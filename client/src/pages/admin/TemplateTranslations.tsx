import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Languages, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function TemplateTranslations() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'translated' | 'untranslated'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'ar' | 'en'>('all');

  const { data: templates, isLoading, refetch } = trpc.templateTranslations.getAllWithStatus.useQuery();
  const createMutation = trpc.templateTranslations.create.useMutation();
  const updateMutation = trpc.templateTranslations.update.useMutation();
  const deleteMutation = trpc.templateTranslations.delete.useMutation();

  const [formData, setFormData] = useState({
    language: 'en' as 'ar' | 'en',
    templateName: '',
    description: '',
    suitableFor: '',
    botPersonality: '',
  });

  const handleOpenDialog = (template: any, translation?: any) => {
    setSelectedTemplate(template);
    setSelectedTranslation(translation);
    
    if (translation) {
      // تعديل ترجمة موجودة
      setFormData({
        language: translation.language,
        templateName: translation.templateName,
        description: translation.description || '',
        suitableFor: translation.suitableFor || '',
        botPersonality: translation.botPersonality || '',
      });
    } else {
      // إنشاء ترجمة جديدة
      setFormData({
        language: template.hasEnglish ? 'ar' : 'en',
        templateName: '',
        description: '',
        suitableFor: '',
        botPersonality: '',
      });
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedTranslation) {
        // تحديث ترجمة موجودة
        await updateMutation.mutateAsync({
          id: selectedTranslation.id,
          ...formData,
        });
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الترجمة بنجاح',
        });
      } else {
        // إنشاء ترجمة جديدة
        await createMutation.mutateAsync({
          templateId: selectedTemplate.id,
          ...formData,
        });
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة الترجمة بنجاح',
        });
      }

      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حفظ الترجمة',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (translationId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الترجمة؟')) return;

    try {
      await deleteMutation.mutateAsync({ id: translationId });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الترجمة بنجاح',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حذف الترجمة',
        variant: 'destructive',
      });
    }
  };

  const filteredTemplates = templates?.filter((template) => {
    if (filter === 'translated') {
      return template.hasArabic && template.hasEnglish;
    } else if (filter === 'untranslated') {
      return !template.hasArabic || !template.hasEnglish;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="h-8 w-8" />
            إدارة ترجمات القوالب
          </h1>
          <p className="text-muted-foreground mt-2">
            إضافة وإدارة الترجمات العربية والإنجليزية لقوالب الأعمال
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي القوالب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">مترجمة بالكامل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates?.filter(t => t.hasArabic && t.hasEnglish).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">تحتاج ترجمة عربية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {templates?.filter(t => !t.hasArabic).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">تحتاج ترجمة إنجليزية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {templates?.filter(t => !t.hasEnglish).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>حالة الترجمة</Label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القوالب</SelectItem>
                  <SelectItem value="translated">مترجمة بالكامل</SelectItem>
                  <SelectItem value="untranslated">تحتاج ترجمة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>القوالب</CardTitle>
          <CardDescription>
            إدارة الترجمات لكل قالب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم القالب</TableHead>
                <TableHead>نوع العمل</TableHead>
                <TableHead className="text-center">الترجمة العربية</TableHead>
                <TableHead className="text-center">الترجمة الإنجليزية</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.templateName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {template.businessType === 'store' ? 'متجر' : template.businessType === 'services' ? 'خدمات' : 'مختلط'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {template.hasArabic ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        متوفرة
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        غير متوفرة
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.hasEnglish ? (
                      <Badge variant="default" className="bg-blue-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        متوفرة
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        غير متوفرة
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {!template.hasArabic && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(template)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة عربي
                        </Button>
                      )}
                      {!template.hasEnglish && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(template)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة إنجليزي
                        </Button>
                      )}
                      {template.translations && template.translations.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>إدارة الترجمات - {template.templateName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {template.translations.map((translation: any) => (
                                <Card key={translation.id}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-lg">
                                        {translation.language === 'ar' ? '🇸🇦 العربية' : '🇬🇧 الإنجليزية'}
                                      </CardTitle>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleOpenDialog(template, translation)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDelete(translation.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">اسم القالب</Label>
                                      <p className="text-sm">{translation.templateName}</p>
                                    </div>
                                    {translation.description && (
                                      <div>
                                        <Label className="text-xs text-muted-foreground">الوصف</Label>
                                        <p className="text-sm">{translation.description}</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Translation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTranslation ? 'تعديل الترجمة' : 'إضافة ترجمة جديدة'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.templateName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select
                value={formData.language}
                onValueChange={(value: 'ar' | 'en') => setFormData({ ...formData, language: value })}
                disabled={!!selectedTranslation}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                  <SelectItem value="en">🇬🇧 الإنجليزية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="templateName">اسم القالب *</Label>
              <Input
                id="templateName"
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                placeholder="مثال: متجر إلكتروني"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف القالب..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="suitableFor">مناسب لـ</Label>
              <Textarea
                id="suitableFor"
                value={formData.suitableFor}
                onChange={(e) => setFormData({ ...formData, suitableFor: e.target.value })}
                placeholder="مثال: المتاجر الإلكترونية، محلات الملابس، إلخ..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="botPersonality">شخصية البوت (JSON)</Label>
              <Textarea
                id="botPersonality"
                value={formData.botPersonality}
                onChange={(e) => setFormData({ ...formData, botPersonality: e.target.value })}
                placeholder='{"tone": "friendly", "style": "professional"}'
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
