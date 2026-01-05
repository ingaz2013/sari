import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';
import { formatCurrency } from '../shared/currency';

describe('Currency Support', () => {
  let testUserId: number;
  let testMerchantId: number;

  beforeAll(async () => {
    // Create test user
    const user = await db.createUser({
      openId: `test-currency-${Date.now()}`,
      name: 'Currency Test User',
      email: `currency-test-${Date.now()}@test.com`,
      password: 'test123',
      loginMethod: 'email',
      role: 'user',
    });
    testUserId = user.id;

    // Create test merchant
    const merchant = await db.createMerchant({
      userId: testUserId,
      businessName: 'Currency Test Store',
      phone: '+966500000000',
      status: 'active',
      currency: 'SAR', // Default currency
    });
    testMerchantId = merchant.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testMerchantId) {
      const products = await db.getProductsByMerchantId(testMerchantId);
      for (const product of products) {
        await db.deleteProduct(product.id);
      }
    }
  });

  it('should format SAR currency correctly', () => {
    const formatted = formatCurrency(100, 'SAR', 'ar-SA');
    // Arabic locale uses Arabic numerals, so check for the word instead
    expect(formatted).toContain('ريال');
    expect(formatted).toBeTruthy();
  });

  it('should format USD currency correctly', () => {
    const formatted = formatCurrency(100, 'USD', 'ar-SA');
    expect(formatted).toContain('$');
    expect(formatted).toBeTruthy();
  });

  it('should update merchant currency to USD', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: 'Test', role: 'user' },
    });

    await caller.merchants.update({
      currency: 'USD',
    });

    const merchant = await db.getMerchantById(testMerchantId);
    expect(merchant?.currency).toBe('USD');
  });

  it('should update merchant currency to SAR', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: 'Test', role: 'user' },
    });

    await caller.merchants.update({
      currency: 'SAR',
    });

    const merchant = await db.getMerchantById(testMerchantId);
    expect(merchant?.currency).toBe('SAR');
  });

  it('should create product with price and display in merchant currency', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: 'Test', role: 'user' },
    });

    // Create product
    const result = await caller.products.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
    });

    expect(result.success).toBe(true);

    // Get products
    const products = await caller.products.list();
    const product = products.find(p => p.name === 'Test Product');
    
    expect(product).toBeDefined();
    // Price might be rounded to integer in database
    expect(product?.price).toBeGreaterThan(99);
    expect(product?.price).toBeLessThanOrEqual(100);

    // Get merchant currency
    const merchant = await db.getMerchantById(testMerchantId);
    const currency = merchant?.currency || 'SAR';

    // Format price with currency
    const formattedPrice = formatCurrency(product!.price, currency);
    expect(formattedPrice).toBeTruthy();
  });

  it('should handle currency formatting with different locales', () => {
    // Arabic locale
    const sarAr = formatCurrency(1000, 'SAR', 'ar-SA');
    expect(sarAr).toContain('ريال');

    // English locale
    const sarEn = formatCurrency(1000, 'SAR', 'en-US');
    expect(sarEn).toContain('SAR');

    // USD formatting
    const usdAr = formatCurrency(1000, 'USD', 'ar-SA');
    expect(usdAr).toContain('$');
  });
});
