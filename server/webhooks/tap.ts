import crypto from 'crypto';
import { getPaymentGatewayByName, updatePaymentStatus, getPaymentById, updateSubscription } from '../db';
import { notifyOwner } from '../_core/notification';

/**
 * Verify Tap webhook signature
 * Tap sends a signature in the x-tap-signature header
 */
export async function verifyTapSignature(
  payload: string,
  signature: string,
  secretKey: string
): Promise<boolean> {
  try {
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('[Tap Webhook] Signature verification failed:', error);
    return false;
  }
}

/**
 * Handle Tap webhook events
 */
export async function handleTapWebhook(payload: any): Promise<{ success: boolean; message: string }> {
  try {
    const { id: tapId, status, reference, amount, currency } = payload;

    if (!reference) {
      return { success: false, message: 'Missing reference (payment ID)' };
    }

    const paymentId = parseInt(reference.number || reference);
    
    // Get payment from database
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    // Handle different statuses
    if (status === 'CAPTURED' || status === 'AUTHORIZED') {
      // Payment successful
      await updatePaymentStatus(paymentId, 'completed', tapId);
      
      // Update subscription status
      if (payment.subscriptionId) {
        await updateSubscription(payment.subscriptionId, { status: 'active' });
        
        // Notify owner
        await notifyOwner({
          title: '✅ دفع ناجح - Tap',
          content: `تم استلام دفع بقيمة ${amount} ${currency} للاشتراك #${payment.subscriptionId}`,
        });
      }

      return { success: true, message: 'Payment completed successfully' };
    } else if (status === 'FAILED' || status === 'DECLINED') {
      // Payment failed
      await updatePaymentStatus(paymentId, 'failed', tapId);
      
      // Notify owner
      await notifyOwner({
        title: '❌ فشل الدفع - Tap',
        content: `فشل الدفع للاشتراك #${payment.subscriptionId}. السبب: ${status}`,
      });

      return { success: true, message: 'Payment marked as failed' };
    } else if (status === 'REFUNDED') {
      // Payment refunded
      await updatePaymentStatus(paymentId, 'refunded', tapId);
      
      // Update subscription status to cancelled
      if (payment.subscriptionId) {
        await updateSubscription(payment.subscriptionId, { status: 'cancelled' });
      }

      return { success: true, message: 'Payment refunded' };
    }

    return { success: true, message: `Status ${status} processed` };
  } catch (error) {
    console.error('[Tap Webhook] Error processing webhook:', error);
    return { success: false, message: 'Internal server error' };
  }
}
