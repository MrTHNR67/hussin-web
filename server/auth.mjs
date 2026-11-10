import { promisify } from 'node:util';
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { readDatabase, updateDatabase } from './data-store.mjs';

const scrypt = promisify(scryptCallback);
const SESSION_DAYS = 30;
const PASSWORD_BYTES = 64;

export class AuthError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function normalizeUsername(value) { return String(value || '').normalize('NFKC').trim().toLocaleLowerCase('en-US'); }
export function normalizePhone(value) { return String(value || '').replace(/[^\d+]/g, ''); }
function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function tokenDigest(token) { return createHash('sha256').update(token).digest('hex'); }
function adminEmails() {
  return String(process.env.SIYAJ_ADMIN_EMAILS || '')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
}
function roleFor(user) {
  return adminEmails().includes(String(user.email || '').toLowerCase()) ? 'admin' : 'user';
}
function safeUser(user) {
  return { id: user.id, role: roleFor(user), username: user.username, email: user.email, phone: user.phone || '', name: user.name || user.username, picture: user.picture || '' };
}
function makeToken() { return randomBytes(32).toString('base64url'); }
function sessionExpiry() { return new Date(Date.now() + SESSION_DAYS * 86400000).toISOString(); }
function derivePassword(password, salt) { return scrypt(password, salt, PASSWORD_BYTES, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }); }

function checkNewUser({ username, email, phone, password }) {
  const cleanUsername = String(username || '').normalize('NFKC').trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  if (!/^[\p{L}\p{N}._-]{3,24}$/u.test(cleanUsername)) throw new AuthError('اسم المستخدم من 3 إلى 24 حرفاً أو رقماً، ويمكن استخدام النقطة والشرطة السفلية فقط.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new AuthError('أدخل بريداً إلكترونياً صالحاً.');
  if (cleanPhone.replace(/\D/g, '').length < 7) throw new AuthError('أدخل رقم هاتف صالحاً.');
  if (String(password || '').length < 8 || String(password).length > 256) throw new AuthError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
  if (!/(?=.*\p{L})(?=.*\d)/u.test(String(password || ''))) throw new AuthError('يجب أن تحتوي كلمة المرور على حرف ورقم على الأقل.');
  return { username: cleanUsername, username_key: normalizeUsername(cleanUsername), email: cleanEmail, phone: cleanPhone, phone_key: normalizePhone(cleanPhone) };
}

async function issueSession(userId) {
  const token = makeToken();
  const tokenHash = tokenDigest(token);
  const expiresAt = sessionExpiry();
  const issuedAt = new Date().toISOString();
  await updateDatabase((db) => {
    for (const [hash, session] of Object.entries(db.sessions)) if (Date.parse(session.expires_at) <= Date.now()) delete db.sessions[hash];
    db.sessions[tokenHash] = { user_id: userId, expires_at: expiresAt, created_at: issuedAt, last_seen_at: issuedAt };
  });
  const db = await readDatabase();
  return { token, user: safeUser(db.users[userId]) };
}

export async function registerAccount(input) {
  const valid = checkNewUser(input);
  const salt = randomBytes(16).toString('hex');
  const passwordHash = (await derivePassword(String(input.password), salt)).toString('hex');
  const user = {
    id: randomUUID(), ...valid, password_salt: salt, password_hash: passwordHash,
    name: valid.username, picture: '', google_sub: '', created_at: new Date().toISOString(),
  };
  await updateDatabase((db) => {
    if (Object.values(db.users).some((item) => item.username_key === user.username_key)) throw new AuthError('اسم المستخدم مستخدم بالفعل؛ اختر اسماً آخر.', 409);
    if (Object.values(db.users).some((item) => item.email === user.email || item.phone_key === user.phone_key)) throw new AuthError('هذا البريد أو رقم الهاتف مسجل مسبقاً.', 409);
    db.users[user.id] = user;
  });
  return issueSession(user.id);
}

export async function loginAccount(identifier, password) {
  if (String(password || '').length > 256) throw new AuthError('بيانات الدخول غير صحيحة.', 401);
  const value = String(identifier || '').trim();
  const lower = value.toLowerCase();
  const normalizedUser = normalizeUsername(value);
  const normalizedTel = normalizePhone(value);
  const db = await readDatabase();
  const user = Object.values(db.users).find((item) => item.email === lower || item.phone_key === normalizedTel || item.username_key === normalizedUser);
  if (!user || !user.password_hash || !user.password_salt) throw new AuthError('بيانات الدخول غير صحيحة.', 401);
  const actual = Buffer.from(await derivePassword(String(password || ''), user.password_salt));
  const expected = Buffer.from(user.password_hash, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new AuthError('بيانات الدخول غير صحيحة.', 401);
  return issueSession(user.id);
}

export async function loginWithGoogle({ sub, email, name, picture }) {
  const cleanEmail = normalizeEmail(email);
  const providerSub = String(sub || '');
  if (!providerSub || !cleanEmail) throw new AuthError('تعذر التحقق من حساب Google.', 401);
  let userId;
  await updateDatabase((db) => {
    let user = Object.values(db.users).find((item) => item.google_sub === providerSub);
    if (!user) {
      user = Object.values(db.users).find((item) => item.email === cleanEmail);
      if (user?.google_sub && user.google_sub !== providerSub) throw new AuthError('هذا البريد مرتبط بحساب Google آخر.', 409);
      if (user) user.google_sub = providerSub;
    }
    if (!user) {
      const base = cleanEmail.split('@')[0].normalize('NFKC').replace(/[^\p{L}\p{N}._-]/gu, '_').slice(0, 24) || 'google_user';
      let username = base.length < 3 ? `user_${base}` : base;
      let usernameKey = normalizeUsername(username);
      let suffix = 2;
      while (Object.values(db.users).some((item) => item.username_key === usernameKey)) {
        const ending = `_${suffix++}`;
        username = `${base.slice(0, 24 - ending.length)}${ending}`;
        usernameKey = normalizeUsername(username);
      }
      user = {
        id: randomUUID(), username, username_key: usernameKey, email: cleanEmail, phone: '', phone_key: null,
        password_salt: '', password_hash: '', name: String(name || username).slice(0, 120), picture: String(picture || '').slice(0, 1000),
        google_sub: providerSub, created_at: new Date().toISOString(),
      };
      db.users[user.id] = user;
    } else {
      user.name ||= String(name || user.username).slice(0, 120);
      user.picture = String(picture || user.picture || '').slice(0, 1000);
    }
    userId = user.id;
  });
  return issueSession(userId);
}

export async function authenticateToken(token) {
  if (!token) return null;
  const digest = tokenDigest(token);
  const db = await readDatabase();
  const session = db.sessions[digest];
  if (!session || Date.parse(session.expires_at) <= Date.now()) return null;
  // Idle timeout on top of the absolute 30-day expiry.
  const idleDays = Number(process.env.SESSION_IDLE_DAYS || 7) || 7;
  const idleMs = idleDays * 86400000;
  const lastSeen = Date.parse(session.last_seen_at || '');
  if (Number.isFinite(lastSeen) && Date.now() - lastSeen > idleMs) {
    await updateDatabase((state) => { delete state.sessions[digest]; });
    return null;
  }
  // Best-effort activity stamp, throttled to one write per 10 minutes per session.
  if (!Number.isFinite(lastSeen) || Date.now() - lastSeen > 10 * 60_000) {
    updateDatabase((state) => {
      const current = state.sessions[digest];
      if (current) current.last_seen_at = new Date().toISOString();
    }).catch(() => {});
  }
  const user = db.users[session.user_id];
  return user ? { id: user.id, user: safeUser(user), tokenHash: digest } : null;
}

export async function removeSession(tokenHash) {
  if (!tokenHash) return;
  await updateDatabase((db) => { delete db.sessions[tokenHash]; });
}
