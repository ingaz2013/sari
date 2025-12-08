import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, MessageSquare, Target, Award, 
  Download, RefreshCw, Lightbulb, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function InsightsDashboard() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch data
  const { data: keywordStats, isLoading: loadingKeywords, refetch: refetchKeywords } = 
    trpc.insights.getKeywordStats.useQuery({ merchantId: 1, period: selectedPeriod });
  
  const { data: weeklyReports, isLoading: loadingReports, refetch: refetchReports } = 
    trpc.insights.getWeeklyReports.useQuery({ merchantId: 1, limit: 4 });
  
  const { data: abTests, isLoading: loadingTests, refetch: refetchTests } = 
    trpc.insights.getActiveABTests.useQuery({ merchantId: 1 });

  const handleRefresh = () => {
    refetchKeywords();
    refetchReports();
    refetchTests();
    toast.success("تم تحديث البيانات");
  };

  const handleExportCSV = () => {
    toast.info("جاري تصدير البيانات...");
    // TODO: Implement CSV export
  };

  if (loadingKeywords || loadingReports || loadingTests) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-accent rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Prepare keyword category data for pie chart
  const categoryData = keywordStats?.byCategory?.map((cat: any) => ({
    name: cat.category,
    value: cat.count
  })) || [];

  // Prepare weekly sentiment trend data
  const sentimentTrendData = weeklyReports?.map((report: any) => ({
    week: new Date(report.weekStart).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    positive: report.positiveCount,
    negative: report.negativeCount,
    neutral: report.neutralCount,
    satisfaction: report.averageSatisfaction
  })) || [];

  // Prepare A/B test comparison data
  const abTestData = abTests?.map((test: any) => ({
    name: test.responseA?.substring(0, 20) + '...',
    versionA: test.usageCountA,
    versionB: test.usageCountB,
    successRateA: test.successRateA || 0,
    successRateB: test.successRateB || 0
  })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة الرؤى التحليلية</h1>
          <p className="text-muted-foreground">تحليل شامل للكلمات المفتاحية والمشاعر واختبارات A/B</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="ml-2 h-4 w-4" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {[
          { value: '7d', label: 'آخر 7 أيام' },
          { value: '30d', label: 'آخر 30 يوم' },
          { value: '90d', label: 'آخر 90 يوم' }
        ].map(period => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod(period.value as any)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keywords">
            <MessageSquare className="ml-2 h-4 w-4" />
            الكلمات المفتاحية
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <TrendingUp className="ml-2 h-4 w-4" />
            تحليل المشاعر
          </TabsTrigger>
          <TabsTrigger value="abtests">
            <Target className="ml-2 h-4 w-4" />
            اختبارات A/B
          </TabsTrigger>
        </TabsList>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الكلمات</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keywordStats?.total ?? 0}</div>
                <p className="text-xs text-muted-foreground">كلمة مفتاحية مكتشفة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ردود مقترحة</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keywordStats?.suggested ?? 0}</div>
                <p className="text-xs text-muted-foreground">رد سريع مقترح</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ردود مطبقة</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keywordStats?.applied ?? 0}</div>
                <p className="text-xs text-muted-foreground">رد تم تطبيقه</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الفئات</CardTitle>
                <CardDescription>الكلمات المفتاحية حسب الفئة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Keywords Table */}
            <Card>
              <CardHeader>
                <CardTitle>أكثر 10 كلمات تكراراً</CardTitle>
                <CardDescription>الكلمات الأكثر ظهوراً في المحادثات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {keywordStats?.topKeywords?.slice(0, 10).map((kw: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{kw.keyword}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{kw.category}</Badge>
                        <span className="text-sm text-muted-foreground">{kw.count} مرة</span>
                      </div>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط الرضا</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {weeklyReports?.[0]?.averageSatisfaction?.toFixed(1) ?? '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground">آخر أسبوع</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إيجابي</CardTitle>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {weeklyReports?.[0]?.positiveCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">محادثة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">محايد</CardTitle>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {weeklyReports?.[0]?.neutralCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">محادثة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">سلبي</CardTitle>
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {weeklyReports?.[0]?.negativeCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">محادثة</p>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>تطور المشاعر</CardTitle>
              <CardDescription>اتجاه المشاعر خلال الأسابيع الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#22c55e" name="إيجابي" strokeWidth={2} />
                  <Line type="monotone" dataKey="neutral" stroke="#f59e0b" name="محايد" strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" name="سلبي" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>آخر التقارير الأسبوعية</CardTitle>
              <CardDescription>ملخص التقارير الأربعة الأخيرة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyReports?.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div>
                      <p className="font-medium">
                        {new Date(report.weekStart).toLocaleDateString('ar-SA')} - {new Date(report.weekEnd).toLocaleDateString('ar-SA')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.totalConversations} محادثة
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.averageSatisfaction >= 70 ? 'default' : 'destructive'}>
                        {report.averageSatisfaction.toFixed(1)}% رضا
                      </Badge>
                      {report.emailSent && (
                        <Badge variant="outline">تم الإرسال</Badge>
                      )}
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">لا توجد تقارير</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="abtests" className="space-y-4">
          {/* Active Tests */}
          <Card>
            <CardHeader>
              <CardTitle>الاختبارات النشطة</CardTitle>
              <CardDescription>مقارنة أداء النسخ المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              {abTests && abTests.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={abTestData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="versionA" fill="#22c55e" name="النسخة A" />
                      <Bar dataKey="versionB" fill="#3b82f6" name="النسخة B" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-3">
                    {abTests.map((test: any) => (
                      <div key={test.id} className="p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium mb-1">النسخة A</p>
                            <p className="text-sm text-muted-foreground">{test.responseA}</p>
                          </div>
                          <Badge variant="outline">{test.usageCountA} استخدام</Badge>
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium mb-1">النسخة B</p>
                            <p className="text-sm text-muted-foreground">{test.responseB}</p>
                          </div>
                          <Badge variant="outline">{test.usageCountB} استخدام</Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge variant={test.successRateA > test.successRateB ? 'default' : 'secondary'}>
                            A: {test.successRateA?.toFixed(1) || 0}% نجاح
                          </Badge>
                          <Badge variant={test.successRateB > test.successRateA ? 'default' : 'secondary'}>
                            B: {test.successRateB?.toFixed(1) || 0}% نجاح
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد اختبارات A/B نشطة حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
