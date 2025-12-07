import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Users, TrendingUp, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MerchantDashboard() {
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: merchant, isLoading: merchantLoading } = trpc.merchants.getCurrent.useQuery();
  const { data: onboardingStatus } = trpc.merchants.getOnboardingStatus.useQuery();
  const completeOnboarding = trpc.merchants.completeOnboarding.useMutation();
  const { data: subscription, isLoading: subscriptionLoading } = trpc.subscriptions.getCurrent.useQuery();
  const { data: conversations, isLoading: conversationsLoading } = trpc.conversations.list.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.campaigns.list.useQuery();
  
  // New analytics queries
  const { data: dashboardStats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: comparisonStats, isLoading: comparisonLoading } = trpc.dashboard.getComparisonStats.useQuery({ days: 30 });
  const { data: ordersTrend, isLoading: ordersTrendLoading } = trpc.dashboard.getOrdersTrend.useQuery({ days: 30 });
  const { data: revenueTrend, isLoading: revenueTrendLoading } = trpc.dashboard.getRevenueTrend.useQuery({ days: 30 });
  const { data: topProducts, isLoading: topProductsLoading } = trpc.dashboard.getTopProducts.useQuery({ limit: 5 });

  const isLoading = merchantLoading || subscriptionLoading || conversationsLoading || campaignsLoading || 
                     statsLoading || comparisonLoading || ordersTrendLoading || revenueTrendLoading || topProductsLoading;

  // Show onboarding wizard for new merchants
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.completed) {
      setShowOnboarding(true);
    }
  }, [onboardingStatus]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    await completeOnboarding.mutateAsync();
    setShowOnboarding(false);
  };

  // Main stats with growth indicators
  const mainStats = [
    {
      title: 'إجمالي الطلبات',
      value: dashboardStats?.totalOrders || 0,
      growth: comparisonStats?.growth.orders || 0,
      icon: Package,
      description: 'آخر 30 يوم',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${dashboardStats?.totalRevenue || 0} ريال`,
      growth: comparisonStats?.growth.revenue || 0,
      icon: TrendingUp,
      description: 'آخر 30 يوم',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'متوسط قيمة الطلب',
      value: `${dashboardStats?.averageOrderValue || 0} ريال`,
      growth: 0,
      icon: MessageSquare,
      description: 'متوسط الطلب',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'الطلبات المكتملة',
      value: dashboardStats?.completedOrders || 0,
      growth: comparisonStats?.growth.completed || 0,
      icon: Users,
      description: 'طلبات ناجحة',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  // Prepare chart data for orders trend
  const ordersChartData = ordersTrend?.map(item => ({
    date: new Date(item.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    orders: Number(item.count),
  })) || [];

  // Prepare chart data for revenue trend
  const revenueChartData = revenueTrend?.map(item => ({
    date: new Date(item.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    revenue: Number(item.revenue),
  })) || [];

  // Show loading skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">مرحباً، {merchant?.businessName || 'التاجر'}</h1>
          <p className="text-muted-foreground mt-2">
            إليك نظرة سريعة على نشاط متجرك
          </p>
        </div>

        {/* Main Stats Grid with Growth */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            const isPositiveGrowth = stat.growth >= 0;
            const GrowthIcon = isPositiveGrowth ? ArrowUp : ArrowDown;
            
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    {stat.growth !== 0 && (
                      <span className={`flex items-center text-xs font-medium ${
                        isPositiveGrowth ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <GrowthIcon className="h-3 w-3 ml-1" />
                        {Math.abs(stat.growth).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Orders Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الطلبات</CardTitle>
              <CardDescription>عدد الطلبات خلال آخر 30 يوم</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="عدد الطلبات"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الإيرادات</CardTitle>
              <CardDescription>الإيرادات خلال آخر 30 يوم (ريال)</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      name="الإيرادات (ريال)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>المنتجات الأكثر مبيعاً</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.totalSales} مبيعة • {product.totalRevenue} ريال
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {product.averagePrice} ريال
                        </p>
                        <p className="text-xs text-muted-foreground">متوسط السعر</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد مبيعات بعد
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle>آخر المحادثات</CardTitle>
              <CardDescription>المحادثات الأخيرة مع العملاء</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations && conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.slice(0, 5).map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{conv.customerName || conv.customerPhone}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conv.lastMessageAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {conv.status === 'active' ? 'نشط' : 'مغلق'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد محادثات بعد
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
