import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChatDemo from '@/components/LiveChatDemo';
import LiveStats from '@/components/LiveStats';
import {
  Bot,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  Sparkles,
  Mic,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Package,
  Gift,
  Bell,
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Mic,
      title: 'طلب بالرسالة الصوتية',
      description: 'عملاؤك يطلبون بصوتهم فقط: المنتج، العدد، والعنوان - وساري يتولى الباقي',
    },
    {
      icon: Bot,
      title: 'رد آلي ذكي',
      description: 'يرد "ساري" على استفسارات عملائك باللهجة السعودية على مدار الساعة',
    },
    {
      icon: ShoppingCart,
      title: 'طلبات تلقائية',
      description: 'تحويل المحادثات إلى طلبات مكتملة مع رابط الدفع تلقائياً',
    },
    {
      icon: ShoppingBag,
      title: 'السلال المهجورة',
      description: 'تذكير تلقائي للعملاء الذين لم يكملوا طلباتهم لزيادة نسبة التحويل',
    },
    {
      icon: FileText,
      title: 'الفواتير بالواتساب',
      description: 'إرسال فواتير احترافية مباشرة عبر الواتساب مع رابط الدفع',
    },
    {
      icon: Package,
      title: 'تتبع الطلبات',
      description: 'تحديثات تلقائية للعملاء عن حالة طلباتهم من التأكيد حتى التوصيل',
    },
    {
      icon: Gift,
      title: 'الهدايا والتهنئة',
      description: 'رسائل تلقائية للعملاء في المناسبات والأعياد مع عروض خاصة',
    },
    {
      icon: Bell,
      title: 'إشعارات ذكية',
      description: 'تنبيهات فورية للتاجر عند وصول طلبات جديدة أو استفسارات مهمة',
    },
    {
      icon: BarChart3,
      title: 'تقارير وتحليلات',
      description: 'تقارير تفصيلية عن المبيعات والمحادثات لتحسين أداء متجرك',
    },
    {
      icon: TrendingUp,
      title: 'زيادة المبيعات',
      description: 'حول الاستفسارات إلى مبيعات بنسبة تحويل أعلى',
    },
    {
      icon: Clock,
      title: 'متاح 24/7',
      description: 'خدمة عملائك في أي وقت حتى خارج ساعات العمل',
    },
    {
      icon: Shield,
      title: 'آمن وموثوق',
      description: 'حماية كاملة لبيانات عملائك ومحادثاتهم',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'سجل حسابك',
      description: 'أنشئ حساباً مجانياً في أقل من دقيقة',
    },
    {
      number: '2',
      title: 'اربط الواتساب',
      description: 'اربط رقم واتساب متجرك بسهولة عبر QR Code',
    },
    {
      number: '3',
      title: 'أضف منتجاتك',
      description: 'أضف منتجاتك وأسعارك ليتعرف عليها "ساري"',
    },
    {
      number: '4',
      title: 'ابدأ البيع',
      description: 'دع "ساري" يتعامل مع عملائك ويزيد مبيعاتك',
    },
  ];

  const testimonials = [
    {
      name: 'أحمد المالكي',
      role: 'صاحب متجر إلكترونيات',
      content: 'ساري غيّر طريقة تعاملي مع العملاء. الآن أستطيع التركيز على تطوير المتجر بينما ساري يتعامل مع الاستفسارات.',
      rating: 5,
    },
    {
      name: 'فاطمة العتيبي',
      role: 'صاحبة متجر أزياء',
      content: 'زادت مبيعاتي 40% بعد استخدام ساري. العملاء يحبون الرد السريع والمحترف.',
      rating: 5,
    },
    {
      name: 'محمد القحطاني',
      role: 'صاحب متجر عطور',
      content: 'أفضل استثمار قمت به لمتجري. ساري يتحدث بلهجة سعودية طبيعية ويفهم احتياجات العملاء.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '10,000+', label: 'تاجر نشط' },
    { value: '500,000+', label: 'محادثة شهرياً' },
    { value: '95%', label: 'رضا العملاء' },
    { value: '24/7', label: 'دعم متواصل' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="container relative py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>مدعوم بالذكاء الاصطناعي</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-primary">
                  ساري
                </span>
                <br />
                مساعد المبيعات الذكي
                <br />
                على الواتساب
              </h1>
              
              <p className="text-xl text-muted-foreground">
                أدر مبيعاتك بالمحادثات الصوتية: فقط سجل بصوتك طلبك والعنوان والمنتج والعدد واترك الباقي على ساري. يفهم اللهجة السعودية ويحول الصوت لطلب كامل تلقائياً.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/try-sari">
                  <a>
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8">
                      جرب ساري الآن
                      <Sparkles className="mr-2 w-5 h-5" />
                    </Button>
                  </a>
                </Link>
                <Link href="/login">
                  <a>
                    <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-lg h-14 px-8">
                      ابدأ الآن مجاناً
                      <ArrowRight className="mr-2 w-5 h-5" />
                    </Button>
                  </a>
                </Link>
                <Link href="/pricing">
                  <a>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                      شاهد الأسعار
                    </Button>
                  </a>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border bg-card">
                <div className="bg-primary p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">ساري</div>
                    <div className="text-sm text-white/80">مساعد المبيعات الذكي</div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 bg-muted p-4 rounded-2xl rounded-tl-none">
                      <p className="text-sm">مرحباً! أنا ساري، مساعدك الذكي. كيف أقدر أساعدك اليوم؟ 😊</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                      <p className="text-sm">عندكم جوالات آيفون؟</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 bg-muted p-4 rounded-2xl rounded-tl-none">
                      <p className="text-sm">أهلاً وسهلاً! نعم عندنا مجموعة رائعة من أجهزة آيفون. عندنا آيفون 15 برو ماكس بسعر 4,999 ريال، وآيفون 15 بسعر 3,799 ريال. أي موديل يهمك؟</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              لماذا تختار ساري؟
            </h2>
            <p className="text-lg text-muted-foreground">
              ساري يوفر لك كل ما تحتاجه لتحسين خدمة العملاء وزيادة مبيعاتك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/30 dark:hover:border-blue-800 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              كيف يعمل ساري؟
            </h2>
            <p className="text-lg text-muted-foreground">
              ابدأ مع ساري في 4 خطوات بسيطة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 right-full w-full h-0.5 bg-primary -translate-y-1/2" style={{ width: 'calc(100% + 2rem)' }} />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              في الوقت الفعلي
            </h2>
            <p className="text-lg text-muted-foreground">
              شاهد نشاط ساري مباشرة - محادثات وطلبات تتم الآن
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <LiveStats targetConversations={12847} targetOrders={8956} duration={2500} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ماذا يقول عملاؤنا؟
            </h2>
            <p className="text-lg text-muted-foreground">
              آراء التجار الذين استخدموا ساري
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Order Feature Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-blue-50 dark:from-primary/5 dark:to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <LiveChatDemo />
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>ميزة جديدة</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                محادثة ذكية تتحول
                <br />
                <span className="text-primary">إلى طلب مكتمل</span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                شاهد كيف يتحدث ساري مع عملائك بشكل طبيعي، يفهم احتياجاتهم، يعرض المنتجات المناسبة، ويحول المحادثة إلى طلب مكتمل مع رابط الدفع تلقائياً!
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">محادثة طبيعية</h3>
                    <p className="text-muted-foreground">يتحدث باللهجة السعودية ويفهم السياق بذكاء</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">عرض منتجات مخصص</h3>
                    <p className="text-muted-foreground">يقترح المنتجات المناسبة مع الأسعار والتفاصيل</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">إتمام الطلب تلقائياً</h3>
                    <p className="text-muted-foreground">يجمع التفاصيل ويرسل رابط الدفع فوراً</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/login">
                  <a>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg h-14 px-8">
                      جرب الميزة الآن
                      <ArrowRight className="mr-2 w-5 h-5" />
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            جاهز لزيادة مبيعاتك؟
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            انضم إلى آلاف التجار الذين يستخدمون ساري لتحسين خدمة العملاء وزيادة المبيعات
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <a>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8">
                  ابدأ الآن مجاناً
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Button>
              </a>
            </Link>
            <Link href="/support">
              <a>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 bg-transparent border-white text-white hover:bg-white/10">
                  تواصل معنا
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
