import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Store, Briefcase, ShoppingBag, Check } from 'lucide-react';

interface BusinessTypeStepProps {
  wizardData: Record<string, any>;
  updateWizardData: (data: Record<string, any>) => void;
  goToNextStep: () => void;
}

const BUSINESS_TYPES = [
  {
    id: 'store',
    title: 'متجر إلكتروني',
    description: 'أبيع منتجات (ملابس، إلكترونيات، طعام، إلخ)',
    icon: Store,
    color: 'from-blue-500 to-cyan-500',
    examples: ['متجر ملابس', 'متجر إلكترونيات', 'متجر مواد غذائية', 'متجر مستحضرات تجميل'],
  },
  {
    id: 'services',
    title: 'مقدم خدمات',
    description: 'أقدم خدمات (صالون، عيادة، استشارات، إلخ)',
    icon: Briefcase,
    color: 'from-purple-500 to-pink-500',
    examples: ['صالون تجميل', 'عيادة طبية', 'مكتب استشارات', 'مركز تدريب'],
  },
  {
    id: 'both',
    title: 'منتجات وخدمات',
    description: 'أبيع منتجات وأقدم خدمات معاً',
    icon: ShoppingBag,
    color: 'from-orange-500 to-red-500',
    examples: ['مطعم (طعام + توصيل)', 'صيدلية (أدوية + استشارات)', 'ورشة (قطع غيار + صيانة)'],
  },
];

export default function BusinessTypeStep({
  wizardData,
  updateWizardData,
  goToNextStep,
}: BusinessTypeStepProps) {
  const [selectedType, setSelectedType] = useState<string>(wizardData.businessType || '');

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
    updateWizardData({ businessType: typeId });
  };

  const handleNext = () => {
    if (selectedType) {
      goToNextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          اختر نوع نشاطك التجاري لنتمكن من تخصيص ساري حسب احتياجاتك
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {BUSINESS_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <Card
              key={type.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:scale-102'
              }`}
              onClick={() => handleSelect(type.id)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mx-auto`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>

                {/* Examples */}
                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-gray-500 mb-2">أمثلة:</p>
                  <ul className="space-y-1">
                    {type.examples.map((example, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          💡 <strong>نصيحة:</strong> يمكنك تغيير نوع النشاط لاحقاً من الإعدادات
        </p>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!selectedType}
          className="px-8"
        >
          التالي
          <ArrowRight className="mr-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
