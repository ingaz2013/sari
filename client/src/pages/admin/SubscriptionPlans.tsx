import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: plans, isLoading, refetch } = trpc.subscriptionPlans.adminListPlans.useQuery();
  const createPlan = trpc.subscriptionPlans.createPlan.useMutation();
  const updatePlan = trpc.subscriptionPlans.updatePlan.useMutation();
  const deletePlan = trpc.subscriptionPlans.deletePlan.useMutation();
  const toggleStatus = trpc.subscriptionPlans.togglePlanStatus.useMutation();

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    monthlyPrice: '',
    yearlyPrice: '',
    maxCustomers: '',
    maxWhatsAppNumbers: '1',
    features: '',
    isActive: 1,
  });

  const handleCreate = async () => {
    try {
      await createPlan.mutateAsync({
        ...formData,
        maxCustomers: parseInt(formData.maxCustomers),
        maxWhatsAppNumbers: parseInt(formData.maxWhatsAppNumbers),
      });
      toast.success('تم إنشاء الباقة بنجاح');
      setIsCreateDialogOpen(false);
      refetch();
      resetForm();
    } catch (error) {
      toast.error('فشل إنشاء الباقة');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan) return;
    try {
      await updatePlan.mutateAsync({
        id: selectedPlan.id,
        ...formData,
        maxCustomers: formData.maxCustomers ? parseInt(formData.maxCustomers) : undefined,
        maxWhatsAppNumbers: formData.maxWhatsAppNumbers ? parseInt(formData.maxWhatsAppNumbers) : undefined,
      });
      toast.success('تم تحديث الباقة بنجاح');
      setIsEditDialogOpen(false);
      refetch();
      resetForm();
    } catch (error) {
      toast.error('فشل تحديث الباقة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    try {
      await deletePlan.mutateAsync({ id });
      toast.success('تم حذف الباقة بنجاح');
      refetch();
    } catch (error) {
      toast.error('فشل حذف الباقة');
    }
  };

  const handleToggleStatus = async (id: number, isActive: number) => {
    try {
      await toggleStatus.mutateAsync({ id, isActive: isActive ? 0 : 1 });
      toast.success(isActive ? 'تم تعطيل الباقة' : 'تم تفعيل الباقة');
      refetch();
    } catch (error) {
      toast.error('فشل تغيير حالة الباقة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      monthlyPrice: '',
      yearlyPrice: '',
      maxCustomers: '',
      maxWhatsAppNumbers: '1',
      features: '',
      isActive: 1,
    });
    setSelectedPlan(null);
  };

  const openEditDialog = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      nameEn: plan.nameEn,
      description: plan.description || '',
      descriptionEn: plan.descriptionEn || '',
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      maxCustomers: plan.maxCustomers.toString(),
      maxWhatsAppNumbers: plan.maxWhatsAppNumbers.toString(),
      features: plan.features || '',
      isActive: plan.isActive,
    });
    setIsEditDialogOpen(true);
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
          <h1 className="text-3xl font-bold">إدارة الباقات</h1>
          <p className="text-muted-foreground mt-1">إدارة باقات الاشتراك المتاحة للتجار</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة باقة جديدة
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id} className={!plan.isActive ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.nameEn}</CardDescription>
                </div>
                <Switch
                  checked={!!plan.isActive}
                  onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">السعر الشهري</p>
                  <p className="text-2xl font-bold">{plan.monthlyPrice} {plan.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السعر السنوي</p>
                  <p className="text-2xl font-bold">{plan.yearlyPrice} {plan.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحد الأقصى للعملاء</p>
                  <p className="font-semibold">{plan.maxCustomers} عميل</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">أرقام الواتساب</p>
                  <p className="font-semibold">{plan.maxWhatsAppNumbers} رقم</p>
                </div>
                {plan.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">الوصف</p>
                    <p className="text-sm">{plan.description}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
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
            <DialogTitle>إضافة باقة جديدة</DialogTitle>
            <DialogDescription>أدخل تفاصيل الباقة الجديدة</DialogDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCustomers">الحد الأقصى للعملاء *</Label>
                <Input
                  id="maxCustomers"
                  type="number"
                  value={formData.maxCustomers}
                  onChange={(e) => setFormData({ ...formData, maxCustomers: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWhatsAppNumbers">عدد أرقام الواتساب *</Label>
                <Input
                  id="maxWhatsAppNumbers"
                  type="number"
                  value={formData.maxWhatsAppNumbers}
                  onChange={(e) => setFormData({ ...formData, maxWhatsAppNumbers: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">الميزات (JSON)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder='["ميزة 1", "ميزة 2"]'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={createPlan.isPending}>
              {createPlan.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الباقة</DialogTitle>
            <DialogDescription>تحديث تفاصيل الباقة</DialogDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-maxCustomers">الحد الأقصى للعملاء *</Label>
                <Input
                  id="edit-maxCustomers"
                  type="number"
                  value={formData.maxCustomers}
                  onChange={(e) => setFormData({ ...formData, maxCustomers: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxWhatsAppNumbers">عدد أرقام الواتساب *</Label>
                <Input
                  id="edit-maxWhatsAppNumbers"
                  type="number"
                  value={formData.maxWhatsAppNumbers}
                  onChange={(e) => setFormData({ ...formData, maxWhatsAppNumbers: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-features">الميزات (JSON)</Label>
              <Textarea
                id="edit-features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder='["ميزة 1", "ميزة 2"]'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdate} disabled={updatePlan.isPending}>
              {updatePlan.isPending ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
