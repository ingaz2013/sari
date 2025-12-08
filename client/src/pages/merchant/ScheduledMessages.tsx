import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

export default function ScheduledMessages() {
  const utils = trpc.useUtils();
  
  // Get scheduled messages
  const { data: messages, isLoading } = trpc.scheduledMessages.list.useQuery();
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    dayOfWeek: 4, // Thursday by default
    time: '10:00',
    isActive: true,
  });

  // Create mutation
  const createMutation = trpc.scheduledMessages.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء الرسالة المجدولة بنجاح');
      utils.scheduledMessages.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error('فشل إنشاء الرسالة: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = trpc.scheduledMessages.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الرسالة بنجاح');
      utils.scheduledMessages.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error('فشل تحديث الرسالة: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.scheduledMessages.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الرسالة بنجاح');
      utils.scheduledMessages.list.invalidate();
    },
    onError: (error) => {
      toast.error('فشل حذف الرسالة: ' + error.message);
    },
  });

  // Toggle mutation
  const toggleMutation = trpc.scheduledMessages.toggle.useMutation({
    onSuccess: () => {
      utils.scheduledMessages.list.invalidate();
    },
    onError: (error) => {
      toast.error('فشل تغيير الحالة: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      dayOfWeek: 4,
      time: '10:00',
      isActive: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (message: any) => {
    setFormData({
      title: message.title,
      message: message.message,
      dayOfWeek: message.dayOfWeek,
      time: message.time,
      isActive: message.isActive,
    });
    setEditingId(message.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة المجدولة؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleToggle = (id: number, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive: !isActive });
  };

  if (isLoading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">الرسائل المجدولة</h1>
        <p className="text-muted-foreground">
          أنشئ رسائل تُرسل تلقائياً في أيام وأوقات محددة (مثل عروض الخميس الأسبوعية)
        </p>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingId ? 'تعديل الرسالة المجدولة' : 'إضافة رسالة مجدولة جديدة'}</span>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الرسالة</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: عرض الخميس الأسبوعي"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">محتوى الرسالة</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="مثال: عروض الخميس! خصم 20% على جميع المنتجات. العرض ساري حتى نهاية اليوم!"
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dayOfWeek">اليوم</Label>
                  <Select
                    value={formData.dayOfWeek.toString()}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">الوقت (24 ساعة)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>تفعيل الرسالة</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="h-4 w-4 ml-2" />
                  {editingId ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-6">
          <Plus className="h-4 w-4 ml-2" />
          إضافة رسالة مجدولة
        </Button>
      )}

      {/* Messages List */}
      <div className="grid gap-4">
        {messages && messages.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد رسائل مجدولة. أنشئ رسالتك الأولى!
            </CardContent>
          </Card>
        )}

        {messages?.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {message.title}
                    {message.isActive ? (
                      <Badge variant="default">مفعّل</Badge>
                    ) : (
                      <Badge variant="secondary">معطّل</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {DAYS_OF_WEEK.find(d => d.value === message.dayOfWeek)?.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {message.time}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Switch
                    checked={message.isActive}
                    onCheckedChange={() => handleToggle(message.id, message.isActive)}
                    disabled={toggleMutation.isPending}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(message)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              {message.lastSentAt && (
                <p className="text-xs text-muted-foreground mt-3">
                  آخر إرسال: {new Date(message.lastSentAt).toLocaleString('ar-SA')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
