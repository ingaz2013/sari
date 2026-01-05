# 🚀 دليل الإعداد والتثبيت | Setup Guide

## 📋 المتطلبات | Prerequisites

قبل البدء، تأكد من توفر:

- **Node.js** 22.x أو أحدث
- **pnpm** (مدير الحزم)
- **MySQL** أو **TiDB** (قاعدة البيانات)
- **Git** (لإدارة النسخ)

## 🔑 الحسابات المطلوبة | Required Accounts

### 1. OpenAI API (إلزامي)
- 🌐 التسجيل: https://platform.openai.com/signup
- 🔑 الحصول على API Key: https://platform.openai.com/api-keys
- 💰 التكلفة: Pay-as-you-go (حسب الاستخدام)
- 📝 ملاحظة: ستحتاج GPT-4o و Whisper API

### 2. Green API (إلزامي)
- 🌐 التسجيل: https://green-api.com
- 🔑 الحصول على Instance ID و Token
- 💰 التكلفة: تبدأ من $10/شهر
- 📝 ملاحظة: لتكامل WhatsApp Business

### 3. Tap Payment (اختياري)
- 🌐 التسجيل: https://tap.company
- 🔑 الحصول على Secret Key و Public Key
- 💰 التكلفة: عمولة على كل معاملة
- 📝 ملاحظة: لقبول المدفوعات من العملاء

### 4. SMTP2GO (اختياري)
- 🌐 التسجيل: https://www.smtp2go.com
- 🔑 الحصول على API Key
- 💰 التكلفة: 1,000 رسالة مجاناً شهرياً
- 📝 ملاحظة: لإرسال الفواتير والتقارير بالبريد

## 📦 خطوات التثبيت | Installation Steps

### 1. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/sari.git
cd sari
```

### 2. تثبيت الحزم
```bash
# تثبيت pnpm إذا لم يكن مثبتاً
npm install -g pnpm

# تثبيت جميع الحزم
pnpm install
```

### 3. إعداد قاعدة البيانات

#### إنشاء قاعدة بيانات MySQL:
```sql
CREATE DATABASE sari CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sari_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON sari.* TO 'sari_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. إعداد المتغيرات البيئية

أنشئ ملف `.env` في المجلد الرئيسي:

```bash
cp .env.example .env
```

ثم عدّل الملف وأضف القيم الفعلية:

```env
# قاعدة البيانات
DATABASE_URL="mysql://sari_user:your_password@localhost:3306/sari"

# JWT Secret (استخدم قيمة عشوائية قوية)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# OpenAI API
OPENAI_API_KEY="sk-proj-..."

# Green API
GREEN_API_INSTANCE_ID="your_instance_id"
GREEN_API_TOKEN="your_token"

# Tap Payment (اختياري)
TAP_SECRET_KEY="sk_test_..."
TAP_PUBLIC_KEY="pk_test_..."

# SMTP2GO (اختياري)
SMTP2GO_API_KEY="api-..."
SMTP_FROM="noreply@yourdomain.com"

# App Branding
VITE_APP_TITLE="ساري - مساعد المبيعات الذكي"
VITE_APP_LOGO="/sari-logo.png"
```

### 5. تطبيق Migrations

```bash
# تطبيق جميع الـ migrations على قاعدة البيانات
pnpm db:push
```

### 6. إضافة البيانات الأولية (اختياري)

```bash
# إنشاء الباقات الافتراضية
node scripts/seed-plans.mjs

# إضافة بيانات تجريبية للاختبار
node seed-data.mjs
```

### 7. تشغيل المشروع

#### Development Mode:
```bash
pnpm dev
```
الموقع سيعمل على: http://localhost:3000

#### Production Mode:
```bash
# بناء المشروع
pnpm build

# تشغيل السيرفر
pnpm start
```

## 🧪 اختبار التثبيت

### 1. تشغيل الاختبارات
```bash
pnpm test
```

### 2. فحص الاتصال بقاعدة البيانات
```bash
node scripts/check-plans.mjs
```

### 3. اختبار Green API
- افتح: http://localhost:3000/merchant/whatsapp-test
- أدخل Instance ID و Token
- اضغط "اختبار الاتصال"

## 👤 إنشاء حسابات تجريبية

```bash
# إنشاء حساب Admin و Merchant تجريبي
node scripts/create-demo-users.mjs
```

**حسابات الدخول:**
- **Admin**: admin@sari.sa / admin123
- **Merchant**: merchant@sari.sa / merchant123

## 🔧 إعداد WhatsApp

### 1. الحصول على Green API Credentials
1. سجل في https://green-api.com
2. أنشئ Instance جديد
3. انسخ Instance ID و Token

### 2. ربط رقم WhatsApp
1. افتح: http://localhost:3000/merchant/whatsapp-instances
2. أضف Instance ID و Token
3. امسح QR Code من تطبيق WhatsApp
4. انتظر حتى تظهر حالة "متصل"

### 3. تفعيل Webhook
1. افتح Green API Console
2. اذهب إلى Settings → Webhooks
3. فعّل Incoming و Outgoing و State webhooks
4. أضف Webhook URL: `https://yourdomain.com/api/webhooks/greenapi`

## 📊 إعداد لوحة التحكم

### 1. تسجيل الدخول
افتح: http://localhost:3000/login

### 2. إعداد المنتجات
- افتح: `/merchant/products`
- أضف منتجاتك يدوياً أو ارفع ملف CSV

### 3. تخصيص إعدادات الروبوت
- افتح: `/merchant/bot-settings`
- خصص رسالة الترحيب
- حدد ساعات العمل
- اختر نبرة الصوت

### 4. اختبار ساري AI
- افتح: `/merchant/test-sari`
- جرّب المحادثة مع ساري
- استخدم الأمثلة الجاهزة

## 🚀 النشر على الإنتاج

راجع [دليل النشر](docs/DEPLOYMENT_GUIDE.md) للتفاصيل الكاملة.

### نصائح سريعة:
1. استخدم قيمة قوية لـ `JWT_SECRET`
2. فعّل HTTPS/SSL
3. استخدم PM2 لإدارة العمليات
4. فعّل Nginx كـ Reverse Proxy
5. راقب الـ Logs بانتظام

## ❓ حل المشاكل الشائعة

### مشكلة: خطأ في الاتصال بقاعدة البيانات
```bash
# تأكد من تشغيل MySQL
sudo systemctl status mysql

# تحقق من صحة DATABASE_URL في .env
```

### مشكلة: Green API لا يستجيب
```bash
# تحقق من صحة Instance ID و Token
# تأكد من أن Instance في حالة "authorized"
# افتح Green API Console وتحقق من الحالة
```

### مشكلة: OpenAI API تعطي خطأ 401
```bash
# تحقق من صحة OPENAI_API_KEY
# تأكد من وجود رصيد في حسابك
```

### مشكلة: الاختبارات تفشل
```bash
# تأكد من تطبيق جميع الـ migrations
pnpm db:push

# امسح الـ cache وأعد التثبيت
rm -rf node_modules .pnpm-store
pnpm install
```

## 📚 الوثائق الإضافية

- [دليل تكامل Green API](docs/GREEN_API_INTEGRATION.md)
- [دليل تكامل OpenAI](docs/OPENAI_INTEGRATION.md)
- [دليل تكامل Salla](docs/SALLA_INTEGRATION.md)
- [دليل الأتمتة](docs/AUTOMATION_FEATURES.md)
- [دليل النشر](docs/DEPLOYMENT_GUIDE.md)

## 💬 الدعم

إذا واجهت أي مشكلة:
- 📧 البريد: support@sary.live
- 💬 WhatsApp: +966501898700
- 🌐 الموقع: https://sary.live
- 📖 المدونة: https://sary.live/blog

---

**صُنع بكل ❤️ في المملكة العربية السعودية 🇸🇦**
