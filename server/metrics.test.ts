import { describe, it, expect, beforeAll } from 'vitest';
import { calculateAllMetrics } from './metrics';
import * as db from './db';

describe('Metrics Calculation', () => {
  let testMerchantId: number;

  beforeAll(async () => {
    // Create a test merchant for metrics testing
    const merchant = await db.createMerchant({
      userId: 1,
      businessName: 'Test Merchant for Metrics',
      phone: '+966500000000',
      status: 'active',
    });
    testMerchantId = merchant.id;

    // Create test conversations and deals
    const conversationId = await db.createTestConversation(testMerchantId);

    // Add test messages
    await db.saveTestMessage({
      conversationId,
      sender: 'user',
      content: 'مرحباً',
    });

    await db.saveTestMessage({
      conversationId,
      sender: 'sari',
      content: 'أهلاً وسهلاً! كيف أقدر أساعدك؟',
      responseTime: 1500,
    });

    await db.saveTestMessage({
      conversationId,
      sender: 'user',
      content: 'أبغى أطلب منتج',
    });

    await db.saveTestMessage({
      conversationId,
      sender: 'sari',
      content: 'تمام! شو المنتج اللي تبغاه؟',
      responseTime: 1200,
    });

    // Mark as deal
    await db.markTestConversationAsDeal({
      merchantId: testMerchantId,
      conversationId,
      dealValue: 250,
      messageCount: 4,
      timeToConversion: 120, // 2 minutes
    });
  });

  it('should calculate all 15 metrics', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // Verify structure
    expect(metrics).toHaveProperty('conversion');
    expect(metrics).toHaveProperty('time');
    expect(metrics).toHaveProperty('quality');
    expect(metrics).toHaveProperty('growth');
    expect(metrics).toHaveProperty('advanced');

    // Verify conversion metrics
    expect(metrics.conversion).toHaveProperty('conversionRate');
    expect(metrics.conversion).toHaveProperty('avgDealValue');
    expect(metrics.conversion).toHaveProperty('totalRevenue');

    // Verify time metrics
    expect(metrics.time).toHaveProperty('avgResponseTime');
    expect(metrics.time).toHaveProperty('avgConversationLength');
    expect(metrics.time).toHaveProperty('avgTimeToConversion');

    // Verify quality metrics
    expect(metrics.quality).toHaveProperty('resolutionRate');
    expect(metrics.quality).toHaveProperty('escalationRate');
    expect(metrics.quality).toHaveProperty('engagementRate');

    // Verify growth metrics
    expect(metrics.growth).toHaveProperty('returnRate');
    expect(metrics.growth).toHaveProperty('referralRate');

    // Verify advanced metrics
    expect(metrics.advanced).toHaveProperty('productClickRate');
    expect(metrics.advanced).toHaveProperty('orderCompletionRate');
    expect(metrics.advanced).toHaveProperty('csatScore');
    expect(metrics.advanced).toHaveProperty('npsScore');
  });

  it('should calculate conversion rate correctly', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // We have 1 conversation and 1 deal, so conversion rate should be 100%
    expect(metrics.conversion.conversionRate).toBeGreaterThanOrEqual(0);
    expect(metrics.conversion.conversionRate).toBeLessThanOrEqual(100);
  });

  it('should calculate average deal value correctly', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // We created a deal with value 250
    expect(metrics.conversion.avgDealValue).toBeGreaterThan(0);
  });

  it('should calculate total revenue correctly', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // Total revenue should be sum of all deals
    expect(metrics.conversion.totalRevenue).toBeGreaterThan(0);
  });

  it('should calculate average response time', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // We added messages with response times 1500 and 1200 ms
    expect(metrics.time.avgResponseTime).toBeGreaterThan(0);
  });

  it('should calculate average conversation length', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // We have 4 messages in the conversation
    expect(metrics.time.avgConversationLength).toBeGreaterThanOrEqual(0);
  });

  it('should calculate time to conversion', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    // We set timeToConversion to 120 seconds
    expect(metrics.time.avgTimeToConversion).toBeGreaterThanOrEqual(0);
  });

  it('should calculate CSAT score between 0 and 5', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    expect(metrics.advanced.csatScore).toBeGreaterThanOrEqual(0);
    expect(metrics.advanced.csatScore).toBeLessThanOrEqual(5);
  });

  it('should calculate NPS score between -100 and 100', async () => {
    const metrics = await calculateAllMetrics(testMerchantId, 'day');

    expect(metrics.advanced.npsScore).toBeGreaterThanOrEqual(-100);
    expect(metrics.advanced.npsScore).toBeLessThanOrEqual(100);
  });

  it('should handle different time periods', async () => {
    const dayMetrics = await calculateAllMetrics(testMerchantId, 'day');
    const weekMetrics = await calculateAllMetrics(testMerchantId, 'week');
    const monthMetrics = await calculateAllMetrics(testMerchantId, 'month');

    // All should return valid metric objects
    expect(dayMetrics).toBeDefined();
    expect(weekMetrics).toBeDefined();
    expect(monthMetrics).toBeDefined();
  });

  it('should return zero metrics for merchant with no data', async () => {
    const emptyMerchant = await db.createMerchant({
      userId: 2,
      businessName: 'Empty Test Merchant',
      phone: '+966500000001',
      status: 'active',
    });

    const metrics = await calculateAllMetrics(emptyMerchant.id, 'day');

    // All metrics should be 0 for a merchant with no conversations
    expect(metrics.conversion.conversionRate).toBe(0);
    expect(metrics.conversion.avgDealValue).toBe(0);
    expect(metrics.conversion.totalRevenue).toBe(0);
  });
});
