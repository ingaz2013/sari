import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Try Sari Analytics', () => {
  const testSessionId = `test-session-${Date.now()}`;

  beforeAll(async () => {
    // Clean up any existing test data
    await db.getDb();
  });

  it('should create new analytics session', async () => {
    const session = await db.upsertTrySariAnalytics({
      sessionId: testSessionId,
      messageCount: 1,
      exampleUsed: 'مرحبا، أريد شراء منتج',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser',
    });

    expect(session).toBeDefined();
    expect(session?.sessionId).toBe(testSessionId);
    expect(session?.messageCount).toBe(1);
  });

  it('should increment message count', async () => {
    await db.incrementTrySariMessageCount(testSessionId);
    
    const session = await db.getTrySariAnalyticsBySessionId(testSessionId);
    expect(session?.messageCount).toBeGreaterThan(1);
  });

  it('should mark signup prompt shown', async () => {
    await db.markSignupPromptShown(testSessionId);
    
    const session = await db.getTrySariAnalyticsBySessionId(testSessionId);
    expect(session?.signupPromptShown).toBe(true);
  });

  it('should mark converted to signup', async () => {
    await db.markConvertedToSignup(testSessionId);
    
    const session = await db.getTrySariAnalyticsBySessionId(testSessionId);
    expect(session?.convertedToSignup).toBe(true);
  });

  it('should get analytics stats', async () => {
    const stats = await db.getTrySariAnalyticsStats(30);
    
    expect(stats).toBeDefined();
    expect(stats?.totalSessions).toBeGreaterThan(0);
    expect(stats?.totalMessages).toBeGreaterThan(0);
  });

  it('should get daily analytics data', async () => {
    const dailyData = await db.getTrySariDailyData(30);
    
    expect(Array.isArray(dailyData)).toBe(true);
  });
});
