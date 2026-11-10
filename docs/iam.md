# 03 — إدارة الهوية والوصول (IAM) كطبقة أمان أساسية

---

## 1. ما كان موجوداً (لم نُغيّره، وثّقناه فقط)

| الضابط | الملف | التفصيل |
|---|---|---|
| تخزين كلمات المرور | `server/auth.mjs` | `scrypt` مع salt عشوائي — لا تخزين نصي |
| الجلسات | `server/auth.mjs` | رمز عشوائي 32 بايت، يُخزَّن **SHA-256** منه فقط |
| الكوكي | `server.mjs` | `HttpOnly` + `SameSite=Lax` + `Secure` في الإنتاج + `Path=/` |
| تسجيل Google | `server.mjs` | التحقق من `idToken` مع `audience = GOOGLE_CLIENT_ID` و`email_verified === true` |
| عزل بيانات المستخدمين | `server/data-store.mjs` | RLS على جداول Postgres + `REVOKE` من `anon/authenticated` |
| وظيفة التنبيهات | `server.mjs` | HMAC-SHA256 + nonce + نافذة 15 دقيقة + مقارنة `timingSafeEqual` |
| حصص الذكاء الاصطناعي | `server/ai-usage.mjs` | حد يومي لكل مستخدم + حد عام |

## 2. ما أضفناه

### 2.1 رؤوس الأمان و CSP — `server/security.mjs`

يُطبَّق على كل طلب:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://accounts.google.com https://plausible.io; script-src-attr 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(self), camera=(), microphone=()
Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy
Strict-Transport-Security (في الإنتاج فقط)
```

- `script-src-attr 'none'` يمنع أي `onclick=` داخل HTML — المشروع نظيف منها (تحققنا: 0).
- `frame-ancestors 'none'` يمنع Clickjacking.
- `X-Powered-By` أُزيل (`app.disable('x-powered-by')`) لمنع كشف التقنية.

### 2.2 مقاومة تخمين كلمات المرور — `server/rate-limit.mjs`

| الطبقة | الحد | النطاق |
|---|---|---|
| حد IP على تسجيل الدخول | 20 محاولة / دقيقة | `POST /api/auth/login` |
| حد IP على التسجيل وGoogle | 30 طلباً / دقيقة | `/api/auth/signup`, `/api/auth/google` |
| قفل الحساب | 10 محاولات فاشلة / 15 دقيقة → قفل 15 دقيقة | لكل `identifier` |

تم التحقق عملياً: المحاولة الحادية عشرة أعادت:

```json
{ "code": "account_locked", "retryAfterSeconds": 900 }
```

مع `Retry-After` في الرأس. القفل بالمُعرِّف يغطي التخمين الموزّع من عناوين متعددة،
والحد بالـ IP يغطي الحرمان الخدمي.

### 2.3 سجل تدقيق المصادقة — `server/audit.mjs`

كل حدث يُسجَّل في `auth_events` (داخل قاعدة البيانات، بحد أقصى 2000 حدث):

`signup` · `login_success` · `login_failed` · `login_locked` · `logout`

كل سجل يحتوي: الوقت، المُعرِّف، `user_id`، IP، User-Agent (مختصر)، والسبب.

- المستخدم يرى أحداثه: `GET /api/auth/events?limit=20`
- الإدارة ترى الكل: `GET /api/admin/stats`

> ملاحظة خصوصية: السجلات لا تحتوي كلمة المرور ولا الرمز، فقط نتيجة المحاولة.

### 2.4 الأدوار (RBAC) — `requireRole`

```env
SIYAJ_ADMIN_EMAILS=you@example.com,team@example.com
```

- الدور يُحسب وقت الطلب من البريد (لا يحتاج ترحيل قاعدة بيانات).
- `GET /api/admin/stats` محمي بـ `requireRole('admin')`.
- مستخدم عادي جرّبناه أعاد: `403 {"code":"forbidden"}`.

مخرجات `/api/admin/stats`:

```json
{
  "users": 2,
  "admins": 1,
  "activeSessions": 5,
  "panelAnalyses": 12,
  "authEvents": 34,
  "recentEvents": [ ... ]
}
```

### 2.5 انتهاء الجلسة بالخمول

- المدة المطلقة تبقى 30 يوماً.
- أضفنا خمولاً افتراضياً **7 أيام** (`SESSION_IDLE_DAYS`): إن لم يستخدم المستخدم
  جلسته تُحذف تلقائياً وتُطلب إعادة الدخول.
- يُحدَّث `last_seen_at` مرة كل 10 دقائق كحد أقصى لتقليل الكتابة على القاعدة.

### 2.6 سياسة كلمة المرور

عند التسجيل فقط (لا نكسر الحسابات القديمة):

- 8 أحرف على الأقل (كان موجوداً).
- يجب أن تحتوي حرفاً ورقماً (`/(?=.*\p{L})(?=.*\d)/u`).

## 3. مصفوفة التهديد ← الضابط

| التهديد | الضابط | الحالة |
|---|---|---|
| تخمين كلمة المرور | Rate limit + قفل الحساب + سجل تدقيق | ✅ مُنفَّذ |
| سرقة الجلسة (XSS) | HttpOnly + CSP صارم + `script-src-attr 'none'` | ✅ |
| Clickjacking | `frame-ancestors 'none'` + `X-Frame-Options: DENY` | ✅ |
| تزوير طلب من موقع آخر (CSRF) | `SameSite=Lax` + التحقق من `Origin` عبر الكوكي | ✅ (كافٍ للمسارات الحالية) |
| تسريب قاعدة البيانات | RLS + منع `anon` + تخزين hash فقط للجلسات | ✅ |
| تسريب الأسرار | `.env` غير متعقَّب + Vault للمهمة المجدولة | ✅ |
| استغلال الحصص (تكلفة AI) | حد يومي لكل مستخدم + حد عام | ✅ |
| إعادة تشغيل وظيفة التنبيهات | HMAC + nonce + نافذة زمنية + lease | ✅ |
| تصعيد الصلاحيات | دور محسوب من قائمة بريد صريحة، وليس من مدخلات المستخدم | ✅ |
| هجوم الحرمان | Nginx + قفل مؤقت + حدود IP | ⚠️ جزئي (لا WAF) |

## 4. مبدأ أقل صلاحية

- التطبيق يتصل بقاعدة البيانات بدور مخصص، وليس `postgres`.
- الجداول ليست مكشوفة لـ `anon` / `authenticated` (RLS + REVOKE).
- مفتاح Supabase السري يبقى في الخادم فقط، ولا يصل للمتصفح إطلاقاً.
- `SIYAJ_JOB_SECRET` موجود في Vault و Render فقط، ويُقارَن زمنياً ثابتاً.

## 5. أدلة جاهزة للتقرير

```powershell
# 1) الرؤوس الأمنية
curl.exe -I http://localhost:3000/

# 2) قفل الحساب بعد محاولات فاشلة
1..11 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" -X POST http://localhost:3000/api/auth/login `
    -H "Content-Type: application/json" -d '{\"identifier\":\"nobody\",\"password\":\"wrong\"}'
}

# 3) سجل التدقيق
curl.exe -s http://localhost:3000/api/auth/events -b cookies.txt

# 4) رفض الوصول لغير الإدارة
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:3000/api/admin/stats -b cookies.txt
# 403
```

## 6. الخطوة التالية (اختيارية)

- استبدال حدود المعدّل المخزّنة في الذاكرة بـ Redis لتكون موحّدة عبر النسخ.
- إضافة رمز CSRF مزدوج للمسارات التي تعدّل البيانات (حالياً `SameSite=Lax` كافٍ).
- تفعيل MFA (TOTP) للحسابات الإدارية.
- ربط سجل التدقيق بنظام مراقبة (Sentry / Supabase Logs) مع تنبيه عند تكرار الفشل.
