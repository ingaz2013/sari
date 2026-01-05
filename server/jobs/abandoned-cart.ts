/**
 * Abandoned Cart Recovery Cron Job
 * 
 * يعمل كل 6 ساعات للتحقق من السلال المهجورة
 * وإرسال رسائل تذكير للعملاء
 */

import cron from 'node-cron';
import { checkAbandonedCarts } from '../automation/abandoned-cart-recovery';

/**
 * بدء Cron Job لاستعادة السلة المهجورة
 * يعمل كل 6 ساعات
 */
export function startAbandonedCartJob(): void {
  // يعمل كل 6 ساعات (في الساعة 0، 6، 12، 18)
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Abandoned Cart Job] Starting...');
    
    try {
      const result = await checkAbandonedCarts();
      console.log('[Abandoned Cart Job] Completed:', result);
    } catch (error) {
      console.error('[Abandoned Cart Job] Error:', error);
    }
  });

  console.log('[Abandoned Cart Job] Initialized - runs every 6 hours');
}
