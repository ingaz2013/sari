import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, Target, TrendingUp, Users, Zap } from "lucide-react";
import { useState } from "react";

export default function PerformanceMetrics() {
  const params = useParams();
  const merchantId = params?.merchantId ? parseInt(params.merchantId) : 0;
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: metrics, isLoading } = trpc.performance.getPerformanceMetrics.useQuery({
    merchantId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  if (isLoading) {
    return <div className="p-6 text-center">جاري تحميل المقاييس...</div>;
  }

  const kpis = [
    {
      id: 1,
      title: "إجمالي الرسائل",
      value: metrics?.totalMessages || 0,
      change: `${metrics?.messageChange >= 0 ? '+' : ''}${metrics?.messageChange?.toFixed(1) || 0}%`,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "عدد الرسائل المستقبلة والمرسلة",
    },
    {
      id: 2,
      title: "معدل التحويل",
      value: `${metrics?.conversionRate?.toFixed(1) || 0}%`,
      change: `${metrics?.conversionRateChange >= 0 ? '+' : ''}${metrics?.conversionRateChange?.toFixed(1) || 0}%`,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "نسبة الرسائل التي أدت إلى مبيعات",
    },
    {
      id: 3,
      title: "العملاء الفريدين",
      value: metrics?.uniqueCustomers || 0,
      change: `العملاء المتكررين: ${metrics?.repeatCustomers || 0}`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "عدد العملاء المختلفين",
    },
    {
      id: 4,
      title: "إجمالي الطلبات",
      value: metrics?.totalOrders || 0,
      change: `مكتملة: ${metrics?.completedOrders || 0}`,
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "عدد الطلبات المسجلة",
    },
  ];

  const performanceMetrics = [
    {
      id: 5,
      title: "متوسط وقت الاستجابة",
      value: `${metrics?.responseTime?.toFixed(1) || 0} دقيقة`,
      change: `${metrics?.responseTimeChange >= 0 ? '+' : ''}${metrics?.responseTimeChange?.toFixed(1) || 0}%`,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      description: "متوسط الوقت للرد على العملاء",
    },
    {
      id: 6,
      title: "رضا العملاء",
      value: `${metrics?.customerSatisfaction?.toFixed(1) || 0}%`,
      change: `${metrics?.customerSatisfactionChange >= 0 ? '+' : ''}${metrics?.customerSatisfactionChange?.toFixed(1) || 0}%`,
      icon: Target,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "نسبة رضا العملاء عن الخدمة",
    },
    {
      id: 7,
      title: "معدل إتمام الطلبات",
      value: `${metrics?.orderFulfillmentRate?.toFixed(1) || 0}%`,
      change: `${metrics?.orderFulfillmentRateChange >= 0 ? '+' : ''}${metrics?.orderFulfillmentRateChange?.toFixed(1) || 0}%`,
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "نسبة الطلبات المكتملة",
    },
    {
      id: 8,
      title: "معدل الشراء المتكرر",
      value: `${metrics?.repeatPurchaseRate?.toFixed(1) || 0}%`,
      change: `${metrics?.repeatPurchaseRateChange >= 0 ? '+' : ''}${metrics?.repeatPurchaseRateChange?.toFixed(1) || 0}%`,
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "نسبة العملاء المتكررين",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">مقاييس الأداء</h1>
        <p className="text-muted-foreground mt-2">تحليل شامل لأداء وكيلك الذكي</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-4">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
                <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{metric.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </div>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{metric.value}</div>
                  <div className={`text-sm ${metric.change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                    {metric.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ROI Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            العائد على الاستثمار (ROI)
          </CardTitle>
          <CardDescription>
            قياس القيمة الفعلية للوكيل الذكي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">إجمالي الإيرادات</div>
              <div className="text-2xl font-bold text-green-600">
                {metrics?.totalRevenue?.toLocaleString('ar-SA') || 0} ر.س
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                إجمالي المبيعات في الفترة
              </div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">إجمالي التكاليف</div>
              <div className="text-2xl font-bold text-red-600">
                {metrics?.totalCost?.toLocaleString('ar-SA') || 0} ر.س
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                تكلفة الخدمة الشهرية
              </div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">صافي الربح</div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.netProfit?.toLocaleString('ar-SA') || 0} ر.س
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                الإيرادات - التكاليف
              </div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">العائد على الاستثمار</div>
              <div className="text-2xl font-bold text-primary">
                {metrics?.roi?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics?.roiChange >= 0 ? '+' : ''}{metrics?.roiChange?.toFixed(1) || 0}% مقارنة بالسابق
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
