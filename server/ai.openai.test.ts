/**
 * Tests for OpenAI Integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testOpenAIConnection, callGPT4 } from './ai/openai';
import { chatWithSari, generateWelcomeMessage, analyzeCustomerIntent } from './ai/sari-personality';
import { searchProducts, suggestProducts, formatProductsForWhatsApp } from './ai/product-intelligence';
import * as db from './db';

describe('OpenAI Integration Tests', () => {
  let testMerchantId: number;
  let testConversationId: number;

  beforeAll(async () => {
    // Get or create test merchant
    const merchants = await db.getAllMerchants();
    if (merchants.length > 0) {
      testMerchantId = merchants[0].id;
    } else {
      // Create test merchant if none exists
      const users = await db.getAllUsers();
      if (users.length > 0) {
        const merchant = await db.createMerchant({
          userId: users[0].id,
          businessName: 'Test Store',
          phone: '966501234567',
          status: 'active',
        });
        testMerchantId = merchant.id;
      }
    }

    // Get or create test conversation
    const conversations = await db.getConversationsByMerchantId(testMerchantId);
    if (conversations.length > 0) {
      testConversationId = conversations[0].id;
    } else {
      const conversation = await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'Test Customer',
        lastMessageAt: new Date(),
        status: 'active',
      });
      testConversationId = conversation.id;
    }
  });

  describe('OpenAI Connection', () => {
    it('should connect to OpenAI successfully', async () => {
      const isConnected = await testOpenAIConnection();
      expect(isConnected).toBe(true);
    }, 30000); // 30 second timeout

    it('should call GPT-4 and get response', async () => {
      const response = await callGPT4([
        { role: 'user', content: 'Say "Hello World"' }
      ], { maxTokens: 20 });
      
      expect(response).toBeTruthy();
      expect(response.toLowerCase()).toContain('hello');
    }, 30000);
  });

  describe('Sari Personality', () => {
    it('should generate welcome message', async () => {
      const message = await generateWelcomeMessage({
        merchantId: testMerchantId,
        customerName: 'أحمد',
      });
      
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(10);
      console.log('Welcome message:', message);
    }, 30000);

    it('should chat with Sari', async () => {
      const response = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        customerName: 'أحمد',
        message: 'السلام عليكم، أبغى أشوف المنتجات',
        conversationId: testConversationId,
      });
      
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(10);
      console.log('Sari response:', response);
    }, 30000);

    it('should analyze customer intent - greeting', async () => {
      const analysis = await analyzeCustomerIntent('السلام عليكم');
      
      expect(analysis.intent).toBe('greeting');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      console.log('Intent analysis:', analysis);
    }, 30000);

    it('should analyze customer intent - product inquiry', async () => {
      const analysis = await analyzeCustomerIntent('عندكم جوالات آيفون؟');
      
      expect(analysis.intent).toBe('product_inquiry');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      console.log('Intent analysis:', analysis);
    }, 30000);

    it('should analyze customer intent - price inquiry', async () => {
      const analysis = await analyzeCustomerIntent('كم سعر هذا المنتج؟');
      
      expect(analysis.intent).toBe('price_inquiry');
      expect(analysis.confidence).toBeGreaterThan(0.5);
      console.log('Intent analysis:', analysis);
    }, 30000);
  });

  describe('Product Intelligence', () => {
    it('should search products by keyword', async () => {
      const products = await searchProducts({
        merchantId: testMerchantId,
        query: 'منتج',
        limit: 5,
      });
      
      expect(Array.isArray(products)).toBe(true);
      console.log(`Found ${products.length} products`);
    }, 30000);

    it('should suggest products based on context', async () => {
      const result = await suggestProducts({
        merchantId: testMerchantId,
        conversationContext: 'العميل يبحث عن هدية لصديقه',
        limit: 3,
      });
      
      expect(Array.isArray(result.products)).toBe(true);
      expect(result.reasoning).toBeTruthy();
      console.log('Suggested products:', result.products.length);
      console.log('Reasoning:', result.reasoning);
    }, 30000);

    it('should format products for WhatsApp', () => {
      const mockProducts = [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          description: 'أحدث إصدار من آيفون',
          price: 4999,
          stock: 10,
        },
        {
          id: 2,
          name: 'Samsung Galaxy S24',
          description: 'هاتف سامسونج الرائد',
          price: 3999,
          stock: 5,
        },
      ];

      const formatted = formatProductsForWhatsApp(mockProducts);
      
      expect(formatted).toContain('iPhone 15 Pro');
      expect(formatted).toContain('4999 ريال');
      expect(formatted).toContain('Samsung Galaxy S24');
      console.log('Formatted message:\n', formatted);
    });

    it('should handle empty product list', () => {
      const formatted = formatProductsForWhatsApp([]);
      
      expect(formatted).toContain('للأسف');
    });
  });

  describe('Edge Cases', () => {
    it('should handle Arabic text correctly', async () => {
      const response = await callGPT4([
        { role: 'user', content: 'قل "مرحباً بالعالم" بالعربية' }
      ], { maxTokens: 20 });
      
      expect(response).toBeTruthy();
      console.log('Arabic response:', response);
    }, 30000);

    it('should handle long conversations', async () => {
      const longMessage = 'أبغى منتج ' + 'ممتاز '.repeat(50);
      
      const response = await chatWithSari({
        merchantId: testMerchantId,
        customerPhone: '966501234567',
        message: longMessage,
      });
      
      expect(response).toBeTruthy();
    }, 30000);

    it('should handle invalid merchant ID gracefully', async () => {
      const response = await chatWithSari({
        merchantId: 999999,
        customerPhone: '966501234567',
        message: 'test',
      });
      
      // Should return fallback error message
      expect(response).toContain('عذراً');
    }, 30000);
  });
});
