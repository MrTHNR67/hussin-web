# النشر على Vercel (المنصة المعتمدة)

سياج يعمل على **Vercel** كتطبيق Express كامل داخل Serverless Function واحدة (`api/index.js` ← `server.mjs`). لم يعد Render مستخدمًا؛ يمكن تجاهل أي ملفات أو docs قديمة تشير إليه.

## المتغيرات المطلوبة

تُضاف من **Project Settings → Environment Variables** في Vercel، ولا تُكتب أبدًا داخل المستودع:

| المتغير | الغرض | ملاحظات |
| --- | --- | --- |
| `DATABASE_URL` | Postgres خارجي (Neon) | إلزامي على Vercel؛ لا يوجد SQLite دائم هناك. يجب أن يكون رابط **pooled** متوافقًا مع IPv4 إذا لزم. |
| `NODE_ENV` | `production` | يُفعّل رابط `Secure` لملف تعريف الجلسة. |
| `SIYAJ_ADMIN_EMAILS` | بريد المشرف فقط | اختياري، لا يظهر في واجهة الزائر. |
| `ANTHROPIC_API_KEY` | تحليل الفاتورة فقط | اختياري تمامًا؛ زر تحليل الألواح **محاكاة بصرية** ولا يحتاجه. |
| `SIYAJ_SMTP_*`, `VAPID_*`, `GOOGLE_CLIENT_ID` | ميزات اختيارية | انسخها من `.env.example` فقط إن كانت مستخدمة فعليًا. |

`VERCEL=1` يضيفه Vercel تلقائيًا، ويمنع `server.mjs` من فتح منفذ HTTP محلي. الجداول تُنشأ تلقائيًا عند أول تشغيل في قاعدة فارغة؛ لا يلزم ملف SQL يدوي.

## الخطوات

```bash
npx vercel link
npx vercel env add DATABASE_URL production      # الصق الرابط الذي يوفره المشغل فقط
npx vercel env add NODE_ENV production
npx vercel --prod
```

## التحقق بعد النشر

```bash
curl https://<DEPLOY_URL>/healthz                  # 200 {"status":"ok",...}
curl https://<DEPLOY_URL>/readyz                  # 200 {"status":"ready",...} → يثبت اتصال Neon
curl https://<DEPLOY_URL>/                        # 200 ويحتوي guest-name و guest-tribe
```

ثم في المتصفح: افتح الرابط → أدخل الاسم والقبيلة → تصل إلى معالج الإعداد → أعد تحميل الصفحة وتعود الجلسة → تحقق أن `GET /api/admin/stats` بملف تعريف الزائر يعيد `403`.

## التراجع

التراجع هو إعادة نشر نشر سابق من **Deployments** في Vercel (`... → Promote to Production`). لا تُعد ملفات `render.yaml` للعمل؛ المنصة المعتمدة هي Vercel فقط.

## الأمان

- لا تضع `DATABASE_URL` أو أي مفتاح في `public/` أو في رسالة أو في Git.
- جلسة الزائر تُحفظ في ملف ارتباط `HttpOnly`، والاسم والقبيلة ورمز الجلسة يُحفظان في `localStorage` على نفس المتصفح فقط.
- دور `guest` لا يمنح صلاحيات إدارية؛ نقاط `requireRole('admin')` ترفضه دائمًا.
