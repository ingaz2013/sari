import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminGoogleOAuth() {
  const { user } = useAuth();
  
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // التحقق من أن المستخدم هو أدمن
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ليس لديك صلاحية للوصول إلى هذه الصفحة. يجب أن تكون مسؤول النظام.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSave = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error("يجب ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      // في الواقع، يجب حفظ البيانات في قاعدة البيانات أو متغيرات البيئة
      // هنا نقوم بمحاكاة الحفظ
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsSaved(true);
      toast.success("تم حفظ إعدادات Google OAuth بنجاح");

      // إعادة تعيين الحالة بعد 3 ثوانِ
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} إلى الحافظة`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات Google OAuth</h1>
        <p className="text-muted-foreground mt-2">
          أدر بيانات اعتماد Google OAuth لتفعيل تسجيل الدخول عبر Google
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>ملاحظة مهمة:</strong> احفظ بيانات الاعتماد في مكان آمن. لا تشارك Client Secret مع أحد.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>بيانات Google OAuth</CardTitle>
          <CardDescription>
            أدخل بيانات الاعتماد من Google Cloud Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Client ID */}
          <div className="space-y-2">
            <Label htmlFor="client-id">Google Client ID</Label>
            <div className="flex gap-2">
              <Input
                id="client-id"
                type="text"
                placeholder="xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex-1"
              />
              {clientId && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(clientId, "Client ID")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              يمكن العثور على هذا في Google Cloud Console تحت Credentials
            </p>
          </div>

          {/* Google Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="client-secret">Google Client Secret</Label>
            <div className="flex gap-2">
              <Input
                id="client-secret"
                type={showSecret ? "text" : "password"}
                placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {clientSecret && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(clientSecret, "Client Secret")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              احفظ هذا في مكان آمن. لا تشارك هذا مع أحد
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !clientId.trim() || !clientSecret.trim()}
              className="gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  تم الحفظ
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>كيفية الحصول على بيانات Google OAuth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside">
            <li>
              اذهب إلى{" "}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </li>
            <li>أنشئ مشروع جديد أو اختر مشروعاً موجوداً</li>
            <li>فعّل Google+ API من قسم APIs & Services</li>
            <li>اذهب إلى "Credentials" وأنشئ "OAuth 2.0 Client ID"</li>
            <li>اختر "Web application" كنوع التطبيق</li>
            <li>
              أضف الـ Authorized redirect URIs:
              <ul className="mt-2 ml-4 space-y-1 list-disc list-inside">
                <li>
                  <code className="bg-muted px-2 py-1 rounded">
                    http://localhost:3000/
                  </code>{" "}
                  (للتطوير)
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">
                    https://yourdomain.com/
                  </code>{" "}
                  (للإنتاج)
                </li>
              </ul>
            </li>
            <li>انسخ Client ID و Client Secret والصقهما أعلاه</li>
          </ol>
        </CardContent>
      </Card>

      {/* Status Card */}
      {isSaved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex gap-2 items-center text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>تم حفظ إعدادات Google OAuth بنجاح</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
