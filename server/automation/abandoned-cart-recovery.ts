/**
 * Abandoned Cart Recovery System
 * 
 * نظام استعادة السلال المهجورة
 * يتتبع المحادثات التي توقفت عند مرحلة اختيار المنتجات
 * ويرسل رسائل تذكير مع كود خصم 10% بعد 24 ساعة
 */

import * as db from '../db';
import { sendTextMessage } from '../whatsapp';
import { extractDiscountCodeFromMessage } from './discount-system';
import { createDiscountCode } from './discount-system';

/**
 * تتبع سلة مهجورة جديدة
 */
export async function trackAbandonedCart(
  merchantId: number,
  customerPhone: string,
  customerName: string | null,
  items: Array<{ productId: number; productName: string; quantity: number; price: number }>,
  totalAmount: number
): Promise<number> {
  // التحقق من وجود سلة مهجورة سابقة لنفس العميل
  const existingCarts = await db.getAbandonedCartsByMerchantId(merchantId);
  const existingCart = existingCarts.find(
    cart => cart.customerPhone === customerPhone && !cart.recovered && !cart.reminderSent
  );

  if (existingCart) {
    // إرجاع ID السلة الموجودة
    return existingCart.id;
  }

  // إنشاء سلة مهجورة جديدة
  const cart = await db.createAbandonedCart({
    merchantId,
    customerPhone,
    customerName,
    items: JSON.stringify(items),
    totalAmount,
    reminderSent: false,
    recovered: false
  });

  return cart!.id;
}

/**
 * إنشاء كود خصم حصري لاستعادة السلة
 */
export async function generateRecoveryDiscount(
  merchantId: number,
  customerPhone: string
): Promise<string> {
  // إنشاء كود خصم 10% صالح لمدة 7 أيام
  const code = `CART${customerPhone.slice(-4)}${Date.now().toString().slice(-4)}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.createDiscountCode({
    merchantId,
    code,
    type: 'percentage',
    value: 10,
    expiresAt,
    maxUses: 1,
    usedCount: 0,
    isActive: true
  });

  return code;
}

/**
 * توليد رسالة تذكير بالسلة المهجورة
 */
export function generateReminderMessage(
  customerName: string | null,
  items: Array<{ productName: string; quantity: number; price: number }>,
  totalAmount: number,
  discountCode: string
): string {
  const greeting = customerName ? `مرحباً ${customerName}! 👋` : 'مرحباً! 👋';
  
  let itemsList = '';
  items.forEach(item => {
    itemsList += `\n• ${item.productName} (${item.quantity}x) - ${item.price} ريال`;
  });

  const discountAmount = Math.round(totalAmount * 0.1);
  const finalAmount = totalAmount - discountAmount;

  return `${greeting}

لاحظنا أنك كنت مهتماً بهذه المنتجات:
${itemsList}

💰 **الإجمالي:** ${totalAmount} ريال

🎁 **عرض خاص لك!**
استخدم كود الخصم: **${discountCode}**
واحصل على خصم 10% (${discountAmount} ريال)

💵 **السعر بعد الخصم:** ${finalAmount} ريال فقط!

⏰ **العرض صالح لمدة 7 أيام فقط**

هل تريد إكمال طلبك الآن؟ فقط أرسل لي "أريد الطلب" مع كود الخصم وسأساعدك! 😊`;
}

/**
 * إرسال تذكير بالسلة المهجورة
 */
export async function sendCartReminder(cartId: number): Promise<boolean> {
  try {
    const cart = await db.getAbandonedCartById(cartId);
    if (!cart || cart.reminderSent || cart.recovered) {
      return false;
    }

    // الحصول على معلومات التاجر
    const merchant = await db.getMerchantById(cart.merchantId);
    if (!merchant) {
      console.error(`[Abandoned Cart] Merchant not found: ${cart.merchantId}`);
      return false;
    }

    // الحصول على اتصال الواتساب
    const connection = await db.getSallaConnectionByMerchantId(merchant.id);
    if (!connection) {
      console.error(`[Abandoned Cart] No WhatsApp connection for merchant: ${merchant.id}`);
      return false;
    }

    // إنشاء كود خصم حصري
    const discountCode = await generateRecoveryDiscount(cart.merchantId, cart.customerPhone);

    // توليد رسالة التذكير
    const items = JSON.parse(cart.items);
    const message = generateReminderMessage(
      cart.customerName,
      items,
      cart.totalAmount,
      discountCode
    );

    // إرسال الرسالة
    const result = await sendTextMessage(cart.customerPhone, message);
    
    if (result.success) {
      // تحديث حالة السلة
      await db.markAbandonedCartReminderSent(cartId);
      console.log(`[Abandoned Cart] Reminder sent successfully for cart ${cartId}`);
      return true;
    } else {
      console.error(`[Abandoned Cart] Failed to send reminder for cart ${cartId}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`[Abandoned Cart] Error sending reminder for cart ${cartId}:`, error);
    return false;
  }
}

/**
 * فحص جميع السلال المهجورة وإرسال التذكيرات
 */
export async function checkAbandonedCarts(): Promise<{
  checked: number;
  reminded: number;
  errors: number;
}> {
  const startTime = Date.now();
  console.log('[Abandoned Cart] Starting abandoned cart check...');

  try {
    // الحصول على السلال المهجورة (أقدم من 24 ساعة ولم يتم إرسال تذكير)
    const carts = await db.getPendingAbandonedCarts();
    console.log(`[Abandoned Cart] Found ${carts.length} abandoned carts to process`);

    let reminded = 0;
    let errors = 0;

    for (const cart of carts) {
      const success = await sendCartReminder(cart.id);
      if (success) {
        reminded++;
      } else {
        errors++;
      }

      // تأخير قصير بين الرسائل (2-3 ثواني)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    }

    const duration = Date.now() - startTime;
    console.log(`[Abandoned Cart] Check completed in ${duration}ms: { checked: ${carts.length}, reminded: ${reminded}, errors: ${errors} }`);

    return {
      checked: carts.length,
      reminded,
      errors
    };
  } catch (error) {
    console.error('[Abandoned Cart] Error during check:', error);
    return {
      checked: 0,
      reminded: 0,
      errors: 1
    };
  }
}

/**
 * الحصول على إحصائيات استعادة السلال
 */
export async function getCartRecoveryStats(merchantId: number): Promise<{
  totalAbandoned: number;
  remindersSent: number;
  recovered: number;
  recoveryRate: number;
  totalRecoveredValue: number;
}> {
  const carts = await db.getAbandonedCartsByMerchantId(merchantId);
  
  const totalAbandoned = carts.length;
  const remindersSent = carts.filter(c => c.reminderSent).length;
  const recovered = carts.filter(c => c.recovered).length;
  const recoveryRate = remindersSent > 0 ? Math.round((recovered / remindersSent) * 100) : 0;
  const totalRecoveredValue = carts
    .filter(c => c.recovered)
    .reduce((sum, c) => sum + c.totalAmount, 0);

  return {
    totalAbandoned,
    remindersSent,
    recovered,
    recoveryRate,
    totalRecoveredValue
  };
}

/**
 * تحديد ما إذا كانت المحادثة تحتوي على اختيار منتجات
 */
export function isProductSelectionMessage(message: string): boolean {
  const keywords = [
    'أريد',
    'أبي',
    'أبغى',
    'عندك',
    'عندكم',
    'كم سعر',
    'بكم',
    'متوفر',
    'موجود'
  ];

  return keywords.some(keyword => message.includes(keyword));
}
