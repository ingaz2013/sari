import { getDb } from "./db";
import { orders, products } from "../drizzle/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

/**
 * الحصول على اتجاه الطلبات لآخر 30 يوم
 */
export async function getOrdersTrend(merchantId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`.as('date'),
      count: sql<number>`COUNT(*)`.as('count'),
      total: sql<number>`SUM(${orders.totalAmount})`.as('total'),
    })
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        gte(orders.createdAt, startDate)
      )
    )
    .groupBy(sql`date`);

  return result;
}

/**
 * الحصول على اتجاه الإيرادات لآخر 30 يوم
 */
export async function getRevenueTrend(merchantId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`.as('date'),
      revenue: sql<number>`SUM(${orders.totalAmount})`.as('revenue'),
      ordersCount: sql<number>`COUNT(*)`.as('ordersCount'),
    })
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        sql`${orders.status} = 'completed'`,
        gte(orders.createdAt, startDate)
      )
    )
    .groupBy(sql`date`);

  return result;
}

/**
 * مقارنة الفترة الحالية مع الفترة السابقة
 */
export async function getComparisonStats(merchantId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return {
    current: { totalOrders: 0, totalRevenue: 0, completedOrders: 0 },
    previous: { totalOrders: 0, totalRevenue: 0, completedOrders: 0 },
    growth: { orders: 0, revenue: 0, completed: 0 },
  };

  const now = new Date();
  const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

  // الفترة الحالية
  const currentPeriod = await db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      completedOrders: sql<number>`SUM(CASE WHEN ${orders.status} = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        gte(orders.createdAt, currentPeriodStart)
      )
    );

  // الفترة السابقة
  const previousPeriod = await db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      completedOrders: sql<number>`SUM(CASE WHEN ${orders.status} = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        gte(orders.createdAt, previousPeriodStart),
        lte(orders.createdAt, currentPeriodStart)
      )
    );

  const current = currentPeriod[0] || { totalOrders: 0, totalRevenue: 0, completedOrders: 0 };
  const previous = previousPeriod[0] || { totalOrders: 0, totalRevenue: 0, completedOrders: 0 };

  // حساب نسب النمو
  const ordersGrowth = previous.totalOrders > 0
    ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100
    : current.totalOrders > 0 ? 100 : 0;

  const revenueGrowth = previous.totalRevenue > 0
    ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
    : current.totalRevenue > 0 ? 100 : 0;

  const completedGrowth = previous.completedOrders > 0
    ? ((current.completedOrders - previous.completedOrders) / previous.completedOrders) * 100
    : current.completedOrders > 0 ? 100 : 0;

  return {
    current: {
      totalOrders: Number(current.totalOrders),
      totalRevenue: Number(current.totalRevenue),
      completedOrders: Number(current.completedOrders),
    },
    previous: {
      totalOrders: Number(previous.totalOrders),
      totalRevenue: Number(previous.totalRevenue),
      completedOrders: Number(previous.completedOrders),
    },
    growth: {
      orders: Math.round(ordersGrowth * 10) / 10,
      revenue: Math.round(revenueGrowth * 10) / 10,
      completed: Math.round(completedGrowth * 10) / 10,
    },
  };
}

/**
 * الحصول على أفضل المنتجات مبيعاً
 * ملاحظة: جدول orders لا يحتوي على productId، لذا سنستخدم items JSON
 */
export async function getTopProducts(merchantId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  // الحصول على جميع الطلبات المكتملة
  const allOrders = await db
    .select({
      items: orders.items,
      totalAmount: orders.totalAmount,
    })
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        sql`${orders.status} = 'completed'`
      )
    );

  // تحليل items JSON وحساب المبيعات
  const productStats: Record<string, {
    productName: string;
    totalSales: number;
    totalRevenue: number;
  }> = {};

  for (const order of allOrders) {
    try {
      const items = JSON.parse(order.items);
      for (const item of items) {
        const key = item.name || item.productName || 'Unknown';
        if (!productStats[key]) {
          productStats[key] = {
            productName: key,
            totalSales: 0,
            totalRevenue: 0,
          };
        }
        productStats[key].totalSales += item.quantity || 1;
        productStats[key].totalRevenue += (item.price || 0) * (item.quantity || 1);
      }
    } catch (e) {
      // تجاهل الأخطاء في parsing
    }
  }

  // تحويل إلى مصفوفة وترتيب حسب المبيعات
  const result = Object.values(productStats)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit)
    .map(item => ({
      productName: item.productName,
      totalSales: item.totalSales,
      totalRevenue: Math.round(item.totalRevenue * 100) / 100,
      averagePrice: item.totalSales > 0
        ? Math.round((item.totalRevenue / item.totalSales) * 100) / 100
        : 0,
    }));

  return result;
}

/**
 * الحصول على إحصائيات Dashboard الرئيسية
 */
export async function getDashboardStats(merchantId: number) {
  const db = await getDb();
  if (!db) return {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
  };

  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // إجمالي الطلبات والإيرادات
  const stats = await db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      pendingOrders: sql<number>`SUM(CASE WHEN ${orders.status} = 'pending' THEN 1 ELSE 0 END)`,
      completedOrders: sql<number>`SUM(CASE WHEN ${orders.status} = 'completed' THEN 1 ELSE 0 END)`,
      cancelledOrders: sql<number>`SUM(CASE WHEN ${orders.status} = 'cancelled' THEN 1 ELSE 0 END)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        gte(orders.createdAt, last30Days)
      )
    );

  const result = stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  };

  return {
    totalOrders: Number(result.totalOrders),
    totalRevenue: Number(result.totalRevenue),
    pendingOrders: Number(result.pendingOrders),
    completedOrders: Number(result.completedOrders),
    cancelledOrders: Number(result.cancelledOrders),
    averageOrderValue: result.totalOrders > 0
      ? Math.round((Number(result.totalRevenue) / Number(result.totalOrders)) * 100) / 100
      : 0,
  };
}
