---
description: خطوات نشر تطبيق ساري على سيرفر الإنتاج
---

# 🚀 دليل النشر (Deployment Guide)

## المتطلبات الأساسية

- Node.js 22.x أو أحدث
- MySQL 8.0+
- pnpm (مدير الحزم)
- خادم VPS مع Ubuntu 22.04+
- شهادة SSL (Let's Encrypt)
- Nginx

---

## الخطوة 1: إعداد السيرفر

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت pnpm
npm install -g pnpm

# تثبيت PM2 لإدارة العمليات
npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx

# تثبيت MySQL
sudo apt install -y mysql-server
```

---

## الخطوة 2: استنساخ المشروع

```bash
# الذهاب إلى مجلد التطبيقات
cd /var/www

# استنساخ المشروع
git clone https://github.com/ingaz2013/sari.git
cd sari

# تثبيت الحزم
pnpm install
```

---

## الخطوة 3: إعداد قاعدة البيانات

```bash
# الدخول إلى MySQL
sudo mysql

# إنشاء قاعدة البيانات
CREATE DATABASE sari_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# إنشاء مستخدم
CREATE USER 'sari_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';

# منح الصلاحيات
GRANT ALL PRIVILEGES ON sari_production.* TO 'sari_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## الخطوة 4: إعداد المتغيرات البيئية

```bash
# نسخ ملف المتغيرات
cp .env.example .env.production

# تعديل الملف
nano .env.production
```

### المتغيرات المطلوبة:

```env
# Database
DATABASE_URL=mysql://sari_user:YOUR_PASSWORD@localhost:3306/sari_production

# Application
NODE_ENV=production
VITE_APP_URL=https://sary.live
PORT=3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI
OPENAI_API_KEY=sk-...

# Green API (WhatsApp)
GREEN_API_URL=https://api.green-api.com

# Tap Payment
TAP_SECRET_KEY=sk_live_...
TAP_PUBLIC_KEY=pk_live_...
```

---

## الخطوة 5: بناء التطبيق

```bash
# تطبيق migrations على قاعدة البيانات
NODE_ENV=production pnpm db:push

# بناء الـ Frontend
pnpm build
```

---

## الخطوة 6: إعداد PM2

```bash
# إنشاء ملف ecosystem
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sari',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/sari/error.log',
    out_file: '/var/log/sari/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M'
  }]
};
```

```bash
# إنشاء مجلد اللوجات
sudo mkdir -p /var/log/sari
sudo chown $USER:$USER /var/log/sari

# تشغيل التطبيق
pm2 start ecosystem.config.js --env production

# حفظ التكوين للتشغيل التلقائي
pm2 save
pm2 startup
```

---

## الخطوة 7: إعداد Nginx

```bash
# إنشاء ملف التكوين
sudo nano /etc/nginx/sites-available/sari
```

```nginx
server {
    listen 80;
    server_name sary.live www.sary.live;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/sari /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl reload nginx
```

---

## الخطوة 8: شهادة SSL (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على الشهادة
sudo certbot --nginx -d sary.live -d www.sary.live

# التجديد التلقائي (يتم إعداده تلقائياً)
sudo systemctl enable certbot.timer
```

---

## الخطوة 9: التحقق من النشر

```bash
# التحقق من حالة التطبيق
pm2 status

# عرض اللوجات
pm2 logs sari

# التحقق من الـ Health Check
curl https://sary.live/health
```

---

## التحديثات المستقبلية

```bash
# سحب آخر التحديثات
cd /var/www/sari
git pull origin main

# تثبيت الحزم الجديدة
pnpm install

# إعادة بناء التطبيق
pnpm build

# إعادة تشغيل التطبيق
pm2 reload sari
```

---

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
# عرض اللوجات
pm2 logs sari --lines 100

# التحقق من المنفذ
sudo lsof -i :3000
```

### مشاكل قاعدة البيانات
```bash
# التحقق من حالة MySQL
sudo systemctl status mysql

# اختبار الاتصال
mysql -u sari_user -p -e "SELECT 1;"
```

### مشاكل SSL
```bash
# تجديد الشهادة يدوياً
sudo certbot renew

# التحقق من الشهادة
sudo certbot certificates
```
