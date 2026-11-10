// Complaints and reports are delivered to the maintenance team's mailbox.
// Server-side SMTP is optional; when it is not configured the app still builds a
// mailto link so the client can hand the message to the visitor's mail client.
import { randomUUID } from 'node:crypto';

const DEFAULT_COMPLAINT_EMAIL = 'shathaalbaraa67@gmail.com';
const COMPLAINT_CATEGORIES = ['dust', 'heat', 'shade', 'electrical', 'performance', 'service', 'other'];
const MAX_NAME = 120;
const MAX_CONTACT = 200;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 4000;

function text(value, max) {
  const result = String(value ?? '').replace(/\s+/g, ' ').trim();
  return result.length > max ? result.slice(0, max) : result;
}

function messageText(value, max) {
  const result = String(value ?? '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return result.length > max ? result.slice(0, max) : result;
}

export function complaintEmailAddress() {
  const configured = text(process.env.SIYAJ_COMPLAINT_EMAIL, 200);
  return configured || DEFAULT_COMPLAINT_EMAIL;
}

function smtpConfiguration() {
  const host = text(process.env.SIYAJ_SMTP_HOST, 200);
  const user = text(process.env.SIYAJ_SMTP_USER, 200);
  const pass = String(process.env.SIYAJ_SMTP_PASS || '');
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SIYAJ_SMTP_PORT || 587);
  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure: String(process.env.SIYAJ_SMTP_SECURE || '').toLowerCase() === 'true' || port === 465,
    auth: { user, pass },
    from: text(process.env.SIYAJ_SMTP_FROM, 200) || user,
  };
}

export function getComplaintConfiguration() {
  return { email: complaintEmailAddress(), smtpEnabled: Boolean(smtpConfiguration()) };
}

// Accepted fields are validated and length-limited before they reach the mailbox.
export function normalizeComplaint(body = {}) {
  const name = text(body.name, MAX_NAME);
  const contact = text(body.contact, MAX_CONTACT);
  const category = COMPLAINT_CATEGORIES.includes(String(body.category)) ? String(body.category) : 'other';
  const subject = text(body.subject, MAX_SUBJECT);
  const message = messageText(body.message, MAX_MESSAGE);
  const location = text(body.location, MAX_NAME);
  const account = text(body.account, MAX_CONTACT);
  const errors = [];
  if (!contact) errors.push('contact');
  if (message.length < 10) errors.push('message');
  if (errors.length) return { errors };
  return { complaint: { id: randomUUID(), name, contact, category, subject, message, location, account, createdAt: new Date().toISOString() } };
}

export function buildComplaintMailto(complaint) {
  const to = complaintEmailAddress();
  const subject = complaint.subject || `بلاغ سياج (${complaint.category})`;
  const lines = [
    `نوع البلاغ: ${complaint.category}`,
    complaint.name ? `الاسم: ${complaint.name}` : '',
    `وسيلة التواصل: ${complaint.contact}`,
    complaint.account ? `الحساب: ${complaint.account}` : '',
    complaint.location ? `الموقع: ${complaint.location}` : '',
    `رقم البلاغ: ${complaint.id}`,
    '',
    complaint.message,
  ].filter((line) => line !== '');
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

// Returns { delivered, reason }. Never throws: delivery problems fall back to mailto.
export async function sendComplaint(complaint) {
  const smtp = smtpConfiguration();
  if (!smtp) return { delivered: false, reason: 'smtp_not_configured' };
  try {
    const { default: nodemailer } = await import('nodemailer');
    const transport = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.secure, auth: smtp.auth });
    await transport.sendMail({
      from: smtp.from,
      to: complaintEmailAddress(),
      replyTo: /@/.test(complaint.contact) ? complaint.contact : undefined,
      subject: `[سياج] ${complaint.subject || 'بلاغ جديد'} (${complaint.id.slice(0, 8)})`,
      text: [
        `رقم البلاغ: ${complaint.id}`,
        `النوع: ${complaint.category}`,
        `الاسم: ${complaint.name || '—'}`,
        `وسيلة التواصل: ${complaint.contact}`,
        `الحساب: ${complaint.account || '—'}`,
        `الموقع: ${complaint.location || '—'}`,
        `التاريخ: ${complaint.createdAt}`,
        '',
        complaint.message,
      ].join('\n'),
    });
    return { delivered: true };
  } catch (error) {
    console.error('Siyaj complaint delivery failed:', error.message);
    return { delivered: false, reason: 'smtp_failed' };
  }
}
