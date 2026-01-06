import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Globe, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  dir: 'ltr' | 'rtl';
}

const languages: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', currency: 'SAR', currencySymbol: 'ر.س', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', currency: 'USD', currencySymbol: '$', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', dir: 'ltr' },
];

const sampleMessages = {
  ar: {
    welcome: 'مرحباً! أنا ساري، مساعدك الذكي. كيف أقدر أساعدك اليوم؟',
    product: 'عندنا منتجات رائعة، تقدر تشوف الكتالوج كامل',
    order: 'تمام! بسجل لك الطلب الآن. ممكن تعطيني عنوان التوصيل؟',
    thanks: 'شكراً لك! طلبك وصل وبنتواصل معك قريب 🎉',
  },
  en: {
    welcome: 'Hello! I\'m Sari, your smart assistant. How can I help you today?',
    product: 'We have amazing products, you can check our full catalog',
    order: 'Perfect! I\'ll register your order now. Can you provide the delivery address?',
    thanks: 'Thank you! Your order has been received and we\'ll contact you soon 🎉',
  },
  fr: {
    welcome: 'Bonjour ! Je suis Sari, votre assistant intelligent. Comment puis-je vous aider aujourd\'hui ?',
    product: 'Nous avons des produits incroyables, vous pouvez consulter notre catalogue complet',
    order: 'Parfait ! Je vais enregistrer votre commande maintenant. Pouvez-vous fournir l\'adresse de livraison ?',
    thanks: 'Merci ! Votre commande a été reçue et nous vous contacterons bientôt 🎉',
  },
  tr: {
    welcome: 'Merhaba! Ben Sari, akıllı asistanınız. Bugün size nasıl yardımcı olabilirim?',
    product: 'Harika ürünlerimiz var, tam kataloğumuzu inceleyebilirsiniz',
    order: 'Mükemmel! Şimdi siparişinizi kaydedeceğim. Teslimat adresini verebilir misiniz?',
    thanks: 'Teşekkürler! Siparişiniz alındı ve yakında sizinle iletişime geçeceğiz 🎉',
  },
  es: {
    welcome: '¡Hola! Soy Sari, tu asistente inteligente. ¿Cómo puedo ayudarte hoy?',
    product: 'Tenemos productos increíbles, puedes ver nuestro catálogo completo',
    order: '¡Perfecto! Voy a registrar tu pedido ahora. ¿Puedes proporcionar la dirección de entrega?',
    thanks: '¡Gracias! Tu pedido ha sido recibido y te contactaremos pronto 🎉',
  },
  it: {
    welcome: 'Ciao! Sono Sari, il tuo assistente intelligente. Come posso aiutarti oggi?',
    product: 'Abbiamo prodotti fantastici, puoi vedere il nostro catalogo completo',
    order: 'Perfetto! Registrerò il tuo ordine ora. Puoi fornire l\'indirizzo di consegna?',
    thanks: 'Grazie! Il tuo ordine è stato ricevuto e ti contatteremo presto 🎉',
  },
};

export default function LanguageSettings() {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'ar');
  const [isSaving, setIsSaving] = useState(false);

  const updateSettingsMutation = trpc.settings.update.useMutation();

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const lang = languages.find(l => l.code === selectedLanguage);
      if (!lang) return;

      await updateSettingsMutation.mutateAsync({
        botLanguage: lang.code,
        currency: lang.currency,
      });

      // Update i18n language
      i18n.changeLanguage(lang.code);
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = lang.code;
      localStorage.setItem('i18nextLng', lang.code);

      toast.success('تم حفظ إعدادات اللغة بنجاح');
    } catch (error) {
      toast.error('فشل حفظ الإعدادات');
      console.error('Failed to save language settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentMessages = sampleMessages[selectedLanguage as keyof typeof sampleMessages] || sampleMessages.ar;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إعدادات اللغة</h1>
        <p className="text-muted-foreground mt-2">
          اختر اللغة التي سيستخدمها البوت للتواصل مع عملائك
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                اختر اللغة
              </CardTitle>
              <CardDescription>
                حدد اللغة الأساسية لرسائل البوت
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {languages.map((lang) => (
                <Card
                  key={lang.code}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedLanguage === lang.code
                      ? "border-primary border-2 bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.flag}</span>
                        <div>
                          <h3 className="font-semibold">{lang.nativeName}</h3>
                          <p className="text-sm text-muted-foreground">{lang.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lang.currencySymbol} {lang.currency}
                          </p>
                        </div>
                      </div>
                      {selectedLanguage === lang.code && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                معاينة رسائل البوت
              </CardTitle>
              <CardDescription>
                شاهد كيف ستظهر رسائل البوت للعملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Welcome Message */}
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  رسالة الترحيب
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {currentMessages.welcome}
                </p>
              </div>

              {/* Product Message */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  رسالة المنتجات
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentMessages.product}
                </p>
              </div>

              {/* Order Message */}
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                  رسالة الطلب
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {currentMessages.order}
                </p>
              </div>

              {/* Thanks Message */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  رسالة الشكر
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {currentMessages.thanks}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    ملاحظة مهمة
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    سيتم تطبيق اللغة المختارة على جميع رسائل البوت التلقائية. 
                    العملة المرتبطة باللغة سيتم استخدامها في عرض الأسعار والفواتير.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
