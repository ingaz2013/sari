import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Plans API', () => {
  let testPlanId: number;

  beforeAll(async () => {
    // Create a test plan
    const plan = await db.createPlan({
      name: 'TEST',
      nameAr: 'Test Plan',
      priceMonthly: 100,
      conversationLimit: 100,
      voiceMessageLimit: 50,
      features: JSON.stringify({ test: true }),
      isActive: true,
    });
    if (plan) {
      testPlanId = plan.id;
    }
  });

  it('should list all active plans', async () => {
    const caller = appRouter.createCaller({
      user: null,
    });

    const plans = await caller.plans.list();

    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThan(0);
  });

  it('should get plan by ID', async () => {
    const caller = appRouter.createCaller({
      user: null,
    });

    const plan = await caller.plans.getById({ id: testPlanId });

    expect(plan).toBeDefined();
    expect(plan?.id).toBe(testPlanId);
    expect(plan?.name).toBe('TEST');
  });

  it('should allow admin to create plan', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '1',
        openId: 'admin-open-id',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      },
    });

    const newPlan = await caller.plans.create({
      name: 'B1',
      nameAr: 'Starter',
      priceMonthly: 90,
      conversationLimit: 150,
      voiceMessageLimit: 50,
      features: JSON.stringify({ ai: true, whatsapp: true }),
    });

    expect(newPlan).toBeDefined();
    expect(newPlan?.name).toBe('B1');
    expect(newPlan?.priceMonthly).toBe(90);

    // Cleanup
    if (newPlan) {
      await db.updatePlan(newPlan.id, { isActive: false });
    }
  });

  it('should reject non-admin from creating plan', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '2',
        openId: 'user-open-id',
        name: 'Regular User',
        email: 'user@test.com',
        role: 'user',
      },
    });

    await expect(
      caller.plans.create({
        name: 'B1',
        nameAr: 'Starter',
        priceMonthly: 90,
        conversationLimit: 150,
        voiceMessageLimit: 50,
        features: JSON.stringify({ ai: true }),
      })
    ).rejects.toThrow('Admin access required');
  });

  it('should allow admin to update plan', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '1',
        openId: 'admin-open-id',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      },
    });

    const result = await caller.plans.update({
      id: testPlanId,
      priceMonthly: 120,
      conversationLimit: 200,
    });

    expect(result.success).toBe(true);

    // Verify update
    const updatedPlan = await db.getPlanById(testPlanId);
    expect(updatedPlan?.priceMonthly).toBe(120);
    expect(updatedPlan?.conversationLimit).toBe(200);
  });

  it('should reject non-admin from updating plan', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '2',
        openId: 'user-open-id',
        name: 'Regular User',
        email: 'user@test.com',
        role: 'user',
      },
    });

    await expect(
      caller.plans.update({
        id: testPlanId,
        priceMonthly: 150,
      })
    ).rejects.toThrow('Admin access required');
  });

  it('should handle unlimited voice messages (-1)', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '1',
        openId: 'admin-open-id',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      },
    });

    const unlimitedPlan = await caller.plans.create({
      name: 'B2',
      nameAr: 'Growth',
      priceMonthly: 230,
      conversationLimit: 600,
      voiceMessageLimit: -1,
      features: JSON.stringify({ ai: true, whatsapp: true, unlimited_voice: true }),
    });

    expect(unlimitedPlan).toBeDefined();
    expect(unlimitedPlan?.voiceMessageLimit).toBe(-1);

    // Cleanup
    if (unlimitedPlan) {
      await db.updatePlan(unlimitedPlan.id, { isActive: false });
    }
  });

  it('should deactivate plan', async () => {
    const caller = appRouter.createCaller({
      user: {
        id: '1',
        openId: 'admin-open-id',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      },
    });

    const result = await caller.plans.update({
      id: testPlanId,
      isActive: false,
    });

    expect(result.success).toBe(true);

    // Verify deactivation
    const deactivatedPlan = await db.getPlanById(testPlanId);
    expect(deactivatedPlan?.isActive).toBe(false);
  });
});
