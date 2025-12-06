import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Campaign Send API', () => {
  let testMerchantId: number;
  let testCampaignId: number;

  beforeAll(async () => {
    // Create test merchant (userId 1 should exist from other tests)
    const merchant = await db.createMerchant({
      userId: 1,
      businessName: 'Test Store for Campaign Send',
      ownerName: 'Test Owner',
      email: 'campaignsend@test.com',
      phone: '966500000099',
      status: 'active',
    });
    testMerchantId = merchant.id;

    // Create test campaign with proper targetAudience format
    const campaign = await db.createCampaign({
      merchantId: testMerchantId,
      name: 'Test Campaign to Send',
      message: 'Hello from test campaign',
      targetAudience: JSON.stringify(['966500000001', '966500000002']),
      totalRecipients: 2,
      status: 'draft',
    });
    testCampaignId = campaign.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testCampaignId) {
      await db.updateCampaign(testCampaignId, { status: 'failed' });
    }
  });

  it('should verify campaign exists', async () => {
    const campaign = await db.getCampaignById(testCampaignId);
    expect(campaign).toBeDefined();
    expect(campaign?.merchantId).toBe(testMerchantId);
  });

  it('should reject sending already sent campaign', async () => {
    // Update to completed manually
    await db.updateCampaign(testCampaignId, { status: 'completed' });
    
    // Get merchant to find userId
    const merchant = await db.getMerchantById(testMerchantId);
    if (!merchant) throw new Error('Merchant not found');

    const caller = appRouter.createCaller({
      user: {
        id: merchant.userId.toString(),
        openId: 'test-open-id-campaign-send',
        name: 'Test Owner',
        email: 'campaignsend@test.com',
        role: 'user',
      },
    });

    // Should fail because already completed
    await expect(
      caller.campaigns.send({ id: testCampaignId })
    ).rejects.toThrow();

    // Reset to draft for other tests
    await db.updateCampaign(testCampaignId, { status: 'draft' });
  });

  it('should reject sending campaign with invalid target audience', async () => {
    // Update existing campaign with invalid JSON temporarily
    const originalAudience = (await db.getCampaignById(testCampaignId))?.targetAudience;
    await db.updateCampaign(testCampaignId, { targetAudience: 'invalid-json', status: 'draft' });

    // Get merchant to find userId
    const merchant = await db.getMerchantById(testMerchantId);
    if (!merchant) throw new Error('Merchant not found');

    const caller = appRouter.createCaller({
      user: {
        id: merchant.userId.toString(),
        openId: 'test-open-id-campaign-send',
        name: 'Test Owner',
        email: 'campaignsend@test.com',
        role: 'user',
      },
    });

    await expect(
      caller.campaigns.send({ id: testCampaignId })
    ).rejects.toThrow();

    // Restore original
    await db.updateCampaign(testCampaignId, { targetAudience: originalAudience || '', status: 'draft' });
  });

  it('should reject sending campaign with no recipients', async () => {
    // Update existing campaign with empty recipients temporarily
    const originalAudience = (await db.getCampaignById(testCampaignId))?.targetAudience;
    await db.updateCampaign(testCampaignId, { targetAudience: JSON.stringify([]), status: 'draft' });

    // Get merchant to find userId
    const merchant = await db.getMerchantById(testMerchantId);
    if (!merchant) throw new Error('Merchant not found');

    const caller = appRouter.createCaller({
      user: {
        id: merchant.userId.toString(),
        openId: 'test-open-id-campaign-send',
        name: 'Test Owner',
        email: 'campaignsend@test.com',
        role: 'user',
      },
    });

    await expect(
      caller.campaigns.send({ id: testCampaignId })
    ).rejects.toThrow();

    // Restore original
    await db.updateCampaign(testCampaignId, { targetAudience: originalAudience || '', status: 'draft' });
  });

  it('should reject unauthorized merchant from sending campaign', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '99999',
        openId: 'unauthorized-open-id',
        name: 'Unauthorized User',
        email: 'unauthorized@test.com',
        role: 'user',
      },
    });

    await expect(
      caller.campaigns.send({ id: testCampaignId })
    ).rejects.toThrow('FORBIDDEN');
  });
});
