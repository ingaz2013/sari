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
      console.log(`✅ Added: ${template.templateName}`);
    }

    console.log(`\n🎉 Successfully seeded ${TEMPLATES.length} templates!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
