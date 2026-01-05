import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  Save, 
  TestTube, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ExternalLink,
  Info,
  MessageSquare,
  Settings2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function PaymentSettings() {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Form state
  const [tapEnabled, setTapEnabled] = useState(false);
  const [tapPublicKey, setTapPublicKey] = useState('');
  const [tapSecretKey, setTapSecretKey] = useState('');
  const [tapTestMode, setTapTestMode] = useState(true);
  const [autoSendPaymentLink, setAutoSendPaymentLink] = useState(true);
  const [paymentLinkMessage, setPaymentLinkMessage] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('SAR');

  // Fetch current settings
  const { data: settings, isLoading, refetch } = trpc.merchantPayments.getSettings.useQuery();

  // Mutations
  const saveMutation = trpc.merchantPayments.saveSettings.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء حفظ الإعدادات');
    },
  });

  const testMutation = trpc.merchantPayments.testConnection.useMutation({
    onSuccess: () => {
      toast.success('تم التحقق من الاتصال بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل التحقق من الاتصال');
    },
  });

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setTapEnabled(!!settings.tapEnabled);
      setTapPublicKey(settings.tapPublicKey || '');
      setTapSecretKey(settings.tapSecretKey || '');
      setTapTestMode(!!settings.tapTestMode);
      setAutoSendPaymentLink(!!settings.autoSendPaymentLink);
      setPaymentLinkMessage(settings.paymentLinkMessage || '');
      setDefaultCurrency(settings.defaultCurrency || 'SAR');
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({
        tapEnabled,
        tapPublicKey,
        tapSecretKey,
        tapTestMode,
        autoSendPaymentLink,
        paymentLinkMessage,
        defaultCurrency,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testMutation.mutateAsync();
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            إعدادات الدفع الإلكتروني
          </h1>
          <p className="text-muted-foreground mt-1">
            قم بإعداد بوابة الدفع Tap لاستقبال المدفوعات من عملائك عبر واتساب
          </p>
        </div>
        {settings?.isVerified && (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-4 w-4 ml-1" />
            تم التحقق
          </Badge>
        )}
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>كيف يعمل؟</AlertTitle>
        <AlertDescription>
          بعد تفعيل Tap، سيتمكن ساري من إرسال روابط دفع آمنة لعملائك عبر واتساب عند إنشاء الطلبات.
          العميل يضغط على الرابط ويدفع مباشرة، وتصلك الأموال في حسابك.
        </AlertDescription>
      </Alert>

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="https://www.tap.company/assets/images/logo.svg" 
              alt="Tap" 
              className="h-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            Tap Payments
          </CardTitle>
          <CardDescription>
            بوابة الدفع الإلكتروني الأكثر استخداماً في المنطقة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tap-enabled" className="text-base">تفعيل Tap Payment</Label>
              <p className="text-sm text-muted-foreground">
                تفعيل استقبال المدفوعات عبر Tap
              </p>
            </div>
            <Switch
              id="tap-enabled"
              checked={tapEnabled}
              onCheckedChange={setTapEnabled}
            />
          </div>

          <Separator />

          {/* Test Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tap-test-mode" className="text-base">وضع الاختبار (Sandbox)</Label>
              <p className="text-sm text-muted-foreground">
                استخدم وضع الاختبار للتجربة قبل التفعيل الفعلي
              </p>
            </div>
            <Switch
              id="tap-test-mode"
              checked={tapTestMode}
              onCheckedChange={setTapTestMode}
            />
          </div>

          <Separator />

          {/* API Keys */}
          <div className="space-y-4">
            <h3 className="font-semibold">مفاتيح API</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tap-public-key">Public Key</Label>
              <Input
                id="tap-public-key"
                placeholder="pk_test_..."
                value={tapPublicKey}
                onChange={(e) => setTapPublicKey(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                المفتاح العام من لوحة تحكم Tap
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tap-secret-key">Secret Key</Label>
              <div className="relative">
                <Input
                  id="tap-secret-key"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="sk_test_..."
                  value={tapSecretKey}
                  onChange={(e) => setTapSecretKey(e.target.value)}
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                المفتاح السري - احتفظ به بشكل آمن
              </p>
            </div>
          </div>

          <Separator />

          {/* WhatsApp Integration */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              إعدادات واتساب
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-send" className="text-base">إرسال رابط الدفع تلقائياً</Label>
                <p className="text-sm text-muted-foreground">
                  إرسال رابط الدفع للعميل تلقائياً عند إنشاء طلب جديد
                </p>
              </div>
              <Switch
                id="auto-send"
                checked={autoSendPaymentLink}
                onCheckedChange={setAutoSendPaymentLink}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-message">رسالة رابط الدفع</Label>
              <Textarea
                id="payment-message"
                placeholder="مرحباً {customer_name}! يمكنك إتمام الدفع من خلال الرابط التالي: {payment_link}"
                value={paymentLinkMessage}
                onChange={(e) => setPaymentLinkMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                المتغيرات المتاحة: {'{customer_name}'}, {'{amount}'}, {'{payment_link}'}, {'{order_number}'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              حفظ الإعدادات
            </Button>

            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || !tapSecretKey}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 ml-2" />
              )}
              اختبار الاتصال
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            كيفية الحصول على مفاتيح Tap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              سجل حساب في{' '}
              <a 
                href="https://tap.company" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                tap.company
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>أكمل عملية التحقق من الهوية والنشاط التجاري</li>
            <li>انتقل إلى "الإعدادات" ثم "API Keys" في لوحة التحكم</li>
            <li>انسخ Public Key و Secret Key</li>
            <li>الصق المفاتيح في الحقول أعلاه واحفظ</li>
            <li>اختبر الاتصال للتأكد من صحة المفاتيح</li>
          </ol>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">ملاحظة:</p>
            <p className="text-sm text-muted-foreground">
              للاختبار، استخدم مفاتيح Sandbox (تبدأ بـ pk_test_ و sk_test_).
              للتفعيل الفعلي، استخدم مفاتيح Live (تبدأ بـ pk_live_ و sk_live_).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>حالة التكامل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {settings.tapEnabled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm">الدفع مفعل</span>
              </div>

              <div className="flex items-center gap-2">
                {settings.tapPublicKey ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm">Public Key</span>
              </div>

              <div className="flex items-center gap-2">
                {settings.tapSecretKey ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm">Secret Key</span>
              </div>

              <div className="flex items-center gap-2">
                {settings.isVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm">تم التحقق</span>
              </div>
            </div>

            {settings.lastVerifiedAt && (
              <p className="text-xs text-muted-foreground mt-4">
                آخر تحقق: {new Date(settings.lastVerifiedAt).toLocaleString('ar-SA')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
