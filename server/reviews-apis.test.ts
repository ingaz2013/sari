import { describe, it, expect, beforeEach } from 'vitest';
import * as db from './db';

describe('Reviews APIs - Database Functions', () => {
  let testMerchantId: number;
  let testOrderId: number;
  let testReviewId: number;

  beforeEach(async () => {
    // Create test merchant
    const merchant = await db.createMerchant({
      userId: 1,
      businessName: 'Test Store',
      phone: '0501234567',
      status: 'active',
    });
    testMerchantId = merchant!.id;

    // Create test order
    const order = await db.createOrder({
      merchantId: testMerchantId,
      customerPhone: '0509876543',
      customerName: 'Test Customer',
      items: JSON.stringify([{ name: 'Test Product', quantity: 1, price: 100 }]),
      totalAmount: 100,
      status: 'delivered',
      sallaOrderId: 'test-order-123',
    });
    testOrderId = order!.id;
  });

  it('should create a customer review', async () => {
    const review = await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Test Customer',
      rating: 5,
      comment: 'منتج ممتاز والخدمة رائعة!',
      isPublic: true,
    });

    expect(review).toBeDefined();
    expect(review!.rating).toBe(5);
    expect(review!.comment).toBe('منتج ممتاز والخدمة رائعة!');
    expect(review!.isPublic).toBe(true);
    testReviewId = review!.id;
  });

  it('should get review by ID', async () => {
    const review = await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Test Customer',
      rating: 4,
      comment: 'جيد جداً',
      isPublic: true,
    });

    const fetched = await db.getCustomerReviewById(review!.id);
    expect(fetched).toBeDefined();
    expect(fetched!.rating).toBe(4);
    expect(fetched!.comment).toBe('جيد جداً');
  });

  it('should get all reviews for merchant', async () => {
    // Create multiple reviews
    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Customer 1',
      rating: 5,
      comment: 'ممتاز',
      isPublic: true,
    });

    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876544',
      customerName: 'Customer 2',
      rating: 4,
      comment: 'جيد',
      isPublic: true,
    });

    const reviews = await db.getCustomerReviewsByMerchantId(testMerchantId);
    expect(reviews.length).toBeGreaterThanOrEqual(2);
  });

  it('should get reviews by order ID', async () => {
    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Test Customer',
      rating: 5,
      comment: 'رائع',
      isPublic: true,
    });

    const reviews = await db.getCustomerReviewsByOrderId(testOrderId);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0].orderId).toBe(testOrderId);
  });

  it('should get only public reviews', async () => {
    // Create public review
    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Customer 1',
      rating: 5,
      comment: 'ممتاز',
      isPublic: true,
    });

    // Create private review
    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876544',
      customerName: 'Customer 2',
      rating: 2,
      comment: 'سيء',
      isPublic: false,
    });

    const publicReviews = await db.getPublicReviews(testMerchantId, 10);
    expect(publicReviews.length).toBeGreaterThan(0);
    expect(publicReviews.every(r => r.isPublic)).toBe(true);
  });

  it('should update review', async () => {
    const review = await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Test Customer',
      rating: 4,
      comment: 'جيد',
      isPublic: false,
    });

    await db.updateCustomerReview(review!.id, {
      isPublic: true,
      comment: 'ممتاز بعد التحديث',
    });

    const updated = await db.getCustomerReviewById(review!.id);
    expect(updated!.isPublic).toBe(true);
    expect(updated!.comment).toBe('ممتاز بعد التحديث');
  });

  it('should filter reviews by rating (4-5 stars only)', async () => {
    // Create reviews with different ratings
    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876543',
      customerName: 'Customer 1',
      rating: 5,
      comment: 'ممتاز',
      isPublic: true,
    });

    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876544',
      customerName: 'Customer 2',
      rating: 3,
      comment: 'متوسط',
      isPublic: true,
    });

    await db.createCustomerReview({
      merchantId: testMerchantId,
      orderId: testOrderId,
      customerPhone: '0509876545',
      customerName: 'Customer 3',
      rating: 4,
      comment: 'جيد',
      isPublic: true,
    });

    const allReviews = await db.getCustomerReviewsByMerchantId(testMerchantId);
    const highRatings = allReviews.filter(r => r.rating >= 4);
    
    expect(highRatings.length).toBeGreaterThanOrEqual(2);
    expect(highRatings.every(r => r.rating >= 4)).toBe(true);
  });
});
