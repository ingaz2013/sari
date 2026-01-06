# سياق المشروع - Sari

## نظرة عامة

**Sari** هو وكيل مبيعات ذكي مدعوم بالذكاء الاصطناعي يعمل عبر WhatsApp. يهدف المشروع إلى تمكين الشركات من أتمتة عمليات المبيعات والتواصل مع العملاء من خلال واجهة محادثة ذكية.

## المعلومات التقنية

- **اسم المشروع**: sari
- **المسار**: `/home/ubuntu/sari`
- **الإصدار الحالي**: 3394ef7c
- **الميزات المفعلة**: server, db, user
- **رابط خادم التطوير**: https://3000-i2p6cd0zb6qb4wcyphorn-356c60d6.manus-asia.computer

## البنية التقنية

### Frontend
- React 19
- Tailwind CSS 4
- tRPC 11 (للاتصال بين Frontend و Backend)
- Wouter (للتوجيه)
- shadcn/ui (مكونات واجهة المستخدم)

### Backend
- Express 4
- tRPC 11
- Drizzle ORM (للتعامل مع قاعدة البيانات)
- Manus OAuth (للمصادقة)

### قاعدة البيانات
- MySQL/TiDB
- إدارة الجداول عبر Drizzle Schema

### التكاملات المتاحة
- **WhatsApp Integration**: عبر GREEN_API_INSTANCE_ID و GREEN_API_TOKEN
- **LLM Integration**: عبر OPENAI_API_KEY و BUILT_IN_FORGE_API
- **File Storage**: S3 عبر الوظائف المدمجة
- **Maps**: Google Maps عبر Manus Proxy
- **Authentication**: Manus OAuth

## الملفات الرئيسية

### Backend
- `drizzle/schema.ts` - تعريف جداول قاعدة البيانات
- `server/db.ts` - وظائف الاستعلام من قاعدة البيانات
- `server/routers.ts` - إجراءات tRPC (API endpoints)
- `server/_core/` - البنية التحتية للإطار (OAuth, Context, LLM, Storage)

### Frontend
- `client/src/App.tsx` - التوجيه والتخطيط العام
- `client/src/pages/Home.tsx` - الصفحة الرئيسية
- `client/src/lib/trpc.ts` - عميل tRPC
- `client/src/components/` - مكونات واجهة المستخدم القابلة لإعادة الاستخدام

## المتغيرات البيئية المتاحة

المتغيرات التالية محقونة تلقائياً من المنصة:

- `DATABASE_URL` - سلسلة اتصال قاعدة البيانات
- `JWT_SECRET` - سر توقيع جلسة المستخدم
- `VITE_APP_ID` - معرف تطبيق Manus OAuth
- `OAUTH_SERVER_URL` - عنوان خادم Manus OAuth
- `OWNER_OPEN_ID`, `OWNER_NAME` - معلومات المالك
- `OPENAI_API_KEY` - مفتاح OpenAI API
- `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN` - بيانات اعتماد WhatsApp
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` - واجهات Manus المدمجة
- `TAP_SECRET_KEY`, `VITE_TAP_PUBLIC_KEY` - مفاتيح الدفع

## سير العمل الموصى به

### 1. تطوير ميزة جديدة
1. تحديث `drizzle/schema.ts` إذا كانت الميزة تتطلب جداول جديدة
2. تشغيل `pnpm db:push` لتطبيق التغييرات على قاعدة البيانات
3. إضافة وظائف الاستعلام في `server/db.ts`
4. إنشاء إجراءات tRPC في `server/routers.ts`
5. بناء واجهة المستخدم في `client/src/pages/`
6. استخدام `trpc.*.useQuery/useMutation` للاتصال بالخادم
7. كتابة اختبارات Vitest في `server/*.test.ts`
8. تشغيل `pnpm test` للتحقق من الاختبارات
9. تحديث `todo.md` بوضع علامة [x] على المهمة المكتملة

### 2. إدارة Checkpoints

#### ما هو Checkpoint؟
Checkpoint هو لقطة كاملة لحالة المشروع في لحظة معينة، تشمل:
- جميع ملفات الكود (Frontend و Backend)
- تكوينات المشروع
- التبعيات (dependencies)
- حالة قاعدة البيانات (schema)
- البيئة والإعدادات

#### متى يتم إنشاء Checkpoint؟
- **بعد إكمال ميزة رئيسية**: عند الانتهاء من تطوير ميزة كاملة وعملها بشكل صحيح
- **قبل عمليات خطرة**: قبل إعادة الهيكلة، ترقية التبعيات، أو تغييرات جذرية
- **قبل النشر**: يجب إنشاء checkpoint قبل نشر المشروع (مطلوب للنشر)
- **عند طلب المستخدم**: عندما يطلب المستخدم حفظ الحالة الحالية

#### كيفية إنشاء Checkpoint
استخدام أداة `webdev_save_checkpoint` مع وصف واضح:
```
webdev_save_checkpoint({
  description: "وصف واضح للتغييرات المحفوظة في هذا الإصدار"
})
```

#### استعادة Checkpoint سابق
استخدام أداة `webdev_rollback_checkpoint` مع معرف الإصدار:
```
webdev_rollback_checkpoint({
  version_id: "3394ef7c"
})
```

#### ملاحظات مهمة
- **لا تستخدم `git reset --hard` أبداً** - استخدم `webdev_rollback_checkpoint` بدلاً منه
- كل checkpoint يحتفظ بنسخة كاملة من المشروع، وليس فقط التغييرات
- يمكن الرجوع إلى أي checkpoint سابق في أي وقت
- Checkpoints ضرورية للنشر - لا يمكن نشر المشروع بدون checkpoint

## الأوامر المفيدة

```bash
# تثبيت التبعيات
pnpm install

# تشغيل خادم التطوير
pnpm dev

# دفع تغييرات قاعدة البيانات
pnpm db:push

# تشغيل الاختبارات
pnpm test

# بناء المشروع للإنتاج
pnpm build
```

## الموارد الإضافية

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

## ملاحظات التطوير

- استخدم `DashboardLayout` للوحات التحكم والأدوات الداخلية
- استخدم المكونات المدمجة قبل بناء مكونات جديدة من الصفر
- احتفظ بالبيانات الفعلية في S3، وليس في قاعدة البيانات
- استخدم `invokeLLM` للتكامل مع الذكاء الاصطناعي
- جميع الطوابع الزمنية يجب أن تُخزن كـ UTC timestamps
- استخدم Optimistic Updates للعمليات السريعة (القوائم، التبديل)
- استخدم `invalidate` للعمليات الحرجة (الدفع، المصادقة)

---

**آخر تحديث**: تم إنشاء المشروع بنجاح مع الميزات الأساسية (server, db, user)
