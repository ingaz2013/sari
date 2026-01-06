/**
 * قوالب البريد الإلكتروني الإضافية
 * تحتوي على القوالب المفقودة من النظام
 */

import { sendEmail } from '../reports/email-sender';

/**
 * قالب HTML أساسي لجميع الرسائل
 */
function getEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              ${content}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * 1. إشعار طلب جديد (New Order)
 */
export async function sendNewOrderEmail(
  email: string,
  orderNumber: string,
  customerName: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<boolean> {
  const subject = `🛍️ طلب جديد #${orderNumber}`;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong><br>
        <span style="color: #6b7280;">الكمية: ${item.quantity} × ${item.price.toFixed(2)} ر.س</span>
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #00d25e 0%, #00a84d 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">طلب جديد! 🎉</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          لديك طلب جديد من <strong>${customerName}</strong>
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280;">رقم الطلب</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #00d25e;">#${orderNumber}</p>
        </div>

        <h3 style="color: #111827; margin-bottom: 15px;">تفاصيل الطلب:</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          ${itemsHtml}
        </table>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: left;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">
            الإجمالي: ${totalAmount.toFixed(2)} ر.س
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/orders" 
             style="display: inline-block; background: #00d25e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            عرض الطلب
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 2. تغيير حالة الطلب (Order Status Changed)
 */
export async function sendOrderStatusChangedEmail(
  email: string,
  orderNumber: string,
  customerName: string,
  oldStatus: string,
  newStatus: string,
  statusMessage: string
): Promise<boolean> {
  const subject = `📦 تحديث حالة الطلب #${orderNumber}`;

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    processing: '🔄',
    shipped: '🚚',
    delivered: '📦',
    cancelled: '❌',
  };

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">تحديث حالة الطلب</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          طلب <strong>${customerName}</strong> تم تحديثه
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280;">رقم الطلب</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #6366f1;">#${orderNumber}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: ${statusColors[oldStatus] || '#9ca3af'}; color: white; padding: 10px 20px; border-radius: 6px; margin: 0 10px;">
            ${statusEmojis[oldStatus] || '⚪'} ${oldStatus}
          </div>
          <span style="font-size: 24px; color: #9ca3af;">→</span>
          <div style="display: inline-block; background: ${statusColors[newStatus] || '#9ca3af'}; color: white; padding: 10px 20px; border-radius: 6px; margin: 0 10px;">
            ${statusEmojis[newStatus] || '⚪'} ${newStatus}
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #374151; line-height: 1.6;">
            ${statusMessage}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/orders" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            عرض الطلب
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 3. رسالة جديدة من عميل (New Customer Message)
 */
export async function sendNewCustomerMessageEmail(
  email: string,
  customerName: string,
  customerPhone: string,
  message: string,
  conversationId: number
): Promise<boolean> {
  const subject = `💬 رسالة جديدة من ${customerName}`;

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">رسالة جديدة! 💬</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; color: #6b7280;">من</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #111827;">${customerName}</p>
          <p style="margin: 5px 0 0 0; color: #6b7280;">${customerPhone}</p>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/conversations" 
             style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            الرد على الرسالة
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 4. تقرير دوري (Scheduled Report)
 */
export async function sendScheduledReportEmail(
  email: string,
  reportType: 'daily' | 'weekly' | 'monthly',
  stats: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
    conversations: number;
  },
  period: string
): Promise<boolean> {
  const reportTitles = {
    daily: 'التقرير اليومي',
    weekly: 'التقرير الأسبوعي',
    monthly: 'التقرير الشهري',
  };

  const subject = `📊 ${reportTitles[reportType]} - ${period}`;

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${reportTitles[reportType]} 📊</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${period}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">الطلبات</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #1e3a8a;">${stats.totalOrders}</p>
          </div>
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">الإيرادات</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #064e3b;">${stats.totalRevenue.toFixed(2)} ر.س</p>
          </div>
          <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #9f1239; font-size: 14px;">عملاء جدد</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #881337;">${stats.newCustomers}</p>
          </div>
          <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #3730a3; font-size: 14px;">المحادثات</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #312e81;">${stats.conversations}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/reports" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            عرض التقرير الكامل
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 5. فشل الدفع (Payment Failed)
 */
export async function sendPaymentFailedEmail(
  email: string,
  orderNumber: string,
  customerName: string,
  amount: number,
  reason: string
): Promise<boolean> {
  const subject = `⚠️ فشل الدفع للطلب #${orderNumber}`;

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">فشل الدفع ⚠️</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="background: #fee2e2; border-right: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">تنبيه: فشلت عملية الدفع</p>
        </div>

        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          فشلت عملية الدفع للطلب من <strong>${customerName}</strong>
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280;">رقم الطلب</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ef4444;">#${orderNumber}</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; color: #6b7280;">المبلغ</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #111827;">${amount.toFixed(2)} ر.س</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; color: #6b7280;">السبب</p>
          <p style="margin: 0; color: #374151;">${reason}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/payments" 
             style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            عرض التفاصيل
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 6. نجاح ربط منصة (Integration Connected)
 */
export async function sendIntegrationConnectedEmail(
  email: string,
  platformName: string,
  storeName: string,
  storeUrl: string
): Promise<boolean> {
  const subject = `✅ تم ربط ${platformName} بنجاح`;

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">تم الربط بنجاح! ✅</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          تم ربط متجرك على <strong>${platformName}</strong> بنجاح مع ساري!
        </p>
        
        <div style="background: #d1fae5; border-right: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #065f46; font-weight: bold;">اسم المتجر</p>
          <p style="margin: 0; font-size: 18px; color: #064e3b;">${storeName}</p>
          ${storeUrl ? `<p style="margin: 10px 0 0 0; color: #059669;"><a href="${storeUrl}" style="color: #059669;">${storeUrl}</a></p>` : ''}
        </div>

        <h3 style="color: #111827; margin-bottom: 15px;">ماذا بعد؟</h3>
        <ul style="color: #374151; line-height: 1.8;">
          <li>سيتم مزامنة المنتجات تلقائياً</li>
          <li>سيتم تحديث المخزون بشكل دوري</li>
          <li>ستتلقى إشعارات بالطلبات الجديدة</li>
        </ul>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/platform-integrations" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            إدارة التكاملات
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 7. خطأ في المزامنة (Sync Error)
 */
export async function sendSyncErrorEmail(
  email: string,
  platformName: string,
  errorMessage: string,
  errorDetails: string
): Promise<boolean> {
  const subject = `⚠️ خطأ في مزامنة ${platformName}`;

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">خطأ في المزامنة ⚠️</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">حدث خطأ أثناء مزامنة ${platformName}</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-weight: bold;">رسالة الخطأ:</p>
          <p style="margin: 0; color: #374151;">${errorMessage}</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-weight: bold;">التفاصيل:</p>
          <p style="margin: 0; color: #374151; font-family: monospace; font-size: 13px; white-space: pre-wrap;">${errorDetails}</p>
        </div>

        <h3 style="color: #111827; margin-bottom: 15px;">الحلول المقترحة:</h3>
        <ul style="color: #374151; line-height: 1.8;">
          <li>تحقق من صحة بيانات الاتصال</li>
          <li>تأكد من صلاحيات API</li>
          <li>حاول إعادة الاتصال بالمنصة</li>
        </ul>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/platform-integrations" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            إصلاح المشكلة
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 8. مخزون منخفض (Low Stock Alert)
 */
export async function sendLowStockAlertEmail(
  email: string,
  products: Array<{ name: string; sku: string; currentStock: number; minStock: number }>
): Promise<boolean> {
  const subject = `📦 تنبيه: مخزون منخفض (${products.length} منتج)`;

  const productsHtml = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #111827;">${product.name}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">SKU: ${product.sku}</p>
        <p style="margin: 5px 0 0 0; color: #ef4444; font-weight: bold;">
          المخزون الحالي: ${product.currentStock} (الحد الأدنى: ${product.minStock})
        </p>
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">تنبيه مخزون منخفض! 📦</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">
            ${products.length} منتج وصل إلى الحد الأدنى من المخزون
          </p>
        </div>

        <h3 style="color: #111827; margin-bottom: 15px;">المنتجات التي تحتاج إعادة تخزين:</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          ${productsHtml}
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/products" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            إدارة المخزون
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 9. مراجعة جديدة (New Review)
 */
export async function sendNewReviewEmail(
  email: string,
  customerName: string,
  rating: number,
  comment: string,
  productName?: string
): Promise<boolean> {
  const subject = `⭐ مراجعة جديدة من ${customerName}`;

  const starsHtml = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">مراجعة جديدة! ⭐</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold; font-size: 18px;">${customerName}</p>
          <p style="margin: 0; font-size: 32px;">${starsHtml}</p>
          <p style="margin: 10px 0 0 0; color: #92400e;">${rating} من 5</p>
        </div>

        ${productName ? `<p style="text-align: center; color: #6b7280; margin-bottom: 20px;">على المنتج: <strong>${productName}</strong></p>` : ''}

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${comment}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/reviews" 
             style="display: inline-block; background: #fbbf24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            عرض جميع المراجعات
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}

/**
 * 10. حملة تسويقية (Campaign Sent)
 */
export async function sendCampaignSentEmail(
  email: string,
  campaignName: string,
  stats: {
    totalRecipients: number;
    sent: number;
    failed: number;
  }
): Promise<boolean> {
  const subject = `📢 تم إرسال الحملة: ${campaignName}`;

  const successRate = ((stats.sent / stats.totalRecipients) * 100).toFixed(1);

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">تم إرسال الحملة! 📢</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px;">
        <div style="background: #cffafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0; color: #155e75; font-size: 20px; font-weight: bold;">${campaignName}</p>
        </div>

        <h3 style="color: #111827; margin-bottom: 15px; text-align: center;">إحصائيات الإرسال</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">إجمالي المستلمين</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold; color: #075985;">${stats.totalRecipients}</p>
          </div>
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">تم الإرسال</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold; color: #064e3b;">${stats.sent}</p>
          </div>
          <div style="background: ${stats.failed > 0 ? '#fee2e2' : '#f3f4f6'}; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: ${stats.failed > 0 ? '#991b1b' : '#6b7280'}; font-size: 14px;">فشل</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold; color: ${stats.failed > 0 ? '#7f1d1d' : '#4b5563'};">${stats.failed}</p>
          </div>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0; color: #0369a1; font-size: 16px;">نسبة النجاح</p>
          <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #075985;">${successRate}%</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://sary.live'}/merchant/campaigns" 
             style="display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            عرض تفاصيل الحملة
          </a>
        </div>
      </td>
    </tr>
  `;

  const html = getEmailTemplate(content);
  return await sendEmail(email, subject, html);
}
