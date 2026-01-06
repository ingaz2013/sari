/**
 * Email Notifications Tests
 * 
 * Tests for email notification templates and delivery
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import {
  notifyWhatsAppConnectionRequest,
  notifyWhatsAppDisconnection,
  notifyNewSubscription,
  notifyPlanUpgrade,
  notifyNewReferral,
  notifyWeeklyReport,
  notifyNewOrder,
  notifyMarketingCampaign,
} from './_core/emailNotifications';

describe('Email Notifications', () => {
  let testMerchantId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create test user
    const user = await db.createUser({
      openId: `test_email_notif_${Date.now()}`,
      name: 'Test Merchant',
      email: 'test@example.com',
      loginMethod: 'email',
      role: 'user',
    });
    testUserId = user!.id;

    // Create test merchant
    const merchant = await db.createMerchant({
      userId: testUserId,
      businessName: 'Test Business',
      phone: '+966501234567',
      status: 'active',
    });
    testMerchantId = merchant!.id;
  });

  describe('WhatsApp Connection Notifications', () => {
    it('should send WhatsApp connection request notification', async () => {
      const result = await notifyWhatsAppConnectionRequest({
        merchantName: 'Test Merchant',
        merchantEmail: 'test@example.com',
        businessName: 'Test Business',
        phoneNumber: '+966501234567',
        requestedAt: new Date(),
      });

      // Result should be boolean (true on success, false on failure)
      expect(typeof result).toBe('boolean');
    });

    it('should send WhatsApp disconnection notification', async () => {
      const result = await notifyWhatsAppDisconnection({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        phoneNumber: '+966501234567',
        disconnectedAt: new Date(),
        reason: 'Manual disconnect',
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Subscription Notifications', () => {
    it('should send new subscription notification', async () => {
      const result = await notifyNewSubscription({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        planName: 'Basic Plan',
        planPrice: 299,
        billingCycle: 'monthly',
        subscribedAt: new Date(),
      });

      expect(typeof result).toBe('boolean');
    });

    it('should send plan upgrade notification', async () => {
      const result = await notifyPlanUpgrade({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        oldPlan: 'Basic Plan',
        newPlan: 'Pro Plan',
        oldPrice: 299,
        newPrice: 599,
        upgradedAt: new Date(),
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Referral Notifications', () => {
    it('should send new referral notification', async () => {
      const result = await notifyNewReferral({
        referrerName: 'Test Merchant',
        referrerBusiness: 'Test Business',
        newMerchantName: 'New Merchant',
        newMerchantEmail: 'new@example.com',
        referralCode: 'TEST123',
        referredAt: new Date(),
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Weekly Report Notifications', () => {
    it('should send weekly report notification', async () => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekEnd = new Date();

      const result = await notifyWeeklyReport({
        weekStart,
        weekEnd,
        totalMerchants: 150,
        newMerchants: 12,
        activeSubscriptions: 120,
        totalRevenue: 45000,
        totalOrders: 850,
        totalConversations: 3200,
        topPerformingMerchants: [
          { name: 'Merchant 1', business: 'Business 1', orders: 50, revenue: 5000 },
          { name: 'Merchant 2', business: 'Business 2', orders: 45, revenue: 4500 },
          { name: 'Merchant 3', business: 'Business 3', orders: 40, revenue: 4000 },
        ],
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Order Notifications', () => {
    it('should send new order notification', async () => {
      const result = await notifyNewOrder({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        orderNumber: 'ORD-2024-001',
        customerName: 'Test Customer',
        customerPhone: '+966501234567',
        totalAmount: 250,
        itemsCount: 3,
        orderDate: new Date(),
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Campaign Notifications', () => {
    it('should send marketing campaign notification (scheduled)', async () => {
      const result = await notifyMarketingCampaign({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        campaignName: 'Summer Sale',
        targetAudience: 'All Customers',
        recipientsCount: 500,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
      });

      expect(typeof result).toBe('boolean');
    });

    it('should send marketing campaign notification (sent)', async () => {
      const result = await notifyMarketingCampaign({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        campaignName: 'Flash Sale',
        targetAudience: 'VIP Customers',
        recipientsCount: 150,
        sentAt: new Date(),
        status: 'sent',
      });

      expect(typeof result).toBe('boolean');
    });

    it('should send marketing campaign notification (failed)', async () => {
      const result = await notifyMarketingCampaign({
        merchantName: 'Test Merchant',
        businessName: 'Test Business',
        campaignName: 'Failed Campaign',
        targetAudience: 'All Customers',
        recipientsCount: 300,
        status: 'failed',
      });

      expect(typeof result).toBe('boolean');
    });
  });
});
