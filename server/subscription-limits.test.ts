import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCaller } from './_core/trpc';
import * as db from './db';

describe('Subscription Limits - WhatsApp Numbers & Notifications', () => {
  let testMerchantId: number;
  let testUserId: number;
  let testPlanId: number;

  beforeAll(async () => {
    // Create test user
    const user = await db.createUser({
      openId: `test-openid-${Date.now()}`,
      name: 'Test Merchant Limits',
      email: `test-limits-${Date.now()}@example.com`,
      password: 'hashedpassword',
      role: 'user',
    });
    testUserId = user!.id;

    // Create test merchant
    const merchant = await db.createMerchant({
      userId: testUserId,
      name: 'Test Merchant Limits',
      businessName: 'Test Business Limits',
      phone: '+966500000999',
      email: `merchant-limits-${Date.now()}@example.com`,
    });
    testMerchantId = merchant!.id;

    // Create test plan with limits
    const plan = await db.createSubscriptionPlan({
      name: 'Test Plan with Limits',
      description: 'Plan for testing limits',
      price: 100,
      billingCycle: 'monthly',
      trialDays: 0,
      maxCustomers: 10,
      maxWhatsAppNumbers: 2,
      maxProducts: 100,
      maxCampaignsPerMonth: 10,
      aiMessagesPerMonth: 1000,
      supportLevel: 'email',
      hasAnalytics: true,
      hasAutomation: false,
      hasCalendarIntegration: false,
      hasSheetsIntegration: false,
      hasLoyaltyProgram: false,
      hasABTesting: false,
      hasCustomBranding: false,
      hasApiAccess: false,
      isActive: true,
      isPopular: false,
      displayOrder: 1,
    });
    testPlanId = plan!.id;

    // Create subscription for merchant
    await db.createSubscription({
      merchantId: testMerchantId,
      planId: testPlanId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: false,
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testMerchantId) {
      await db.deleteMerchant(testMerchantId);
    }
    if (testUserId) {
      await db.deleteUser(testUserId);
    }
    if (testPlanId) {
      // Delete plan if needed
    }
  });

  describe('WhatsApp Number Limit Protection', () => {
    it('should allow adding WhatsApp number within limit', async () => {
      const caller = createCaller({ user: { id: testUserId, role: 'user' } });

      // First WhatsApp number should succeed
      const result = await caller.whatsapp.linkWhatsApp({
        instanceId: `test-instance-${Date.now()}`,
        token: 'test-token-1',
        phoneNumber: '+966500001111',
      });

      expect(result.success).toBe(true);
    });

    it('should block adding WhatsApp number when limit reached', async () => {
      const caller = createCaller({ user: { id: testUserId, role: 'user' } });

      // Add second WhatsApp number (should succeed - at limit)
      await caller.whatsapp.linkWhatsApp({
        instanceId: `test-instance-2-${Date.now()}`,
        token: 'test-token-2',
        phoneNumber: '+966500002222',
      });

      // Try to add third WhatsApp number (should fail - over limit)
      await expect(
        caller.whatsapp.linkWhatsApp({
          instanceId: `test-instance-3-${Date.now()}`,
          token: 'test-token-3',
          phoneNumber: '+966500003333',
        })
      ).rejects.toThrow(/الحد الأقصى لأرقام الواتساب/);
    });
  });

  describe('Customer Limit Notifications', () => {
    it('should send notification when reaching 80% of customer limit', async () => {
      // Plan has maxCustomers: 10, so 80% = 8 customers
      // Add 7 customers (70%) - no notification
      for (let i = 1; i <= 7; i++) {
        await db.createConversation({
          merchantId: testMerchantId,
          customerPhone: `+96650000${1000 + i}`,
          customerName: `Test Customer ${i}`,
          lastMessage: 'Test message',
          lastMessageAt: new Date(),
          status: 'active',
        });
      }

      // Check no notification sent yet
      const notificationsBefore = await db.getNotificationRecordsByMerchant(testMerchantId);
      const limitWarnings = notificationsBefore.filter(n => n.type === 'customer_limit_warning');
      expect(limitWarnings.length).toBe(0);

      // Add 8th customer (80%) - should trigger notification
      await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: `+966500002000`,
        customerName: `Test Customer 8`,
        lastMessage: 'Test message',
        lastMessageAt: new Date(),
        status: 'active',
      });

      // Check notification was sent
      const notificationsAfter = await db.getNotificationRecordsByMerchant(testMerchantId);
      const limitWarningsAfter = notificationsAfter.filter(n => n.type === 'customer_limit_warning');
      expect(limitWarningsAfter.length).toBeGreaterThan(0);
    });

    it('should not send duplicate notifications', async () => {
      // Add 9th customer - should not send another notification (already notified at 80%)
      await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: `+966500003000`,
        customerName: `Test Customer 9`,
        lastMessage: 'Test message',
        lastMessageAt: new Date(),
        status: 'active',
      });

      // Check notification count hasn't increased
      const notifications = await db.getNotificationRecordsByMerchant(testMerchantId);
      const limitWarnings = notifications.filter(n => n.type === 'customer_limit_warning');
      expect(limitWarnings.length).toBe(1); // Still only 1 notification
    });

    it('should block adding customer when limit reached', async () => {
      // Try to add 11th customer (over limit of 10)
      await expect(
        db.createConversation({
          merchantId: testMerchantId,
          customerPhone: `+966500004000`,
          customerName: `Test Customer 11`,
          lastMessage: 'Test message',
          lastMessageAt: new Date(),
          status: 'active',
        })
      ).rejects.toThrow(/الحد الأقصى للعملاء/);
    });
  });

  describe('Subscription Guard Helper Functions', () => {
    it('should calculate remaining customer slots correctly', async () => {
      const { getRemainingCustomerSlots } = await import('./helpers/subscriptionGuard');
      const slots = await getRemainingCustomerSlots(testMerchantId);

      expect(slots.max).toBe(10);
      expect(slots.current).toBeGreaterThanOrEqual(8); // At least 8 from previous tests
      expect(slots.remaining).toBeLessThanOrEqual(2);
      expect(slots.percentage).toBeGreaterThanOrEqual(80);
    });

    it('should check WhatsApp number limit correctly', async () => {
      const { checkWhatsAppNumberLimit } = await import('./helpers/subscriptionGuard');

      // Should throw error as we already have 2 numbers (at limit)
      await expect(checkWhatsAppNumberLimit(testMerchantId)).rejects.toThrow(
        /الحد الأقصى لأرقام الواتساب/
      );
    });
  });
});
