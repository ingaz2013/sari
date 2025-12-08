import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, Send, Image as ImageIcon, CheckCircle2, XCircle, Phone, 
  Save, Trash2, AlertCircle, Copy, ExternalLink, Info 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function WhatsAppTest() {
  // Green API Credentials
  const [instanceId, setInstanceId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  // Message fields
  const [phoneNumber, setPhoneNumber] = useState("966501898700");
  const [message, setMessage] = useState("مرحباً! هذه رسالة تجريبية من ساري 🎉");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  // Test results
  const [testResults, setTestResults] = useState<{
    connection?: {
      success: boolean;
      status: string;
      phoneNumber?: string;
      error?: string;
      timestamp: string;
    };
    textMessage?: {
      success: boolean;
      messageId?: string;
      error?: string;
      timestamp: string;
    };
    imageMessage?: {
      success: boolean;
      messageId?: string;
      error?: string;
      timestamp: string;
    };
  }>({});

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    status: string;
    phoneNumber?: string;
    error?: string;
    debug?: any;
  } | null>(null);

  // Load saved instance
  const { data: savedInstance, refetch: refetchInstance } = trpc.whatsapp.getPrimaryInstance.useQuery();

  // Load saved data on mount
  useEffect(() => {
    if (savedInstance) {
      setInstanceId(savedInstance.instanceId);
      setApiToken(savedInstance.token);
      setIsSaved(true);
    }
  }, [savedInstance]);

  const saveInstanceMutation = trpc.whatsapp.saveInstance.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ بيانات WhatsApp بنجاح! ✅");
      setIsSaved(true);
      refetchInstance();
    },
    onError: (error) => {
      toast.error(`فشل حفظ البيانات: ${error.message}`);
    },
  });

  const deleteInstanceMutation = trpc.whatsapp.deleteInstance.useMutation({
    onSuccess: () => {
      toast.success("تم حذف البيانات المحفوظة");
      setInstanceId("");
      setApiToken("");
      setIsSaved(false);
      setConnectionStatus(null);
      setTestResults({});
      refetchInstance();
    },
    onError: (error) => {
      toast.error(`فشل حذف البيانات: ${error.message}`);
    },
  });

  const sendMessageMutation = trpc.whatsapp.sendTestMessage.useMutation({
    onSuccess: (data: any) => {
      toast.success("تم إرسال الرسالة بنجاح! ✅");
      setTestResults(prev => ({
        ...prev,
        textMessage: {
          success: true,
          messageId: data?.idMessage || 'unknown',
          timestamp: new Date().toISOString(),
        }
      }));
    },
    onError: (error) => {
      toast.error(`فشل إرسال الرسالة: ${error.message}`);
      setTestResults(prev => ({
        ...prev,
        textMessage: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      }));
    },
  });

  const sendImageMutation = trpc.whatsapp.sendTestImage.useMutation({
    onSuccess: (data: any) => {
      toast.success("تم إرسال الصورة بنجاح! ✅");
      setTestResults(prev => ({
        ...prev,
        imageMessage: {
          success: true,
          messageId: data?.idMessage || 'unknown',
          timestamp: new Date().toISOString(),
        }
      }));
    },
    onError: (error) => {
      toast.error(`فشل إرسال الصورة: ${error.message}`);
      setTestResults(prev => ({
        ...prev,
        imageMessage: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      }));
    },
  });

  const testConnectionMutation = trpc.whatsapp.testConnection.useMutation({
    onSuccess: (data) => {
      setConnectionStatus(data);
      setTestResults(prev => ({
        ...prev,
        connection: {
          success: data.success,
          status: data.status,
          phoneNumber: data.phoneNumber,
          error: data.error,
          timestamp: new Date().toISOString(),
        }
      }));
      
      if (data.success) {
        toast.success(`الاتصال ناجح! ✅\nالحالة: ${data.status}`);
      } else {
        toast.error(data.error || `فشل الاتصال ❌\nالحالة: ${data.status}`);
      }
    },
    onError: (error: any) => {
      console.error('[WhatsApp Test] Unexpected Error:', error);
      toast.error(`خطأ غير متوقع: ${error.message}`);
      setConnectionStatus({
        success: false,
        status: 'error',
        error: error.message,
        debug: {
          errorMessage: error.message,
          note: 'Unexpected error - check console',
        },
      });
      setTestResults(prev => ({
        ...prev,
        connection: {
          success: false,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      }));
    },
  });

  const handleTestConnection = () => {
    if (!instanceId.trim()) {
      toast.error("يرجى إدخال Instance ID");
      return;
    }
    if (!apiToken.trim()) {
      toast.error("يرجى إدخال API Token");
      return;
    }

    testConnectionMutation.mutate({
      instanceId: instanceId.trim(),
      token: apiToken.trim(),
    });
  };

  const handleSaveInstance = () => {
    if (!instanceId.trim()) {
      toast.error("يرجى إدخال Instance ID");
      return;
    }
    if (!apiToken.trim()) {
      toast.error("يرجى إدخال API Token");
      return;
    }

    saveInstanceMutation.mutate({
      instanceId: instanceId.trim(),
      token: apiToken.trim(),
      phoneNumber: connectionStatus?.phoneNumber,
    });
  };

  const handleDeleteInstance = () => {
    if (!savedInstance) return;
    
    if (confirm("هل أنت متأكد من حذف بيانات WhatsApp المحفوظة؟")) {
      deleteInstanceMutation.mutate({ instanceId: savedInstance.id });
    }
  };

  const handleSendMessage = () => {
    if (!instanceId.trim() || !apiToken.trim()) {
      toast.error("يرجى إدخال بيانات Green API أولاً");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("يرجى إدخال رقم الجوال");
      return;
    }
    if (!message.trim()) {
      toast.error("يرجى إدخال نص الرسالة");
      return;
    }

    sendMessageMutation.mutate({
      instanceId: instanceId.trim(),
      token: apiToken.trim(),
      phoneNumber: phoneNumber.trim(),
      message: message.trim(),
    });
  };

  const handleSendImage = () => {
    if (!instanceId.trim() || !apiToken.trim()) {
      toast.error("يرجى إدخال بيانات Green API أولاً");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("يرجى إدخال رقم الجوال");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("يرجى إدخال رابط الصورة");
      return;
    }

    sendImageMutation.mutate({
      instanceId: instanceId.trim(),
      token: apiToken.trim(),
      phoneNumber: phoneNumber.trim(),
      imageUrl: imageUrl.trim(),
      caption: imageCaption.trim(),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ!");
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">اختبار WhatsApp</h1>
            <p className="text-muted-foreground">
              اختبر الاتصال بـ Green API وإرسال الرسائل
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/merchant/greenapi-setup"}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            دليل الإعداد
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Configuration & Testing */}
        <div className="space-y-6">
          {/* Green API Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                بيانات Green API
              </CardTitle>
              <CardDescription>
                أدخل Instance ID و Token من لوحة تحكم Green API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSaved && savedInstance && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    البيانات محفوظة! Instance: {savedInstance.instanceId}
                    {savedInstance.phoneNumber && ` • رقم الهاتف: ${savedInstance.phoneNumber}`}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="instanceId">Instance ID</Label>
                  <Input
                    id="instanceId"
                    placeholder="7105411382"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    disabled={isSaved}
                  />
                </div>

                <div>
                  <Label htmlFor="apiToken">API Token</Label>
                  <Input
                    id="apiToken"
                    type="password"
                    placeholder="أدخل API Token"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    disabled={isSaved}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={testConnectionMutation.isPending || !instanceId || !apiToken}
                  className="flex-1"
                >
                  {testConnectionMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  اختبار الاتصال
                </Button>

                {!isSaved && connectionStatus?.success && (
                  <Button
                    onClick={handleSaveInstance}
                    disabled={saveInstanceMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {saveInstanceMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    <Save className="ml-2 h-4 w-4" />
                    حفظ البيانات
                  </Button>
                )}

                {isSaved && (
                  <Button
                    onClick={handleDeleteInstance}
                    disabled={deleteInstanceMutation.isPending}
                    variant="destructive"
                  >
                    {deleteInstanceMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Send Text Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                إرسال رسالة نصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">رقم الجوال (مع رمز الدولة)</Label>
                <Input
                  id="phoneNumber"
                  placeholder="966501234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مثال: 966501234567 (بدون + أو 00)
                </p>
              </div>

              <div>
                <Label htmlFor="message">نص الرسالة</Label>
                <Textarea
                  id="message"
                  placeholder="اكتب رسالتك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !instanceId || !apiToken}
                className="w-full"
              >
                {sendMessageMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                <Send className="ml-2 h-4 w-4" />
                إرسال الرسالة
              </Button>
            </CardContent>
          </Card>

          {/* Send Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                إرسال صورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">رابط الصورة</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="imageCaption">نص مرفق (اختياري)</Label>
                <Textarea
                  id="imageCaption"
                  placeholder="وصف الصورة..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                onClick={handleSendImage}
                disabled={sendImageMutation.isPending || !instanceId || !apiToken}
                className="w-full"
              >
                {sendImageMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                <ImageIcon className="ml-2 h-4 w-4" />
                إرسال الصورة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Test Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                نتائج الاختبار
              </CardTitle>
              <CardDescription>
                نتائج تفصيلية لجميع العمليات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Test Result */}
              {testResults.connection && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      {testResults.connection.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      اختبار الاتصال
                    </h3>
                    <Badge variant={testResults.connection.success ? "default" : "destructive"}>
                      {testResults.connection.status}
                    </Badge>
                  </div>
                  
                  {testResults.connection.phoneNumber && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">رقم الواتساب المتصل:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-sm">{testResults.connection.phoneNumber}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(testResults.connection!.phoneNumber!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {testResults.connection.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{testResults.connection.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(testResults.connection.timestamp).toLocaleString('ar-SA')}
                  </p>
                  <Separator />
                </div>
              )}

              {/* Text Message Result */}
              {testResults.textMessage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      {testResults.textMessage.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      إرسال رسالة نصية
                    </h3>
                    <Badge variant={testResults.textMessage.success ? "default" : "destructive"}>
                      {testResults.textMessage.success ? "نجح" : "فشل"}
                    </Badge>
                  </div>
                  
                  {testResults.textMessage.messageId && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Message ID:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs break-all">{testResults.textMessage.messageId}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(testResults.textMessage!.messageId!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {testResults.textMessage.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{testResults.textMessage.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(testResults.textMessage.timestamp).toLocaleString('ar-SA')}
                  </p>
                  <Separator />
                </div>
              )}

              {/* Image Message Result */}
              {testResults.imageMessage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      {testResults.imageMessage.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      إرسال صورة
                    </h3>
                    <Badge variant={testResults.imageMessage.success ? "default" : "destructive"}>
                      {testResults.imageMessage.success ? "نجح" : "فشل"}
                    </Badge>
                  </div>
                  
                  {testResults.imageMessage.messageId && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Message ID:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs break-all">{testResults.imageMessage.messageId}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(testResults.imageMessage!.messageId!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {testResults.imageMessage.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{testResults.imageMessage.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(testResults.imageMessage.timestamp).toLocaleString('ar-SA')}
                  </p>
                </div>
              )}

              {!testResults.connection && !testResults.textMessage && !testResults.imageMessage && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لم يتم إجراء أي اختبار بعد</p>
                  <p className="text-sm mt-1">ابدأ باختبار الاتصال أولاً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>نصائح سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>خطوة 1:</strong> اختبر الاتصال أولاً للتأكد من صحة البيانات
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>خطوة 2:</strong> احفظ البيانات بعد نجاح الاتصال
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>خطوة 3:</strong> جرب إرسال رسالة لرقمك الشخصي
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>خطوة 4:</strong> أرسل رسالة من رقمك لرقم المتجر لاختبار ساري
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
