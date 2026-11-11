# نشر سياج على Azure (المهمة 1)

هذا المجلد ينفّذ المهمة الأولى من ملف التحدي: شبكة افتراضية مقسّمة، توجيه،
مدخل عام وحيد، خلفية خاصة، ونقطة وصول تعمل.

## ما ينشئه السكربت

| المكوّن | الاسم | الدور |
|---|---|---|
| Resource Group | `siyaj-rg` | الحاوية |
| VNet `10.20.0.0/16` | `siyaj-vnet` | الشبكة الافتراضية |
| `snet-app` `10.20.2.0/24` | — | نسخ التطبيق (بلا IP عام) |
| `snet-data` `10.20.3.0/24` | — | PostgreSQL (مُفوَّض) |
| `snet-mgmt` `10.20.4.0/24` | — | إدارة محجوزة |
| NSG للتطبيق | `siyaj-nsg-app` | يسمح 3000 من الإنترنت فقط، ويرفض SSH |
| NSG للبيانات | `siyaj-nsg-data` | يسمح 5432 من `snet-app` فقط |
| NAT Gateway | `siyaj-nat` | خروج فقط (Open-Meteo / Claude) |
| Load Balancer | `siyaj-lb` | المدخل العام الوحيد (Standard + public IP) |
| Health probe | `/healthz` | كل 5 ثوان |
| VM Scale Set | `siyaj-vmss` | 2–5 نسخ، `Standard_B1ms` |
| Autoscale | `siyaj-autoscale` | توسّع عند CPU>60%، تقليص عند CPU<30% |
| PostgreSQL | `siyaj-pg-*` | `Standard_B1ms`، شبكة خاصة، نسخ احتياطي 7 أيام |
| Azure Files | `siyaj-<rand>/siyaj-data` | تخزين الوسائط المشترك بين النسخ |

## التشغيل

```powershell
# 1) تسجيل الدخول
az login

# 2) التأكد من الاشتراك
az account show

# 3) النشر (15–20 دقيقة)
cd "C:\Users\MOBPC\Downloads\siyaj-full-2026-10-16\siyaj-solar-guardian\deploy\azure"
powershell -ExecutionPolicy Bypass -File .\deploy.ps1

# اختياري: منح حسابك دور admin داخل التطبيق
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -AdminEmails "you@example.com"
```

النتيجة:

```
Endpoint: http://siyaj-xxxxxx.uaenorth.cloudapp.azure.com
Health:   http://siyaj-xxxxxx.uaenorth.cloudapp.azure.com/healthz
```

بيانات الاعتماد تُحفظ في `.build/deployment.json` (مستثنى من git).

## التحقق بعد النشر

```powershell
# 1) نقطة الوصول العامة
Invoke-WebRequest http://<endpoint>/healthz | Select-Object StatusCode, Content

# 2) النسخ تعمل وبلا IP عام
az vmss list-instances -g siyaj-rg -n siyaj-vmss -o table
az vmss list-instance-public-ips -g siyaj-rg -n siyaj-vmss -o table   # يجب أن يكون فارغاً

# 3) قاعدة البيانات غير مكشوفة
Test-NetConnection <pg-host>.postgres.database.azure.com -Port 5432   # False

# 4) SSH مرفوض من الإنترنت
Test-NetConnection <endpoint> -Port 22                                  # False

# 5) الأدوار والقواعد
az network nsg rule list -g siyaj-rg --nsg-name siyaj-nsg-app -o table
az network nsg rule list -g siyaj-rg --nsg-name siyaj-nsg-data -o table
az network vnet subnet list -g siyaj-rg --vnet-name siyaj-vnet -o table
```

## ملاحظات

- **TLS غير مُفعّل بعد** في هذه النسخة (المنفذ 80). لذلك يعمل التطبيق بـ
  `NODE_ENV=deployment` وليس `production`، لأن الأخير يفعّل `upgrade-insecure-requests`
  في CSP فيتعطل الموقع على HTTP.
- **الوسائط** تُخزَّن على Azure Files مثبّت على `/srv/siyaj-data`، فتصل كل النسخ
  إلى نفس الملفات. إذا فشل التثبيت يعمل التطبيق بوسائط محلية على النسخة نفسها.
- **قاعدة البيانات** مشتركة عبر PostgreSQL، لذا الجلسات والحسابات موحّدة بين النسخ.
- **التكلفة** التقديرية للتشغيل التجريبي (بضعة أيام): أقل من 15 دولاراً من رصيد
  Azure for Students (100 دولار).
- **الحذف الكامل** بعد انتهاء التحدي:
  `az group delete -n siyaj-rg --yes --no-wait`
