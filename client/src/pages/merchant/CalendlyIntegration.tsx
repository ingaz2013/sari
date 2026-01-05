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
  Calendar, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle,
  Clock,
  Users,
  Settings,
  History,
  Webhook,
  Link2,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

export default function CalendlyIntegration() {
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [syncToWhatsApp, setSyncToWhatsApp] = useState(true);

  // Get merchant ID from localStorage
  const merchantId = parseInt(localStorage.getItem('merchantId') || '0');

  // Get connection status
  const { data: connection, isLoading, refetch } = trpc.calendly.getConnection.useQuery(
    { merchantId },
    { enabled: merchantId > 0 }
  );

  // Get upcoming events
  const { data: upcomingEvents } = trpc.calendly.getUpcomingEvents.useQuery(
    { merchantId, limit: 5 },
    { enabled: merchantId > 0 && connection?.connected }
  );

  // Get event types
  const { data: eventTypes } = trpc.calendly.getEventTypes.useQuery(
    { merchantId },
    { enabled: merchantId > 0 && connection?.connected }
  );

  // Get stats
  const { data: stats } = trpc.calendly.getStats.useQuery(
    { merchantId },
    { enabled: merchantId > 0 && connection?.connected }
  );

  // Mutations
  const connectMutation = trpc.calendly.connect.useMutation({
    onSuccess: (data) => {
      toast.success('تم الربط بنجاح!', {
        description: data.message,
      });
      setApiKey('');
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

  const disconnectMutation = trpc.calendly.disconnect.useMutation({
    onSuccess: (data) => {
      toast.success('تم فصل الحساب', {
        description: data.message,
      });
      refetch();
    },
    onError: (error) => {
      toast.error('فشل فصل الحساب', {
        description: error.message,
      });
    },
  });

  const syncMutation = trpc.calendly.syncNow.useMutation({
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

  const updateSettingsMutation = trpc.calendly.updateSettings.useMutation({
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
    if (!apiKey) {
      toast.error('بيانات ناقصة', {
        description: 'يرجى إدخال API Key من Calendly',
      });
      return;
    }

    setIsConnecting(true);
    connectMutation.mutate({
      merchantId,
      apiKey,
    });
  };

  const handleDisconnect = () => {
    if (confirm('هل أنت متأكد من فصل حساب Calendly؟')) {
      disconnectMutation.mutate({ merchantId });
    }
  };

  const handleSync = () => {
    syncMutation.mutate({ merchantId });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      merchantId,
      autoConfirm,
      sendReminders,
      syncToWhatsApp,
    });
  };

  // Load settings when connection data is available
  useEffect(() => {
    if (connection?.settings) {
      setAutoConfirm(connection.settings.autoConfirm ?? true);
      setSendReminders(connection.settings.sendReminders ?? true);
      setSyncToWhatsApp(connection.settings.syncToWhatsApp ?? true);
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
        <h1 className="text-3xl font-bold mb-2">تكامل Calendly</h1>
        <p className="text-muted-foreground">
          اربط حسابك على Calendly لإدارة المواعيد وإرسال التذكيرات عبر واتساب
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>حالة الاتصال</CardTitle>
                <CardDescription>
                  {connection?.connected ? connection.userName : 'غير متصل'}
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
                <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                <div className="text-sm text-muted-foreground">إجمالي المواعيد</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
                <div className="text-sm text-muted-foreground">مواعيد قادمة</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{stats?.eventTypes || 0}</div>
                <div className="text-sm text-muted-foreground">أنواع المواعيد</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Bell className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{stats?.remindersSent || 0}</div>
                <div className="text-sm text-muted-foreground">تذكيرات مرسلة</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content */}
      {connection?.connected ? (
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 ml-2" />
              المواعيد
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="h-4 w-4 ml-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="links">
              <Link2 className="h-4 w-4 ml-2" />
              روابط الحجز
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>المواعيد القادمة</CardTitle>
                <CardDescription>
                  المواعيد المجدولة من Calendly
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-sm text-muted-foreground">{event.inviteeName}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{new Date(event.startTime).toLocaleDateString('ar-SA')}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد مواعيد قادمة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التكامل</CardTitle>
                <CardDescription>
                  تحكم في كيفية التعامل مع المواعيد من Calendly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">تأكيد تلقائي</Label>
                    <p className="text-sm text-muted-foreground">
                      تأكيد المواعيد تلقائياً عند الحجز
                    </p>
                  </div>
                  <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">إرسال تذكيرات واتساب</Label>
                    <p className="text-sm text-muted-foreground">
                      إرسال تذكيرات للعملاء قبل الموعد
                    </p>
                  </div>
                  <Switch checked={sendReminders} onCheckedChange={setSendReminders} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">مزامنة مع واتساب</Label>
                    <p className="text-sm text-muted-foreground">
                      إرسال تفاصيل الموعد عبر واتساب للعميل
                    </p>
                  </div>
                  <Switch checked={syncToWhatsApp} onCheckedChange={setSyncToWhatsApp} />
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
                    فصل الحساب
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
                  قم بإضافة رابط Webhook في Calendly لاستقبال التحديثات الفورية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Webhook className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">رابط Webhook الخاص بك:</p>
                      <code className="block p-2 bg-muted rounded text-sm break-all">
                        {window.location.origin}/api/webhooks/calendly/{merchantId}
                      </code>
                      <p className="text-sm text-muted-foreground mt-2">
                        انسخ هذا الرابط وأضفه في إعدادات Webhooks في Calendly
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">الأحداث المدعومة:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>invitee.created - حجز موعد جديد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>invitee.canceled - إلغاء موعد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>routing_form_submission.created - تقديم نموذج</span>
                    </li>
                  </ul>
                </div>

                <Button variant="outline" asChild>
                  <a href="https://developer.calendly.com/api-docs/ZG9jOjQ2NTA5-webhooks" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 ml-2" />
                    دليل إعداد Webhooks في Calendly
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Links Tab */}
          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>روابط الحجز</CardTitle>
                <CardDescription>
                  أنواع المواعيد المتاحة للحجز
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventTypes && eventTypes.length > 0 ? (
                  <div className="space-y-3">
                    {eventTypes.map((eventType: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Link2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{eventType.name}</p>
                            <p className="text-sm text-muted-foreground">{eventType.duration} دقيقة</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={eventType.schedulingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 ml-2" />
                            فتح الرابط
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد أنواع مواعيد</p>
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
            <CardTitle>ربط حساب Calendly</CardTitle>
            <CardDescription>
              أدخل API Key من Calendly للبدء في إدارة المواعيد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                للحصول على API Key، اذهب إلى Calendly &gt; Integrations &gt; API & Webhooks &gt; Personal Access Token
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Personal Access Token</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="أدخل الـ Personal Access Token"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                ربط الحساب
              </Button>
              <Button variant="outline" asChild>
                <a href="https://calendly.com/integrations/api_webhooks" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 ml-2" />
                  فتح إعدادات Calendly
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
