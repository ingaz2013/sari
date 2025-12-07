import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('WhatsApp Setup System', () => {
  let testMerchantId: number;

  beforeAll(async () => {
    // Create test merchant
    const merchant = await db.createMerchant({
      businessName: 'Test Business Setup',
      userId: 998,
    });
    testMerchantId = merchant.id;
  });

  afterAll(async () => {
    // Cleanup all requests for this merchant
    const requests = await db.getWhatsAppRequestsByMerchantId(testMerchantId);
    for (const request of requests) {
      await db.deleteWhatsAppRequest(request.id);
    }
    // Note: Merchant cleanup handled separately
  });

  describe('WhatsApp Request Lifecycle', () => {
    it('should create and manage a complete request lifecycle', async () => {
      // 1. Create request
      const request = await db.createWhatsAppRequest({
        merchantId: testMerchantId,
        phoneNumber: '+966501234567',
        businessName: 'Test Business Setup',
        status: 'pending',
      });

      expect(request).toBeDefined();
      expect(request.status).toBe('pending');

      // 2. Get by ID
      const fetchedRequest = await db.getWhatsAppRequestById(request.id);
      expect(fetchedRequest).toBeDefined();
      expect(fetchedRequest?.id).toBe(request.id);

      // 3. Approve
      await db.approveWhatsAppRequest(
        request.id,
        '7103123456',
        'test-token-123',
        'https://api.green-api.com',
        1
      );

      const approvedRequest = await db.getWhatsAppRequestById(request.id);
      expect(approvedRequest?.status).toBe('approved');
      expect(approvedRequest?.instanceId).toBe('7103123456');

      // 4. Complete
      await db.completeWhatsAppRequest(request.id, '+966501234567');

      const completedRequest = await db.getWhatsAppRequestById(request.id);
      expect(completedRequest?.status).toBe('completed');
      expect(completedRequest?.connectedAt).toBeDefined();
    });

    it('should handle request rejection', async () => {
      const request = await db.createWhatsAppRequest({
        merchantId: testMerchantId,
        phoneNumber: '+966509999999',
        businessName: 'Test Business Reject',
        status: 'pending',
      });

      await db.rejectWhatsAppRequest(
        request.id,
        'Invalid phone number',
        1
      );

      const rejectedRequest = await db.getWhatsAppRequestById(request.id);
      expect(rejectedRequest?.status).toBe('rejected');
      expect(rejectedRequest?.rejectionReason).toBe('Invalid phone number');
    });
  });

  describe('WhatsApp Request Queries', () => {
    it('should get requests by merchant ID', async () => {
      const requests = await db.getWhatsAppRequestsByMerchantId(testMerchantId);
      expect(requests).toBeDefined();
      expect(requests.length).toBeGreaterThan(0);
    });

    it('should get all requests', async () => {
      const allRequests = await db.getAllWhatsAppRequests();
      expect(allRequests).toBeDefined();
      expect(allRequests.length).toBeGreaterThan(0);
    });

    it('should update request', async () => {
      const request = await db.createWhatsAppRequest({
        merchantId: testMerchantId,
        phoneNumber: '+966508888888',
        businessName: 'Test Business Update',
        status: 'pending',
      });

      await db.updateWhatsAppRequest(request.id, {
        adminNotes: 'Test notes',
      });

      const updatedRequest = await db.getWhatsAppRequestById(request.id);
      expect(updatedRequest?.adminNotes).toBe('Test notes');
    });
  });
});
