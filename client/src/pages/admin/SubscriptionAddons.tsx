import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionAddons() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<any>(null);

  const { data: addons, isLoading, refetch } = trpc.subscriptionAddons.listAddons.useQuery();
  const createAddon = trpc.subscriptionAddons.createAddon.useMutation();
  const updateAddon = trpc.subscriptionAddons.updateAddon.useMutation();
  const deleteAddon = trpc.subscriptionAddons.deleteAddon.useMutation();
  const toggleStatus = trpc.subscriptionAddons.toggleAddonStatus.useMutation();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    type: 'extra_whatsapp',
    monthlyPrice: '',
    yearlyPrice: '',
    value: '1',
    isActive: 1,
  });

  const handleCreate = async () => {
    try {
      await createAddon.mutateAsync({
        ...formData,
        value: parseInt(formData.value),
      });
      toast.success('تم إنشاء الخدمة الإضافية بنجاح');
      setIsCreateDialogOpen(false);
      refetch();
      resetForm();
    } catch (error) {
      toast.error('فشل إنشاء الخدمة الإضافية');
    }
  };

  const handleUpdate = async () => {
    if (!selectedAddon) return;
    try {
      await updateAddon.mutateAsync({
        id: selectedAddon.id,
        ...formData,
        value: formData.value ? parseInt(formData.value) : undefined,
      });
      toast.success('تم تحديث الخدمة الإضافية بنجاح');
      setIsEditDialogOpen(false);
      refetch();
      resetForm();
    } catch (error) {
      toast.error('فشل تحديث الخدمة الإضافية');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة الإضافية؟')) return;
    try {
      await deleteAddon.mutateAsync({ id });
      toast.success('تم حذف الخدمة الإضافية بنجاح');
      refetch();
    } catch (error) {
      toast.error('فشل حذف الخدمة الإضافية');
    }
  };

  const handleToggleStatus = async (id: number, isActive: number) => {
    try {
      await toggleStatus.mutateAsync({ id, isActive: isActive ? 0 : 1 });
      toast.success(isActive ? 'تم تعطيل الخدمة' : 'تم تفعيل الخدمة');
      refetch();
    } catch (error) {
      toast.error('فشل تغيير حالة الخدمة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      type: 'extra_whatsapp',
      monthlyPrice: '',
      yearlyPrice: '',
      value: '1',
      isActive: 1,
    });
    setSelectedAddon(null);
  };

  const openEditDialog = (addon: any) => {
    setSelectedAddon(addon);
    setFormData({
      name: addon.name,
      nameEn: addon.nameEn,
      description: addon.description || '',
      descriptionEn: addon.descriptionEn || '',
      type: addon.type,
      monthlyPrice: addon.monthlyPrice,
      yearlyPrice: addon.yearlyPrice,
      value: addon.value.toString(),
      isActive: addon.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      extra_whatsapp: 'رقم واتساب إضافي',
      extra_customers: 'عملاء إضافيين',
      custom: 'خدمة مخصصة',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الخدمات الإضافية</h1>
          <p className="text-muted-foreground mt-1">إدارة الخدمات الإضافية المتاحة للتجار</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة خدمة جديدة
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {addons?.map((addon) => (
          <Card key={addon.id} className={!addon.isActive ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{addon.name}</CardTitle>
                  <CardDescription>{addon.nameEn}</CardDescription>
                </div>
                <Switch
                  checked={!!addon.isActive}
                  onCheckedChange={() => handleToggleStatus(addon.id, addon.isActive)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">النوع</p>
                  <p className="font-semibold">{getTypeLabel(addon.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">القيمة</p>
                  <p className="font-semibold">{addon.value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السعر الشهري</p>
                  <p className="text-2xl font-bold">{addon.monthlyPrice} {addon.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السعر السنوي</p>
                  <p className="text-2xl font-bold">{addon.yearlyPrice} {addon.currency}</p>
                </div>
                {addon.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">الوصف</p>
                    <p className="text-sm">{addon.description}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(addon)}
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(addon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة خدمة إضافية جديدة</DialogTitle>
            <DialogDescription>أدخل تفاصيل الخدمة الإضافية الجديدة</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم بالعربية *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">نوع الخدمة *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extra_whatsapp">رقم واتساب إضافي</SelectItem>
                  <SelectItem value="extra_customers">عملاء إضافيين</SelectItem>
                  <SelectItem value="custom">خدمة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">القيمة *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="1"
              />
              <p className="text-sm text-muted-foreground">
                {formData.type === 'extra_whatsapp' && 'عدد الأرقام الإضافية'}
                {formData.type === 'extra_customers' && 'عدد العملاء الإضافيين'}
                {formData.type === 'custom' && 'القيمة المخصصة'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف بالعربية</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">الوصف بالإنجليزية</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">السعر الشهري (SAR) *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">السعر السنوي (SAR) *</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  value={formData.yearlyPrice}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={createAddon.isPending}>
              {createAddon.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الخدمة الإضافية</DialogTitle>
            <DialogDescription>تحديث تفاصيل الخدمة الإضافية</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم بالعربية *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nameEn">الاسم بالإنجليزية *</Label>
                <Input
                  id="edit-nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">نوع الخدمة *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extra_whatsapp">رقم واتساب إضافي</SelectItem>
                  <SelectItem value="extra_customers">عملاء إضافيين</SelectItem>
                  <SelectItem value="custom">خدمة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-value">القيمة *</Label>
              <Input
                id="edit-value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">الوصف بالعربية</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descriptionEn">الوصف بالإنجليزية</Label>
              <Textarea
                id="edit-descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-monthlyPrice">السعر الشهري (SAR) *</Label>
                <Input
                  id="edit-monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-yearlyPrice">السعر السنوي (SAR) *</Label>
                <Input
                  id="edit-yearlyPrice"
                  type="number"
                  value={formData.yearlyPrice}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdate} disabled={updateAddon.isPending}>
              {updateAddon.isPending ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
