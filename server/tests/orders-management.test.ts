import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import * as db from '../db';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Orders Management System', () => {
  let testMerchantId: number;
  let testOrderId: number;
  let testProductId: number;

  beforeAll(async () => {
    // Create test merchant
    const merchant = await db.createMerchant({
      businessName: 'Test Store Orders',
      phoneNumber: '+966501234567',
      userId: 999,
    });
    testMerchantId = merchant.id;

    // Create test product
    const product = await db.createProduct({
      merchantId: testMerchantId,
      name: 'Test Product Orders',
      price: '100.00',
      stock: 10,
    });
    testProductId = product.id;

    // Create test order
    const order = await db.createOrder({
      merchantId: testMerchantId,
      customerName: 'Test Customer',
      customerPhone: '+966501234567',
      totalAmount: '100.00',
      status: 'pending',
      items: JSON.stringify([{ productId: testProductId, quantity: 1, price: '100.00' }]),
    });
    testOrderId = order.id;
  });

  describe('getOrdersWithFilters', () => {
    it('should get orders with search filter', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const result = await caller.orders.getWithFilters({
        merchantId: testMerchantId,
        search: 'Test Customer',
      });

      expect(result.orders.length).toBeGreaterThan(0);
      expect(result.orders[0].customerName).toContain('Test');
    });

    it('should get orders with status filter', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const result = await caller.orders.getWithFilters({
        merchantId: testMerchantId,
        status: 'pending',
      });

      expect(result.orders.length).toBeGreaterThan(0);
      expect(result.orders[0].status).toBe('pending');
    });

    it('should return pagination info', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const result = await caller.orders.getWithFilters({
        merchantId: testMerchantId,
      });

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(typeof result.total).toBe('number');
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const stats = await caller.orders.getStats({
        merchantId: testMerchantId,
      });

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('confirmed');
      expect(stats).toHaveProperty('shipped');
      expect(stats).toHaveProperty('delivered');
      expect(stats).toHaveProperty('cancelled');
      expect(typeof stats.total).toBe('number');
    });

    it('should have correct sum of all statuses', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const stats = await caller.orders.getStats({
        merchantId: testMerchantId,
      });

      const sum = stats.pending + stats.confirmed + stats.shipped + stats.delivered + stats.cancelled;
      expect(sum).toBe(stats.total);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const result = await caller.orders.cancel({
        orderId: testOrderId,
        merchantId: testMerchantId,
      });

      expect(result.success).toBe(true);

      // Verify order status changed
      const order = await db.getOrderById(testOrderId, testMerchantId);
      expect(order.status).toBe('cancelled');
    });

    it('should not cancel already delivered order', async () => {
      // Create delivered order
      const deliveredOrder = await db.createOrder({
        merchantId: testMerchantId,
        customerName: 'Delivered Customer',
        customerPhone: '+966501234567',
        totalAmount: '200.00',
        status: 'delivered',
        items: JSON.stringify([{ productId: testProductId, quantity: 2, price: '200.00' }]),
      });

      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      await expect(
        caller.orders.cancel({
          orderId: deliveredOrder.id,
          merchantId: testMerchantId,
        })
      ).rejects.toThrow();
    });

    it('should not cancel non-existent order', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      await expect(
        caller.orders.cancel({
          orderId: 999999, // Non-existent order
          merchantId: testMerchantId,
        })
      ).rejects.toThrow();
    });
  });

  describe('Orders Integration', () => {
    it('should get orders with filters', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const result = await caller.orders.getWithFilters({
        merchantId: testMerchantId,
      });

      expect(result.orders).toBeDefined();
      expect(Array.isArray(result.orders)).toBe(true);
    });

    it('should get order statistics', async () => {
      const caller = appRouter.createCaller({
        user: { id: 999, role: 'merchant' as const },
      });

      const stats = await caller.orders.getStats({
        merchantId: testMerchantId,
      });

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
    });
  });
});
