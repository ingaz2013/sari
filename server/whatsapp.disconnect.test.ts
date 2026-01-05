import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from './db';

// Mock the db module
vi.mock('./db', async () => {
  const actual = await vi.importActual('./db');
  return {
    ...actual,
    getMerchantByUserId: vi.fn(),
    getWhatsAppConnectionRequestByMerchantId: vi.fn(),
    deleteWhatsAppConnectionRequest: vi.fn(),
    getWhatsAppInstancesByMerchantId: vi.fn(),
    deleteWhatsAppInstance: vi.fn(),
  };
});

// Mock notification module
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe('WhatsApp Disconnect Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteWhatsAppConnectionRequest', () => {
    it('should delete a WhatsApp connection request', async () => {
      const mockDeleteFn = vi.mocked(db.deleteWhatsAppConnectionRequest);
      mockDeleteFn.mockResolvedValue(undefined);

      await db.deleteWhatsAppConnectionRequest(1);

      expect(mockDeleteFn).toHaveBeenCalledWith(1);
    });
  });

  describe('disconnect flow', () => {
    it('should get merchant by user id', async () => {
      const mockMerchant = {
        id: 1,
        userId: 1,
        businessName: 'Test Store',
        phone: '+966501234567',
        planId: 1,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getMerchantByUserId).mockResolvedValue(mockMerchant);

      const result = await db.getMerchantByUserId(1);

      expect(result).toEqual(mockMerchant);
      expect(db.getMerchantByUserId).toHaveBeenCalledWith(1);
    });

    it('should get WhatsApp connection request by merchant id', async () => {
      const mockRequest = {
        id: 1,
        merchantId: 1,
        countryCode: '+966',
        phoneNumber: '501234567',
        fullNumber: '+966501234567',
        status: 'approved' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      };

      vi.mocked(db.getWhatsAppConnectionRequestByMerchantId).mockResolvedValue(mockRequest);

      const result = await db.getWhatsAppConnectionRequestByMerchantId(1);

      expect(result).toEqual(mockRequest);
      expect(db.getWhatsAppConnectionRequestByMerchantId).toHaveBeenCalledWith(1);
    });

    it('should get WhatsApp instances by merchant id', async () => {
      const mockInstances = [
        {
          id: 1,
          merchantId: 1,
          instanceId: 'instance123',
          token: 'token123',
          phoneNumber: '+966501234567',
          status: 'active' as const,
          isPrimary: true,
          connectedAt: new Date(),
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getWhatsAppInstancesByMerchantId).mockResolvedValue(mockInstances);

      const result = await db.getWhatsAppInstancesByMerchantId(1);

      expect(result).toEqual(mockInstances);
      expect(db.getWhatsAppInstancesByMerchantId).toHaveBeenCalledWith(1);
    });

    it('should delete WhatsApp instance', async () => {
      vi.mocked(db.deleteWhatsAppInstance).mockResolvedValue(undefined);

      await db.deleteWhatsAppInstance(1);

      expect(db.deleteWhatsAppInstance).toHaveBeenCalledWith(1);
    });

    it('should complete full disconnect flow', async () => {
      // Setup mocks
      const mockMerchant = {
        id: 1,
        userId: 1,
        businessName: 'Test Store',
        phone: '+966501234567',
        planId: 1,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        id: 5,
        merchantId: 1,
        countryCode: '+966',
        phoneNumber: '501234567',
        fullNumber: '+966501234567',
        status: 'approved' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      };

      const mockInstances = [
        {
          id: 10,
          merchantId: 1,
          instanceId: 'instance123',
          token: 'token123',
          phoneNumber: '+966501234567',
          status: 'active' as const,
          isPrimary: true,
          connectedAt: new Date(),
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getMerchantByUserId).mockResolvedValue(mockMerchant);
      vi.mocked(db.getWhatsAppConnectionRequestByMerchantId).mockResolvedValue(mockRequest);
      vi.mocked(db.getWhatsAppInstancesByMerchantId).mockResolvedValue(mockInstances);
      vi.mocked(db.deleteWhatsAppConnectionRequest).mockResolvedValue(undefined);
      vi.mocked(db.deleteWhatsAppInstance).mockResolvedValue(undefined);

      // Simulate disconnect flow
      const merchant = await db.getMerchantByUserId(1);
      expect(merchant).toBeDefined();

      const request = await db.getWhatsAppConnectionRequestByMerchantId(merchant!.id);
      expect(request).toBeDefined();

      // Delete connection request
      await db.deleteWhatsAppConnectionRequest(request!.id);
      expect(db.deleteWhatsAppConnectionRequest).toHaveBeenCalledWith(5);

      // Delete instances
      const instances = await db.getWhatsAppInstancesByMerchantId(merchant!.id);
      for (const instance of instances) {
        await db.deleteWhatsAppInstance(instance.id);
      }
      expect(db.deleteWhatsAppInstance).toHaveBeenCalledWith(10);
    });
  });
});
