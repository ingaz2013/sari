import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupWizardReset() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const resetWizardMutation = trpc.setupWizard.resetWizard.useMutation({
    onSuccess: () => {
      toast.success('تم إعادة تعيين معالج الإعداد بنجاح');
      setIsOpen(false);
      // Redirect to wizard
      setTimeout(() => {
        setLocation('/merchant/setup-wizard');
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إعادة تعيين معالج الإعداد');
    },
  });

  const handleReset = () => {
    resetWizardMutation.mutate();
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <RefreshCw className="w-5 h-5" />
          إعادة تشغيل معالج الإعداد
        </CardTitle>
        <CardDescription className="text-orange-700">
          ابدأ من جديد وأعد إعداد متجرك بالكامل
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/60 p-4 rounded-lg border border-orange-200">
          <div className="flex items-start space-x-3 space-x-reverse mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">تنبيه مهم</h4>
              <p className="text-sm text-orange-700">
                إعادة تشغيل معالج الإعداد سيسمح لك بتغيير نوع نشاطك التجاري واختيار قالب جديد.
                لن يتم حذف أي بيانات موجودة (منتجات، حملات، محادثات).
              </p>
            </div>
          </div>
          
          <ul className="text-sm text-orange-700 space-y-1 mr-8">
            <li>• يمكنك تغيير نوع النشاط (متجر، خدمات، كلاهما)</li>
            <li>• يمكنك اختيار قالب جاهز مختلف</li>
            <li>• يمكنك تعديل شخصية ساري وأسلوب الرد</li>
            <li>• جميع بياناتك الحالية ستبقى محفوظة</li>
          </ul>
        </div>

        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تشغيل معالج الإعداد
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                هل أنت متأكد؟
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  سيتم إعادة تشغيل معالج الإعداد من البداية. سيمكنك هذا من:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>تغيير نوع نشاطك التجاري</li>
                  <li>اختيار قالب جديد</li>
                  <li>تعديل إعدادات ساري</li>
                </ul>
                <p className="font-semibold text-orange-600 mt-3">
                  ملاحظة: جميع بياناتك الحالية (منتجات، حملات، محادثات) ستبقى محفوظة.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={resetWizardMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {resetWizardMutation.isPending ? 'جاري الإعادة...' : 'نعم، إعادة التشغيل'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
