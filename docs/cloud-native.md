# 01 — أنماط التصميم السحابي (Microservices + Serverless)

هذا الملف يوثّق ما تم تنفيذه فعلياً في المشروع، وليس خطة نظرية فقط.

---

## 1. ما كان موجوداً أصلاً (قبل التعديل)

| النمط | الدليل في المشروع |
|---|---|
| Serverless / Scheduled Job | `deploy/supabase-alert-schedule.sql` — Supabase Cron + `pg_net` + Vault، يستدعي `POST /api/jobs/daily-alerts` |
| Stateless Worker | الوظيفة موقّعة بـ HMAC-SHA256 + nonce + timestamp، وتعمل على أي نسخة من التطبيق دون حالة محلية |
| Idempotency | `server/dust-wind-alerts.mjs` — lease لكل لوح + cooldown 14 يوماً، فلا تكرار عند تشغيل الوظيفة أكثر من مرة |
| Config من البيئة | `dotenv` + `.env.example` — لا أسرار داخل الكود |
| Stateless Sessions | الجلسات في قاعدة البيانات (`sessions`) وليس في ذاكرة العملية |

## 2. ما أضفناه: خدمة الطقس المستقلة

```
services/weather/
├── server.mjs      # خدمة Express مستقلة على المنفذ 4001
├── package.json
└── Dockerfile      # صورة مستقلة (build من جذر المستودع)
```

**كيف تعمل:**

- الخدمة تملك كل الاتصالات الصادرة إلى Open-Meteo (forecast + air quality + geocoding).
- التطبيق الرئيسي يستخدمها فقط عند ضبط `WEATHER_SERVICE_URL`:

```env
WEATHER_SERVICE_URL=http://127.0.0.1:4001
```

- في `server.mjs` أصبحت المسارات `/api/weather` و `/api/geocode` تمر عبر `proxyWeatherService()`.
- **إن سقطت الخدمة، يعود التطبيق تلقائياً للتنفيذ المحلي** (fallback) — هذا هو مبدأ العزل والفشل الآمن (bulkhead + graceful degradation) بدل أن يسقط الموقع كله.

تم التحقق عملياً: أوقفنا خدمة الطقس أثناء التشغيل، وبقي `/api/geocode` يعيد `200`.

## 3. المخطط المعماري

```
                    ┌──────────────────────────┐
   المتصفح  ───────▶│  Nginx (load balancer)   │
                    └───────────┬──────────────┘
                                │  least_conn
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐             ┌─────────┐
   │ API #1  │            │ API #2  │             │ API #3  │   (stateless)
   └────┬────┘            └────┬────┘             └────┬────┘
        │                      │                       │
        │  WEATHER_SERVICE_URL │                       │
        └──────────┬───────────┴───────────┬───────────┘
                   ▼                       ▼
          ┌──────────────────┐    ┌────────────────────┐
          │ Weather Service  │    │ Supabase Postgres  │
          │   :4001          │    │ sessions + state   │
          └────────┬─────────┘    └────────────────────┘
                   ▼
          Open-Meteo APIs

   Supabase Cron ──(pg_net + HMAC)──▶ POST /api/jobs/daily-alerts
```

## 4. مطابقة عوامل 12-Factor

| العامل | الحالة | الدليل |
|---|---|---|
| I. Codebase | ✅ | مستودع واحد، والخدمة داخل `services/` |
| II. Dependencies | ✅ | `package.json` + `package-lock.json` |
| III. Config | ✅ | `.env` فقط؛ أضفنا `WEATHER_SERVICE_URL`, `SIYAJ_ADMIN_EMAILS`, `SESSION_IDLE_DAYS` |
| IV. Backing services | ✅ | Postgres/Supabase وخدمة الطقس تُستبدل عبر متغير بيئة |
| V. Build/Release/Run | ✅ | `Dockerfile` + `docker-compose.yml` |
| VI. Processes | ✅ | لا جلسات في الذاكرة؛ `sessions` في القاعدة |
| VII. Port binding | ✅ | `PORT` لكل نسخة (`3001`, `3002`, `3003`) |
| VIII. Concurrency | ✅ | 3 نسخ خلف Nginx (`scripts/start-cluster.ps1`) |
| IX. Disposability | ✅ | `/healthz`, `/readyz`, وإيقاف آمن عند `SIGTERM` |
| X. Dev/Prod parity | ✅ | نفس الكود، فرق الإعدادات فقط |
| XI. Logs | ✅ | stdout/stderr (في `.run/api-<port>.log`) |
| XII. Admin processes | ✅ | وظيفة التنبيهات تعمل عبر HTTP موقّع، لا داخل العملية |

## 5. كيف تشغّل خدمة الطقس محلياً

```powershell
# نافذة أولى
node services/weather/server.mjs      # http://localhost:4001/healthz

# نافذة ثانية
$env:WEATHER_SERVICE_URL = "http://127.0.0.1:4001"
node server.mjs
```

أو عبر Docker:

```powershell
docker compose up -d --build
# ثم افتح http://localhost:8080
```

## 6. لماذا لا نفصل كل شيء؟

فصل كل وحدة (تحليل الذكاء الاصطناعي، البلاغات، التنبيهات) إلى خدمة منفصلة يضاعف
التعقيد التشغيلي دون فائدة على مشروع بهذا الحجم. الفصل المختار يحقق الهدف التعليمي
(حدود خدمة واضحة، نشر مستقل، فشل معزول) دون تعريض استقرار الموقع للخطر.

## 7. أدلة جاهزة للتقرير

- لقطة من `services/weather/server.mjs` + `Dockerfile`.
- لقطة من `proxyWeatherService()` في `server.mjs` ورسالة الـ fallback في سجل الخادم.
- لقطة من `deploy/supabase-alert-schedule.sql` (serverless scheduler).
- نتيجة `curl http://localhost:4001/healthz`.
