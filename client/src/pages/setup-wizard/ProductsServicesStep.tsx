import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowRight, Plus, Trash2, Package, Briefcase } from 'lucide-react';

interface ProductsServicesStepProps {
  wizardData: Record<string, any>;
  updateWizardData: (data: Record<string, any>) => void;
  goToNextStep: () => void;
  skipStep: () => void;
}

interface Item {
  id: string;
  name: string;
  description: string;
  price: string;
}

export default function ProductsServicesStep({
  wizardData,
  updateWizardData,
  goToNextStep,
  skipStep,
}: ProductsServicesStepProps) {
  const businessType = wizardData.businessType;
  const isStore = businessType === 'store' || businessType === 'both';
  const isServices = businessType === 'services' || businessType === 'both';

  const [products, setProducts] = useState<Item[]>(
    wizardData.products || [{ id: '1', name: '', description: '', price: '' }]
  );
  const [services, setServices] = useState<Item[]>(
    wizardData.services || [{ id: '1', name: '', description: '', price: '' }]
  );

  const addItem = (type: 'products' | 'services') => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: '',
    };

    if (type === 'products') {
      setProducts([...products, newItem]);
    } else {
      setServices([...services, newItem]);
    }
  };

  const removeItem = (type: 'products' | 'services', id: string) => {
    if (type === 'products') {
      setProducts(products.filter(p => p.id !== id));
    } else {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const updateItem = (type: 'products' | 'services', id: string, field: keyof Item, value: string) => {
    if (type === 'products') {
      setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    } else {
      setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
    }
  };

  const handleNext = () => {
    const data: any = {};
    
    if (isStore) {
      data.products = products.filter(p => p.name.trim());
    }
    
    if (isServices) {
      data.services = services.filter(s => s.name.trim());
    }

    updateWizardData(data);
    goToNextStep();
  };

  const handleSkip = () => {
    updateWizardData({ products: [], services: [] });
    skipStep();
  };

  const renderItemForm = (item: Item, type: 'products' | 'services', index: number) => {
    const items = type === 'products' ? products : services;
    const Icon = type === 'products' ? Package : Briefcase;
    const label = type === 'products' ? 'المنتج' : 'الخدمة';

    return (
      <Card key={item.id} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Icon className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-gray-900">
              {label} #{index + 1}
            </h4>
          </div>
          {items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(type, item.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor={`${type}-name-${item.id}`}>الاسم *</Label>
            <Input
              id={`${type}-name-${item.id}`}
              placeholder={type === 'products' ? 'مثال: قميص قطني' : 'مثال: قص شعر'}
              value={item.name}
              onChange={(e) => updateItem(type, item.id, 'name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor={`${type}-desc-${item.id}`}>الوصف (اختياري)</Label>
            <Textarea
              id={`${type}-desc-${item.id}`}
              placeholder={type === 'products' ? 'وصف المنتج...' : 'وصف الخدمة...'}
              value={item.description}
              onChange={(e) => updateItem(type, item.id, 'description', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor={`${type}-price-${item.id}`}>السعر (ريال) *</Label>
            <Input
              id={`${type}-price-${item.id}`}
              type="number"
              placeholder="0.00"
              value={item.price}
              onChange={(e) => updateItem(type, item.id, 'price', e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          أضف بعض {isStore && isServices ? 'المنتجات والخدمات' : isStore ? 'المنتجات' : 'الخدمات'} لتبدأ
        </p>
        <p className="text-sm text-gray-500 mt-1">
          يمكنك إضافة المزيد لاحقاً من لوحة التحكم
        </p>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {/* Products Section */}
        {isStore && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                <Package className="h-5 w-5 text-blue-600" />
                <span>المنتجات</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem('products')}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة منتج
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((product, index) => renderItemForm(product, 'products', index))}
            </div>
          </div>
        )}

        {/* Services Section */}
        {isServices && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span>الخدمات</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem('services')}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة خدمة
              </Button>
            </div>

            <div className="space-y-3">
              {services.map((service, index) => renderItemForm(service, 'services', index))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={handleSkip}>
          تخطي - سأضيف لاحقاً
        </Button>

        <Button size="lg" onClick={handleNext} className="px-8">
          التالي
          <ArrowRight className="mr-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
