/**
 * نظام التقارير الأسبوعية للمشاعر
 */

import * as db from '../db';
import { analyzeSentiment } from './sentiment-analysis';
// import { sendEmail } from '../email'; // سيتم تفعيله لاحقاً

interface WeeklySentimentReport {
  merchantId: number;
  weekStartDate: Date;
  weekEndDate: Date;
  totalConversations: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  improvementSuggestions: string[];
}

/**
 * إنشاء تقرير أسبوعي للمشاعر
 */
export async function generateWeeklySentimentReport(
  merchantId: number
): Promise<WeeklySentimentReport | null> {
  try {
    // حساب تاريخ بداية ونهاية الأسبوع الماضي
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - now.getDay()); // الأحد الماضي
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6); // الاثنين قبل أسبوع
    weekStart.setHours(0, 0, 0, 0);

    // الحصول على المحادثات في هذا الأسبوع
    const conversations = await db.getConversationsByMerchantId(merchantId);
    const weekConversations = conversations.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= weekStart && createdAt <= weekEnd;
    });

    if (weekConversations.length === 0) {
      console.log(`[Weekly Report] No conversations found for merchant ${merchantId} in the past week`);
      return null;
    }

    // تحليل المشاعر لكل محادثة
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    const keywordMap = new Map<string, number>();

    for (const conversation of weekConversations) {
      // الحصول على رسائل المحادثة
      const messages = await db.getMessagesByConversationId(conversation.id);
      const customerMessages = messages.filter(m => m.direction === 'incoming');
      
      if (customerMessages.length === 0) continue;

      // تحليل المشاعر
      const conversationText = customerMessages.map(m => m.content).join(' ');
      const sentiment = await analyzeSentiment(conversationText);

      if (sentiment.sentiment === 'positive' || sentiment.sentiment === 'happy') positiveCount++;
      else if (sentiment.sentiment === 'negative' || sentiment.sentiment === 'angry' || sentiment.sentiment === 'sad' || sentiment.sentiment === 'frustrated') negativeCount++;
      else neutralCount++;

      // استخراج الكلمات المفتاحية (بسيط)
      const words = conversationText.split(/\s+/);
      for (const word of words) {
        if (word.length > 3) {
          keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
        }
      }
    }

    const totalConversations = weekConversations.length;
    const positivePercentage = (positiveCount / totalConversations) * 100;
    const negativePercentage = (negativeCount / totalConversations) * 100;
    const neutralPercentage = (neutralCount / totalConversations) * 100;

    // أكثر 10 كلمات تكراراً
    const topKeywords = Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // اقتراحات التحسين
    const improvementSuggestions = [];
    if (negativePercentage > 20) {
      improvementSuggestions.push('نسبة المشاعر السلبية مرتفعة. يُنصح بمراجعة الردود وتحسين خدمة العملاء.');
    }
    if (positivePercentage < 50) {
      improvementSuggestions.push('يمكن تحسين رضا العملاء من خلال ردود أسرع وأكثر ودية.');
    }
    if (topKeywords.length > 0) {
      improvementSuggestions.push(`الكلمات الأكثر تكراراً: ${topKeywords.slice(0, 3).map(k => k.keyword).join('، ')}. قد تحتاج لردود سريعة مخصصة.`);
    }

    const report: WeeklySentimentReport = {
      merchantId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalConversations,
      positiveCount,
      negativeCount,
      neutralCount,
      positivePercentage,
      negativePercentage,
      neutralPercentage,
      topKeywords,
      improvementSuggestions
    };

    // حفظ التقرير في قاعدة البيانات
    await db.createWeeklySentimentReport({
      merchantId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalConversations,
      positiveCount,
      negativeCount,
      neutralCount,
      topKeywords: topKeywords.map(k => k.keyword),
      topComplaints: [], // يمكن إضافته لاحقاً
      recommendations: improvementSuggestions
    });

    // إرسال التقرير عبر البريد الإلكتروني
    const merchant = await db.getMerchantById(merchantId);
    if (merchant) {
      const user = await db.getUserById(merchant.userId);
      if (user?.email) {
        await sendWeeklyReportEmail(user.email, merchant.businessName, report);
        
        // تحديث حالة الإرسال
        // تحديث حالة الإرسال (يمكن إضافة دالة updateWeeklySentimentReport لاحقاً)
      }
    }

    return report;
  } catch (error) {
    console.error('[Weekly Report] Error generating report:', error);
    throw error;
  }
}

/**
 * إرسال التقرير الأسبوعي عبر البريد الإلكتروني
 */
async function sendWeeklyReportEmail(
  email: string,
  businessName: string,
  report: WeeklySentimentReport
) {
  const subject = `📊 التقرير الأسبوعي لـ ${businessName}`;
  
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #22c55e;">التقرير الأسبوعي للمشاعر</h1>
      <p>من ${report.weekStartDate.toLocaleDateString('ar-SA')} إلى ${report.weekEndDate.toLocaleDateString('ar-SA')}</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>📈 الإحصائيات</h2>
        <ul style="list-style: none; padding: 0;">
          <li>✅ إجمالي المحادثات: <strong>${report.totalConversations}</strong></li>
          <li>😊 إيجابي: <strong>${report.positiveCount}</strong> (${report.positivePercentage.toFixed(1)}%)</li>
          <li>😐 محايد: <strong>${report.neutralCount}</strong> (${report.neutralPercentage.toFixed(1)}%)</li>
          <li>😞 سلبي: <strong>${report.negativeCount}</strong> (${report.negativePercentage.toFixed(1)}%)</li>
        </ul>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>🔑 الكلمات المفتاحية الأكثر تكراراً</h2>
        <ol>
          ${report.topKeywords.slice(0, 5).map(k => `<li><strong>${k.keyword}</strong>: ${k.count} مرة</li>`).join('')}
        </ol>
      </div>
      
      ${report.improvementSuggestions.length > 0 ? `
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>💡 اقتراحات التحسين</h2>
          <ul>
            ${report.improvementSuggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
        هذا تقرير تلقائي من نظام ساري. للمزيد من التفاصيل، قم بزيارة لوحة التحكم.
      </p>
    </div>
  `;

  // TODO: إرسال البريد الإلكتروني
  console.log('[Weekly Report] Email would be sent to:', email);
  console.log('[Weekly Report] Subject:', subject);
  // await sendEmail({ to: email, subject, html });
}
