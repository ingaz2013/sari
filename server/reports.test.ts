import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('Reports API', () => {
  const merchantCaller = appRouter.createCaller({
    user: { id: 1, openId: 'test-merchant', name: 'Test Merchant', email: 'merchant@test.com', role: 'user', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: 'test' },
  });

  describe('campaigns.getStats', () => {
    it('should return campaign statistics for merchant', async () => {
      const stats = await merchantCaller.campaigns.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalCampaigns).toBeGreaterThanOrEqual(0);
      expect(stats.completedCampaigns).toBeGreaterThanOrEqual(0);
      expect(stats.totalSent).toBeGreaterThanOrEqual(0);
      expect(stats.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(stats.deliveryRate).toBeLessThanOrEqual(100);
      expect(stats.readRate).toBeGreaterThanOrEqual(0);
      expect(stats.readRate).toBeLessThanOrEqual(100);
    });

    it('should calculate delivery rate correctly', async () => {
      const stats = await merchantCaller.campaigns.getStats();

      // Delivery rate should be between 0 and 100
      expect(stats.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(stats.deliveryRate).toBeLessThanOrEqual(100);

      // Read rate should be less than or equal to delivery rate
      expect(stats.readRate).toBeLessThanOrEqual(stats.deliveryRate);
    });
  });

  describe('campaigns.getTimelineData', () => {
    it('should return timeline data for last 7 days', async () => {
      const timeline = await merchantCaller.campaigns.getTimelineData({ days: 7 });

      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBe(7);

      // Check data structure
      timeline.forEach(item => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('sent');
        expect(item).toHaveProperty('delivered');
        expect(item).toHaveProperty('read');
        expect(item.sent).toBeGreaterThanOrEqual(0);
        expect(item.delivered).toBeGreaterThanOrEqual(0);
        expect(item.read).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return timeline data for last 30 days', async () => {
      const timeline = await merchantCaller.campaigns.getTimelineData({ days: 30 });

      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBe(30);
    });

    it('should return timeline data for last 90 days', async () => {
      const timeline = await merchantCaller.campaigns.getTimelineData({ days: 90 });

      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBe(90);
    });

    it('should ensure read count is less than or equal to delivered count', async () => {
      const timeline = await merchantCaller.campaigns.getTimelineData({ days: 30 });

      timeline.forEach(item => {
        expect(item.read).toBeLessThanOrEqual(item.delivered);
        expect(item.delivered).toBeLessThanOrEqual(item.sent);
      });
    });

    it('should reject invalid days parameter', async () => {
      await expect(
        merchantCaller.campaigns.getTimelineData({ days: 0 })
      ).rejects.toThrow();

      await expect(
        merchantCaller.campaigns.getTimelineData({ days: 400 })
      ).rejects.toThrow();
    });
  });
});
