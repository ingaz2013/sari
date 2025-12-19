import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Rocket, Store, Briefcase, MessageSquare, Calendar, Settings } from 'lucide-react';

interface CompleteStepProps {
  wizardData: Record<string, any>;
  completeSetup: () => void;
  isLoading: boolean;
}

export default function CompleteStep({
  wizardData,
  completeSetup,
  isLoading,
}: CompleteStepProps) {
  const businessType = wizardData.businessType;
  const hasProducts = wizardData.products && wizardData.products.length > 0;
  const hasServices = wizardData.services && wizardData.services.length > 0;
  const hasIntegrations = wizardData.enableCalendar || wizardData.enableSheets;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 animate-bounce">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          رائع! كل شيء جاهز 🎉
        </h2>
        <p className="text-lg text-gray-600">
          دعنا نراجع إعداداتك قبل البدء
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Business Info */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              {businessType === 'store' ? (
                <Store className="h-5 w-5 text-white" />
              ) : businessType === 'services' ? (
                <Briefcase className="h-5 w-5 text-white" />
              ) : (
                <Settings className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">معلومات النشاط</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>الاسم:</strong> {wizardData.businessName || 'غير محدد'}</p>
                <p><strong>النوع:</strong> {
                  businessType === 'store' ? 'متجر إلكتروني' :
                  businessType === 'services' ? 'مقدم خدمات' :
                  'منتجات وخدمات'
                }</p>
                <p><strong>الهاتف:</strong> {wizardData.phone || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Products/Services */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">المنتجات والخدمات</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {hasProducts && (
                  <p className="flex items-center space-x-1 space-x-reverse">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{wizardData.products.length} منتج</span>
                  </p>
                )}
                {hasServices && (
                  <p className="flex items-center space-x-1 space-x-reverse">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{wizardData.services.length} خدمة</span>
                  </p>
                )}
                {!hasProducts && !hasServices && (
                  <p className="text-gray-500">لم يتم إضافة منتجات أو خدمات بعد</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Bot Personality */}
        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">شخصية ساري</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>الأسلوب:</strong> {
                  wizardData.botTone === 'friendly' ? 'ودود ومرح' :
                  wizardData.botTone === 'professional' ? 'احترافي ورسمي' :
                  'عفوي وبسيط'
                }</p>
                <p><strong>اللغة:</strong> {
                  wizardData.botLanguage === 'ar' ? 'العربية' :
                  wizardData.botLanguage === 'en' ? 'الإنجليزية' :
                  'العربية والإنجليزية'
                }</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Integrations */}
        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">التكاملات</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {wizardData.enableCalendar && (
                  <p className="flex items-center space-x-1 space-x-reverse">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Google Calendar</span>
                  </p>
                )}
                {wizardData.enableSheets && (
                  <p className="flex items-center space-x-1 space-x-reverse">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Google Sheets</span>
                  </p>
                )}
                {!hasIntegrations && (
                  <p className="text-gray-500">لم يتم تفعيل تكاملات</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* What's Next */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
            <Rocket className="h-5 w-5 text-indigo-600" />
            <span>ماذا بعد؟</span>
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start space-x-2 space-x-reverse">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>سنقوم بإنشاء حسابك وتجهيز كل شيء</span>
            </li>
            <li className="flex items-start space-x-2 space-x-reverse">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>ستتمكن من ربط رقم واتساب الخاص بك</span>
            </li>
            <li className="flex items-start space-x-2 space-x-reverse">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>ساري سيبدأ في الرد على عملائك تلقائياً</span>
            </li>
            <li className="flex items-start space-x-2 space-x-reverse">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>يمكنك متابعة المحادثات والطلبات من لوحة التحكم</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Complete Button */}
      <div className="text-center pt-6">
        <Button
          size="lg"
          onClick={completeSetup}
          disabled={isLoading}
          className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              جاري الإعداد...
            </>
          ) : (
            <>
              ابدأ الآن! 🚀
              <Rocket className="mr-2 h-6 w-6" />
            </>
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          بالنقر على "ابدأ الآن"، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
