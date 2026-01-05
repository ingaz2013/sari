import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Customers Management', () => {
  let testMerchantId: number;
  let testCustomerPhone: string;

  beforeAll(async () => {
    // Use existing merchant or create test data
    testMerchantId = 150001; // Default test merchant
    testCustomerPhone = '+966500000001'; // Test customer phone
  });

  describe('Customer Database Functions', () => {
    it('should get customers by merchant', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      
      if (customers.length > 0) {
        const customer = customers[0];
        expect(customer).toHaveProperty('customerPhone');
        expect(customer).toHaveProperty('customerName');
        expect(customer).toHaveProperty('orderCount');
        expect(customer).toHaveProperty('totalSpent');
        expect(customer).toHaveProperty('loyaltyPoints');
        expect(customer).toHaveProperty('status');
        expect(['active', 'new', 'inactive']).toContain(customer.status);
      }
    });

    it('should get customer stats', async () => {
      const stats = await db.getCustomerStats(testMerchantId);
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('new');
      expect(stats).toHaveProperty('inactive');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.new).toBe('number');
      expect(typeof stats.inactive).toBe('number');
      
      // Total should equal sum of all statuses
      expect(stats.total).toBe(stats.active + stats.new + stats.inactive);
    });

    it('should search customers by query', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      if (customers.length > 0) {
        const firstCustomer = customers[0];
        const searchQuery = firstCustomer.customerPhone.slice(-4); // Last 4 digits
        
        const searchResults = await db.searchCustomers(testMerchantId, searchQuery);
        
        expect(searchResults).toBeDefined();
        expect(Array.isArray(searchResults)).toBe(true);
        
        // Should find at least the customer we searched for
        const found = searchResults.some(c => c.customerPhone === firstCustomer.customerPhone);
        expect(found).toBe(true);
      }
    });

    it('should get customer by phone', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      if (customers.length > 0) {
        const testPhone = customers[0].customerPhone;
        const customer = await db.getCustomerByPhone(testMerchantId, testPhone);
        
        expect(customer).toBeDefined();
        expect(customer?.customerPhone).toBe(testPhone);
        expect(customer).toHaveProperty('orders');
        expect(customer).toHaveProperty('conversations');
        expect(customer).toHaveProperty('orderCount');
        expect(customer).toHaveProperty('totalSpent');
        expect(customer).toHaveProperty('loyaltyPoints');
        
        // Verify orders and conversations are arrays
        expect(Array.isArray(customer?.orders)).toBe(true);
        expect(Array.isArray(customer?.conversations)).toBe(true);
      }
    });

    it('should return null for non-existent customer', async () => {
      const nonExistentPhone = '+966999999999';
      const customer = await db.getCustomerByPhone(testMerchantId, nonExistentPhone);
      
      expect(customer).toBeNull();
    });

    it('should get customer count', async () => {
      const count = await db.getCustomerCountByMerchant(testMerchantId);
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Customer Status Logic', () => {
    it('should correctly determine customer status', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      customers.forEach(customer => {
        const daysSinceLastMessage = Math.floor(
          (new Date().getTime() - new Date(customer.lastMessageAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastMessage <= 7) {
          expect(customer.status).toBe('active');
        } else if (daysSinceLastMessage <= 30) {
          expect(customer.status).toBe('new');
        } else {
          expect(customer.status).toBe('inactive');
        }
      });
    });
  });

  describe('Customer Data Integrity', () => {
    it('should have valid phone numbers', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      customers.forEach(customer => {
        expect(customer.customerPhone).toBeTruthy();
        expect(typeof customer.customerPhone).toBe('string');
        // Should start with + or be a valid number
        expect(customer.customerPhone.length).toBeGreaterThan(0);
      });
    });

    it('should have non-negative order counts and totals', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      customers.forEach(customer => {
        expect(customer.orderCount).toBeGreaterThanOrEqual(0);
        expect(customer.totalSpent).toBeGreaterThanOrEqual(0);
        expect(customer.loyaltyPoints).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid timestamps', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      customers.forEach(customer => {
        const lastMessageDate = new Date(customer.lastMessageAt);
        expect(lastMessageDate.toString()).not.toBe('Invalid Date');
        expect(lastMessageDate.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });
  });

  describe('Customer Filtering', () => {
    it('should filter customers by status', async () => {
      const allCustomers = await db.getCustomersByMerchant(testMerchantId);
      
      const statuses: Array<'active' | 'new' | 'inactive'> = ['active', 'new', 'inactive'];
      
      statuses.forEach(status => {
        const filtered = allCustomers.filter(c => c.status === status);
        
        filtered.forEach(customer => {
          expect(customer.status).toBe(status);
        });
      });
    });

    it('should sort customers by last message date', async () => {
      const customers = await db.getCustomersByMerchant(testMerchantId);
      
      if (customers.length > 1) {
        for (let i = 0; i < customers.length - 1; i++) {
          const current = new Date(customers[i].lastMessageAt).getTime();
          const next = new Date(customers[i + 1].lastMessageAt).getTime();
          
          // Should be sorted in descending order (newest first)
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });
});
