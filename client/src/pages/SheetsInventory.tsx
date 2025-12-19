import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Download, RefreshCw, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

export default function SheetsInventory() {
  const [lastAction, setLastAction] = useState<'export' | 'import' | null>(null);

  // مزامنة المخزون إلى Sheets
  const exportMutation = trpc.sheets.syncInventory.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'نجحت المزامنة',
          description: data.message,
        });
        setLastAction('export');
      } else {
        toast({
          title: 'فشلت المزامنة',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
  });

  // تحديث المخزون من Sheets
  const importMutation = trpc.sheets.updateInventoryFromSheets.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'نجح التحديث',
          description: `${data.message} - تم تحديث ${data.updatedCount} منتج`,
        });
        setLastAction('import');
      } else {
        toast({
          title: 'فشل التحديث',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleImport = () => {
    if (confirm('هل أنت متأكد من تحديث المخزون من Google Sheets؟ سيتم استبدال الكميات الحالية.')) {
      importMutation.mutate();
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مزامنة المخزون</h1>
          <p className="text-muted-foreground">
            مزامنة ثنائية الاتجاه بين قاعدة البيانات و Google Sheets
          </p>
        </div>

        {/* بطاقات المزامنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* تصدير إلى Sheets */}
          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>

            <h3 className="text-xl font-semibold mb-2">تصدير إلى Sheets</h3>
            <p className="text-sm text-muted-foreground mb-6">
              نقل بيانات المخزون من قاعدة البيانات إلى Google Sheets
            </p>

            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="w-full"
              size="lg"
            >
              {exportMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              <Upload className="w-5 h-5 ml-2" />
              تصدير المخزون
            </Button>

            {lastAction === 'export' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">تم التصدير بنجاح</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-2 text-sm">متى تستخدم هذا؟</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• عند إضافة منتجات جديدة</li>
                <li>• بعد تحديث الأسعار</li>
                <li>• لمشاركة المخزون مع الفريق</li>
              </ul>
            </div>
          </Card>

          {/* استيراد من Sheets */}
          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold mb-2">استيراد من Sheets</h3>
            <p className="text-sm text-muted-foreground mb-6">
              تحديث كميات المخزون من Google Sheets إلى قاعدة البيانات
            </p>

            <Button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {importMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              <Download className="w-5 h-5 ml-2" />
              استيراد المخزون
            </Button>

            {lastAction === 'import' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">تم الاستيراد بنجاح</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-2 text-sm">متى تستخدم هذا؟</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• بعد جرد المخزون اليدوي</li>
                <li>• عند تحديث الكميات في Sheets</li>
                <li>• لمزامنة التغييرات من الفريق</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* كيفية العمل */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">كيف تعمل المزامنة؟</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">التصدير إلى Sheets</h3>
                <p className="text-sm text-muted-foreground">
                  يتم نسخ جميع المنتجات مع أسعارها وكمياتها إلى صفحة "المخزون" في Google Sheets
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-green-600">2</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">التعديل في Sheets</h3>
                <p className="text-sm text-muted-foreground">
                  يمكنك تعديل الكميات مباشرة في Google Sheets (عمود "الكمية المتاحة")
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">الاستيراد من Sheets</h3>
                <p className="text-sm text-muted-foreground">
                  يتم قراءة الكميات المحدثة من Sheets وتطبيقها على قاعدة البيانات
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* تحذيرات */}
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2 text-amber-900">⚠️ تحذيرات مهمة:</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• <strong>الاستيراد من Sheets</strong> سيستبدل الكميات الحالية في قاعدة البيانات</li>
                <li>• تأكد من صحة البيانات في Sheets قبل الاستيراد</li>
                <li>• لا تقم بحذف أو تعديل أعمدة "رقم المنتج" و "الكمية المتاحة"</li>
                <li>• يتم تحديث الكميات فقط، الأسعار والأسماء لا تتأثر بالاستيراد</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* نصائح */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2 text-blue-900">💡 نصائح للاستخدام الأمثل:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• قم بالتصدير أولاً للحصول على أحدث البيانات</li>
                <li>• استخدم Google Sheets للجرد السريع مع الفريق</li>
                <li>• يمكنك إضافة أعمدة إضافية للملاحظات (لن تؤثر على الاستيراد)</li>
                <li>• احتفظ بنسخة احتياطية قبل الاستيراد للمرة الأولى</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
