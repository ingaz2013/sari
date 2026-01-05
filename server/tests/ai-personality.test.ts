import { describe, it, expect, beforeAll } from 'vitest';
import { generateAIResponse } from '../ai';
import * as db from '../db';

describe('AI Personality - ساري', () => {
  let testMerchantId: number;

  beforeAll(async () => {
    // إنشاء تاجر تجريبي
    const merchant = await db.createMerchant({
      userId: 999,
      businessName: 'متجر الإلكترونيات',
      phoneNumber: '+966500000000',
    });
    testMerchantId = merchant.id;

    // إضافة منتجات تجريبية
    await db.createProduct({
      merchantId: testMerchantId,
      name: 'آيفون 15 برو',
      description: 'أحدث إصدار من آيفون',
      price: 3999,
      stock: 10,
      category: 'هواتف',
    });

    await db.createProduct({
      merchantId: testMerchantId,
      name: 'سماعات إيربودز برو',
      description: 'سماعات لاسلكية',
      price: 899,
      stock: 5,
      category: 'إكسسوارات',
    });
  });

  describe('اللهجة السعودية', () => {
    it('should use Saudi dialect phrases', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'مرحبا',
        []
      );

      // التحقق من استخدام عبارات سعودية
      const saudiPhrases = ['أهلاً', 'أهلا', 'والله', 'يا أخي', 'بإذن الله', 'تبي', 'عندنا'];
      const containsSaudiPhrase = saudiPhrases.some(phrase => 
        response.includes(phrase)
      );

      expect(containsSaudiPhrase).toBe(true);
    });

    it('should not be overly formal', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'شكراً',
        []
      );

      // يجب أن يكون الرد قريب وليس رسمي جداً
      expect(response.length).toBeLessThan(200); // ردود قصيرة
      expect(response).not.toMatch(/سيادتكم|حضرتك|سعادة/); // تجنب الألفاظ الرسمية جداً
    });
  });

  describe('سيناريوهات المحادثة', () => {
    it('should handle product inquiry naturally', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'عندكم آيفون 15 برو؟',
        []
      );

      expect(response).toContain('آيفون 15 برو');
      expect(response).toMatch(/\d{3,4}/); // يجب أن يحتوي على السعر
    });

    it('should summarize order before confirmation', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'أبي أشتري سماعات إيربودز',
        []
      );

      // يجب أن يلخص الطلب ويطلب التأكيد
      const hasSummary = response.includes('•') || response.includes('-') || response.includes('المنتج');
      const asksConfirmation = response.includes('موافق') || response.includes('تأكيد') || response.includes('؟');

      expect(hasSummary || asksConfirmation).toBe(true);
    });

    it('should handle unavailable product gracefully', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'عندكم بلايستيشن 5؟',
        []
      );

      // يجب أن يعتذر ويقترح بدائل
      const apologizes = response.includes('أسف') || response.includes('للأسف') || response.includes('ما عندنا');
      expect(apologizes).toBe(true);
    });

    it('should help indecisive customers', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'ما أدري وش أشتري',
        []
      );

      // يجب أن يساعد العميل باستفسارات
      const helpsDecide = response.includes('؟') && (
        response.includes('استخدام') ||
        response.includes('احتياج') ||
        response.includes('ميزانية') ||
        response.includes('وش')
      );

      expect(helpsDecide).toBe(true);
    });
  });

  describe('جودة الردود', () => {
    it('should keep responses concise', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'كم سعر السماعات؟',
        []
      );

      // الردود يجب أن تكون قصيرة ومباشرة
      expect(response.length).toBeLessThan(300);
    });

    it('should use minimal emojis', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'شكراً على المساعدة',
        []
      );

      // عدد الإيموجي يجب أن يكون قليل (0-2)
      const emojiCount = (response.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
      expect(emojiCount).toBeLessThanOrEqual(2);
    });

    it('should provide clear pricing information', async () => {
      const response = await generateAIResponse(
        testMerchantId,
        'كم سعر آيفون 15؟',
        []
      );

      // يجب أن يحتوي على السعر بوضوح
      expect(response).toMatch(/\d{3,4}\s*ريال/);
    });
  });

  describe('سياق المحادثة', () => {
    it('should maintain conversation context', async () => {
      const history = [
        { role: 'user' as const, content: 'عندكم آيفون؟' },
        { role: 'assistant' as const, content: 'نعم عندنا آيفون 15 برو بسعر 3,999 ريال' },
      ];

      const response = await generateAIResponse(
        testMerchantId,
        'كم الكمية المتوفرة؟',
        history
      );

      // يجب أن يفهم أن السؤال عن آيفون 15 برو
      expect(response).toMatch(/\d+/); // يجب أن يحتوي على رقم (الكمية)
    });
  });
});
