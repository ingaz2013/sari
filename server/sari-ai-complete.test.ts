/**
 * Comprehensive Sari AI Tests
 * Tests for Playground, Analytics, and complete AI system
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { chatWithSari, generateWelcomeMessage, analyzeCustomerIntent } from './ai/sari-personality';
import { searchProducts, suggestProducts, formatProductsForWhatsApp } from './ai/product-intelligence';
import { processVoiceMessage, isVoiceProcessingEnabled, hasReachedVoiceLimit } from './ai/voice-handler';

describe('Sari AI - Complete System Tests', () => {
  let testMerchantId: number;
  let testConversationId: number;

  beforeAll(async () => {
    // Get or create test merchant
    const merchants = await db.getAllMerchants();
    const testMerchant = merchants.find(m => m.businessName === 'Test Referral Business');
    
    if (!testMerchant) {
      throw new Error('Test merchant not found. Please run seed script first.');
    }
    
    testMerchantId = testMerchant.id;

    // Create a test conversation
    const conversation = await db.createConversation({
      merchantId: testMerchantId,
      customerPhone: '966501234567',
      customerName: 'أحمد العميل',
      status: 'active',
      lastMessageAt: new Date(),
    });
    
    testConversationId = conversation.id;
  });

  describe('1. Sari Personality Tests', () => {
    it('should generate personalized welcome message', async () => {
      const welcome = await generateWelcomeMessage({
        merchantId: testMerchantId,
        customerName: 'أحمد',
      });

      expect(welcome).toBeTruthy();
      expect(welcome).toContain('أحمد');
      expect(welcome.length).toBeGreaterThan(10);
      console.log('Welcome message:', welcome);
    });

    it('should chat with proper Saudi dialect', async () => {
      const response = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'أحمد',
        message: 'السلام عليكم، كيف حالك؟',
        conversationId: testConversationId,
      });

      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(5);
      console.log('Sari response:', response);
    });

    it('should analyze customer intent - greeting', async () => {
      const intent = await analyzeCustomerIntent('السلام عليكم');

      expect(intent).toBeTruthy();
      expect(intent.intent).toBe('greeting');
      expect(intent.confidence).toBeGreaterThan(0.8);
      console.log('Intent analysis:', intent);
    });

    it('should analyze customer intent - product inquiry', async () => {
      const intent = await analyzeCustomerIntent('عندك جوالات آيفون؟');

      expect(intent).toBeTruthy();
      expect(intent.intent).toBe('product_inquiry');
      expect(intent.keywords).toContain('جوالات');
      console.log('Intent analysis:', intent);
    });

    it('should analyze customer intent - price inquiry', async () => {
      const intent = await analyzeCustomerIntent('كم سعر المنتج؟');

      expect(intent).toBeTruthy();
      expect(intent.intent).toBe('price_inquiry');
      expect(intent.confidence).toBeGreaterThan(0.8);
      console.log('Intent analysis:', intent);
    });

    it('should handle long conversations', async () => {
      const longMessage = 'أبغى منتج ' + 'ممتاز '.repeat(50);
      
      const response = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        message: longMessage,
        conversationId: testConversationId,
      });

      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe('2. Product Intelligence Tests', () => {
    it('should search products by keyword', async () => {
      // First, add some test products
      await db.createProduct({
        merchantId: testMerchantId,
        name: 'iPhone 15 Pro',
        description: 'أحدث إصدار من آيفون',
        price: 4999,
        stock: 10,
        category: 'جوالات',
        sku: 'IPHONE15PRO',
        isActive: true,
      });

      const results = await searchProducts({
        merchantId: testMerchantId,
        query: 'آيفون',
        limit: 5,
      });

      expect(results).toBeTruthy();
      expect(Array.isArray(results)).toBe(true);
      console.log(`Found ${results.length} products`);
    });

    it('should suggest products based on context', async () => {
      const suggestion = await suggestProducts({
        merchantId: testMerchantId,
        conversationContext: 'العميل يبحث عن هدية لصديقه، ميزانيته 500 ريال',
        limit: 3,
      });

      expect(suggestion).toBeTruthy();
      expect(suggestion.products).toBeTruthy();
      expect(suggestion.reasoning).toBeTruthy();
      console.log('Suggested products:', suggestion.products.length);
      console.log('Reasoning:', suggestion.reasoning);
    });

    it('should format products for WhatsApp display', async () => {
      const products = [
        {
          name: 'iPhone 15 Pro',
          description: 'أحدث إصدار من آيفون',
          price: 4999,
          stock: 10,
        },
        {
          name: 'Samsung Galaxy S24',
          description: 'هاتف سامسونج الرائد',
          price: 3999,
          stock: 5,
        },
      ];

      const formatted = formatProductsForWhatsApp(products);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain('iPhone 15 Pro');
      expect(formatted).toContain('4999 ريال');
      expect(formatted).toContain('Samsung Galaxy S24');
      console.log('Formatted message:\n', formatted);
    });

    it('should handle empty product list', async () => {
      const formatted = formatProductsForWhatsApp([]);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain('للأسف');
    });
  });

  describe('3. Voice Processing Tests', () => {
    it('should check if voice processing is enabled', async () => {
      const isEnabled = await isVoiceProcessingEnabled(testMerchantId);

      // Should be boolean
      expect(typeof isEnabled).toBe('boolean');
      console.log('Voice processing enabled:', isEnabled);
    });

    it('should check voice limit status', async () => {
      const hasReached = await hasReachedVoiceLimit(testMerchantId);

      // Should be boolean
      expect(typeof hasReached).toBe('boolean');
      console.log('Voice limit reached:', hasReached);
    });

    // Note: Actual voice processing test requires real audio file
    // This is tested separately in integration tests
  });

  describe('4. Integration Tests', () => {
    it('should handle complete conversation flow', { timeout: 30000 }, async () => {
      // Step 1: Customer greets
      const greeting = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'خالد',
        message: 'السلام عليكم',
        conversationId: testConversationId,
      });

      expect(greeting).toBeTruthy();
      console.log('Step 1 - Greeting:', greeting);

      // Step 2: Customer asks about products
      const inquiry = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'خالد',
        message: 'عندك جوالات؟',
        conversationId: testConversationId,
      });

      expect(inquiry).toBeTruthy();
      console.log('Step 2 - Product inquiry:', inquiry);

      // Step 3: Customer asks about price
      const priceInquiry = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'خالد',
        message: 'كم سعر آيفون 15؟',
        conversationId: testConversationId,
      });

      expect(priceInquiry).toBeTruthy();
      console.log('Step 3 - Price inquiry:', priceInquiry);

      // Step 4: Customer thanks
      const thanks = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'خالد',
        message: 'شكراً لك',
        conversationId: testConversationId,
      });

      expect(thanks).toBeTruthy();
      console.log('Step 4 - Thanks:', thanks);
    });

    it('should maintain context across messages', { timeout: 30000 }, async () => {
      // First message
      const msg1 = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'فهد',
        message: 'أبغى هدية لأمي',
        conversationId: testConversationId,
      });

      expect(msg1).toBeTruthy();
      console.log('Message 1:', msg1);

      // Follow-up message
      const msg2 = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'فهد',
        message: 'ميزانيتي 500 ريال',
        conversationId: testConversationId,
      });

      expect(msg2).toBeTruthy();
      console.log('Message 2:', msg2);
    });
  });

  describe('5. Error Handling Tests', () => {
    it('should handle invalid merchant ID', async () => {
      const response = await chatWithSari({
        merchantId: 999999,
        customerPhone: '966501234567',
        message: 'مرحباً',
      });

      // Should return fallback message
      expect(response).toBeTruthy();
      expect(response).toContain('عذراً');
    });

    it('should handle empty message', async () => {
      const response = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        message: '',
      });

      expect(response).toBeTruthy();
    });

    it('should handle special characters', async () => {
      const response = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        message: '!@#$%^&*()',
      });

      expect(response).toBeTruthy();
    });
  });

  describe('6. Performance Tests', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now();
      
      await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        message: 'مرحباً',
      });

      const duration = Date.now() - startTime;
      
      // Should respond within 10 seconds
      expect(duration).toBeLessThan(10000);
      console.log(`Response time: ${duration}ms`);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(3).fill(null).map((_, i) => 
        chatWithSari({
          merchantId: testMerchantId,
          customerPhone: `96650123456${i}`,
          message: `مرحباً ${i}`,
        })
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result).toBeTruthy();
      });
    });
  });
});
