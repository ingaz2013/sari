/**
 * Tests for Usage Tracking System
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import {
  hasReachedConversationLimit,
  hasReachedMessageLimit,
  hasReachedVoiceMessageLimit,
  incrementConversationUsage,
  incrementMessageUsage,
  incrementVoiceMessageUsage,
  getUsageStats,
  isApproachingLimit,
} from './usage-tracking';

describe('Usage Tracking System Tests', () => {
  let testMerchantId: number;
  let testPlanId: number;
  let testSubscriptionId: number;

  beforeAll(async () => {
    // Get or create test merchant
    const merchants = await db.getAllMerchants();
    if (merchants.length > 0) {
      testMerchantId = merchants[0].id;
    } else {
      const users = await db.getAllUsers();
      if (users.length > 0) {
        const merchant = await db.createMerchant({
          userId: users[0].id,
          businessName: 'Test Store',
          phone: '966501234567',
          status: 'active',
        });
        if (merchant) {
          testMerchantId = merchant.id;
        }
      }
    }

    // Get or create test plan
    const plans = await db.getAllPlans();
    if (plans.length > 0) {
      testPlanId = plans[0].id;
    } else {
      const plan = await db.createPlan({
        name: 'Test Plan',
        nameAr: 'باقة تجريبية',
        priceMonthly: 100,
        conversationLimit: 10,
        voiceMessageLimit: 5,
        features: JSON.stringify(['test']),
        isActive: true,
      });
      if (plan) {
        testPlanId = plan.id;
      }
    }

    // Create test subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await db.createSubscription({
      merchantId: testMerchantId,
      planId: testPlanId,
      status: 'active',
      conversationsUsed: 0,
      messagesUsed: 0,
      voiceMessagesUsed: 0,
      startDate,
      endDate,
      autoRenew: true,
    });

    if (subscription) {
      testSubscriptionId = subscription.id;
    }
  });

  describe('Limit Checking', () => {
    it('should return false when under conversation limit', async () => {
      const reached = await hasReachedConversationLimit(testMerchantId);
      expect(reached).toBe(false);
    });

    it('should return false when under message limit', async () => {
      const reached = await hasReachedMessageLimit(testMerchantId);
      expect(reached).toBe(false);
    });

    it('should return false when under voice message limit', async () => {
      const reached = await hasReachedVoiceMessageLimit(testMerchantId);
      expect(reached).toBe(false);
    });
  });

  describe('Usage Increment', () => {
    it('should increment conversation usage', async () => {
      const before = await getUsageStats(testMerchantId);
      const beforeCount = before?.conversations.used || 0;

      await incrementConversationUsage(testMerchantId);

      const after = await getUsageStats(testMerchantId);
      const afterCount = after?.conversations.used || 0;

      expect(afterCount).toBe(beforeCount + 1);
    });

    it('should increment message usage', async () => {
      const before = await getUsageStats(testMerchantId);
      const beforeCount = before?.messages.used || 0;

      await incrementMessageUsage(testMerchantId);

      const after = await getUsageStats(testMerchantId);
      const afterCount = after?.messages.used || 0;

      expect(afterCount).toBe(beforeCount + 1);
    });

    it('should increment voice message usage', async () => {
      const before = await getUsageStats(testMerchantId);
      const beforeCount = before?.voiceMessages.used || 0;

      await incrementVoiceMessageUsage(testMerchantId);

      const after = await getUsageStats(testMerchantId);
      const afterCount = after?.voiceMessages.used || 0;

      expect(afterCount).toBe(beforeCount + 1);
    });
  });

  describe('Usage Statistics', () => {
    it('should return usage stats', async () => {
      const stats = await getUsageStats(testMerchantId);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('conversations');
      expect(stats).toHaveProperty('messages');
      expect(stats).toHaveProperty('voiceMessages');
      expect(stats).toHaveProperty('lastResetAt');
      expect(stats).toHaveProperty('nextResetAt');
    });

    it('should calculate percentage correctly', async () => {
      const stats = await getUsageStats(testMerchantId);

      if (stats && !stats.conversations.unlimited) {
        const expectedPercentage = (stats.conversations.used / stats.conversations.limit) * 100;
        expect(stats.conversations.percentage).toBeCloseTo(expectedPercentage, 1);
      }
    });

    it('should identify unlimited plans', async () => {
      const stats = await getUsageStats(testMerchantId);

      if (stats) {
        // Messages are unlimited in current schema
        expect(stats.messages.unlimited).toBe(true);
      }
    });
  });

  describe('Approaching Limit Detection', () => {
    it('should detect when not approaching limit', async () => {
      // Reset usage to low level
      await db.updateSubscription(testSubscriptionId, {
        conversationsUsed: 1,
        messagesUsed: 1,
        voiceMessagesUsed: 1,
      });

      const result = await isApproachingLimit(testMerchantId);

      expect(result.approaching).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect when approaching conversation limit', async () => {
      // Set usage to 85% (above 80% threshold)
      const plan = await db.getPlanById(testPlanId);
      if (plan) {
        const highUsage = Math.ceil(plan.conversationLimit * 0.85);

        await db.updateSubscription(testSubscriptionId, {
          conversationsUsed: highUsage,
        });

        const result = await isApproachingLimit(testMerchantId);

        expect(result.approaching).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('المحادثات');
      }
    });
  });

  describe('Limit Enforcement', () => {
    it('should block when conversation limit reached', async () => {
      // Set usage to limit
      const plan = await db.getPlanById(testPlanId);
      if (plan) {
        await db.updateSubscription(testSubscriptionId, {
          conversationsUsed: plan.conversationLimit,
        });

        const reached = await hasReachedConversationLimit(testMerchantId);

        expect(reached).toBe(true);
      }
    });

    it('should block when voice message limit reached', async () => {
      // Set usage to limit
      const plan = await db.getPlanById(testPlanId);
      if (plan) {
        await db.updateSubscription(testSubscriptionId, {
          voiceMessagesUsed: plan.voiceMessageLimit,
        });

        const reached = await hasReachedVoiceMessageLimit(testMerchantId);

        expect(reached).toBe(true);
      }
    });

    it('should not block unlimited messages', async () => {
      // Messages are unlimited (-1)
      await db.updateSubscription(testSubscriptionId, {
        messagesUsed: 999999,
      });

      const reached = await hasReachedMessageLimit(testMerchantId);

      expect(reached).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle merchant without subscription', async () => {
      const nonExistentMerchantId = 999999;

      const reached = await hasReachedConversationLimit(nonExistentMerchantId);

      // Should block if no subscription
      expect(reached).toBe(true);
    });

    it('should return null stats for merchant without subscription', async () => {
      const nonExistentMerchantId = 999999;

      const stats = await getUsageStats(nonExistentMerchantId);

      expect(stats).toBeNull();
    });
  });
});
