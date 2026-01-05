/**
 * Seed Business Templates
 * Run with: npx tsx scripts/seed-templates.ts
 */

import { getDb } from '../server/db';
import { businessTemplates } from '../drizzle/schema';

const TEMPLATES = [
  // Store Templates
  {
    business_type: 'store' as const,
    template_name: 'متجر ملابس عصرية',
    icon: '👔',
    description: 'قالب متكامل لمتاجر الملابس والأزياء',
    suitable_for: 'متاجر الملابس، محلات الأزياء، البوتيكات',
    services: JSON.stringify([]),
    products: JSON.stringify([
      { name: 'قميص قطني', description: 'قميص قطني مريح بألوان متعددة', price: 150, category: 'ملابس رجالية', stock: 50, is_active: 1 },
      { name: 'فستان سهرة', description: 'فستان سهرة أنيق للمناسبات', price: 450, category: 'ملابس نسائية', stock: 30, is_active: 1 },
      { name: 'بنطال جينز', description: 'بنطال جينز عالي الجودة', price: 200, category: 'ملابس رجالية', stock: 40, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '09:00', close: '22:00', isOpen: true },
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '14:00', close: '22:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'friendly',
      language: 'ar',
      welcomeMessage: 'أهلاً وسهلاً! 👋 أنا ساري، مساعدك في متجرنا. كيف يمكنني مساعدتك اليوم؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'store' as const,
    template_name: 'متجر إلكترونيات',
    icon: '📱',
    description: 'قالب مخصص لمتاجر الإلكترونيات والأجهزة',
    suitable_for: 'متاجر الجوالات، محلات الإلكترونيات، بيع الأجهزة',
    services: JSON.stringify([]),
    products: JSON.stringify([
      { name: 'آيفون 15 برو', description: 'أحدث إصدار من آيفون', price: 4500, category: 'جوالات', stock: 20, is_active: 1 },
      { name: 'سماعات لاسلكية', description: 'سماعات بلوتوث عالية الجودة', price: 350, category: 'إكسسوارات', stock: 50, is_active: 1 },
      { name: 'شاحن سريع', description: 'شاحن سريع 65 واط', price: 120, category: 'إكسسوارات', stock: 100, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '10:00', close: '23:00', isOpen: true },
      sunday: { open: '10:00', close: '23:00', isOpen: true },
      monday: { open: '10:00', close: '23:00', isOpen: true },
      tuesday: { open: '10:00', close: '23:00', isOpen: true },
      wednesday: { open: '10:00', close: '23:00', isOpen: true },
      thursday: { open: '10:00', close: '23:00', isOpen: true },
      friday: { open: '15:00', close: '23:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'professional',
      language: 'ar',
      welcomeMessage: 'مرحباً بك في متجرنا للإلكترونيات. كيف يمكنني مساعدتك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'store' as const,
    template_name: 'متجر مواد غذائية',
    icon: '🛒',
    description: 'قالب لمتاجر البقالة والمواد الغذائية',
    suitable_for: 'سوبر ماركت، بقالة، متاجر المواد الغذائية',
    services: JSON.stringify([]),
    products: JSON.stringify([
      { name: 'أرز بسمتي 5 كجم', description: 'أرز بسمتي فاخر', price: 45, category: 'حبوب', stock: 200, is_active: 1 },
      { name: 'زيت زيتون 1 لتر', description: 'زيت زيتون بكر ممتاز', price: 85, category: 'زيوت', stock: 100, is_active: 1 },
      { name: 'حليب طازج 2 لتر', description: 'حليب طازج كامل الدسم', price: 18, category: 'ألبان', stock: 150, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '07:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '23:00', isOpen: true },
      monday: { open: '07:00', close: '23:00', isOpen: true },
      tuesday: { open: '07:00', close: '23:00', isOpen: true },
      wednesday: { open: '07:00', close: '23:00', isOpen: true },
      thursday: { open: '07:00', close: '23:00', isOpen: true },
      friday: { open: '07:00', close: '23:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'friendly',
      language: 'ar',
      welcomeMessage: 'أهلاً! 🛒 كيف يمكنني مساعدتك في طلبك اليوم؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },

  // Services Templates
  {
    business_type: 'services' as const,
    template_name: 'صالون تجميل',
    icon: '💇',
    description: 'قالب شامل لصالونات التجميل والعناية',
    suitable_for: 'صالونات نسائية، مراكز تجميل، سبا',
    services: JSON.stringify([
      { name: 'قص شعر', description: 'قص وتصفيف شعر احترافي', priceType: 'fixed', basePrice: 80, durationMinutes: 45, requiresAppointment: 1, is_active: 1 },
      { name: 'صبغة شعر', description: 'صبغة شعر بألوان متنوعة', priceType: 'fixed', basePrice: 250, durationMinutes: 120, requiresAppointment: 1, is_active: 1 },
      { name: 'مكياج', description: 'مكياج للمناسبات', priceType: 'fixed', basePrice: 200, durationMinutes: 60, requiresAppointment: 1, is_active: 1 },
      { name: 'عناية بالبشرة', description: 'جلسة عناية بالبشرة', priceType: 'fixed', basePrice: 150, durationMinutes: 90, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([]),
    working_hours: JSON.stringify({
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '09:00', close: '21:00', isOpen: true },
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '14:00', close: '21:00', isOpen: false },
    }),
    bot_personality: JSON.stringify({
      tone: 'friendly',
      language: 'ar',
      welcomeMessage: 'أهلاً وسهلاً! 💇 كيف يمكنني مساعدتك في حجز موعد؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: true,
      appointmentReminders: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'services' as const,
    template_name: 'عيادة طبية',
    icon: '🏥',
    description: 'قالب للعيادات الطبية والمراكز الصحية',
    suitable_for: 'عيادات، مراكز طبية، مستوصفات',
    services: JSON.stringify([
      { name: 'كشف عام', description: 'كشف طبي عام', priceType: 'fixed', basePrice: 150, durationMinutes: 30, requiresAppointment: 1, is_active: 1 },
      { name: 'استشارة متخصصة', description: 'استشارة طبية متخصصة', priceType: 'fixed', basePrice: 300, durationMinutes: 45, requiresAppointment: 1, is_active: 1 },
      { name: 'فحوصات مخبرية', description: 'تحاليل وفحوصات', priceType: 'variable', minPrice: 100, maxPrice: 500, durationMinutes: 15, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([]),
    working_hours: JSON.stringify({
      saturday: { open: '08:00', close: '20:00', isOpen: true },
      sunday: { open: '08:00', close: '20:00', isOpen: true },
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '16:00', close: '20:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'professional',
      language: 'ar',
      welcomeMessage: 'مرحباً بك في عيادتنا. كيف يمكنني مساعدتك في حجز موعد؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: true,
      appointmentReminders: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'services' as const,
    template_name: 'مركز صيانة سيارات',
    icon: '🔧',
    description: 'قالب لمراكز صيانة وإصلاح السيارات',
    suitable_for: 'ورش سيارات، مراكز صيانة، خدمات سيارات',
    services: JSON.stringify([
      { name: 'تغيير زيت', description: 'تغيير زيت المحرك والفلتر', priceType: 'fixed', basePrice: 120, durationMinutes: 30, requiresAppointment: 1, is_active: 1 },
      { name: 'فحص شامل', description: 'فحص شامل للسيارة', priceType: 'fixed', basePrice: 200, durationMinutes: 60, requiresAppointment: 1, is_active: 1 },
      { name: 'إصلاح ميكانيكي', description: 'إصلاحات ميكانيكية', priceType: 'custom', durationMinutes: 120, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([]),
    working_hours: JSON.stringify({
      saturday: { open: '07:00', close: '22:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
      monday: { open: '07:00', close: '22:00', isOpen: true },
      tuesday: { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday: { open: '07:00', close: '22:00', isOpen: true },
      friday: { open: '14:00', close: '22:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'casual',
      language: 'ar',
      welcomeMessage: 'هلا! 🔧 كيف يمكنني مساعدتك في صيانة سيارتك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      appointmentReminders: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'services' as const,
    template_name: 'مركز تدريب',
    icon: '📚',
    description: 'قالب لمراكز التدريب والدورات',
    suitable_for: 'مراكز تدريب، معاهد، دورات تعليمية',
    services: JSON.stringify([
      { name: 'دورة تطوير ويب', description: 'دورة شاملة في تطوير المواقع', priceType: 'fixed', basePrice: 2500, durationMinutes: 120, requiresAppointment: 1, is_active: 1 },
      { name: 'دورة تصميم جرافيك', description: 'تعلم التصميم الجرافيكي', priceType: 'fixed', basePrice: 1800, durationMinutes: 90, requiresAppointment: 1, is_active: 1 },
      { name: 'دورة تسويق رقمي', description: 'أساسيات التسويق الرقمي', priceType: 'fixed', basePrice: 1500, durationMinutes: 90, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([]),
    working_hours: JSON.stringify({
      saturday: { open: '08:00', close: '20:00', isOpen: true },
      sunday: { open: '08:00', close: '20:00', isOpen: true },
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '00:00', close: '00:00', isOpen: false },
    }),
    bot_personality: JSON.stringify({
      tone: 'professional',
      language: 'ar',
      welcomeMessage: 'مرحباً بك في مركزنا التدريبي. كيف يمكنني مساعدتك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: true,
      appointmentReminders: true,
    }),
    is_active: 1,
  },

  // Both (Store + Services) Templates
  {
    business_type: 'both' as const,
    template_name: 'مطعم',
    icon: '🍽️',
    description: 'قالب شامل للمطاعم (طعام + توصيل)',
    suitable_for: 'مطاعم، كافيهات، مقاهي',
    services: JSON.stringify([
      { name: 'توصيل طلبات', description: 'خدمة توصيل للمنازل', priceType: 'fixed', basePrice: 15, durationMinutes: 30, requiresAppointment: 0, is_active: 1 },
      { name: 'حجز طاولة', description: 'حجز طاولة في المطعم', priceType: 'fixed', basePrice: 0, durationMinutes: 0, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([
      { name: 'برجر لحم', description: 'برجر لحم فاخر مع بطاطس', price: 45, category: 'وجبات رئيسية', stock: 999, is_active: 1 },
      { name: 'بيتزا مارغريتا', description: 'بيتزا إيطالية أصلية', price: 55, category: 'وجبات رئيسية', stock: 999, is_active: 1 },
      { name: 'سلطة سيزر', description: 'سلطة سيزر طازجة', price: 28, category: 'مقبلات', stock: 999, is_active: 1 },
      { name: 'عصير برتقال طازج', description: 'عصير برتقال طبيعي', price: 15, category: 'مشروبات', stock: 999, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '10:00', close: '02:00', isOpen: true },
      sunday: { open: '10:00', close: '02:00', isOpen: true },
      monday: { open: '10:00', close: '02:00', isOpen: true },
      tuesday: { open: '10:00', close: '02:00', isOpen: true },
      wednesday: { open: '10:00', close: '02:00', isOpen: true },
      thursday: { open: '10:00', close: '02:00', isOpen: true },
      friday: { open: '10:00', close: '02:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'friendly',
      language: 'ar',
      welcomeMessage: 'أهلاً وسهلاً في مطعمنا! 🍽️ كيف يمكنني مساعدتك اليوم؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'both' as const,
    template_name: 'صيدلية',
    icon: '💊',
    description: 'قالب للصيدليات (أدوية + استشارات)',
    suitable_for: 'صيدليات، مستودعات أدوية',
    services: JSON.stringify([
      { name: 'استشارة صيدلانية', description: 'استشارة مع صيدلي', priceType: 'fixed', basePrice: 50, durationMinutes: 15, requiresAppointment: 0, is_active: 1 },
      { name: 'قياس ضغط', description: 'قياس ضغط الدم', priceType: 'fixed', basePrice: 20, durationMinutes: 10, requiresAppointment: 0, is_active: 1 },
    ]),
    products: JSON.stringify([
      { name: 'بانادول أقراص', description: 'مسكن للألم والحرارة', price: 12, category: 'مسكنات', stock: 200, is_active: 1 },
      { name: 'فيتامين سي 1000', description: 'مكمل فيتامين سي', price: 45, category: 'فيتامينات', stock: 150, is_active: 1 },
      { name: 'كريم مرطب', description: 'كريم مرطب للبشرة', price: 65, category: 'عناية', stock: 100, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '08:00', close: '00:00', isOpen: true },
      sunday: { open: '08:00', close: '00:00', isOpen: true },
      monday: { open: '08:00', close: '00:00', isOpen: true },
      tuesday: { open: '08:00', close: '00:00', isOpen: true },
      wednesday: { open: '08:00', close: '00:00', isOpen: true },
      thursday: { open: '08:00', close: '00:00', isOpen: true },
      friday: { open: '08:00', close: '00:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'professional',
      language: 'ar',
      welcomeMessage: 'مرحباً بك في صيدليتنا. كيف يمكنني مساعدتك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'both' as const,
    template_name: 'ورشة (قطع غيار + صيانة)',
    icon: '🚗',
    description: 'قالب لورش السيارات (بيع قطع + صيانة)',
    suitable_for: 'ورش سيارات، محلات قطع غيار',
    services: JSON.stringify([
      { name: 'صيانة دورية', description: 'صيانة دورية شاملة', priceType: 'fixed', basePrice: 300, durationMinutes: 90, requiresAppointment: 1, is_active: 1 },
      { name: 'تركيب قطع', description: 'تركيب قطع الغيار', priceType: 'custom', durationMinutes: 60, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([
      { name: 'فلتر زيت', description: 'فلتر زيت أصلي', price: 45, category: 'قطع غيار', stock: 100, is_active: 1 },
      { name: 'بطارية 70 أمبير', description: 'بطارية سيارة', price: 350, category: 'قطع غيار', stock: 30, is_active: 1 },
      { name: 'إطار 195/65 R15', description: 'إطار سيارة', price: 280, category: 'إطارات', stock: 50, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '07:00', close: '22:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
      monday: { open: '07:00', close: '22:00', isOpen: true },
      tuesday: { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday: { open: '07:00', close: '22:00', isOpen: true },
      friday: { open: '14:00', close: '22:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'casual',
      language: 'ar',
      welcomeMessage: 'هلا! 🚗 عندك قطعة أو صيانة؟ أنا جاهز أساعدك',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  // قوالب متخصصة إضافية
  {
    business_type: 'store' as const,
    template_name: 'مكتبة',
    icon: '📚',
    description: 'قالب متكامل للمكتبات وبيع الكتب',
    suitable_for: 'مكتبات، محلات كتب، دور نشر',
    services: JSON.stringify([]),
    products: JSON.stringify([
      { name: 'رواية عربية', description: 'رواية أدبية عربية', price: 45, category: 'روايات', stock: 80, is_active: 1 },
      { name: 'كتاب تطوير ذات', description: 'كتاب في التنمية البشرية', price: 55, category: 'تطوير ذات', stock: 60, is_active: 1 },
      { name: 'كتاب أطفال', description: 'قصص مصورة للأطفال', price: 30, category: 'أطفال', stock: 100, is_active: 1 },
      { name: 'قرطاسية مدرسية', description: 'أدوات مدرسية متنوعة', price: 25, category: 'قرطاسية', stock: 150, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '09:00', close: '21:00', isOpen: true },
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '14:00', close: '21:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'friendly',
      language: 'ar',
      welcomeMessage: 'أهلاً وسهلاً في مكتبتنا! 📚 كيف يمكنني مساعدتك في إيجاد كتابك المفضل؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'services' as const,
    template_name: 'نادي رياضي',
    icon: '💪',
    description: 'قالب شامل للنوادي الرياضية ومراكز اللياقة',
    suitable_for: 'نوادي رياضية، صالات جيم، مراكز لياقة',
    services: JSON.stringify([
      { name: 'اشتراك شهري', description: 'اشتراك شهري في النادي', priceType: 'fixed', basePrice: 300, durationMinutes: 0, requiresAppointment: 0, is_active: 1 },
      { name: 'اشتراك سنوي', description: 'اشتراك سنوي مع خصم', priceType: 'fixed', basePrice: 2800, durationMinutes: 0, requiresAppointment: 0, is_active: 1 },
      { name: 'تدريب شخصي', description: 'جلسة تدريب شخصي مع مدرب', priceType: 'fixed', basePrice: 150, durationMinutes: 60, requiresAppointment: 1, is_active: 1 },
      { name: 'برنامج تغذية', description: 'برنامج تغذية متكامل', priceType: 'fixed', basePrice: 500, durationMinutes: 45, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([]),
    working_hours: JSON.stringify({
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '06:00', close: '23:00', isOpen: true },
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '14:00', close: '23:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'motivational',
      language: 'ar',
      welcomeMessage: 'أهلاً بطل! 💪 جاهز لتبدأ رحلة اللياقة؟ كيف أقدر أساعدك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      appointmentReminders: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'both' as const,
    template_name: 'مقهى',
    icon: '☕',
    description: 'قالب متكامل للمقاهي (مشروبات + حلويات)',
    suitable_for: 'مقاهي، كافيهات، محامص',
    services: JSON.stringify([
      { name: 'حجز طاولة', description: 'حجز طاولة في المقهى', priceType: 'fixed', basePrice: 0, durationMinutes: 0, requiresAppointment: 1, is_active: 1 },
      { name: 'توصيل', description: 'خدمة توصيل للمنازل', priceType: 'fixed', basePrice: 10, durationMinutes: 25, requiresAppointment: 0, is_active: 1 },
    ]),
    products: JSON.stringify([
      { name: 'قهوة أمريكانو', description: 'قهوة أمريكانو ساخنة', price: 18, category: 'مشروبات ساخنة', stock: 999, is_active: 1 },
      { name: 'كابتشينو', description: 'كابتشينو بالحليب الطازج', price: 22, category: 'مشروبات ساخنة', stock: 999, is_active: 1 },
      { name: 'آيس لاتيه', description: 'لاتيه مثلج منعش', price: 24, category: 'مشروبات باردة', stock: 999, is_active: 1 },
      { name: 'كرواسون', description: 'كرواسون طازج بالزبدة', price: 15, category: 'معجنات', stock: 50, is_active: 1 },
      { name: 'كيك شوكولاتة', description: 'قطعة كيك شوكولاتة فاخرة', price: 28, category: 'حلويات', stock: 30, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '07:00', close: '01:00', isOpen: true },
      sunday: { open: '07:00', close: '01:00', isOpen: true },
      monday: { open: '07:00', close: '01:00', isOpen: true },
      tuesday: { open: '07:00', close: '01:00', isOpen: true },
      wednesday: { open: '07:00', close: '01:00', isOpen: true },
      thursday: { open: '07:00', close: '01:00', isOpen: true },
      friday: { open: '07:00', close: '01:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'friendly',
      language: 'ar',
      welcomeMessage: 'أهلاً وسهلاً! ☕ كيف يمكنني أن أخدمك اليوم؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'services' as const,
    template_name: 'استشارات مهنية',
    icon: '💼',
    description: 'قالب للاستشارات المهنية والخدمات الاحترافية',
    suitable_for: 'مكاتب استشارات، محامين، محاسبين، مستشارين',
    services: JSON.stringify([
      { name: 'استشارة قانونية', description: 'استشارة قانونية متخصصة', priceType: 'fixed', basePrice: 500, durationMinutes: 60, requiresAppointment: 1, is_active: 1 },
      { name: 'استشارة محاسبية', description: 'استشارة في المحاسبة والضرائب', priceType: 'fixed', basePrice: 400, durationMinutes: 45, requiresAppointment: 1, is_active: 1 },
      { name: 'استشارة إدارية', description: 'استشارة في الإدارة والتخطيط', priceType: 'fixed', basePrice: 600, durationMinutes: 90, requiresAppointment: 1, is_active: 1 },
      { name: 'مراجعة عقود', description: 'مراجعة وصياغة العقود', priceType: 'variable', minPrice: 300, maxPrice: 2000, durationMinutes: 120, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([]),
    working_hours: JSON.stringify({
      saturday: { open: '08:00', close: '17:00', isOpen: true },
      sunday: { open: '08:00', close: '17:00', isOpen: true },
      monday: { open: '08:00', close: '17:00', isOpen: true },
      tuesday: { open: '08:00', close: '17:00', isOpen: true },
      wednesday: { open: '08:00', close: '17:00', isOpen: true },
      thursday: { open: '08:00', close: '17:00', isOpen: true },
      friday: { open: '00:00', close: '00:00', isOpen: false },
    }),
    bot_personality: JSON.stringify({
      tone: 'professional',
      language: 'ar',
      welcomeMessage: 'مرحباً بك في مكتبنا الاستشاري. كيف يمكنني مساعدتك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: true,
      appointmentReminders: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'store' as const,
    template_name: 'متجر عطور',
    icon: '🌸',
    description: 'قالب متخصص لمتاجر العطور والبخور',
    suitable_for: 'محلات عطور، متاجر بخور، عطارة',
    services: JSON.stringify([]),
    products: JSON.stringify([
      { name: 'عطر فرنسي فاخر', description: 'عطر فرنسي أصلي 100 مل', price: 450, category: 'عطور رجالية', stock: 40, is_active: 1 },
      { name: 'عطر نسائي', description: 'عطر نسائي راقي 75 مل', price: 380, category: 'عطور نسائية', stock: 50, is_active: 1 },
      { name: 'عود كمبودي', description: 'عود كمبودي فاخر', price: 850, category: 'بخور', stock: 20, is_active: 1 },
      { name: 'مبخرة كهربائية', description: 'مبخرة كهربائية حديثة', price: 120, category: 'إكسسوارات', stock: 30, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '10:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '22:00', isOpen: true },
      monday: { open: '10:00', close: '22:00', isOpen: true },
      tuesday: { open: '10:00', close: '22:00', isOpen: true },
      wednesday: { open: '10:00', close: '22:00', isOpen: true },
      thursday: { open: '10:00', close: '22:00', isOpen: true },
      friday: { open: '15:00', close: '22:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'elegant',
      language: 'ar',
      welcomeMessage: 'أهلاً وسهلاً في عالم العطور 🌸 كيف يمكنني مساعدتك في اختيار عطرك المثالي؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'store' as const,
    template_name: 'متجر ألعاب أطفال',
    icon: '🧸',
    description: 'قالب متكامل لمتاجر ألعاب الأطفال',
    suitable_for: 'محلات ألعاب، متاجر ألعاب تعليمية',
    services: JSON.stringify([]),
    products: JSON.stringify([
      { name: 'دمية تفاعلية', description: 'دمية تفاعلية ناطقة', price: 180, category: 'دمى', stock: 60, is_active: 1 },
      { name: 'مكعبات بناء', description: 'مجموعة مكعبات بناء تعليمية', price: 95, category: 'ألعاب تعليمية', stock: 80, is_active: 1 },
      { name: 'سيارة تحكم عن بعد', description: 'سيارة سباق بالريموت كنترول', price: 220, category: 'ألعاب إلكترونية', stock: 40, is_active: 1 },
      { name: 'لوح رسم مغناطيسي', description: 'لوح رسم مغناطيسي للأطفال', price: 65, category: 'ألعاب إبداعية', stock: 70, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '10:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '22:00', isOpen: true },
      monday: { open: '10:00', close: '22:00', isOpen: true },
      tuesday: { open: '10:00', close: '22:00', isOpen: true },
      wednesday: { open: '10:00', close: '22:00', isOpen: true },
      thursday: { open: '10:00', close: '22:00', isOpen: true },
      friday: { open: '14:00', close: '22:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'playful',
      language: 'ar',
      welcomeMessage: 'مرحباً! 🧸 أهلاً بك في عالم الألعاب المرح! كيف يمكنني مساعدتك؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
    }),
    is_active: 1,
  },
  {
    business_type: 'both' as const,
    template_name: 'متجر حيوانات أليفة',
    icon: '🐾',
    description: 'قالب شامل لمتاجر الحيوانات الأليفة (منتجات + خدمات)',
    suitable_for: 'محلات حيوانات، عيادات بيطرية، متاجر مستلزمات حيوانات',
    services: JSON.stringify([
      { name: 'فحص بيطري', description: 'فحص بيطري شامل', priceType: 'fixed', basePrice: 150, durationMinutes: 30, requiresAppointment: 1, is_active: 1 },
      { name: 'تطعيم', description: 'تطعيمات الحيوانات الأليفة', priceType: 'variable', minPrice: 80, maxPrice: 200, durationMinutes: 15, requiresAppointment: 1, is_active: 1 },
      { name: 'حلاقة وتنظيف', description: 'حلاقة وتنظيف الحيوانات', priceType: 'fixed', basePrice: 120, durationMinutes: 60, requiresAppointment: 1, is_active: 1 },
    ]),
    products: JSON.stringify([
      { name: 'طعام قطط 2 كجم', description: 'طعام جاف للقطط', price: 85, category: 'طعام', stock: 100, is_active: 1 },
      { name: 'طعام كلاب 5 كجم', description: 'طعام جاف للكلاب', price: 180, category: 'طعام', stock: 80, is_active: 1 },
      { name: 'قفص طيور', description: 'قفص طيور متوسط الحجم', price: 220, category: 'إكسسوارات', stock: 25, is_active: 1 },
      { name: 'ألعاب قطط', description: 'مجموعة ألعاب للقطط', price: 45, category: 'ألعاب', stock: 60, is_active: 1 },
    ]),
    working_hours: JSON.stringify({
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '09:00', close: '21:00', isOpen: true },
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '14:00', close: '21:00', isOpen: true },
    }),
    bot_personality: JSON.stringify({
      tone: 'caring',
      language: 'ar',
      welcomeMessage: 'أهلاً! 🐾 كيف يمكنني مساعدتك في العناية بحيوانك الأليف؟',
    }),
    settings: JSON.stringify({
      autoReply: true,
      workingHoursOnly: false,
      orderConfirmation: true,
      appointmentReminders: true,
    }),
    is_active: 1,
  },
];

async function seedTemplates() {
  console.log('🌱 Starting to seed business templates...');

  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Clear existing templates
    console.log('🗑️  Clearing existing templates...');
    await db.delete(businessTemplates);

    // Insert new templates
    console.log('📝 Inserting new templates...');
    for (const template of TEMPLATES) {
      await db.insert(businessTemplates).values(template);
      console.log(`✅ Added: ${template.template_name}`);
    }

    console.log(`\n🎉 Successfully seeded ${TEMPLATES.length} templates!\n`);
    console.log('Templates:');
    TEMPLATES.forEach((t, i) => console.log(`  ${i + 1}. ${t.template_name} (${t.business_type})`));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
