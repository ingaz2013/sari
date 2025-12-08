import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Clock, Users, Target, BarChart3, MessageSquare, Zap, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsDashboard() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  
  const { data: metrics, isLoading } = trpc.testSari.getMetrics.useQuery({ period });
  
  if (isLoading) {
    return <MetricsDashboardSkeleton />;
  }
  
  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم المقاييس</h1>
          <p className="text-muted-foreground mt-2">
            تتبع أداء ساري AI بـ15 مقياس احترافي
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">اليوم</SelectItem>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* قسم 1: مقاييس التحويل والمبيعات */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          مقاييس التحويل والمبيعات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="معدل التحويل"
            value={`${metrics.conversion.conversionRate}%`}
            icon={<Target className="h-5 w-5" />}
            description="نسبة المحادثات التي تحولت لاتفاق"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <MetricCard
            title="متوسط قيمة الصفقة"
            value={`${metrics.conversion.avgDealValue} ريال`}
            icon={<DollarSign className="h-5 w-5" />}
            description="متوسط قيمة المبيعات"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <MetricCard
            title="الإيرادات المحتملة"
            value={`${metrics.conversion.totalRevenue} ريال`}
            icon={<TrendingUp className="h-5 w-5" />}
            description="إجمالي قيمة الصفقات"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>
      </div>
      
      {/* قسم 2: مقاييس الوقت والكفاءة */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          مقاييس الوقت والكفاءة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="متوسط وقت الرد"
            value={`${(metrics.time.avgResponseTime / 1000).toFixed(1)} ث`}
            icon={<Zap className="h-5 w-5" />}
            description="الوقت بين رسالة العميل ورد ساري"
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <MetricCard
            title="متوسط طول المحادثة"
            value={`${metrics.time.avgConversationLength} رسالة`}
            icon={<MessageSquare className="h-5 w-5" />}
            description="عدد الرسائل حتى نهاية المحادثة"
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="وقت التحويل"
            value={`${Math.round(metrics.time.avgTimeToConversion / 60)} دقيقة`}
            icon={<Clock className="h-5 w-5" />}
            description="الوقت من بداية المحادثة حتى الاتفاق"
            color="text-pink-600"
            bgColor="bg-pink-50"
          />
        </div>
      </div>
      
      {/* قسم 3: مقاييس الجودة */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          مقاييس جودة المحادثة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="معدل الاستفسارات المحلولة"
            value={`${metrics.quality.resolutionRate}%`}
            icon={<Target className="h-5 w-5" />}
            description="نسبة الاستفسارات التي حلها ساري"
            color="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="معدل التصعيد"
            value={`${metrics.quality.escalationRate}%`}
            icon={<Users className="h-5 w-5" />}
            description="نسبة المحادثات المحولة للبشر"
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <MetricCard
            title="معدل التفاعل"
            value={`${metrics.quality.engagementRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            description="نسبة العملاء الذين أكملوا المحادثة"
            color="text-cyan-600"
            bgColor="bg-cyan-50"
          />
        </div>
      </div>
      
      {/* قسم 4: مقاييس النمو */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          مقاييس النمو والتحسين
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="معدل العودة"
            value={`${metrics.growth.returnRate}%`}
            icon={<Users className="h-5 w-5" />}
            description="نسبة العملاء الذين عادوا للمحادثة"
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="معدل الإحالة"
            value={`${metrics.growth.referralRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            description="نسبة العملاء الذين ذكروا إحالة"
            color="text-violet-600"
            bgColor="bg-violet-50"
          />
        </div>
      </div>
      
      {/* قسم 5: مقاييس متقدمة */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          مقاييس إضافية متقدمة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="معدل النقر على المنتجات"
            value={`${metrics.advanced.productClickRate}%`}
            icon={<Target className="h-5 w-5" />}
            description="نسبة النقر على المنتجات المقترحة"
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <MetricCard
            title="معدل إكمال الطلب"
            value={`${metrics.advanced.orderCompletionRate}%`}
            icon={<DollarSign className="h-5 w-5" />}
            description="نسبة الاتفاقات المكتملة"
            color="text-lime-600"
            bgColor="bg-lime-50"
          />
          <MetricCard
            title="نقاط رضا العملاء (CSAT)"
            value={`${metrics.advanced.csatScore}/5`}
            icon={<Award className="h-5 w-5" />}
            description="تقييم العميل للمحادثة"
            color="text-sky-600"
            bgColor="bg-sky-50"
          />
          <MetricCard
            title="صافي نقاط الترويج (NPS)"
            value={`${metrics.advanced.npsScore}`}
            icon={<TrendingUp className="h-5 w-5" />}
            description="احتمالية التوصية بساري"
            color="text-fuchsia-600"
            bgColor="bg-fuchsia-50"
          />
        </div>
      </div>

      {/* ملاحظة توضيحية */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 كيف تستفيد من هذه المقاييس؟</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>معدل التحويل:</strong> إذا كان أقل من 20%، حاول تحسين رسائل ساري لتكون أكثر إقناعاً
          </div>
          <div>
            <strong>وقت الرد:</strong> الهدف أقل من 3 ثواني - كلما كان أسرع، كانت التجربة أفضل
          </div>
          <div>
            <strong>معدل التصعيد:</strong> إذا كان أكثر من 10%، قد تحتاج لتحسين قاعدة معرفة ساري
          </div>
          <div>
            <strong>CSAT Score:</strong> الهدف 4/5 أو أعلى - يعكس رضا العملاء عن جودة المحادثة
          </div>
          <div>
            <strong>NPS:</strong> أي قيمة موجبة جيدة، وفوق +50 ممتاز - يعني أن العملاء سيوصون بساري
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  description,
  color,
  bgColor 
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor || 'bg-muted'} ${color || 'text-muted-foreground'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color || ''}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricsDashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>
      
      {[1, 2, 3, 4, 5].map((section) => (
        <div key={section}>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className={`grid grid-cols-1 md:grid-cols-${section === 4 ? 2 : section === 5 ? 4 : 3} gap-6`}>
            {Array.from({ length: section === 4 ? 2 : section === 5 ? 4 : 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
