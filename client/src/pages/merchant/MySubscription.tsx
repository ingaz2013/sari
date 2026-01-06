import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, CreditCard, AlertCircle, Check, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function MySubscription() {
  const [, setLocation] = useLocation();
  
  const { data: subscription, isLoading, refetch } = trpc.merchantSubscription.getCurrentSubscription.useQuery();
  const { data: daysRemaining } = trpc.merchantSubscription.getDaysRemaining.useQuery();
  const { data: transactions } = trpc.payment.listTransactions.useQuery({ limit: 10 });
  const cancelSubscription = trpc.merchantSubscription.cancelSubscription.useMutation();

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء الاشتراك؟ سيتم إيقاف جميع الميزات عند انتهاء الفترة الحالية.')) {
      return;
    }

    try {
      await cancelSubscription.mutateAsync();
      toast.success('تم إلغاء الاشتراك بنجاح');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'فشل إلغاء الاشتراك');
    }
  };

  const handleUpgrade = () => {
    setLocation('/merchant/subscription/plans');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>لا يوجد اشتراك نشط</CardTitle>
            <CardDescription>اشترك الآن للاستمتاع بجميع ميزات ساري</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpgrade}>
              عرض الباقات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      trial: { variant: 'secondary', label: 'فترة تجريبية' },
      active: { variant: 'default', label: 'نشط' },
      expired: { variant: 'destructive', label: 'منتهي' },
      cancelled: { variant: 'outline', label: 'ملغي' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isExpiringSoon = daysRemaining && daysRemaining <= 7;
  const isExpired = subscription.status === 'expired';

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة الاشتراك</h1>
        <p className="text-muted-foreground mt-1">تفاصيل اشتراكك الحالي وسجل المدفوعات</p>
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon && !isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            اشتراكك سينتهي خلال {daysRemaining} يوم. قم بالتجديد الآن لتجنب انقطاع الخدمة.
            <Button size="sm" className="mr-4" onClick={handleUpgrade}>
              تجديد الآن
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            انتهى اشتراكك. اشترك الآن لاستعادة الوصول إلى جميع الميزات.
            <Button size="sm" className="mr-4" onClick={handleUpgrade}>
              اشترك الآن
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{subscription.plan?.name}</CardTitle>
              <CardDescription>{subscription.plan?.description}</CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">الأيام المتبقية</p>
              </div>
              <p className="text-3xl font-bold">{daysRemaining || 0}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">الحد الأقصى للعملاء</p>
              </div>
              <p className="text-3xl font-bold">{subscription.plan?.maxCustomers.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">دورة الفوترة</p>
              </div>
              <p className="text-2xl font-bold">
                {subscription.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">تاريخ البدء</p>
              <p className="font-semibold">
                {new Date(subscription.startDate).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">تاريخ الانتهاء</p>
              <p className="font-semibold">
                {new Date(subscription.endDate).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpgrade} className="flex-1">
              <TrendingUp className="ml-2 h-4 w-4" />
              ترقية الباقة
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/merchant/subscription/compare')}
              className="flex-1"
            >
              مقارنة الباقات
            </Button>
            {subscription.status === 'active' && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? 'جاري الإلغاء...' : 'إلغاء الاشتراك'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
          <CardDescription>آخر 10 معاملات</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="font-semibold">
                      {transaction.amount} {transaction.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status === 'completed' ? 'مكتمل' : 
                         transaction.status === 'pending' ? 'قيد الانتظار' : 'فشل'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد معاملات</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
