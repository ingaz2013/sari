import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TapSettings() {
  const { data: settings, isLoading, refetch } = trpc.tapSettings.getTapSettings.useQuery();
  const updateSettings = trpc.tapSettings.updateTapSettings.useMutation();
  const testConnection = trpc.tapSettings.testTapConnection.useMutation();

  const [formData, setFormData] = useState({
    secretKey: '',
    publicKey: '',
    isLive: 0,
    webhookUrl: '',
    webhookSecret: '',
    isActive: 1,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        secretKey: settings.secretKey,
        publicKey: settings.publicKey,
        isLive: settings.isLive,
        webhookUrl: settings.webhookUrl || '',
        webhookSecret: settings.webhookSecret || '',
        isActive: settings.isActive,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      toast.success('تم حفظ الإعدادات بنجاح');
      refetch();
    } catch (error) {
      toast.error('فشل حفظ الإعدادات');
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection.mutateAsync();
      if (result.success) {
        toast.success('نجح الاتصال بـ Tap');
      } else {
        toast.error(`فشل الاتصال: ${result.message}`);
      }
      refetch();
    } catch (error) {
      toast.error('فشل اختبار الاتصال');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إعدادات Tap Payment</h1>
        <p className="text-muted-foreground mt-1">إدارة إعدادات بوابة الدفع Tap</p>
      </div>

      {settings?.lastTestAt && (
        <Alert className={`mb-6 ${settings.lastTestStatus === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-center gap-2">
            {settings.lastTestStatus === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-semibold">
                {settings.lastTestStatus === 'success' ? 'الاتصال ناجح' : 'فشل الاتصال'}
              </p>
              <AlertDescription>
                {settings.lastTestMessage}
                <br />
                <span className="text-sm text-muted-foreground">
                  آخر اختبار: {new Date(settings.lastTestAt).toLocaleString('ar-SA')}
                </span>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>معلومات الاتصال</CardTitle>
          <CardDescription>
            أدخل مفاتيح API الخاصة بحساب Tap الخاص بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key *</Label>
            <Input
              id="secretKey"
              type="password"
              value={formData.secretKey}
              onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
              placeholder="sk_test_..."
            />
            <p className="text-sm text-muted-foreground">
              المفتاح السري الخاص بحساب Tap (يستخدم في الـ Backend)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicKey">Public Key *</Label>
            <Input
              id="publicKey"
              value={formData.publicKey}
              onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
              placeholder="pk_test_..."
            />
            <p className="text-sm text-muted-foreground">
              المفتاح العام الخاص بحساب Tap (يستخدم في الـ Frontend)
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isLive">الوضع المباشر (Live Mode)</Label>
              <p className="text-sm text-muted-foreground">
                تفعيل الوضع المباشر للمدفوعات الحقيقية
              </p>
            </div>
            <Switch
              id="isLive"
              checked={!!formData.isLive}
              onCheckedChange={(checked) => setFormData({ ...formData, isLive: checked ? 1 : 0 })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">تفعيل بوابة الدفع</Label>
              <p className="text-sm text-muted-foreground">
                تمكين/تعطيل بوابة الدفع Tap
              </p>
            </div>
            <Switch
              id="isActive"
              checked={!!formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              placeholder="https://yourdomain.com/api/webhooks/tap"
            />
            <p className="text-sm text-muted-foreground">
              عنوان URL لاستقبال إشعارات الدفع من Tap
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret</Label>
            <Input
              id="webhookSecret"
              type="password"
              value={formData.webhookSecret}
              onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
              placeholder="whsec_..."
            />
            <p className="text-sm text-muted-foreground">
              المفتاح السري للتحقق من صحة إشعارات Webhook
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={updateSettings.isPending} className="flex-1">
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الإعدادات'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testConnection.isPending}
            >
              {testConnection.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                'اختبار الاتصال'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>معلومات مهمة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">🔑 الحصول على مفاتيح API:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>سجل الدخول إلى حساب Tap الخاص بك</li>
              <li>انتقل إلى Settings → API Keys</li>
              <li>انسخ Secret Key و Public Key</li>
              <li>الصقهما في الحقول أعلاه</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">🔔 إعداد Webhook:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>في لوحة تحكم Tap، انتقل إلى Webhooks</li>
              <li>أضف Webhook جديد</li>
              <li>استخدم URL: {window.location.origin}/api/trpc/payment.handleWebhook</li>
              <li>فعّل الأحداث: charge.captured, charge.failed</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">⚠️ ملاحظات:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>استخدم مفاتيح Test في البداية للتجربة</li>
              <li>لا تفعّل Live Mode إلا بعد اختبار شامل</li>
              <li>احتفظ بنسخة احتياطية من المفاتيح في مكان آمن</li>
              <li>لا تشارك Secret Key مع أي شخص</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
