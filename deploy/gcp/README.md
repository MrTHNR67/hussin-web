# نشر سياج على Google Cloud (المهمة 1)

نفس تصميم `deploy/azure/` لكن على Google Cloud: شبكة مقسّمة، مدخل عام وحيد،
خلفية خاصة، وتوسّع تلقائي.

## قبل البدء

1. حساب Google Cloud مع **حساب فوترة مفعّل** (حتى الرصيد المجاني يتطلب بطاقة).
2. تثبيت Google Cloud CLI:
   ```powershell
   winget install --id Google.CloudSDK --exact
   ```
3. تسجيل الدخول واختيار المشروع:
   ```powershell
   gcloud auth login
   gcloud config set project <PROJECT_ID>
   ```
4. تفعيل الفوترة على المشروع (مرة واحدة من لوحة التحكم).

## ما ينشئه السكربت

| المكوّن | الاسم | الدور |
|---|---|---|
| VPC (custom) | `siyaj-vpc` | الشبكة الافتراضية |
| Subnet | `siyaj-snet-app` `10.20.2.0/24` | نسخ التطبيق (بلا IP خارجي) |
| Subnet | `siyaj-snet-mgmt` `10.20.4.0/24` | إدارة عبر IAP فقط |
| Private range | `10.30.0.0/16` | شبكة Cloud SQL المعزولة |
| Cloud Router + NAT | `siyaj-router` / `siyaj-nat` | خروج فقط |
| Firewall | 4 قواعد | 3000 من الـLB فقط، رفض SSH و5432 من الإنترنت |
| Cloud SQL | `siyaj-pg` (PostgreSQL 16) | IP خاص، نسخ احتياطي + PITR |
| Service Account | `siyaj-vm@...` | `logging.logWriter` + `monitoring.metricWriter` فقط |
| Instance Template | `siyaj-template` | Ubuntu 22.04، e2-small، بلا IP خارجي |
| MIG | `siyaj-mig` | 2–5 نسخ إقليمية |
| Autoscaler | CPU 60% | توسّع/تقليص تلقائي |
| Global LB | `siyaj-http` | IP عام وحيد، فحص `/healthz` |

## التشغيل

```powershell
cd "C:\Users\MOBPC\Downloads\siyaj-full-2026-10-16\siyaj-solar-guardian\deploy\gcp"
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

النتيجة:

```
Endpoint: http://<static-ip>
Health:   http://<static-ip>/healthz
```

بيانات الاعتماد في `.build/deployment.json` (مستثنى من git).

## التحقق

```powershell
# 1) نقطة الوصول
Invoke-WebRequest http://<ip>/healthz | Select-Object StatusCode, Content

# 2) النسخ تعمل وبلا IP خارجي
gcloud compute instance-groups managed list-instances siyaj-mig --region=me-central2

# 3) لا SSH من الإنترنت (يجب أن يفشل)
Test-NetConnection <ip> -Port 22

# 4) قاعدة البيانات غير مكشوفة
Test-NetConnection <cloud-sql-private-ip> -Port 5432

# 5) قواعد الجدار الناري
gcloud compute firewall-rules list --filter="name~siyaj"
```

## ملاحظات

- **الجلسات والبيانات** مشتركة عبر Cloud SQL، فالنسخ كلها ترى نفس الحسابات.
- **الوسائط** محلية على كل نسخة، وموازن الحمل يستخدم `GENERATED_COOKIE`
  فالطلب من المتصفح يبقى على النسخة نفسها (الرفع ثم التحليل يعمل).
  لطلب موزّع فعلياً استخدم `curl` بدون كوكيز.
- **TLS غير مفعّل** في هذه النسخة (منفذ 80)، لذلك `NODE_ENV=deployment`
  وليس `production` (الأخير يفعّل `upgrade-insecure-requests` في CSP).
- **التكلفة** التقريبية: e2-small ×2 ≈ 26$/شهر، Cloud SQL f1-micro ≈ 10$/شهر،
  موازن الحمل ≈ 18$/شهر. لبضعة أيام أقل من 10$ من الرصيد المجاني.
- **الحذف الكامل**:
  ```powershell
  gcloud compute forwarding-rules delete siyaj-http --global --quiet
  gcloud compute target-http-proxies delete siyaj-http-proxy --quiet
  gcloud compute url-maps delete siyaj-urlmap --quiet
  gcloud compute backend-services delete siyaj-backend --global --quiet
  gcloud compute instance-groups managed delete siyaj-mig --region=me-central2 --quiet
  gcloud compute instance-templates delete siyaj-template --quiet
  gcloud sql instances delete siyaj-pg --quiet
  gcloud compute networks delete siyaj-vpc --quiet
  ```
