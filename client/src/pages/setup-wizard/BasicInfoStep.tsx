import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, Building2, Phone, MapPin, FileText, Clock } from 'lucide-react';

interface BasicInfoStepProps {
  wizardData: Record<string, any>;
  updateWizardData: (data: Record<string, any>) => void;
  goToNextStep: () => void;
}

export default function BasicInfoStep({
  wizardData,
  updateWizardData,
  goToNextStep,
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    businessName: wizardData.businessName || '',
    phone: wizardData.phone || '',
    address: wizardData.address || '',
    description: wizardData.description || '',
    workingHoursType: wizardData.workingHoursType || 'weekdays',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'اسم النشاط مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[+\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم هاتف غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateWizardData(formData);
      goToNextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          أخبرنا المزيد عن نشاطك التجاري
        </p>
      </div>

      <div className="space-y-5">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="flex items-center space-x-2 space-x-reverse">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span>اسم النشاط التجاري *</span>
          </Label>
          <Input
            id="businessName"
            placeholder="مثال: متجر الأناقة للملابس"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            className={errors.businessName ? 'border-red-500' : ''}
          />
          {errors.businessName && (
            <p className="text-sm text-red-500">{errors.businessName}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center space-x-2 space-x-reverse">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>رقم الهاتف *</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="مثال: +966501234567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
            dir="ltr"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
          <p className="text-xs text-gray-500">
            سيستخدم هذا الرقم للتواصل مع العملاء عبر واتساب
          </p>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center space-x-2 space-x-reverse">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>العنوان (اختياري)</span>
          </Label>
          <Input
            id="address"
            placeholder="مثال: الرياض، حي النخيل، شارع الملك فهد"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center space-x-2 space-x-reverse">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>وصف النشاط (اختياري)</span>
          </Label>
          <Textarea
            id="description"
            placeholder="مثال: نقدم أفضل الملابس العصرية بأسعار مناسبة مع خدمة توصيل سريعة"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500">
            سيساعد هذا الوصف ساري في فهم نشاطك بشكل أفضل
          </p>
        </div>

        {/* Working Hours Type */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2 space-x-reverse">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>ساعات العمل</span>
          </Label>
          <RadioGroup
            value={formData.workingHoursType}
            onValueChange={(value) => handleChange('workingHoursType', value)}
          >
            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="24_7" id="24_7" />
              <Label htmlFor="24_7" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">24/7 - متاح دائماً</p>
                  <p className="text-xs text-gray-500">نعمل على مدار الساعة طوال أيام الأسبوع</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="weekdays" id="weekdays" />
              <Label htmlFor="weekdays" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">أيام العمل فقط</p>
                  <p className="text-xs text-gray-500">من السبت إلى الخميس (9 صباحاً - 6 مساءً)</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">ساعات مخصصة</p>
                  <p className="text-xs text-gray-500">سأحدد ساعات العمل لاحقاً</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleNext}
          className="px-8"
        >
          التالي
          <ArrowRight className="mr-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
