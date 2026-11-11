# المهمة 1 — الشبكة والنشر (Networking & Deployment)

الهدف من هذه المهمة حسب ملف التحدي:

> "Documented virtual network, segmentation, routing, appropriate public entry point,
> private backend where applicable, and a working application endpoint."

أي: شبكة معرّفة، تقسيم واضح، توجيه موثّق، مدخل عام وحيد، وخلفية خاصة غير مكشوفة،
ونقطة وصول تعمل فعلاً.

---

## 1. المبدأ المعماري

**لا يُكشف إلا المدخل العام.** التطبيق وقاعدة البيانات يعيشان في شبكات فرعية خاصة
بلا عناوين عامة، والخروج إلى الإنترنت (Open-Meteo / Claude / Supabase) يمر عبر NAT.

```
                        Internet
                           │ 443/80
                           ▼
        ┌─────────────────────────────────────┐
        │  snet-edge  10.20.1.0/24            │
        │  Application Gateway / ALB / Nginx  │  ← العنوان العام الوحيد
        └───────────────┬─────────────────────┘
                        │ 3000 (داخلي فقط)
                        ▼
        ┌─────────────────────────────────────┐
        │  snet-app   10.20.2.0/24            │
        │  3 × تطبيق سياج (بلا IP عام)        │
        └───────┬──────────────────┬──────────┘
                │ 5432             │ 443 عبر NAT
                ▼                  ▼
   ┌──────────────────────┐   ┌──────────────┐
   │ snet-data 10.20.3/24 │   │ NAT Gateway  │
   │ PostgreSQL (خاص)     │   └──────┬───────┘
   └──────────────────────┘          ▼
                              Open-Meteo / Claude
                              Supabase (إن استُخدم)

   snet-admin 10.20.4.0/26 — Bastion / Session Manager للإدارة فقط
```

### التقسيم

| الشبكة الفرعية | المدى | المحتوى | IP عام |
|---|---|---|---|
| `snet-edge` | 10.20.1.0/24 | موازن الحمل / Nginx | ✅ وحيد |
| `snet-app` | 10.20.2.0/24 | نسخ التطبيق (2–5) | ❌ |
| `snet-data` | 10.20.3.0/24 | PostgreSQL | ❌ |
| `snet-admin` | 10.20.4.0/26 | Bastion / إدارة | ❌ (وصول عبر الخدمة) |

### التوجيه (Route Tables)

| الجدول | الوجهة | التالي |
|---|---|---|
| `rt-edge` | 0.0.0.0/0 | Internet Gateway |
| `rt-app` | 0.0.0.0/0 | NAT Gateway (خروج فقط) |
| `rt-app` | 10.20.0.0/16 | الشبكة المحلية |
| `rt-data` | 10.20.0.0/16 | الشبكة المحلية (لا إنترنت) |

### قواعد الجدار الناري (Security Groups / NSG)

| القاعدة | المصدر | الوجهة | المنفذ | الغرض |
|---|---|---|---|---|
| `allow-web-in` | Internet | edge | 443, 80 | الدخول العام |
| `allow-edge-to-app` | edge | app | 3000 | تمرير الطلبات |
| `allow-app-to-db` | app | data | 5432 | قاعدة البيانات |
| `allow-app-egress` | app | Internet | 443 | Open-Meteo / Claude |
| `allow-admin-ssh` | admin | app | 22 | صيانة عبر Bastion فقط |
| `deny-all-inbound` | Internet | app, data | * | لا وصول مباشر |

**قاعدة صارمة:** لا قاعدة `0.0.0.0/0` على المنفذ 22 أو 5432 أو 3000.

---

## 2. خطة الأدلة المطلوبة (Task 1 = 10 نقاط)

| البند في التقييم | الدليل الذي نلتقطه |
|---|---|
| Functional endpoint (5) | `curl -I https://<domain>` يعيد 200، ولقطة من المتصفح |
| Network, routing and isolation (3) | لقطات: الشبكة الفرعية، جداول التوجيه، قواعد NSG، وإثبات أن التطبيق بلا IP عام |
| Upload-validation workflow (2) | رفع صورة/فاتورة من الواجهة ثم ظهور نتيجة التحقق من `/api/analyze` |

**اختبار الرفض المطلوب (يُستخدم أيضاً في المهمة 6):**

```powershell
# من خارج الشبكة: يجب أن يفشل
Test-NetConnection <app-private-ip> -Port 3000   # TcpTestSucceeded: False
Test-NetConnection <db-private-ip>  -Port 5432   # TcpTestSucceeded: False

# المدخل العام فقط هو الذي يعمل
(Invoke-WebRequest https://<domain>/healthz).StatusCode   # 200
```

---

## 3. التطابق بين المزوّدين

| المفهوم | AWS | Azure | GCP | OCI |
|---|---|---|---|---|
| الشبكة | VPC | Virtual Network (VNet) | VPC | VCN |
| تقسيم | Subnets | Subnets | Subnets | Subnets |
| جدار ناري | Security Groups | NSG | Firewall Rules | Security Lists |
| المدخل العام | ALB | Application Gateway | HTTP(S) LB | Load Balancer |
| خروج فقط | NAT Gateway | NAT Gateway | Cloud NAT | NAT Gateway |
| إدارة آمنة | Session Manager | Bastion | IAP | Bastion |
| قاعدة البيانات | RDS PostgreSQL | Flexible Server | Cloud SQL | Autonomous DB |

---

## 4. متطلبات ما قبل التنفيذ

1. حساب سحابي فعّال (لا يوجد أي حساب مُعدّ على الجهاز حالياً).
2. نطاق (domain) أو استخدام اسم المزوّد الافتراضي مؤقتاً.
3. شهادة TLS — مجانية عبر Let's Encrypt أو المُدارة من المزوّد.
4. المنطقة الجغرافية: يفضّل قريبة من عُمان (مثل `UAE North` / `me-central-1` / `me-west1`).

## 5. ملاحظة عن التكلفة (تُستخدم في المهمة 7)

الحد الأدنى المقبول للعرض:

| المكوّن | الحجم | تقدير شهري |
|---|---|---|
| نسختان صغيرتان للتطبيق | 1 vCPU / 1 GB | ~$15–25 |
| قاعدة بيانات مُدارة صغيرة | 1 vCPU / 2 GB | ~$15–30 |
| موازن حمل عام | Basic | ~$5–18 |
| NAT Gateway | ساعات الاستخدام | ~$5–10 |
| تخزين ونسخ احتياطي | 10 GB | ~$2 |

> الأرقام تقديرية وتُضبط حسب المزوّد والمنطقة؛ المطلوب في التقرير تقدير **مبني على
> أسعار المزوّد الفعلية** مع افتراضات مكتوبة، لا رقم عشوائي.

## 6. خطوات التنفيذ (تُملأ بعد اختيار المزوّد)

- [ ] إنشاء الشبكة والتقسيم
- [ ] إنشاء جداول التوجيه و NAT
- [ ] قواعد الجدار الناري
- [ ] نشر التطبيق على نسختين
- [ ] موازن الحمل + شهادة TLS
- [ ] ربط النطاق
- [ ] اختبار الوصول العام واختبار الرفض
- [ ] لقطات الأدلة (بتاريخ ووقت)
