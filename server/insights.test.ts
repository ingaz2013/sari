/**
 * اختبارات لوحة التحكم التحليلية والميزات الجديدة
 */

import { describe, it, expect } from 'vitest';
import * as dbInsights from './db-insights';

describe('Insights Dashboard Features', () => {
  const testMerchantId = 1; // استخدام ID موجود مسبقاً

  describe('Keyword Insights', () => {
    it('should get keyword statistics', async () => {
      const stats = await dbInsights.getKeywordInsights(testMerchantId, '30d');
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('suggested');
      expect(stats).toHaveProperty('applied');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('topKeywords');
    });
  });

  describe('Weekly Reports', () => {
    it('should get weekly reports list', async () => {
      const reports = await dbInsights.getWeeklyReportsList(testMerchantId, 4);
      
      expect(reports).toBeDefined();
      expect(reports).toBeInstanceOf(Array);
    });
  });

  describe('A/B Tests', () => {
    it('should get active A/B tests', async () => {
      const tests = await dbInsights.getActiveABTests(testMerchantId);
      
      expect(tests).toBeDefined();
      expect(tests).toBeInstanceOf(Array);
    });
  });

  describe('Keyword Extraction', () => {
    it('should have extractKeywordsFromMessage function', async () => {
      const { extractKeywordsFromMessage } = await import('./ai/keyword-extraction');
      
      expect(extractKeywordsFromMessage).toBeDefined();
      expect(typeof extractKeywordsFromMessage).toBe('function');
    });
  });

  describe('Weekly Sentiment Report', () => {
    it('should have generateWeeklySentimentReport function', async () => {
      const { generateWeeklySentimentReport } = await import('./ai/weekly-sentiment');
      
      expect(generateWeeklySentimentReport).toBeDefined();
      expect(typeof generateWeeklySentimentReport).toBe('function');
    });
  });
});
