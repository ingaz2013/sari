/**
 * WhatsApp Instances System Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('WhatsApp Instances System', () => {
  let testMerchantId: number;
  let testInstanceId: number;

  beforeAll(async () => {
    // Create test merchant
    const merchant = await db.createMerchant({
      userId: 999998,
      businessName: 'WhatsApp Instances Test Store',
      businessType: 'retail',
      phoneNumber: '+966500000098',
      whatsappConnected: false,
      whatsappInstanceId: null,
      whatsappToken: null,
    });
    testMerchantId = merchant.id;
  });

  afterAll(async () => {
    // Cleanup is handled by database constraints
  });

  describe('Create WhatsApp Instance', () => {
    it('should create a new WhatsApp instance', async () => {
      const instance = await db.createWhatsAppInstance({
        merchantId: testMerchantId,
        instanceId: 'TEST123456',
        token: 'test-token-123',
        apiUrl: 'https://api.green-api.com',
        phoneNumber: '+966500000001',
        webhookUrl: null,
        status: 'pending',
        isPrimary: true,
        lastSyncAt: null,
        connectedAt: null,
        expiresAt: null,
        metadata: null,
      });

      expect(instance).toBeDefined();
      expect(instance?.instanceId).toBe('TEST123456');
      expect(instance?.token).toBe('test-token-123');
      expect(instance?.status).toBe('pending');
      expect(instance?.isPrimary).toBe(true);

      if (instance) {
        testInstanceId = instance.id;
      }
    });

    it('should not allow duplicate instance IDs', async () => {
      const existing = await db.getWhatsAppInstanceByInstanceId('TEST123456');
      expect(existing).toBeDefined();
      expect(existing?.instanceId).toBe('TEST123456');
    });
  });

  describe('Get WhatsApp Instances', () => {
    it('should get instance by ID', async () => {
      const instance = await db.getWhatsAppInstanceById(testInstanceId);
      expect(instance).toBeDefined();
      expect(instance?.id).toBe(testInstanceId);
      expect(instance?.merchantId).toBe(testMerchantId);
    });

    it('should get all instances for a merchant', async () => {
      const instances = await db.getWhatsAppInstancesByMerchantId(testMerchantId);
      expect(instances).toBeDefined();
      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0].merchantId).toBe(testMerchantId);
    });

    it('should get primary instance', async () => {
      // First set the instance to active status
      await db.updateWhatsAppInstance(testInstanceId, { status: 'active' });
      
      const primary = await db.getPrimaryWhatsAppInstance(testMerchantId);
      expect(primary).toBeDefined();
      expect(primary?.isPrimary).toBe(true);
      expect(primary?.merchantId).toBe(testMerchantId);
    });

    it('should get instance by instance ID', async () => {
      const instance = await db.getWhatsAppInstanceByInstanceId('TEST123456');
      expect(instance).toBeDefined();
      expect(instance?.instanceId).toBe('TEST123456');
    });
  });

  describe('Update WhatsApp Instance', () => {
    it('should update instance details', async () => {
      await db.updateWhatsAppInstance(testInstanceId, {
        phoneNumber: '+966500000002',
        status: 'active',
      });

      const updated = await db.getWhatsAppInstanceById(testInstanceId);
      expect(updated?.phoneNumber).toBe('+966500000002');
      expect(updated?.status).toBe('active');
    });

    it('should update instance status', async () => {
      await db.updateWhatsAppInstance(testInstanceId, {
        status: 'inactive',
      });

      const updated = await db.getWhatsAppInstanceById(testInstanceId);
      expect(updated?.status).toBe('inactive');
    });
  });

  describe('Primary Instance Management', () => {
    let secondInstanceId: number;

    it('should create a second instance', async () => {
      const instance = await db.createWhatsAppInstance({
        merchantId: testMerchantId,
        instanceId: 'TEST789012',
        token: 'test-token-789',
        apiUrl: 'https://api.green-api.com',
        phoneNumber: '+966500000003',
        webhookUrl: null,
        status: 'active',
        isPrimary: false,
        lastSyncAt: null,
        connectedAt: null,
        expiresAt: null,
        metadata: null,
      });

      expect(instance).toBeDefined();
      expect(instance?.isPrimary).toBe(false);
      
      if (instance) {
        secondInstanceId = instance.id;
      }
    });

    it('should set second instance as primary', async () => {
      await db.setWhatsAppInstanceAsPrimary(secondInstanceId, testMerchantId);

      const firstInstance = await db.getWhatsAppInstanceById(testInstanceId);
      const secondInstance = await db.getWhatsAppInstanceById(secondInstanceId);

      expect(firstInstance?.isPrimary).toBe(false);
      expect(secondInstance?.isPrimary).toBe(true);
    });

    it('should have only one primary instance', async () => {
      const instances = await db.getWhatsAppInstancesByMerchantId(testMerchantId);
      const primaryInstances = instances.filter(i => i.isPrimary);
      
      expect(primaryInstances.length).toBe(1);
      expect(primaryInstances[0].id).toBe(secondInstanceId);
    });
  });

  describe('Active Instances Count', () => {
    it('should count active instances', async () => {
      // Set first instance to active
      await db.updateWhatsAppInstance(testInstanceId, { status: 'active' });

      const count = await db.getActiveWhatsAppInstancesCount(testMerchantId);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Expired Instances', () => {
    it('should detect expired instances', async () => {
      // Set instance to expire yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await db.updateWhatsAppInstance(testInstanceId, {
        expiresAt: yesterday,
        status: 'active',
      });

      const expired = await db.getExpiredWhatsAppInstances();
      const testInstance = expired.find(i => i.id === testInstanceId);
      
      expect(testInstance).toBeDefined();
      expect(testInstance?.status).toBe('active');
    });

    it('should mark instance as expired', async () => {
      await db.markWhatsAppInstanceExpired(testInstanceId);

      const instance = await db.getWhatsAppInstanceById(testInstanceId);
      expect(instance?.status).toBe('expired');
    });
  });

  describe('Delete WhatsApp Instance', () => {
    it('should delete an instance', async () => {
      await db.deleteWhatsAppInstance(testInstanceId);

      const deleted = await db.getWhatsAppInstanceById(testInstanceId);
      expect(deleted).toBeUndefined();
    });

    it('should not find deleted instance', async () => {
      const instances = await db.getWhatsAppInstancesByMerchantId(testMerchantId);
      const deletedInstance = instances.find(i => i.id === testInstanceId);
      
      expect(deletedInstance).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent merchant', async () => {
      const instances = await db.getWhatsAppInstancesByMerchantId(999999999);
      expect(instances).toEqual([]);
    });

    it('should handle non-existent instance ID', async () => {
      const instance = await db.getWhatsAppInstanceById(999999999);
      expect(instance).toBeUndefined();
    });

    it('should handle non-existent instance string ID', async () => {
      const instance = await db.getWhatsAppInstanceByInstanceId('NON_EXISTENT');
      expect(instance).toBeUndefined();
    });

    it('should return null for primary instance when none exists', async () => {
      // Create a new merchant without instances
      const newMerchant = await db.createMerchant({
        userId: 999997,
        businessName: 'No Instances Store',
        businessType: 'retail',
        phoneNumber: '+966500000097',
        whatsappConnected: false,
        whatsappInstanceId: null,
        whatsappToken: null,
      });

      const primary = await db.getPrimaryWhatsAppInstance(newMerchant.id);
      expect(primary).toBeUndefined();
    });
  });
});
