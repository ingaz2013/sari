/**
 * Test Sari AI Playground APIs
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import bcrypt from 'bcryptjs';

describe('Test Sari AI Playground', () => {
  let testUserId: number;
  let testMerchantId: number;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const user = await db.createUser({
      openId: `test-sari-${Date.now()}`,
      name: 'Test Merchant',
      email: `testsari${Date.now()}@test.com`,
      password: hashedPassword,
      role: 'user',
    });
    testUserId = user.id;

    // Create test merchant
    const merchant = await db.createMerchant({
      userId: testUserId,
      businessName: 'Test Store',
      phone: '+966501234567',
      planId: 1,
    });
    testMerchantId = merchant.id;

    // Create some test products
    await db.createProduct({
      merchantId: testMerchantId,
      name: 'ساعة ذكية',
      description: 'ساعة ذكية مع شاشة AMOLED',
      price: 299,
      stock: 10,
      category: 'Electronics',
    });

    await db.createProduct({
      merchantId: testMerchantId,
      name: 'عطر فاخر',
      description: 'عطر رجالي فاخر',
      price: 450,
      stock: 5,
      category: 'Perfumes',
    });
  });

  afterAll(async () => {
    // Cleanup - products will be deleted by cascade
    // No need to manually delete merchant or user
  });

  it('should have chatWithSari function', async () => {
    const { chatWithSari } = await import('./ai/sari-personality');
    expect(chatWithSari).toBeDefined();
    expect(typeof chatWithSari).toBe('function');
  });

  it('should generate AI response for test message', async () => {
    const { chatWithSari } = await import('./ai/sari-personality');
    
    const response = await chatWithSari({
      merchantId: testMerchantId,
      customerPhone: 'test-playground',
      customerName: 'عميل تجريبي',
      message: 'مرحباً',
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle product inquiry', async () => {
    const { chatWithSari } = await import('./ai/sari-personality');
    
    const response = await chatWithSari({
      merchantId: testMerchantId,
      customerPhone: 'test-playground',
      customerName: 'عميل تجريبي',
      message: 'عندك ساعات؟',
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle price inquiry', async () => {
    const { chatWithSari } = await import('./ai/sari-personality');
    
    const response = await chatWithSari({
      merchantId: testMerchantId,
      customerPhone: 'test-playground',
      customerName: 'عميل تجريبي',
      message: 'كم سعر العطر؟',
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should return fallback message on error', async () => {
    const { chatWithSari } = await import('./ai/sari-personality');
    
    // Test with invalid merchant ID
    const response = await chatWithSari({
      merchantId: 999999,
      customerPhone: 'test-playground',
      customerName: 'عميل تجريبي',
      message: 'مرحباً',
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    // Should return fallback message
    expect(response).toContain('عذراً');
  });
});
