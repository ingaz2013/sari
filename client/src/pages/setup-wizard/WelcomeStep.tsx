import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

interface WelcomeStepProps {
  goToNextStep: () => void;
}

export default function WelcomeStep({ goToNextStep }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          مرحباً بك في ساري! 🎉
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          مساعدك الذكي للمبيعات والتسويق عبر واتساب. سنساعدك في إعداد كل شيء خلال 5 دقائق فقط!
        </p>
      </div>

      {/* Video Placeholder */}
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8 text-center">
        <div className="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">فيديو توضيحي (30 ثانية)</p>
            <p className="text-sm text-gray-500">شاهد كيف يعمل ساري</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          اكتشف كيف يمكن لساري أن يحول محادثات واتساب إلى مبيعات حقيقية
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="flex items-start space-x-3 space-x-reverse p-4 bg-blue-50 rounded-lg">
          <div className="flex-shrink-0">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">ردود تلقائية ذكية</h3>
            <p className="text-sm text-gray-600">
              ساري يرد على عملائك 24/7 بذكاء اصطناعي متقدم
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-x-reverse p-4 bg-purple-50 rounded-lg">
          <div className="flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">زيادة المبيعات</h3>
            <p className="text-sm text-gray-600">
              تحويل المحادثات إلى طلبات ومبيعات فعلية
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-x-reverse p-4 bg-green-50 rounded-lg">
          <div className="flex-shrink-0">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">آمن ومضمون</h3>
            <p className="text-sm text-gray-600">
              بياناتك محمية بأعلى معايير الأمان
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-x-reverse p-4 bg-orange-50 rounded-lg">
          <div className="flex-shrink-0">
            <Sparkles className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">سهل الاستخدام</h3>
            <p className="text-sm text-gray-600">
              لا تحتاج خبرة تقنية، كل شيء بسيط وواضح
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-6">
        <Button
          size="lg"
          onClick={goToNextStep}
          className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          لنبدأ! 🚀
          <ArrowRight className="mr-2 h-5 w-5" />
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          لن يستغرق الأمر أكثر من 5 دقائق
        </p>
      </div>
    </div>
  );
}
