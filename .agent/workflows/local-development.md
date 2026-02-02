---
description: خطوات تشغيل مشروع ساري محلياً للتطوير
---

# 🖥️ دليل التطوير المحلي (Local Development)

## المتطلبات

- Node.js 22.x
- pnpm
- MySQL 8.0+ (أو XAMPP/Laragon)
- Git

---

## الخطوة 1: استنساخ المشروع

```bash
git clone https://github.com/ingaz2013/sari.git
cd sari
```

---

## الخطوة 2: تثبيت الحزم

// turbo
```bash
pnpm install
```

---

## الخطوة 3: إعداد قاعدة البيانات

### باستخدام XAMPP (Windows):
1. افتح XAMPP Control Panel
2. شغّل MySQL
3. افتح phpMyAdmin (http://localhost/phpmyadmin)
4. أنشئ قاعدة بيانات جديدة: `sari_dev`

### باستخدام MySQL CLI:
```bash
mysql -u root -p
CREATE DATABASE sari_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## الخطوة 4: إعداد المتغيرات البيئية

```bash
# نسخ ملف المتغيرات
cp .env.example .env
```

### تعديل ملف .env:

```env
# Database - MySQL محلي
DATABASE_URL=mysql://root:@localhost:3306/sari_dev

# Application
NODE_ENV=development
VITE_APP_URL=http://localhost:3000
PORT=3000

# Authentication (للتطوير فقط)
JWT_SECRET=dev-secret-key-change-in-production

# OpenAI (مطلوب للـ AI features)
OPENAI_API_KEY=sk-your-key-here

# Green API (اختياري للتطوير)
GREEN_API_URL=https://api.green-api.com
```

---

## الخطوة 5: تطبيق Database Schema

// turbo
```bash
pnpm db:push
```

---

## الخطوة 6: إضافة بيانات تجريبية (اختياري)

// turbo
```bash
node seed.mjs
```

---

## الخطوة 7: تشغيل التطبيق

// turbo
```bash
pnpm dev
```

التطبيق سيعمل على: **http://localhost:3000**

---

## حسابات الدخول الافتراضية

| النوع | البريد | كلمة المرور |
|-------|--------|-------------|
| Admin | admin@sari.sa | admin123 |
| Merchant | merchant@test.com | test123 |

---

## الأوامر المفيدة

### تشغيل التطبيق
```bash
pnpm dev          # تشغيل بيئة التطوير
pnpm build        # بناء للإنتاج
pnpm preview      # معاينة البناء
```

### قاعدة البيانات
```bash
pnpm db:push      # تطبيق التغييرات على DB
pnpm db:studio    # فتح Drizzle Studio
```

### الاختبارات
```bash
pnpm test         # تشغيل الاختبارات
pnpm test:watch   # تشغيل مع المراقبة
```

### التنسيق
```bash
pnpm lint         # فحص الكود
pnpm format       # تنسيق الكود
```

---

## استكشاف الأخطاء

### خطأ "NODE_ENV is not recognized"
هذا خطأ شائع في Windows. استخدم:
```bash
set NODE_ENV=development && pnpm dev
```
أو استخدم cross-env (مُثبت مسبقاً):
```bash
npx cross-env NODE_ENV=development pnpm dev
```

### خطأ في الاتصال بقاعدة البيانات
1. تأكد من تشغيل MySQL
2. تحقق من DATABASE_URL في .env
3. تأكد من وجود قاعدة البيانات

### المنفذ 3000 مستخدم
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# أو استخدم منفذ آخر في .env
PORT=3001
```

---

## نصائح للتطوير

1. **Hot Reload**: التغييرات تظهر تلقائياً
2. **Drizzle Studio**: استخدم `pnpm db:studio` لعرض البيانات
3. **Console**: راقب الـ terminal للأخطاء
4. **Browser DevTools**: استخدم React DevTools للتصحيح
