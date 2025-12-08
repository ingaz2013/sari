/**
 * Sari AI Agent Personality
 * A friendly, professional Saudi sales assistant
 */

import { callGPT4, ChatMessage } from './openai';
import * as db from '../db';

/**
 * System prompt for Sari's personality
 */
const SARI_SYSTEM_PROMPT = `أنت ساري، مساعد مبيعات ذكي وودود عبر الواتساب.

## شخصيتك:
- سعودي الأصل، تتحدث باللهجة السعودية بطريقة طبيعية وودودة
- محترف ومهذب، لكن ليس رسمياً بشكل مبالغ فيه
- متحمس لمساعدة العملاء وإيجاد المنتجات المناسبة لهم
- صبور ومستمع جيد، تفهم احتياجات العميل قبل الاقتراح
- تستخدم الإيموجي بشكل معتدل لجعل المحادثة أكثر حيوية 😊

## مهامك الأساسية:
1. الترحيب بالعملاء الجدد بحرارة
2. الإجابة على أسئلة العملاء عن المنتجات
3. البحث عن المنتجات المناسبة حسب احتياجات العميل
4. اقتراح منتجات إضافية بناءً على السياق
5. مساعدة العملاء في إتمام الطلبات
6. الرد على الاستفسارات عن الأسعار والتوصيل

## أسلوب التواصل:
- استخدم "أهلاً" أو "مرحباً" للترحيب
- استخدم "حياك" أو "تسلم" للشكر
- اسأل "كيف أقدر أساعدك؟" أو "شو تحتاج؟"
- قل "ماشي" أو "تمام" للتأكيد
- استخدم "إن شاء الله" عند الوعد بشيء

## قواعد مهمة:
- لا تخترع معلومات عن المنتجات - استخدم فقط المعلومات المتوفرة
- إذا لم تجد منتج مناسب، اعتذر بلطف واقترح التواصل مع الدعم
- لا تعطي أسعار غير صحيحة
- كن صادقاً إذا لم تعرف الإجابة
- لا تتحدث عن منتجات غير موجودة في المتجر

## اللغة:
- الأولوية للهجة السعودية العامية
- يمكنك التبديل للإنجليزية إذا تحدث العميل بالإنجليزية
- يمكنك فهم الفصحى لكن الرد يكون بالعامية السعودية

## أمثلة على ردودك:
- "أهلاً وسهلاً! أنا ساري، مساعدك الشخصي 😊 كيف أقدر أساعدك اليوم؟"
- "تمام! فهمت عليك، تبغى [المنتج]. عندي لك خيارات حلوة..."
- "ماشي، خلني أدور لك على أفضل الخيارات المتاحة..."
- "للأسف ما عندي هالمنتج حالياً، بس عندي بديل ممتاز إن شاء الله..."

تذكر: أنت هنا لتسهيل عملية الشراء وجعلها ممتعة للعميل! 🛍️`;

/**
 * Generate context-aware prompt with customer and product info
 */
function buildContextPrompt(context: {
  customerName?: string;
  merchantName?: string;
  previousMessages?: Array<{ role: string; content: string }>;
  availableProducts?: Array<any>;
}): string {
  let contextPrompt = '';

  if (context.merchantName) {
    contextPrompt += `\n## معلومات المتجر:\nأنت تعمل لدى متجر "${context.merchantName}".`;
  }

  if (context.customerName) {
    contextPrompt += `\n\n## معلومات العميل:\nاسم العميل: ${context.customerName}`;
  }

  if (context.availableProducts && context.availableProducts.length > 0) {
    contextPrompt += `\n\n## المنتجات المتاحة:\n`;
    context.availableProducts.forEach((product, index) => {
      contextPrompt += `${index + 1}. ${product.name}`;
      if (product.price) contextPrompt += ` - ${product.price} ريال`;
      if (product.description) contextPrompt += ` - ${product.description}`;
      contextPrompt += `\n`;
    });
  }

  return contextPrompt;
}

/**
 * Chat with Sari AI Agent
 */
export async function chatWithSari(params: {
  merchantId: number;
  customerPhone: string;
  customerName?: string;
  message: string;
  conversationId?: number;
}): Promise<string> {
  try {
    // Get merchant info
    const merchant = await db.getMerchantById(params.merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // Get conversation history (last 10 messages)
    let previousMessages: ChatMessage[] = [];
    if (params.conversationId) {
      const messages = await db.getMessagesByConversationId(params.conversationId);
      previousMessages = messages
        .slice(-10) // Last 10 messages
        .map(msg => ({
          role: msg.direction === 'incoming' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));
    }

    // Get relevant products (we'll implement smart search later)
    const products = await db.getProductsByMerchantId(params.merchantId);
    const topProducts = products.slice(0, 10); // Top 10 products for now

    // Build context
    const contextPrompt = buildContextPrompt({
      merchantName: merchant.businessName,
      customerName: params.customerName,
      availableProducts: topProducts,
    });

    // Prepare messages
    const messages: ChatMessage[] = [
      { role: 'system', content: SARI_SYSTEM_PROMPT + contextPrompt },
      ...previousMessages,
      { role: 'user', content: params.message },
    ];

    // Call GPT-4
    const response = await callGPT4(messages, {
      temperature: 0.8, // More creative for natural conversation
      maxTokens: 500,
    });

    return response;
  } catch (error: any) {
    console.error('Error in chatWithSari:', error);
    
    // Fallback response
    return 'عذراً، حصل خطأ مؤقت. ممكن تعيد رسالتك مرة ثانية؟ 🙏';
  }
}

/**
 * Generate welcome message for new customers
 */
export async function generateWelcomeMessage(params: {
  merchantId: number;
  customerName?: string;
}): Promise<string> {
  try {
    const merchant = await db.getMerchantById(params.merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    const contextPrompt = `\n## معلومات المتجر:\nأنت تعمل لدى متجر "${merchant.businessName}".\n\n## المهمة:\nاكتب رسالة ترحيب قصيرة ومميزة لعميل جديد${params.customerName ? ` اسمه ${params.customerName}` : ''}. اجعلها ودودة ومحفزة للتفاعل.`;

    const response = await callGPT4([
      { role: 'system', content: SARI_SYSTEM_PROMPT + contextPrompt },
      { role: 'user', content: 'أرسل رسالة ترحيب' },
    ], {
      temperature: 0.9,
      maxTokens: 150,
    });

    return response;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return `أهلاً وسهلاً! 😊\n\nأنا ساري، مساعدك الشخصي في متجرنا. كيف أقدر أساعدك اليوم؟ 🛍️`;
  }
}

/**
 * Analyze customer intent
 */
export async function analyzeCustomerIntent(message: string): Promise<{
  intent: 'greeting' | 'product_inquiry' | 'price_inquiry' | 'order' | 'complaint' | 'other';
  confidence: number;
  keywords: string[];
}> {
  try {
    const analysisPrompt = `حلل الرسالة التالية وحدد نية العميل:

الرسالة: "${message}"

أجب بصيغة JSON فقط:
{
  "intent": "greeting | product_inquiry | price_inquiry | order | complaint | other",
  "confidence": 0.0-1.0,
  "keywords": ["كلمة1", "كلمة2"]
}`;

    const response = await callGPT4([
      { role: 'system', content: 'أنت محلل ذكي لنوايا العملاء. أجب بصيغة JSON فقط.' },
      { role: 'user', content: analysisPrompt },
    ], {
      temperature: 0.3,
      maxTokens: 150,
    });

    // Parse JSON response
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleaned);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing intent:', error);
    return {
      intent: 'other',
      confidence: 0.5,
      keywords: [],
    };
  }
}
