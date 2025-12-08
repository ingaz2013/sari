import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Clock, 
  MessageSquare, 
  Zap, 
  Save,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function BotSettings() {
  const utils = trpc.useUtils();
  
  // Get current settings
  const { data: settings, isLoading } = trpc.botSettings.get.useQuery();
  const { data: shouldRespond } = trpc.botSettings.shouldRespond.useQuery();
  
  // Update mutation
  const updateMutation = trpc.botSettings.update.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات بنجاح');
      utils.botSettings.get.invalidate();
      utils.botSettings.shouldRespond.invalidate();
    },
    onError: (error) => {
      toast.error('فشل حفظ الإعدادات: ' + error.message);
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    autoReplyEnabled: true,
    workingHoursEnabled: false,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    workingDays: '1,2,3,4,5',
    welcomeMessage: '',
    outOfHoursMessage: '',
    responseDelay: 2,
    maxResponseLength: 200,
    tone: 'friendly' as 'friendly' | 'professional' | 'casual',
    language: 'ar' as 'ar' | 'en' | 'both',
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        autoReplyEnabled: settings.autoReplyEnabled,
        workingHoursEnabled: settings.workingHoursEnabled,
        workingHoursStart: settings.workingHoursStart || '09:00',
        workingHoursEnd: settings.workingHoursEnd || '18:00',
        workingDays: settings.workingDays || '1,2,3,4,5',
        welcomeMessage: settings.welcomeMessage || '',
        outOfHoursMessage: settings.outOfHoursMessage || '',
        responseDelay: settings.responseDelay ?? 2,
        maxResponseLength: settings.maxResponseLength ?? 200,
        tone: settings.tone,
        language: settings.language,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleWorkingDayToggle = (day: number) => {
    const days = formData.workingDays.split(',').map(d => parseInt(d));
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day].sort();
    setFormData({ ...formData, workingDays: newDays.join(',') });
  };

  const isWorkingDay = (day: number) => {
    return formData.workingDays.split(',').map(d => parseInt(d)).includes(day);
  };

  const weekDays = [
    { value: 0, label: 'الأحد' },
    { value: 1, label: 'الإثنين' },
    { value: 2, label: 'الثلاثاء' },
    { value: 3, label: 'الأربعاء' },
    { value: 4, label: 'الخميس' },
    { value: 5, label: 'الجمعة' },
    { value: 6, label: 'السبت' },
  ];

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إعدادات الروبوت</h1>
        <p className="text-muted-foreground">
          تخصيص سلوك ساري AI للرد التلقائي على رسائل WhatsApp
        </p>
      </div>

      {/* Status Alert */}
      {shouldRespond && (
        <Alert className="mb-6" variant={shouldRespond.shouldRespond ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {shouldRespond.shouldRespond ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <strong>الروبوت نشط</strong> - يرد تلقائياً على الرسائل الواردة
              </span>
            ) : (
              <span>
                <strong>الروبوت متوقف</strong> - {shouldRespond.reason === 'Auto-reply is disabled' ? 'الرد التلقائي معطّل' : shouldRespond.reason === 'Outside working hours' ? 'خارج ساعات العمل' : 'خارج أيام العمل'}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto-Reply Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              الرد التلقائي
            </CardTitle>
            <CardDescription>
              تفعيل أو تعطيل الرد التلقائي على رسائل WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoReply">تفعيل الرد التلقائي</Label>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، سيرد ساري تلقائياً على جميع الرسائل الواردة
                </p>
              </div>
              <Switch
                id="autoReply"
                checked={formData.autoReplyEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, autoReplyEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              ساعات العمل
            </CardTitle>
            <CardDescription>
              تحديد ساعات وأيام العمل للرد التلقائي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="workingHours">تفعيل ساعات العمل</Label>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، سيرد الروبوت فقط خلال ساعات وأيام العمل المحددة
                </p>
              </div>
              <Switch
                id="workingHours"
                checked={formData.workingHoursEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, workingHoursEnabled: checked })}
              />
            </div>

            {formData.workingHoursEnabled && (
              <>
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">وقت البداية</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.workingHoursStart}
                      onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">وقت النهاية</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.workingHoursEnd}
                      onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>أيام العمل</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <Badge
                        key={day.value}
                        variant={isWorkingDay(day.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleWorkingDayToggle(day.value)}
                      >
                        {day.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    اضغط على اليوم لتفعيله أو تعطيله
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              الرسائل
            </CardTitle>
            <CardDescription>
              تخصيص رسائل الترحيب والرسائل خارج أوقات العمل
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
              <Textarea
                id="welcomeMessage"
                placeholder="مرحباً! أنا ساري، مساعدك الذكي. كيف أقدر أساعدك اليوم؟ 😊"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                الرسالة الأولى التي يراها العميل الجديد (اختياري)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outOfHoursMessage">رسالة خارج أوقات العمل</Label>
              <Textarea
                id="outOfHoursMessage"
                placeholder="شكراً لتواصلك! نحن حالياً خارج أوقات العمل. سنرد عليك في أقرب وقت ممكن. ⏰"
                value={formData.outOfHoursMessage}
                onChange={(e) => setFormData({ ...formData, outOfHoursMessage: e.target.value })}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                الرسالة التي تُرسل عند التواصل خارج ساعات العمل
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              سلوك الذكاء الاصطناعي
            </CardTitle>
            <CardDescription>
              تخصيص طريقة رد ساري AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">نبرة الصوت</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value: 'friendly' | 'professional' | 'casual') => 
                    setFormData({ ...formData, tone: value })
                  }
                >
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">ودود 😊</SelectItem>
                    <SelectItem value="professional">احترافي 💼</SelectItem>
                    <SelectItem value="casual">عادي 👋</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">اللغة</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: 'ar' | 'en' | 'both') => 
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية فقط 🇸🇦</SelectItem>
                    <SelectItem value="en">الإنجليزية فقط 🇬🇧</SelectItem>
                    <SelectItem value="both">كلاهما 🌍</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responseDelay">تأخير الرد (ثواني)</Label>
                <Input
                  id="responseDelay"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.responseDelay}
                  onChange={(e) => setFormData({ ...formData, responseDelay: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  الوقت قبل إرسال الرد (1-10 ثواني)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLength">الحد الأقصى لطول الرد</Label>
                <Input
                  id="maxLength"
                  type="number"
                  min={50}
                  max={500}
                  value={formData.maxResponseLength}
                  onChange={(e) => setFormData({ ...formData, maxResponseLength: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  عدد الأحرف (50-500)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>ملاحظة:</strong> التغييرات ستطبق فوراً على جميع الرسائل الجديدة. لن تؤثر على المحادثات الجارية.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 ml-2" />
            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </form>
    </div>
  );
}
