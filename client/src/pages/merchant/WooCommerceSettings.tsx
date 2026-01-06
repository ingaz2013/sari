/**
 * WooCommerce Settings Page
 * 
 * صفحة إعدادات ربط WooCommerce - إدخال بيانات الاتصال واختبار الربط
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function WooCommerceSettings() {
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [autoSyncProducts, setAutoSyncProducts] = useState(true);
  const [autoSyncOrders, setAutoSyncOrders] = useState(true);
  const [autoSyncCustomers, setAutoSyncCustomers] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch existing settings
  const { data: settings, isLoading: isLoadingSettings, refetch } = trpc.woocommerce.getSettings.useQuery();

  // Load settings when available
  useState(() => {
    if (settings) {
      setStoreUrl(settings.storeUrl || "");
      setAutoSyncProducts(settings.autoSyncProducts === 1);
      setAutoSyncOrders(settings.autoSyncOrders === 1);
      setAutoSyncCustomers(settings.autoSyncCustomers === 1);
      setSyncInterval(settings.syncInterval || 60);
    }
  });

  // Save settings mutation
  const saveSettingsMutation = trpc.woocommerce.saveSettings.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حفظ الإعدادات");
    },
  });

  // Test connection mutation
  const testConnectionMutation = trpc.woocommerce.testConnection.useMutation({
    onSuccess: (data) => {
      setTestResult({ success: true, message: data.message });
      toast.success("تم الاتصال بنجاح!");
    },
    onError: (error) => {
      setTestResult({ success: false, message: error.message });
      toast.error("فشل الاتصال");
    },
    onSettled: () => {
      setIsTesting(false);
    },
  });

  // Manual sync mutations
  const syncProductsMutation = trpc.woocommerce.syncProducts.useMutation({
    onSuccess: (data) => {
      toast.success(`تم مزامنة ${data.count} منتج بنجاح`);
    },
    onError: (error) => {
      toast.error(error.message || "فشلت المزامنة");
    },
  });

  const syncOrdersMutation = trpc.woocommerce.syncOrders.useMutation({
    onSuccess: (data) => {
      toast.success(`تم مزامنة ${data.count} طلب بنجاح`);
    },
    onError: (error) => {
      toast.error(error.message || "فشلت المزامنة");
    },
  });

  const handleSaveSettings = () => {
    if (!storeUrl || !consumerKey || !consumerSecret) {
      toast.error("يرجى إدخال جميع البيانات المطلوبة");
      return;
    }

    saveSettingsMutation.mutate({
      storeUrl,
      consumerKey,
      consumerSecret,
      autoSyncProducts,
      autoSyncOrders,
      autoSyncCustomers,
      syncInterval,
    });
  };

  const handleTestConnection = () => {
    if (!settings) {
      toast.error("يرجى حفظ الإعدادات أولاً");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    testConnectionMutation.mutate();
  };

  const handleSyncProducts = () => {
    syncProductsMutation.mutate();
  };

  const handleSyncOrders = () => {
    syncOrdersMutation.mutate();
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إعدادات WooCommerce</h1>
        <p className="text-muted-foreground">
          قم بربط متجر WooCommerce الخاص بك مع ساري لمزامنة المنتجات والطلبات تلقائياً
        </p>
      </div>

      {/* Connection Status */}
      {settings && settings.isActive === 1 && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            متصل بنجاح - آخر مزامنة: {settings.lastSyncAt ? new Date(settings.lastSyncAt).toLocaleString('ar-SA') : 'لم يتم بعد'}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>بيانات الاتصال</CardTitle>
          <CardDescription>
            أدخل بيانات API الخاصة بمتجر WooCommerce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeUrl">رابط المتجر</Label>
            <Input
              id="storeUrl"
              type="url"
              placeholder="https://example.com"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground">
              مثال: https://yourstore.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <Input
              id="consumerKey"
              type="text"
              placeholder="ck_xxxxxxxxxxxxx"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerSecret">Consumer Secret</Label>
            <Input
              id="consumerSecret"
              type="password"
              placeholder="cs_xxxxxxxxxxxxx"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              dir="ltr"
            />
          </div>

          <Alert>
            <AlertDescription>
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">كيفية الحصول على API Keys:</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>اذهب إلى لوحة تحكم WooCommerce</li>
                    <li>WooCommerce → Settings → Advanced → REST API</li>
                    <li>اضغط "Add Key" وأنشئ مفتاح جديد</li>
                    <li>اختر صلاحيات "Read/Write"</li>
                    <li>انسخ Consumer Key و Consumer Secret</li>
                  </ol>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
            >
              {saveSettingsMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ الإعدادات
            </Button>

            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!settings || isTesting}
            >
              {isTesting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              اختبار الاتصال
            </Button>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}>
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>إعدادات المزامنة التلقائية</CardTitle>
          <CardDescription>
            تحكم في المزامنة التلقائية للبيانات من WooCommerce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>مزامنة المنتجات تلقائياً</Label>
              <p className="text-sm text-muted-foreground">
                تحديث المنتجات من WooCommerce بشكل دوري
              </p>
            </div>
            <Switch
              checked={autoSyncProducts}
              onCheckedChange={setAutoSyncProducts}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>مزامنة الطلبات تلقائياً</Label>
              <p className="text-sm text-muted-foreground">
                تحديث الطلبات من WooCommerce بشكل دوري
              </p>
            </div>
            <Switch
              checked={autoSyncOrders}
              onCheckedChange={setAutoSyncOrders}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>مزامنة العملاء تلقائياً</Label>
              <p className="text-sm text-muted-foreground">
                تحديث بيانات العملاء من WooCommerce
              </p>
            </div>
            <Switch
              checked={autoSyncCustomers}
              onCheckedChange={setAutoSyncCustomers}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncInterval">فترة المزامنة (بالدقائق)</Label>
            <Input
              id="syncInterval"
              type="number"
              min="15"
              max="1440"
              value={syncInterval}
              onChange={(e) => setSyncInterval(parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              الحد الأدنى: 15 دقيقة | الحد الأقصى: 1440 دقيقة (24 ساعة)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync */}
      <Card>
        <CardHeader>
          <CardTitle>مزامنة يدوية</CardTitle>
          <CardDescription>
            قم بمزامنة البيانات يدوياً من WooCommerce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSyncProducts}
              disabled={!settings || syncProductsMutation.isPending}
            >
              {syncProductsMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="ml-2 h-4 w-4" />
              مزامنة المنتجات
            </Button>

            <Button
              variant="outline"
              onClick={handleSyncOrders}
              disabled={!settings || syncOrdersMutation.isPending}
            >
              {syncOrdersMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="ml-2 h-4 w-4" />
              مزامنة الطلبات
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <p className="text-sm">
                💡 <strong>نصيحة:</strong> استخدم المزامنة اليدوية عند إضافة منتجات جديدة أو تحديث الطلبات في WooCommerce
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
