import cron from 'node-cron';
import {
  shouldRequestReview,
  sendReviewRequest,
} from '../automation/review-request';
import { getOrdersForReviewRequest } from '../db';

/**
 * Cron Job لطلب التقييمات من العملاء
 * يعمل يومياً الساعة 10 صباحاً
 * يفحص الطلبات المسلمة منذ 3-7 أيام ويرسل طلبات التقييم
 */
export function startReviewRequestJob() {
  // يعمل يومياً الساعة 10 صباحاً (0 10 * * *)
  cron.schedule('0 10 * * *', async () => {
    console.log('[Review Request Job] Starting...');
    const startTime = Date.now();

    try {
      // جلب الطلبات المسلمة منذ 3-7 أيام
      const orders = await getOrdersForReviewRequest();
      
      let requested = 0;
      let skipped = 0;
      let errors = 0;

      for (const order of orders) {
        try {
          // التحقق من أن الطلب يستحق طلب تقييم
          const shouldRequest = await shouldRequestReview(order.id);
          
          if (!shouldRequest) {
            skipped++;
            continue;
          }

          // إرسال طلب التقييم
          await sendReviewRequest(order.id);
          requested++;
          
          console.log(`[Review Request] Sent to order ${order.id} (customer: ${order.customerPhone})`);
          
          // تأخير صغير بين الرسائل (1-2 ثانية)
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
          
        } catch (error) {
          errors++;
          console.error(`[Review Request] Error for order ${order.id}:`, error);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[Review Request Job] Completed in ${duration}ms:`, {
        checked: orders.length,
        requested,
        skipped,
        errors,
      });

    } catch (error) {
      console.error('[Review Request Job] Fatal error:', error);
    }
  });

  console.log('[Review Request Job] Initialized - runs daily at 10 AM');
}
