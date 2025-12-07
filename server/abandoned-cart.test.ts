/**
 * Abandoned Cart Recovery System Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { 
  trackAbandonedCart, 
  generateRecoveryDiscount,
  generateReminderMessage,
  getCartRecoveryStats,
  isProductSelectionMessage
} from './automation/abandoned-cart-recovery';

describe('Abandoned Cart Recovery System', () => {
  let testMerchantId: number;
  let testProductId: number;

  beforeAll(async () => {
    // Create test merchant
    const merchant = await db.createMerchant({
      userId: 999,
      businessName: 'Test Store for Abandoned Carts',
      phoneNumber: '+966500000999',
      status: 'active',
      autoReplyEnabled: true,
    });
    testMerchantId = merchant!.id;

    // Create test product
    const product = await db.createProduct({
      merchantId: testMerchantId,
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      isAvailable: true,
    });
    testProductId = product!.id;
  });

  afterAll(async () => {
    // Cleanup - merchants will be cleaned up automatically
  });

  describe('trackAbandonedCart', () => {
    it('should create a new abandoned cart', async () => {
      const items = [
        {
          productId: testProductId,
          productName: 'Test Product',
          quantity: 2,
          price: 100,
        },
      ];

      const cartId = await trackAbandonedCart(
        testMerchantId,
        '+966500001111',
        'Test Customer',
        items,
        200
      );

      expect(cartId).toBeGreaterThan(0);

      const cart = await db.getAbandonedCartById(cartId);
      expect(cart).toBeDefined();
      expect(cart?.customerPhone).toBe('+966500001111');
      expect(cart?.totalAmount).toBe(200);
      expect(cart?.reminderSent).toBe(false);
      expect(cart?.recovered).toBe(false);
    });

    it('should return existing cart if already tracked', async () => {
      const items = [
        {
          productId: testProductId,
          productName: 'Test Product',
          quantity: 1,
          price: 100,
        },
      ];

      const cartId1 = await trackAbandonedCart(
        testMerchantId,
        '+966500002222',
        'Test Customer 2',
        items,
        100
      );

      const cartId2 = await trackAbandonedCart(
        testMerchantId,
        '+966500002222',
        'Test Customer 2',
        items,
        100
      );

      expect(cartId1).toBe(cartId2);
    });
  });

  describe('generateRecoveryDiscount', () => {
    it('should create a discount code for cart recovery', async () => {
      const code = await generateRecoveryDiscount(testMerchantId, '+966500003333');

      expect(code).toBeDefined();
      expect(code).toMatch(/^CART\d{8}$/);

      // Verify discount code exists in database
      const db_instance = await db.getDb();
      if (!db_instance) throw new Error('Database not available');

      const { discountCodes } = await import('../drizzle/schema.js');
      const { eq } = await import('drizzle-orm');

      const discounts = await db_instance
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.code, code));

      expect(discounts.length).toBe(1);
      expect(discounts[0].type).toBe('percentage');
      expect(discounts[0].value).toBe(10);
      expect(discounts[0].maxUses).toBe(1);
    });
  });

  describe('generateReminderMessage', () => {
    it('should generate reminder message with customer name', () => {
      const items = [
        { productName: 'Product 1', quantity: 2, price: 100 },
        { productName: 'Product 2', quantity: 1, price: 50 },
      ];

      const message = generateReminderMessage('أحمد', items, 250, 'CART12345678');

      expect(message).toContain('مرحباً أحمد!');
      expect(message).toContain('Product 1 (2x) - 100 ريال');
      expect(message).toContain('Product 2 (1x) - 50 ريال');
      expect(message).toContain('250 ريال');
      expect(message).toContain('CART12345678');
      expect(message).toContain('225 ريال'); // After 10% discount
    });

    it('should generate reminder message without customer name', () => {
      const items = [{ productName: 'Product 1', quantity: 1, price: 100 }];

      const message = generateReminderMessage(null, items, 100, 'CART87654321');

      expect(message).toContain('مرحباً!');
      expect(message).toContain('Product 1 (1x) - 100 ريال');
      expect(message).toContain('CART87654321');
    });
  });

  describe('getCartRecoveryStats', () => {
    it('should return correct statistics', async () => {
      // Create test carts
      const items = [{ productId: testProductId, productName: 'Test', quantity: 1, price: 100 }];

      const cart1 = await trackAbandonedCart(
        testMerchantId,
        '+966500004444',
        'Customer 1',
        items,
        100
      );

      const cart2 = await trackAbandonedCart(
        testMerchantId,
        '+966500005555',
        'Customer 2',
        items,
        200
      );

      // Mark one as reminder sent
      await db.markAbandonedCartReminderSent(cart1);

      // Mark one as recovered
      await db.markAbandonedCartRecovered(cart2);

      const stats = await getCartRecoveryStats(testMerchantId);

      expect(stats.totalAbandoned).toBeGreaterThanOrEqual(2);
      expect(stats.remindersSent).toBeGreaterThanOrEqual(1);
      expect(stats.recovered).toBeGreaterThanOrEqual(1);
      expect(stats.totalRecoveredValue).toBeGreaterThanOrEqual(200);
    });
  });

  describe('isProductSelectionMessage', () => {
    it('should detect product selection messages', () => {
      expect(isProductSelectionMessage('أريد جوال آيفون')).toBe(true);
      expect(isProductSelectionMessage('أبي سماعة بلوتوث')).toBe(true);
      expect(isProductSelectionMessage('أبغى لابتوب')).toBe(true);
      expect(isProductSelectionMessage('عندك ساعة ذكية؟')).toBe(true);
      expect(isProductSelectionMessage('كم سعر الجوال؟')).toBe(true);
      expect(isProductSelectionMessage('بكم السماعة؟')).toBe(true);
      expect(isProductSelectionMessage('متوفر عندكم؟')).toBe(true);
      expect(isProductSelectionMessage('موجود؟')).toBe(true);
    });

    it('should not detect non-product messages', () => {
      expect(isProductSelectionMessage('مرحباً')).toBe(false);
      expect(isProductSelectionMessage('شكراً')).toBe(false);
      expect(isProductSelectionMessage('وين موقعكم؟')).toBe(false);
      expect(isProductSelectionMessage('كيف أطلب؟')).toBe(false);
    });
  });

  describe('Database Functions', () => {
    it('should create and retrieve abandoned cart', async () => {
      const items = [{ productId: 1, productName: 'Test', quantity: 1, price: 100 }];

      const cart = await db.createAbandonedCart({
        merchantId: testMerchantId,
        customerPhone: '+966500006666',
        customerName: 'Test Customer',
        items: JSON.stringify(items),
        totalAmount: 100,
        reminderSent: false,
        recovered: false,
      });

      expect(cart).toBeDefined();
      expect(cart?.customerPhone).toBe('+966500006666');

      const retrieved = await db.getAbandonedCartById(cart!.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(cart?.id);
    });

    it('should get abandoned carts by merchant', async () => {
      const carts = await db.getAbandonedCartsByMerchantId(testMerchantId);
      expect(carts).toBeDefined();
      expect(Array.isArray(carts)).toBe(true);
      expect(carts.length).toBeGreaterThan(0);
    });

    it('should mark cart reminder as sent', async () => {
      const items = [{ productId: 1, productName: 'Test', quantity: 1, price: 100 }];

      const cart = await db.createAbandonedCart({
        merchantId: testMerchantId,
        customerPhone: '+966500007777',
        customerName: 'Test Customer',
        items: JSON.stringify(items),
        totalAmount: 100,
        reminderSent: false,
        recovered: false,
      });

      await db.markAbandonedCartReminderSent(cart!.id);

      const updated = await db.getAbandonedCartById(cart!.id);
      expect(updated?.reminderSent).toBe(true);
    });

    it('should mark cart as recovered', async () => {
      const items = [{ productId: 1, productName: 'Test', quantity: 1, price: 100 }];

      const cart = await db.createAbandonedCart({
        merchantId: testMerchantId,
        customerPhone: '+966500008888',
        customerName: 'Test Customer',
        items: JSON.stringify(items),
        totalAmount: 100,
        reminderSent: false,
        recovered: false,
      });

      await db.markAbandonedCartRecovered(cart!.id);

      const updated = await db.getAbandonedCartById(cart!.id);
      expect(updated?.recovered).toBe(true);
    });

    it('should get pending abandoned carts (older than 24 hours)', async () => {
      const carts = await db.getPendingAbandonedCarts();
      expect(carts).toBeDefined();
      expect(Array.isArray(carts)).toBe(true);
      // Note: This test might return 0 carts if no carts are older than 24 hours
    });
  });
});
