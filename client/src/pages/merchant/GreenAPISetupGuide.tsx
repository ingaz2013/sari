import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Copy, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function GreenAPISetupGuide() {
  const { t } = useTranslation();
  const [copiedText, setCopiedText] = useState<string>("");

  const webhookUrl = `${window.location.origin}/api/webhooks/greenapi`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`تم نسخ ${label}`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">دليل إعداد Green API الشامل</h1>
        <p className="text-muted-foreground">
          اتبع هذه الخطوات لربط رقم واتساب الخاص بك مع ساري
        </p>
      </div>

      {/* الخطوة 1: التسجيل */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">الخطوة 1</Badge>
            <CardTitle>التسجيل في Green API</CardTitle>
          </div>
          <CardDescription>
            احصل على حساب مجاني في Green API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">1. افتح موقع Green API</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://green-api.com", "_blank")}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                افتح Green API
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">2. اضغط على "Sign Up" أو "تسجيل"</p>
              <p className="text-sm text-muted-foreground">
                سجل باستخدام بريدك الإلكتروني أو حساب Google
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">3. فعّل حسابك عبر البريد الإلكتروني</p>
              <p className="text-sm text-muted-foreground">
                ستصلك رسالة تأكيد، اضغط على الرابط لتفعيل الحساب
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظة:</strong> Green API يوفر 3 أيام تجريبية مجاناً، ثم يمكنك الاشتراك في باقة مدفوعة
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* الخطوة 2: إنشاء Instance */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">الخطوة 2</Badge>
            <CardTitle>إنشاء Instance جديد</CardTitle>
          </div>
          <CardDescription>
            Instance هو الاتصال بين رقم واتساب وساري
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">1. سجل دخول إلى لوحة التحكم</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://console.green-api.com", "_blank")}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                افتح لوحة التحكم
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">2. اضغط على "Create Instance"</p>
              <p className="text-sm text-muted-foreground">
                ستظهر لك صفحة إنشاء instance جديد
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">3. احفظ Instance ID و API Token</p>
              <p className="text-sm text-muted-foreground mb-2">
                ستحتاجهما في الخطوة التالية
              </p>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div className="mb-2">
                  <span className="text-muted-foreground">Instance ID:</span> 1234567890
                </div>
                <div>
                  <span className="text-muted-foreground">API Token:</span> abc123def456...
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الخطوة 3: إعداد Webhooks */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">الخطوة 3</Badge>
            <CardTitle>إعداد Webhooks</CardTitle>
          </div>
          <CardDescription>
            لاستقبال الرسائل الواردة تلقائياً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">1. افتح إعدادات Instance</p>
              <p className="text-sm text-muted-foreground">
                في لوحة التحكم، اضغط على Instance ثم "Settings"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">2. فعّل Webhooks التالية:</p>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Incoming</Badge>
                  <span className="text-sm">لاستقبال الرسائل الواردة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Outgoing</Badge>
                  <span className="text-sm">لتتبع الرسائل الصادرة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">State</Badge>
                  <span className="text-sm">لمراقبة حالة الاتصال</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">3. الصق Webhook URL</p>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <code className="text-sm break-all">{webhookUrl}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {copiedText === "Webhook URL" && (
                <p className="text-sm text-primary mt-1">✓ تم النسخ!</p>
              )}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>مهم جداً:</strong> يجب إضافة هذا الرابط في حقل "Webhook URL" في إعدادات Green API
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* الخطوة 4: ربط رقم الواتساب */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">الخطوة 4</Badge>
            <CardTitle>ربط رقم الواتساب</CardTitle>
          </div>
          <CardDescription>
            امسح QR Code لربط رقمك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">1. افتح واتساب على هاتفك</p>
              <p className="text-sm text-muted-foreground">
                تأكد من أن الرقم غير مستخدم في جهاز آخر
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">2. اذهب إلى "الأجهزة المرتبطة"</p>
              <p className="text-sm text-muted-foreground">
                الإعدادات → الأجهزة المرتبطة → ربط جهاز
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">3. امسح QR Code من لوحة Green API</p>
              <p className="text-sm text-muted-foreground">
                ستجد QR Code في صفحة Instance في لوحة التحكم
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>نصيحة:</strong> استخدم رقم جديد مخصص للمتجر، وليس رقمك الشخصي
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* الخطوة 5: الاختبار */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">الخطوة 5</Badge>
            <CardTitle>اختبار الاتصال</CardTitle>
          </div>
          <CardDescription>
            تأكد من أن كل شيء يعمل بشكل صحيح
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">1. اذهب إلى صفحة اختبار WhatsApp</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/merchant/whatsapp-test"}
              >
                افتح صفحة الاختبار
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">2. أدخل Instance ID و Token</p>
              <p className="text-sm text-muted-foreground">
                الصقهما في الخانات المخصصة
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">3. اختبر الاتصال</p>
              <p className="text-sm text-muted-foreground">
                اضغط "اختبار الاتصال" - يجب أن يظهر رقم الواتساب المتصل
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">4. أرسل رسالة تجريبية</p>
              <p className="text-sm text-muted-foreground">
                أرسل رسالة لرقمك الشخصي للتأكد من عمل الإرسال
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">5. اختبر استقبال الرسائل</p>
              <p className="text-sm text-muted-foreground">
                أرسل رسالة من رقمك الشخصي إلى رقم المتجر، يجب أن يرد ساري تلقائياً
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* روابط مفيدة */}
      <Card>
        <CardHeader>
          <CardTitle>روابط مفيدة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("https://green-api.com/docs/", "_blank")}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            التوثيق الرسمي لـ Green API
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("https://console.green-api.com", "_blank")}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            لوحة تحكم Green API
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.location.href = "/merchant/whatsapp-test"}
          >
            صفحة اختبار WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.location.href = "/merchant/whatsapp-instances"}
          >
            إدارة WhatsApp Instances
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
