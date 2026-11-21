# دليل النشر على Render — سياج

المنشور المعتمد هو **Render**: https://siyaj-web.onrender.com

## ما الذي يعمل بعد النشر

- خادم Express كامل من `server.mjs` (لا واجهة ثابتة فقط).
- دخول الزائر بالاسم والقبيلة في نفس مكان شاشة الدخول السابقة، دون حساب أو كلمة مرور.
- الاسم والقبيلة ورمز الجلسة محفوظة في متصفح الزائر (`localStorage` + ملف ارتباط `HttpOnly`)، وتستمر بعد إعادة التحميل.
- كل الصفحات الأصلية تعمل كما هي: الرئيسية، السجل، التقارير، تقرير النظام، الإعدادات.
- زر «قراءة تقديرية للألواح» محاكاة بصرية مدتها ~2.5 ثانية في المتصفح، بلا طلبات إضافية للخادم.
- الطقس من Open-Meteo مع بديل تلقائي من MET Norway.

## النشر (Blueprint)

1. افتح https://dashboard.render.com → **Blueprints** → **New Blueprint Instance**.
2. اختر مستودع `MrTHNR67/hussin-web` والفرع `main`.
3. سيقرأ Render ملف `render.yaml` وينشئ تلقائياً:
   - قاعدة `siyaj-db` (Postgres 16، منطقة Frankfurt).
   - خدمة الويب `siyaj-web` (Node، خطة مجانية، منطقة Frankfurt، `autoDeploy: true`).
4. لا تضف `PORT` يدوياً؛ Render يضبطه. لا تكتب رابط قاعدة البيانات في الملفات أو في المحادثة.

## متغيرات البيئة

| المتغير | المصدر | ملاحظة |
|---|---|---|
| `NODE_ENV` | `render.yaml` | `production` (يفعّل HSTS) |
| `DATABASE_SSL` | `render.yaml` | `no-verify` |
| `DATABASE_URL` | `fromDatabase` في `render.yaml` | يُحقنه Render تلقائياً؛ سري، لا يظهر في Git |
| `DATABASE_PASSWORD` | يدوي (اختياري) | فقط إن أردت إدخال كلمة المرور الخام منفصلة عن الرابط |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | يدوي (اختياري) | لتخزين المرفقات خارج القرص المؤقت |
| `ANTHROPIC_API_KEY` | يدوي (اختياري) | لقراءة الفاتورة فقط؛ لا علاقة لها بالقراءة التقديرية للألواح |
| `SIYAJ_JOB_SECRET` | يدوي (اختياري) | سر جدولة التنبيهات الخارجية |

كل الأسرار تُضاف من تبويب **Environment** في Render فقط، ولا تُكتب في `public/` أو Git.

## التحقق بعد النشر

```powershell
curl.exe -s -o NUL -w "root    %{http_code}`n" https://siyaj-web.onrender.com/
curl.exe -s -o NUL -w "healthz %{http_code}`n" https://siyaj-web.onrender.com/healthz
curl.exe -s -o NUL -w "readyz  %{http_code}`n" https://siyaj-web.onrender.com/readyz
curl.exe -s -o NUL -w "admin   %{http_code}`n" https://siyaj-web.onrender.com/api/admin/stats
```

المتوقع: `200 / 200 / 200 / 401`. ثم افتح الرابط في المتصفح:
- أدخل أي اسم وأي قبيلة → تظهر معالج الإعداد، ويظهر الاسم في الترويسة.
- أعد تحميل الصفحة → يبقى الاسم والمتابعة من دون إعادة إدخال.
- اضغط «قراءة تقديرية للألواح» → شريط تقدّم ~2.5 ثانية ثم «تم تجهيز القراءة التقديرية» بلا أخطاء في الـ console.

## ملاحظات التشغيل

- الخطة المجانية تنام بعد ~15 دقيقة خمول؛ أول طلب بعدها قد يستغرق 30–50 ثانية.
- قاعدة Postgres المجانية تنتهي في **2026-12-11**. صدّر البيانات من الإعدادات أو عبر `pg_dump` قبل ذلك، وحدّث الخطة عند اللزوم.
- النسخ الاحتياطي المحلي (`scripts/backup.ps1`) يعمل على المجموعة المحلية فقط؛Render يحتفظ بنسخ المنصة حسب خطته.
- للتراجع: أعد نشر الـ commit السابق من تبويب **Deploys** في Render (Manual Deploy ← اختر الـ commit).
- ملفات `docs/design-vercel-guest-mode.md` و`docs/superpowers/plans/...` سجل تاريخي لمحاولة النشر على Vercel؛ المنصة المعتمدة هي Render كما في هذا الدليل.
