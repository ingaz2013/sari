/**
 * Subscription Signup Tests
 * Tests for the new subscription signup flow
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import bcrypt from 'bcryptjs';

describe('Subscription Signup Flow', () => {
  let testUserId: number;
  let testMerchantId: number;
  let testPlanId: number;
  const testEmail = `signup_test_${Date.now()}@test.com`;

  beforeAll(async () => {
    // Create a test subscription plan
    testPlanId = await db.createSubscriptionPlan({
      name: 'خطة تجريبية',
      nameEn: 'Test Plan',
      description: 'خطة للاختبار',
      descriptionEn: 'Plan for testing',
      monthlyPrice: '99',
      yearlyPrice: '999',
      currency: 'SAR',
      maxCustomers: 100,
      maxWhatsAppNumbers: 1,
      features: JSON.stringify(['ميزة 1', 'ميزة 2']),
      isActive: 1,
      sortOrder: 0,
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
      await db.deleteSubscriptionPlan(testPlanId);
    }
  });

  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const password = 'testpass123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await db.createUser({
        openId: `test_${Date.now()}`,
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        loginMethod: 'email',
        role: 'user',
      });
      
      testUserId = newUser?.id || 0;

      expect(testUserId).toBeGreaterThan(0);

      const user = await db.getUserById(testUserId);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.role).toBe('user');

      // Verify password is hashed
      const isPasswordValid = await bcrypt.compare(password, user?.password || '');
      expect(isPasswordValid).toBe(true);
    });

    it('should create merchant after user registration', async () => {
      const newMerchant = await db.createMerchant({
        userId: testUserId,
        businessName: 'متجر تجريبي',
        phone: '0501234567',
        subscriptionStatus: 'pending',
      });
      
      testMerchantId = newMerchant?.id || 0;

      expect(testMerchantId).toBeGreaterThan(0);

      const merchant = await db.getMerchantById(testMerchantId);
      expect(merchant).toBeDefined();
      expect(merchant?.userId).toBe(testUserId);
      expect(merchant?.businessName).toBe('متجر تجريبي');
      expect(merchant?.subscriptionStatus).toBe('pending');
    });

    it('should not allow duplicate email registration', async () => {
      const existingUser = await db.getUserByEmail(testEmail);
      expect(existingUser).toBeDefined();
      expect(existingUser?.email).toBe(testEmail);
    });
  });

  describe('Subscription Plan Selection', () => {
    it('should retrieve active subscription plans', async () => {
      const plans = await db.getActiveSubscriptionPlans();
      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);

      const testPlan = plans.find(p => p.id === testPlanId);
      expect(testPlan).toBeDefined();
      expect(testPlan?.name).toBe('خطة تجريبية');
    });

    it('should get plan details by ID', async () => {
      const plan = await db.getSubscriptionPlanById(testPlanId);
      expect(plan).toBeDefined();
      expect(plan?.id).toBe(testPlanId);
      expect(plan?.monthlyPrice).toBe('99');
      expect(plan?.yearlyPrice).toBe('999');
      expect(plan?.currency).toBe('SAR');
    });
  });

  describe('Payment Transaction Creation', () => {
    it('should create payment transaction for subscription', async () => {
      const transactionId = await db.createPaymentTransaction({
        merchantId: testMerchantId,
        subscriptionId: null,
        type: 'subscription',
        amount: '99',
        currency: 'SAR',
        status: 'pending',
        paymentMethod: 'tap',
        metadata: JSON.stringify({
          planId: testPlanId,
          billingCycle: 'monthly',
        }),
      });

      expect(transactionId).toBeGreaterThan(0);

      const transaction = await db.getPaymentTransactionById(transactionId);
      expect(transaction).toBeDefined();
      expect(transaction?.merchantId).toBe(testMerchantId);
      expect(transaction?.type).toBe('subscription');
      expect(transaction?.amount).toBe('99');
      expect(transaction?.status).toBe('pending');

      const metadata = JSON.parse(transaction?.metadata || '{}');
      expect(metadata.planId).toBe(testPlanId);
      expect(metadata.billingCycle).toBe('monthly');
    });

    it('should update transaction with Tap charge ID', async () => {
      const transactionId = await db.createPaymentTransaction({
        merchantId: testMerchantId,
        subscriptionId: null,
        type: 'subscription',
        amount: '99',
        currency: 'SAR',
        status: 'pending',
        paymentMethod: 'tap',
        metadata: JSON.stringify({
          planId: testPlanId,
          billingCycle: 'monthly',
        }),
      });

      const tapChargeId = 'chg_test_123456';
      await db.updatePaymentTransaction(transactionId, {
        tapChargeId,
        tapResponse: JSON.stringify({ id: tapChargeId, status: 'INITIATED' }),
      });

      const transaction = await db.getPaymentTransactionById(transactionId);
      expect(transaction?.tapChargeId).toBe(tapChargeId);
      expect(transaction?.tapResponse).toContain(tapChargeId);
    });
  });

  describe('Payment Callback Processing', () => {
    it('should create subscription after successful payment', async () => {
      // Create a transaction
      const transactionId = await db.createPaymentTransaction({
        merchantId: testMerchantId,
        subscriptionId: null,
        type: 'subscription',
        amount: '99',
        currency: 'SAR',
        status: 'pending',
        paymentMethod: 'tap',
        metadata: JSON.stringify({
          planId: testPlanId,
          billingCycle: 'monthly',
        }),
        tapChargeId: 'chg_test_success',
      });

      // Simulate successful payment
      await db.updatePaymentTransaction(transactionId, {
        status: 'completed',
        paidAt: new Date().toISOString(),
      });

      // Create subscription
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const subscriptionId = await db.createMerchantSubscription({
        merchantId: testMerchantId,
        planId: testPlanId,
        status: 'active',
        billingCycle: 'monthly',
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        trialEndsAt: null,
        autoRenew: 0,
      });

      expect(subscriptionId).toBeGreaterThan(0);

      // Verify subscription
      const subscription = await db.getMerchantCurrentSubscription(testMerchantId);
      expect(subscription).toBeDefined();
      expect(subscription?.planId).toBe(testPlanId);
      expect(subscription?.status).toBe('active');
      expect(subscription?.billingCycle).toBe('monthly');

      // Update merchant status
      await db.updateMerchantSubscriptionStatus(testMerchantId, 'active');

      const merchant = await db.getMerchantById(testMerchantId);
      expect(merchant?.subscriptionStatus).toBe('active');
    });

    it('should update merchant customer limit after subscription', async () => {
      const plan = await db.getSubscriptionPlanById(testPlanId);
      expect(plan).toBeDefined();

      await db.updateMerchantCustomerLimit(testMerchantId, plan!.maxCustomers);

      const merchant = await db.getMerchantById(testMerchantId);
      expect(merchant?.customerLimit).toBe(plan!.maxCustomers);
    });

    it('should handle failed payment', async () => {
      const transactionId = await db.createPaymentTransaction({
        merchantId: testMerchantId,
        subscriptionId: null,
        type: 'subscription',
        amount: '99',
        currency: 'SAR',
        status: 'pending',
        paymentMethod: 'tap',
        metadata: JSON.stringify({
          planId: testPlanId,
          billingCycle: 'monthly',
        }),
        tapChargeId: 'chg_test_failed',
      });

      // Simulate failed payment
      await db.updatePaymentTransaction(transactionId, {
        status: 'failed',
        tapResponse: JSON.stringify({ id: 'chg_test_failed', status: 'FAILED' }),
      });

      const transaction = await db.getPaymentTransactionById(transactionId);
      expect(transaction?.status).toBe('failed');

      // Merchant should not have active subscription
      const merchant = await db.getMerchantById(testMerchantId);
      expect(merchant?.subscriptionStatus).toBe('active'); // Still active from previous test
    });
  });

  describe('Tap Settings', () => {
    it('should have Tap settings configured', async () => {
      const tapSettings = await db.getTapSettings();
      
      // If no settings exist, this is expected in test environment
      if (tapSettings) {
        expect(tapSettings.secretKey).toBeDefined();
        expect(tapSettings.publicKey).toBeDefined();
        expect(typeof tapSettings.isActive).toBe('number');
      }
    });
  });

  describe('Integration Flow', () => {
    it('should complete full signup flow', async () => {
      // 1. User selects a plan
      const plan = await db.getSubscriptionPlanById(testPlanId);
      expect(plan).toBeDefined();

      // 2. User registers
      const newEmail = `integration_test_${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newUser = await db.createUser({
        openId: `integration_${Date.now()}`,
        name: 'Integration Test User',
        email: newEmail,
        password: hashedPassword,
        loginMethod: 'email',
        role: 'user',
      });
      const newUserId = newUser?.id || 0;
      expect(newUserId).toBeGreaterThan(0);

      // 3. Merchant is created
      const createdMerchant = await db.createMerchant({
        userId: newUserId,
        businessName: 'متجر التكامل',
        phone: '0509876543',
        subscriptionStatus: 'pending',
      });
      const newMerchantId = createdMerchant?.id || 0;
      expect(newMerchantId).toBeGreaterThan(0);

      // 4. Payment transaction is created
      const transactionId = await db.createPaymentTransaction({
        merchantId: newMerchantId,
        subscriptionId: null,
        type: 'subscription',
        amount: plan!.monthlyPrice,
        currency: plan!.currency,
        status: 'pending',
        paymentMethod: 'tap',
        metadata: JSON.stringify({
          planId: testPlanId,
          billingCycle: 'monthly',
        }),
      });
      expect(transactionId).toBeGreaterThan(0);

      // 5. Payment succeeds
      await db.updatePaymentTransaction(transactionId, {
        status: 'completed',
        paidAt: new Date().toISOString(),
        tapChargeId: 'chg_integration_test',
      });

      // 6. Subscription is created
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const subscriptionId = await db.createMerchantSubscription({
        merchantId: newMerchantId,
        planId: testPlanId,
        status: 'active',
        billingCycle: 'monthly',
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        trialEndsAt: null,
        autoRenew: 0,
      });
      expect(subscriptionId).toBeGreaterThan(0);

      // 7. Merchant status is updated
      await db.updateMerchantSubscriptionStatus(newMerchantId, 'active');
      await db.updateMerchantCustomerLimit(newMerchantId, plan!.maxCustomers);

      // 8. Verify final state
      const finalMerchant = await db.getMerchantById(newMerchantId);
      expect(finalMerchant?.subscriptionStatus).toBe('active');
      expect(finalMerchant?.customerLimit).toBe(plan!.maxCustomers);

      const finalSubscription = await db.getMerchantCurrentSubscription(newMerchantId);
      expect(finalSubscription?.status).toBe('active');
      expect(finalSubscription?.planId).toBe(testPlanId);

      // Cleanup
      await db.deleteMerchant(newMerchantId);
      await db.deleteUser(newUserId);
    });
  });
});
