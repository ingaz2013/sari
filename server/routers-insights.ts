/**
 * tRPC routers للوحة التحكم التحليلية
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as dbInsights from "./db-insights";

export const insightsRouter = router({
  /**
   * الحصول على إحصائيات الكلمات المفتاحية
   */
  getKeywordStats: protectedProcedure
    .input(z.object({
      merchantId: z.number(),
      period: z.enum(['7d', '30d', '90d']).default('30d')
    }))
    .query(async ({ input }) => {
      return await dbInsights.getKeywordInsights(input.merchantId, input.period);
    }),

  /**
   * الحصول على التقارير الأسبوعية
   */
  getWeeklyReports: protectedProcedure
    .input(z.object({
      merchantId: z.number(),
      limit: z.number().default(4)
    }))
    .query(async ({ input }) => {
      return await dbInsights.getWeeklyReportsList(input.merchantId, input.limit);
    }),

  /**
   * الحصول على اختبارات A/B النشطة
   */
  getActiveABTests: protectedProcedure
    .input(z.object({
      merchantId: z.number()
    }))
    .query(async ({ input }) => {
      return await dbInsights.getActiveABTests(input.merchantId);
    }),
});
