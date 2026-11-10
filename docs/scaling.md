# 02 — المرونة: التوسّع التلقائي وموازنة الحمل

---

## 1. ما أضفناه في الكود

| الميزة | الملف | التفصيل |
|---|---|---|
| Liveness probe | `server.mjs` | `GET /healthz` — لا يلمس قاعدة البيانات، يرد فوراً |
| Readiness probe | `server.mjs` | `GET /readyz` — يقرأ القاعدة؛ إن فشلت يعيد `503` فيُخرج Nginx النسخة من الدوران |
| إيقاف آمن | `server.mjs` | عند `SIGTERM`/`SIGINT`: يتوقف عن استقبال اتصالات جديدة، يكمل الجارية، ويخرج خلال 10 ثوانٍ كحد أقصى |
| `trust proxy` | `server.mjs` | ليقرأ IP الحقيقي من `X-Forwarded-For` خلف Nginx |
| منافذ متعددة | `.env` → `PORT` | كل نسخة تعمل على منفذ مختلف بنفس الكود |

```powershell
Invoke-RestMethod http://127.0.0.1:3001/healthz
# {"status":"ok","instance":3001,"pid":17700,"uptimeSeconds":5}

Invoke-RestMethod http://127.0.0.1:3001/readyz
# {"status":"ready","instance":3001}
```

## 2. موازنة الحمل بـ Nginx

- **Windows:** `nginx/windows.conf` (upstream ثابت على 3001–3003).
- **Docker:** `nginx/docker.conf` (اكتشاف تلقائي لنسخ الخدمة عبر DNS + `resolve`).

الخوارزمية: `least_conn` — يوجّه الطلب للنسخة الأقل اتصالاً، وهو مناسب لطلبات
التحليل الثقيلة. مع `max_fails=3 fail_timeout=15s` تُستبعد النسخة المعطلة مؤقتاً،
و`proxy_next_upstream` يعيد المحاولة على نسخة أخرى دون أن يرى المستخدم خطأً.

```nginx
upstream siyaj_upstream {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=15s;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=15s;
    server 127.0.0.1:3003 max_fails=3 fail_timeout=15s;
}
server {
    listen 8080;
    location / {
        proxy_pass http://siyaj_upstream;
        proxy_next_upstream error timeout http_502 http_503;
    }
}
```

## 3. سياسة التوسّع التلقائي

مُنفّذة في `scripts/autoscale.ps1`:

| المعامل | القيمة الافتراضية | المعنى |
|---|---|---|
| `MinInstances` | 2 | لا ننزل تحت نسختين (توفّر عالٍ) |
| `MaxInstances` | 5 | سقف التكلفة |
| `HighMs` | 400 | متوسط زمن الاستجابة الذي يفعّل التوسّع |
| `LowMs` | 150 | الحد الذي يفعّل التقليص |
| `Samples` | 6 | عدد القياسات المتتالية قبل القرار (يمنع التذبذب) |
| `IntervalSeconds` | 5 | كل 5 ثوانٍ قياس |
| `Iterations` | 0 | 0 = يعمل باستمرار |

**القاعدة:** توسّع عند بقاء المتوسط > `HighMs` لست قياسات متتالية، وتقليص عند بقائه
< `LowMs` لست قياسات، مع فترة تهدئة بعد كل قرار. عند التوسّع تُضاف نسخة على أول
منفذ حر ويُعاد توليد `nginx.conf` ثم `nginx -s reload` (بلا قطع للخدمة).

## 4. خطوات التجربة (نسخة ويندوز)

```powershell
# 1) شغّل 3 نسخ
powershell -ExecutionPolicy Bypass -File scripts\start-cluster.ps1

# 2) انسخ إعداد Nginx
copy nginx\windows.conf C:\nginx\conf\nginx.conf

# 3) شغّل Nginx
cd C:\nginx ; .\nginx.exe

# 4) توليد حمل
powershell -ExecutionPolicy Bypass -File scripts\load-test.ps1 -Connections 100 -Duration 30

# 5) راقب التوسّع (في نافذة ثالثة)
powershell -ExecutionPolicy Bypass -File scripts\autoscale.ps1 -NginxDir C:\nginx

# 6) الإيقاف
powershell -ExecutionPolicy Bypass -File scripts\stop-cluster.ps1
cd C:\nginx ; .\nginx.exe -s stop
```

## 5. إثبات تحمّل الفشل (أهم لقطة للتقرير)

```powershell
# أثناء تشغيل الحمل، أوقف نسخة واحدة:
Stop-Process -Id (Get-Content .run\api-3002.pid)
```

**النتيجة المتوقعة:** يستمر الحمل بلا أخطاء لأن Nginx يحوّل الطلبات إلى 3001 و3003.
هذا يثبت أن النظام لا يعتمد على نسخة واحدة (No single point of failure).

## 6. نتائج القياس الفعلية (مُختبرة على هذا الجهاز)

الأمر: `autocannon -c 50 -d 15 http://<target>/readyz` (المسار يقرأ قاعدة البيانات، فهو الأثقل).

| السيناريو | RPS | p50 (ms) | p99 (ms) | أخطاء |
|---|---|---|---|---|
| نسخة واحدة مباشرة (3001) | 1,156 | 42 | 61 | 0 |
| 3 نسخ خلف Nginx (8080) | **2,641** | 18 | **27** | 0 |
| 3 نسخ + إيقاف نسخة وسط الحمل | 2,310 | — | 28 | **0** من 46,190 طلب |

**الاستنتاج:** الإنتاجية زادت **+128%**، وزمن الاستجابة عند p99 انخفض **من 61ms إلى 27ms**،
وبقي عدد الأخطاء صفراً حتى عند قتل نسخة أثناء الحمل — لأن Nginx أعاد توجيه الطلبات
إلى النسختين الباقيتين.

سجل Nginx يوثّق اللحظة (أخطاء upstream فقط، بلا أثر على المستخدم):

```
[error] WSARecv() failed (10054: connection forcibly closed) while reading response
        header from upstream, request: "GET /readyz", upstream: "http://127.0.0.1:3002/readyz"
```

### تجربة التوسّع التلقائي

تم تشغيل حمل `-c 200` ومراقبة المتوسط لحظياً:

```
[02:15:53] avg=237ms replicas=3
[02:16:00] scale-out -> 4 replicas   (avg=227ms)
[02:16:06] avg=178ms replicas=4
[02:16:13] scale-out -> 5 replicas   (avg=170ms)
...
[02:17:09] avg=13.7ms replicas=5
[02:17:11] scale-in  -> 4 replicas
[02:17:15] scale-in  -> 3 replicas
```

قيَم العتبات في التجربة (50ms / 20ms) أقل من الافتراضية (400ms / 150ms) لأن زمن
الاستجابة على localhost منخفض جداً؛ **السياسة نفسها لم تتغير**، فقط الأرقام تُضبط
حسب بيئة التشغيل.

## 7. ملاحظة مهمة عن Render

الخطة المجانية في Render لا تدعم التوسّع التلقائي ولا النسخ المتعددة. الخيارات:

1. **عرض محلي** (المُنفّذ أعلاه) — يثبت الفهم والتطبيق.
2. **Render Starter** — نسخة واحدة، مع إمكانية الترقية اليدوية للأعلى.
3. **Render Pro** — تفعيل Autoscaling من لوحة التحكم مع نفس `/healthz` و`/readyz`.

السياسة المكتوبة في `autoscale.ps1` قابلة للنقل حرفياً إلى أي مزوّد (Render، ECS،
Kubernetes HPA) لأنها تعتمد على مقياس واحد: زمن الاستجابة.

## 8. القيود المعروفة

- حدود المعدّل (rate limit) في الذاكرة: مع 3 نسخ يصبح الحد الفعلي 3×. الحل الإنتاجي: Redis مشترك — مذكور في `docs/iam.md`.
- SQLite لا تصلح لعدة نسخ. النسخ المتعددة تتطلب `DATABASE_URL` إلى Postgres/Supabase.
- لا يوجد بعدُ تحميل تلقائي لأسرار الإنتاج؛ تُدار عبر متغيرات بيئة المنصّة.
