import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Merchant Settings', () => {
  let testUserId: string;
  let testMerchantId: number;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: 'test-merchant-settings',
      name: 'Test Merchant User',
      email: 'merchant@test.com',
      role: 'user',
    });

    const user = await db.getUserByOpenId('test-merchant-settings');
    if (user) {
      testUserId = user.id.toString();

      // Create a test merchant
      const merchant = await db.createMerchant({
        userId: user.id,
        businessName: 'Test Business',
        phone: '+966500000000',
        status: 'active',
      });

      if (merchant) {
        testMerchantId = merchant.id;
      }
    }
  });

  describe('auth.updateProfile', () => {
    it('should allow user to update their profile', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: 'test-merchant-settings',
          name: 'Test Merchant User',
          email: 'merchant@test.com',
          role: 'user',
        },
      });

      const result = await caller.auth.updateProfile({
        name: 'Updated Name',
        email: 'updated@test.com',
      });

      expect(result.success).toBe(true);

      // Verify update
      const user = await db.getUserByOpenId('test-merchant-settings');
      expect(user?.name).toBe('Updated Name');
      expect(user?.email).toBe('updated@test.com');
    });

    it('should allow user to update only name', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: 'test-merchant-settings',
          name: 'Updated Name',
          email: 'updated@test.com',
          role: 'user',
        },
      });

      await caller.auth.updateProfile({
        name: 'New Name Only',
      });

      const user = await db.getUserByOpenId('test-merchant-settings');
      expect(user?.name).toBe('New Name Only');
      expect(user?.email).toBe('updated@test.com'); // Email unchanged
    });

    it('should reject invalid email', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: 'test-merchant-settings',
          name: 'New Name Only',
          email: 'updated@test.com',
          role: 'user',
        },
      });

      await expect(
        caller.auth.updateProfile({
          email: 'invalid-email',
        })
      ).rejects.toThrow();
    });
  });

  describe('merchants.update', () => {
    it('should allow merchant to update business info', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: 'test-merchant-settings',
          name: 'New Name Only',
          email: 'updated@test.com',
          role: 'user',
        },
      });

      const result = await caller.merchants.update({
        businessName: 'Updated Business Name',
        phone: '+966511111111',
      });

      expect(result.success).toBe(true);

      // Verify update
      const merchant = await db.getMerchantById(testMerchantId);
      expect(merchant?.businessName).toBe('Updated Business Name');
      expect(merchant?.phone).toBe('+966511111111');
    });

    it('should allow merchant to update only business name', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: 'test-merchant-settings',
          name: 'New Name Only',
          email: 'updated@test.com',
          role: 'user',
        },
      });

      await caller.merchants.update({
        businessName: 'Another Business Name',
      });

      const merchant = await db.getMerchantById(testMerchantId);
      expect(merchant?.businessName).toBe('Another Business Name');
      expect(merchant?.phone).toBe('+966511111111'); // Phone unchanged
    });

    it('should reject update for non-existent merchant', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: '99999',
          openId: 'non-existent-merchant',
          name: 'Non Existent',
          email: 'nonexistent@test.com',
          role: 'user',
        },
      });

      await expect(
        caller.merchants.update({
          businessName: 'Should Fail',
        })
      ).rejects.toThrow('Merchant not found');
    });
  });

  describe('merchants.getCurrent', () => {
    it('should return current merchant for logged-in user', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: 'test-merchant-settings',
          name: 'New Name Only',
          email: 'updated@test.com',
          role: 'user',
        },
      });

      const merchant = await caller.merchants.getCurrent();
      expect(merchant).toBeDefined();
      expect(merchant?.businessName).toBe('Another Business Name');
    });

    it('should return undefined for user without merchant profile', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: '99999',
          openId: 'no-merchant-user',
          name: 'No Merchant',
          email: 'nomerchant@test.com',
          role: 'user',
        },
      });

      const merchant = await caller.merchants.getCurrent();
      expect(merchant).toBeUndefined();
    });
  });
});
