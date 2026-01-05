import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { invokeLLM } from './_core/llm';
import * as db from './db';

// نظام اقتراحات الذكاء الاصطناعي للردود
export const aiSuggestionsRouter = router({
  // توليد اقتراحات للرد على رسالة
  generateSuggestions: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      lastMessages: z.array(z.object({
        content: z.string(),
        direction: z.enum(['incoming', 'outgoing']),
        timestamp: z.string().optional(),
      })).max(10), // آخر 10 رسائل للسياق
      customerName: z.string().optional(),
      context: z.object({
        businessType: z.string().optional(),
        products: z.array(z.object({
          name: z.string(),
          price: z.number().optional(),
        })).optional(),
        services: z.array(z.object({
          name: z.string(),
          price: z.number().optional(),
        })).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const merchant = await db.getMerchantByUserId(ctx.user.id);
      if (!merchant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant not found' });
      }

      // بناء السياق للمحادثة
      const conversationContext = input.lastMessages
        .map(msg => `${msg.direction === 'incoming' ? 'العميل' : 'ساري'}: ${msg.content}`)
        .join('\n');

      // بناء معلومات المنتجات/الخدمات
      let productsInfo = '';
      if (input.context?.products && input.context.products.length > 0) {
        productsInfo = '\n\nالمنتجات المتاحة:\n' + 
          input.context.products.slice(0, 5).map(p => 
            `- ${p.name}${p.price ? ` (${p.price} ريال)` : ''}`
          ).join('\n');
      }
      if (input.context?.services && input.context.services.length > 0) {
        productsInfo += '\n\nالخدمات المتاحة:\n' + 
          input.context.services.slice(0, 5).map(s => 
            `- ${s.name}${s.price ? ` (${s.price} ريال)` : ''}`
          ).join('\n');
      }

      const systemPrompt = `أنت مساعد ذكي يساعد في اقتراح ردود مناسبة للمحادثات التجارية عبر واتساب.

قواعد الاقتراحات:
1. اقترح 4 ردود مختلفة ومناسبة للسياق
2. استخدم اللهجة السعودية العامية المهذبة
3. كن ودوداً ومحترفاً
4. إذا كان السؤال عن منتج/خدمة، اذكر التفاصيل المتاحة
5. استخدم الإيموجي بشكل معتدل
6. اجعل الردود قصيرة ومباشرة (جملة أو جملتين)
7. نوّع في أسلوب الردود (رسمي، ودي، مختصر، تفصيلي)

${productsInfo}

نوع النشاط: ${input.context?.businessType || 'متجر إلكتروني'}
اسم العميل: ${input.customerName || 'العميل'}`;

      const userPrompt = `المحادثة الحالية:
${conversationContext}

اقترح 4 ردود مناسبة للرسالة الأخيرة من العميل.

أعد الإجابة بتنسيق JSON فقط:
{
  "suggestions": [
    {"text": "الرد الأول", "type": "friendly"},
    {"text": "الرد الثاني", "type": "professional"},
    {"text": "الرد الثالث", "type": "brief"},
    {"text": "الرد الرابع", "type": "detailed"}
  ]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'suggestions_response',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        text: { type: 'string', description: 'نص الرد المقترح' },
                        type: { 
                          type: 'string', 
                          enum: ['friendly', 'professional', 'brief', 'detailed'],
                          description: 'نوع الرد'
                        },
                      },
                      required: ['text', 'type'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['suggestions'],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new Error('Invalid response format');
        }

        const parsed = JSON.parse(content);
        return {
          suggestions: parsed.suggestions.map((s: { text: string; type: string }, index: number) => ({
            id: index + 1,
            text: s.text,
            type: s.type,
            label: getTypeLabel(s.type),
          })),
        };
      } catch (error) {
        console.error('AI Suggestions error:', error);
        // إرجاع اقتراحات افتراضية في حالة الخطأ
        return {
          suggestions: [
            { id: 1, text: 'أهلاً وسهلاً! كيف أقدر أساعدك؟ 😊', type: 'friendly', label: 'ودي' },
            { id: 2, text: 'شكراً لتواصلك معنا. كيف يمكنني مساعدتك؟', type: 'professional', label: 'رسمي' },
            { id: 3, text: 'تفضل، كيف أخدمك؟', type: 'brief', label: 'مختصر' },
            { id: 4, text: 'مرحباً بك! نحن سعداء بتواصلك. كيف يمكننا مساعدتك اليوم؟', type: 'detailed', label: 'تفصيلي' },
          ],
        };
      }
    }),

  // توليد رد مخصص بناءً على طلب معين
  generateCustomReply: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      instruction: z.string(), // مثل: "اشكره على الطلب" أو "اعتذر عن التأخير"
      lastMessages: z.array(z.object({
        content: z.string(),
        direction: z.enum(['incoming', 'outgoing']),
      })).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const merchant = await db.getMerchantByUserId(ctx.user.id);
      if (!merchant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant not found' });
      }

      const conversationContext = input.lastMessages
        .map(msg => `${msg.direction === 'incoming' ? 'العميل' : 'ساري'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `أنت مساعد ذكي يكتب ردود للمحادثات التجارية عبر واتساب.
استخدم اللهجة السعودية العامية المهذبة.
كن ودوداً ومحترفاً.
اكتب رداً واحداً فقط.`;

      const userPrompt = `المحادثة:
${conversationContext}

التعليمات: ${input.instruction}

اكتب رداً مناسباً (جملة أو جملتين):`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const content = response.choices[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new Error('Invalid response format');
        }

        return { reply: content.trim() };
      } catch (error) {
        console.error('Custom reply error:', error);
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'فشل في توليد الرد' 
        });
      }
    }),

  // تحسين رد موجود
  improveReply: protectedProcedure
    .input(z.object({
      originalReply: z.string(),
      improvement: z.enum(['more_friendly', 'more_professional', 'shorter', 'longer', 'add_emoji']),
    }))
    .mutation(async ({ input }) => {
      const improvementInstructions: Record<string, string> = {
        more_friendly: 'اجعل الرد أكثر ودية وحميمية',
        more_professional: 'اجعل الرد أكثر رسمية واحترافية',
        shorter: 'اختصر الرد مع الحفاظ على المعنى',
        longer: 'أضف المزيد من التفاصيل والشرح',
        add_emoji: 'أضف إيموجي مناسبة للرد',
      };

      const systemPrompt = `أنت مساعد يحسن الردود للمحادثات التجارية.
استخدم اللهجة السعودية العامية المهذبة.`;

      const userPrompt = `الرد الأصلي: "${input.originalReply}"

التعليمات: ${improvementInstructions[input.improvement]}

اكتب الرد المحسن فقط:`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const content = response.choices[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new Error('Invalid response format');
        }

        return { improvedReply: content.trim() };
      } catch (error) {
        console.error('Improve reply error:', error);
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'فشل في تحسين الرد' 
        });
      }
    }),

  // اقتراحات سريعة مبنية على نوع الرسالة
  getQuickSuggestions: protectedProcedure
    .input(z.object({
      messageType: z.enum([
        'greeting', // تحية
        'product_inquiry', // استفسار عن منتج
        'price_inquiry', // استفسار عن السعر
        'order_status', // حالة الطلب
        'complaint', // شكوى
        'thanks', // شكر
        'goodbye', // وداع
        'general', // عام
      ]),
    }))
    .query(async ({ input }) => {
      const quickReplies: Record<string, Array<{ text: string; emoji: string }>> = {
        greeting: [
          { text: 'أهلاً وسهلاً! كيف أقدر أساعدك؟', emoji: '👋' },
          { text: 'مرحباً! تفضل كيف أخدمك؟', emoji: '😊' },
          { text: 'هلا والله! شلون أقدر أساعدك؟', emoji: '🌟' },
        ],
        product_inquiry: [
          { text: 'نعم متوفر! تبي أرسلك التفاصيل؟', emoji: '✅' },
          { text: 'أكيد عندنا! خلني أعطيك المعلومات', emoji: '📦' },
          { text: 'متوفر الحمدلله. أي لون تفضل؟', emoji: '🎨' },
        ],
        price_inquiry: [
          { text: 'السعر [X] ريال شامل الضريبة', emoji: '💰' },
          { text: 'عندنا عرض خاص الحين!', emoji: '🔥' },
          { text: 'خلني أرسلك قائمة الأسعار', emoji: '📋' },
        ],
        order_status: [
          { text: 'طلبك في الطريق! يوصلك خلال [X]', emoji: '🚚' },
          { text: 'تم شحن طلبك. رقم التتبع: [X]', emoji: '📦' },
          { text: 'طلبك جاهز للاستلام', emoji: '✨' },
        ],
        complaint: [
          { text: 'نعتذر جداً عن الإزعاج. خلني أحل المشكلة', emoji: '🙏' },
          { text: 'آسفين على هالموقف. راح نعوضك', emoji: '💔' },
          { text: 'شكراً على ملاحظتك. راح نتابع الموضوع', emoji: '📝' },
        ],
        thanks: [
          { text: 'العفو! نورتنا 🌹', emoji: '🌹' },
          { text: 'شكراً لك! ننتظرك دايماً', emoji: '💜' },
          { text: 'تسلم! نتشرف بخدمتك', emoji: '🙏' },
        ],
        goodbye: [
          { text: 'مع السلامة! ننتظرك مرة ثانية', emoji: '👋' },
          { text: 'الله يسعدك! تشرفنا', emoji: '💫' },
          { text: 'في أمان الله! لا تتردد تراسلنا', emoji: '🌟' },
        ],
        general: [
          { text: 'تفضل، كيف أقدر أساعدك؟', emoji: '💬' },
          { text: 'أنا هنا لخدمتك', emoji: '🤝' },
          { text: 'لو عندك أي سؤال، تفضل', emoji: '❓' },
        ],
      };

      return {
        suggestions: quickReplies[input.messageType] || quickReplies.general,
      };
    }),
});

// دالة مساعدة للحصول على تسمية نوع الرد
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    friendly: 'ودي',
    professional: 'رسمي',
    brief: 'مختصر',
    detailed: 'تفصيلي',
  };
  return labels[type] || type;
}

export default aiSuggestionsRouter;
