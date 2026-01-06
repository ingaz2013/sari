import { TRPCError } from '@trpc/server';
import * as db from '../db';
import { notifyOwner } from '../_core/notification';

/**
 * Send notification to merchant when reaching 80% of customer limit
 * @param merchantId The merchant ID
 * @param current Current customer count
 * @param max Maximum customer count
 * @param percentage Current usage percentage
 */
export async function notifyMerchantAboutLimit(
  merchantId: number,
  current: number,
  max: number,
  percentage: number
): Promise<void> {
  try {
    // Get merchant details
    const merchant = await db.getMerchantById(merchantId);
    if (!merchant) {
      return;
    }

    // Check if notification already sent (to avoid spam)
    const notificationKey = `limit_warning_${merchantId}_${max}`;
    const existingNotification = await db.getNotificationByKey(notificationKey);
    
    if (existingNotification) {
      // Already notified for this limit
      return;
    }

    // Get subscription plan
    const subscription = await db.getMerchantCurrentSubscription(merchantId);
    if (!subscription) {
      return;
    }

    const plan = await db.getSubscriptionPlanById(subscription.planId);
    if (!plan) {
      return;
    }

    // Create notification message
    const remaining = max - current;
    const message = `
⚠️ تنبيه: اقتراب من حد العملاء

مرحباً ${merchant.businessName || merchant.name}،

لقد وصلت إلى ${percentage.toFixed(0)}% من الحد الأقصى للعملاء في باقتك الحالية.

📊 التفاصيل:
• العملاء الحاليون: ${current}
• الحد الأقصى: ${max}
• المتبقي: ${remaining} عميل

💡 نوصي بالترقية إلى باقة أعلى لتجنب انقطاع الخدمة.

للترقية، يرجى زيارة لوحة التحكم > اشتراكي
    `.trim();

    // Send notification via WhatsApp (if primary instance exists)
    const whatsappInstance = await db.getPrimaryWhatsAppInstance(merchantId);
    if (whatsappInstance && whatsappInstance.status === 'active') {
      try {
        // Get merchant's phone number from user
        const user = await db.getUserById(merchant.userId);
        if (user && user.phone) {
          // Send WhatsApp message using Green API
          const apiUrl = whatsappInstance.apiUrl || 'https://api.green-api.com';
          const url = `${apiUrl}/waInstance${whatsappInstance.instanceId}/sendMessage/${whatsappInstance.token}`;
          
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: `${user.phone}@c.us`,
              message,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    // Also notify system owner
    await notifyOwner({
      title: `تنبيه: تاجر يقترب من حد العملاء`,
      content: `التاجر ${merchant.businessName || merchant.name} (ID: ${merchantId}) وصل إلى ${percentage.toFixed(0)}% من حد العملاء (${current}/${max})`,
    });

    // Save notification record to prevent duplicate notifications
    await db.createNotificationRecord({
      merchantId,
      notificationKey,
      type: 'customer_limit_warning',
      message,
      sentAt: new Date(),
    });

  } catch (error) {
    console.error('Error sending limit notification:', error);
    // Don't throw error - notification failure shouldn't block the main operation
  }
}

/**
 * Check if merchant should be notified about approaching limits
 * @param merchantId The merchant ID
 */
export async function checkAndNotifyLimits(merchantId: number): Promise<void> {
  try {
    const { getRemainingCustomerSlots } = await import('./subscriptionGuard');
    const slots = await getRemainingCustomerSlots(merchantId);

    // Notify if reached 80% or more
    if (slots.percentage >= 80 && slots.percentage < 100) {
      await notifyMerchantAboutLimit(
        merchantId,
        slots.current,
        slots.max,
        slots.percentage
      );
    }
  } catch (error) {
    console.error('Error checking limits:', error);
  }
}
