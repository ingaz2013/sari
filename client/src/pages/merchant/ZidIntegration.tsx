import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Store, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle,
  Package,
  ShoppingCart,
  Users,
  Settings,
  History,
  Webhook
} from 'lucide-react';
import { toast } from 'sonner';

export default function ZidIntegration() {
  const [storeUrl, setStoreUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncProducts, setSyncProducts] = useState(true);
  const [syncOrders, setSyncOrders] = useState(true);
  const [syncCustomers, setSyncCustomers] = useState(true);

  // Get merchant ID from localStorage
  const merchantId = parseInt(localStorage.getItem('merchantId') || '0');

  // Get connection status
  const { data: connection, isLoading, refetch } = trpc.zid.getConnection.useQuery(
    { merchantId },
    { enabled: merchantId > 0 }
  );

  // Get sync logs
  const { data: syncLogs } = trpc.zid.getSyncLogs.useQuery(
    { merchantId, limit: 10 },
    { enabled: merchantId > 0 && connection?.connected }
  );

  // Get sync stats
  const { data: syncStats } = trpc.zid.getSyncStats.useQuery(
    { merchantId },
    { enabled: merchantId > 0 && connection?.connected }
  );

  // Mutations
  const connectMutation = trpc.zid.connect.useMutation({
    onSuccess: (data) => {
      toast.success('تم الربط بنجاح!', {
        description: data.message,
      });
      setStoreUrl('');
      setAccessToken('');
      refetch();
    },
    onError: (error) => {
      toast.error('فشل الربط', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsConnecting(false);
    },
  });

  const disconnectMutation = trpc.zid.disconnect.useMutation({
    onSuccess: (data) => {
      toast.success('تم فصل المتجر', {
        description: data.message,
      });
      refetch();
    },
    onError: (error) => {
      toast.error('فشل فصل المتجر', {
        description: error.message,
      });
    },
  });

  const syncMutation = trpc.zid.syncNow.useMutation({
    onSuccess: (data) => {
      toast.success('تمت المزامنة بنجاح!', {
        description: data.message,
      });
      refetch();
    },
    onError: (error) => {
      toast.error('فشلت المزامنة', {
        description: error.message,
      });
    },
  });

  const updateSettingsMutation = trpc.zid.updateSettings.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات');
    },
    onError: (error) => {
      toast.error('فشل حفظ الإعدادات', {
        description: error.message,
      });
    },
  });

  const handleConnect = () => {
    if (!storeUrl || !accessToken) {
      toast.error('بيانات ناقصة', {
        description: 'يرجى إدخال رابط المتجر والـ Access Token',
      });
      return;
    }

    setIsConnecting(true);
    connectMutation.mutate({
      merchantId,
      storeUrl,
      accessToken,
    });
  };

  const handleDisconnect = () => {
    if (confirm('هل أنت متأكد من فصل متجر زد؟')) {
      disconnectMutation.mutate({ merchantId });
    }
  };

  const handleSync = () => {
    syncMutation.mutate({ merchantId });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      merchantId,
      autoSync,
      syncProducts,
      syncOrders,
      syncCustomers,
    });
  };

  // Load settings when connection data is available
  useEffect(() => {
    if (connection?.settings) {
      setAutoSync(connection.settings.autoSync ?? true);
      setSyncProducts(connection.settings.syncProducts ?? true);
      setSyncOrders(connection.settings.syncOrders ?? true);
      setSyncCustomers(connection.settings.syncCustomers ?? true);
    }
  }, [connection]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">تكامل زد (Zid)</h1>
        <p className="text-muted-foreground">
          اربط متجرك على زد لمزامنة المنتجات والطلبات تلقائياً
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>حالة الاتصال</CardTitle>
                <CardDescription>
                  {connection?.connected ? connection.storeName : 'غير متصل'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={connection?.connected ? 'default' : 'secondary'}>
              {connection?.connected ? (
                <><CheckCircle2 className="h-4 w-4 ml-1" /> متصل</>
              ) : (
                <><XCircle className="h-4 w-4 ml-1" /> غير متصل</>
              )}
            </Badge>
          </div>
        </CardHeader>
        {connection?.connected && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Package className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{syncStats?.products || 0}</div>
                <div className="text-sm text-muted-foreground">منتج</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <ShoppingCart className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{syncStats?.orders || 0}</div>
                <div className="text-sm text-muted-foreground">طلب</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{syncStats?.customers || 0}</div>
                <div className="text-sm text-muted-foreground">عميل</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <History className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{syncStats?.lastSync || '-'}</div>
                <div className="text-sm text-muted-foreground">آخر مزامنة</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content */}
      {connection?.connected ? (
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="h-4 w-4 ml-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="logs">
              <History className="h-4 w-4 ml-2" />
              سجل المزامنة
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المزامنة</CardTitle>
                <CardDescription>
                  تحكم في البيانات التي تريد مزامنتها من متجر زد
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">المزامنة التلقائية</Label>
                    <p className="text-sm text-muted-foreground">
                      مزامنة البيانات تلقائياً عند حدوث تغييرات
                    </p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">مزامنة المنتجات</Label>
                    <p className="text-sm text-muted-foreground">
                      استيراد المنتجات والمخزون من زد
                    </p>
                  </div>
                  <Switch checked={syncProducts} onCheckedChange={setSyncProducts} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">مزامنة الطلبات</Label>
                    <p className="text-sm text-muted-foreground">
                      استيراد الطلبات الجديدة تلقائياً
                    </p>
                  </div>
                  <Switch checked={syncOrders} onCheckedChange={setSyncOrders} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">مزامنة العملاء</Label>
                    <p className="text-sm text-muted-foreground">
                      استيراد بيانات العملاء من زد
                    </p>
                  </div>
                  <Switch checked={syncCustomers} onCheckedChange={setSyncCustomers} />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline" onClick={handleSync} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 ml-2" />
                    )}
                    مزامنة الآن
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    فصل المتجر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات Webhooks</CardTitle>
                <CardDescription>
                  قم بإضافة رابط Webhook في لوحة تحكم زد لاستقبال التحديثات الفورية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Webhook className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">رابط Webhook الخاص بك:</p>
                      <code className="block p-2 bg-muted rounded text-sm break-all">
                        {window.location.origin}/api/webhooks/zid/{merchantId}
                      </code>
                      <p className="text-sm text-muted-foreground mt-2">
                        انسخ هذا الرابط وأضفه في إعدادات Webhooks في لوحة تحكم زد
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">الأحداث المدعومة:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>order.created - طلب جديد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>order.updated - تحديث طلب</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>product.created - منتج جديد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>product.updated - تحديث منتج</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>inventory.updated - تحديث المخزون</span>
                    </li>
                  </ul>
                </div>

                <Button variant="outline" asChild>
                  <a href="https://docs.zid.sa/webhooks" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 ml-2" />
                    دليل إعداد Webhooks في زد
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>سجل المزامنة</CardTitle>
                <CardDescription>
                  آخر عمليات المزامنة مع متجر زد
                </CardDescription>
              </CardHeader>
              <CardContent>
                {syncLogs && syncLogs.length > 0 ? (
                  <div className="space-y-3">
                    {syncLogs.map((log: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{log.type}</p>
                            <p className="text-sm text-muted-foreground">{log.message}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد سجلات مزامنة بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Connection Form */
        <Card>
          <CardHeader>
            <CardTitle>ربط متجر زد</CardTitle>
            <CardDescription>
              أدخل بيانات متجرك على زد للبدء في المزامنة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                للحصول على Access Token، اذهب إلى لوحة تحكم زد &gt; الإعدادات &gt; التكاملات &gt; API
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeUrl">رابط المتجر</Label>
                <Input
                  id="storeUrl"
                  placeholder="https://your-store.zid.store"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="أدخل الـ Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                ربط المتجر
              </Button>
              <Button variant="outline" asChild>
                <a href="https://web.zid.sa/market/app-store" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 ml-2" />
                  فتح لوحة تحكم زد
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
