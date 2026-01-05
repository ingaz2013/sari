/**
 * Setup Wizard Tests
 * Tests for Setup Wizard APIs and functionality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Setup Wizard - Progress Management', () => {
  let testMerchantId: number;

  beforeAll(async () => {
    // Create a test merchant for wizard testing
    const testUser = await db.createUser({
      openId: `test-wizard-${Date.now()}`,
      name: 'Test Wizard User',
      email: `wizard-test-${Date.now()}@test.com`,
      role: 'user',
    });

    if (!testUser) throw new Error('Failed to create test user');

    const merchant = await db.createMerchant({
      userId: testUser.id,
      businessName: 'Test Wizard Business',
      phone: '+966500000999',
    });

    if (!merchant) throw new Error('Failed to create test merchant');
    testMerchantId = merchant.id;
  });

  it('should get initial wizard progress', async () => {
    const progress = await db.getSetupWizardProgress(testMerchantId);
    
    expect(progress).toBeDefined();
    expect(progress?.currentStep).toBe(1);
    expect(progress?.isCompleted).toBe(0);
    
    const completedSteps = JSON.parse(progress?.completedSteps || '[]');
    expect(completedSteps).toEqual([]);
  });

  it('should save wizard progress', async () => {
    const wizardData = {
      businessType: 'store',
      businessName: 'Test Store',
      selectedTemplate: 1,
    };

    await db.updateSetupWizardProgress(testMerchantId, {
      currentStep: 3,
      completedSteps: JSON.stringify([1, 2]),
      wizardData: JSON.stringify(wizardData),
    });

    const progress = await db.getSetupWizardProgress(testMerchantId);
    
    expect(progress?.currentStep).toBe(3);
    
    const completedSteps = JSON.parse(progress?.completedSteps || '[]');
    expect(completedSteps).toContain(1);
    expect(completedSteps).toContain(2);
    
    const savedData = JSON.parse(progress?.wizardData || '{}');
    expect(savedData.businessType).toBe('store');
    expect(savedData.businessName).toBe('Test Store');
  });

  it('should mark wizard as completed', async () => {
    await db.completeSetupWizard(testMerchantId);

    const progress = await db.getSetupWizardProgress(testMerchantId);
    
    expect(progress?.isCompleted).toBe(1);
  });

  it('should reset wizard progress', async () => {
    await db.updateSetupWizardProgress(testMerchantId, {
      currentStep: 1,
      completedSteps: JSON.stringify([]),
      wizardData: JSON.stringify({}),
      isCompleted: 0,
    });

    const progress = await db.getSetupWizardProgress(testMerchantId);
    
    expect(progress?.currentStep).toBe(1);
    expect(progress?.isCompleted).toBe(0);
    
    const completedSteps = JSON.parse(progress?.completedSteps || '[]');
    expect(completedSteps).toEqual([]);
  });
});

describe('Setup Wizard - Templates', () => {
  it('should get all business templates', async () => {
    const templates = await db.getAllBusinessTemplates();
    
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThan(0);
    
    // Check that we have templates for all business types
    const storeTemplates = templates.filter(t => t.businessType === 'store');
    const servicesTemplates = templates.filter(t => t.businessType === 'services');
    const bothTemplates = templates.filter(t => t.businessType === 'both');
    
    expect(storeTemplates.length).toBeGreaterThan(0);
    expect(servicesTemplates.length).toBeGreaterThan(0);
    expect(bothTemplates.length).toBeGreaterThan(0);
  });

  it('should get templates by business type', async () => {
    const storeTemplates = await db.getBusinessTemplatesByType('store');
    
    expect(storeTemplates).toBeDefined();
    expect(storeTemplates.length).toBeGreaterThan(0);
    
    // All returned templates should be of type 'store'
    storeTemplates.forEach(template => {
      expect(template.businessType).toBe('store');
    });
  });

  it('should get template by ID', async () => {
    const allTemplates = await db.getAllBusinessTemplates();
    const firstTemplate = allTemplates[0];
    
    const template = await db.getBusinessTemplateById(firstTemplate.id);
    
    expect(template).toBeDefined();
    expect(template?.id).toBe(firstTemplate.id);
    expect(template?.templateName).toBe(firstTemplate.templateName);
  });

  it('should have valid template structure', async () => {
    const templates = await db.getAllBusinessTemplates();
    const template = templates[0];
    
    // Check required fields
    expect(template.templateName).toBeDefined();
    expect(template.businessType).toBeDefined();
    expect(template.icon).toBeDefined();
    expect(template.description).toBeDefined();
    expect(template.suitableFor).toBeDefined();
    
    // Check JSON fields can be parsed
    expect(() => JSON.parse(template.services || '[]')).not.toThrow();
    expect(() => JSON.parse(template.products || '[]')).not.toThrow();
    expect(() => JSON.parse(template.workingHours || '{}')).not.toThrow();
    expect(() => JSON.parse(template.botPersonality || '{}')).not.toThrow();
    expect(() => JSON.parse(template.settings || '{}')).not.toThrow();
  });

  it('should increment template usage count', async () => {
    const templates = await db.getAllBusinessTemplates();
    const template = templates[0];
    
    const initialUsage = template.usageCount;
    
    await db.incrementTemplateUsage(template.id);
    
    const updatedTemplate = await db.getBusinessTemplateById(template.id);
    
    expect(updatedTemplate?.usageCount).toBe(initialUsage + 1);
  });
});

describe('Setup Wizard - Template Application', () => {
  let testMerchantId: number;

  beforeAll(async () => {
    // Create a test merchant for template application
    const testUser = await db.createUser({
      openId: `test-template-${Date.now()}`,
      name: 'Test Template User',
      email: `template-test-${Date.now()}@test.com`,
      role: 'user',
    });

    if (!testUser) throw new Error('Failed to create test user');

    const merchant = await db.createMerchant({
      userId: testUser.id,
      businessName: 'Test Template Business',
      phone: '+966500000888',
    });

    if (!merchant) throw new Error('Failed to create test merchant');
    testMerchantId = merchant.id;
  });

  it('should apply template with products', async () => {
    // Get a store template
    const storeTemplates = await db.getBusinessTemplatesByType('store');
    const template = storeTemplates[0];
    
    // Parse template data
    const products = JSON.parse(template.products || '[]');
    
    // Apply products from template
    for (const product of products) {
      await db.createProduct({
        merchantId: testMerchantId,
        ...product,
      });
    }
    
    // Verify products were created
    const merchantProducts = await db.getProductsByMerchantId(testMerchantId);
    
    expect(merchantProducts.length).toBe(products.length);
  });

  it('should apply template with services', async () => {
    // Get a services template
    const servicesTemplates = await db.getBusinessTemplatesByType('services');
    const template = servicesTemplates[0];
    
    // Parse template data
    const services = JSON.parse(template.services || '[]');
    
    // Create a new merchant for services test
    const testUser = await db.createUser({
      openId: `test-services-${Date.now()}`,
      name: 'Test Services User',
      email: `services-test-${Date.now()}@test.com`,
      role: 'user',
    });

    if (!testUser) throw new Error('Failed to create test user');

    const merchant = await db.createMerchant({
      userId: testUser.id,
      businessName: 'Test Services Business',
      phone: '+966500000777',
    });

    if (!merchant) throw new Error('Failed to create test merchant');
    
    // Apply services from template
    for (const service of services) {
      await db.createService({
        merchantId: merchant.id,
        ...service,
      });
    }
    
    // Verify services were created
    const merchantServices = await db.getServicesByMerchantId(merchant.id);
    
    expect(merchantServices.length).toBe(services.length);
  });

  it('should apply template working hours', async () => {
    const templates = await db.getAllBusinessTemplates();
    const template = templates[0];
    
    const workingHours = JSON.parse(template.workingHours || '{}');
    
    // Update merchant with working hours
    await db.updateMerchant(testMerchantId, {
      workingHours: JSON.stringify(workingHours),
    });
    
    // Verify working hours were applied
    const merchant = await db.getMerchantById(testMerchantId);
    const savedWorkingHours = JSON.parse(merchant?.workingHours || '{}');
    
    expect(savedWorkingHours).toEqual(workingHours);
  });

  it('should apply template bot personality', async () => {
    const templates = await db.getAllBusinessTemplates();
    const template = templates[0];
    
    const botPersonality = JSON.parse(template.botPersonality || '{}');
    
    // Update bot settings
    await db.updateBotSettings(testMerchantId, botPersonality);
    
    // Verify bot settings were applied
    const botSettings = await db.getBotSettings(testMerchantId);
    
    expect(botSettings?.tone).toBe(botPersonality.tone);
    expect(botSettings?.language).toBe(botPersonality.language);
    expect(botSettings?.welcomeMessage).toBe(botPersonality.welcomeMessage);
  });
});

describe('Setup Wizard - Integration Tests', () => {
  it('should complete full wizard flow', async () => {
    // 1. Create test user and merchant
    const testUser = await db.createUser({
      openId: `test-flow-${Date.now()}`,
      name: 'Test Flow User',
      email: `flow-test-${Date.now()}@test.com`,
      role: 'user',
    });

    if (!testUser) throw new Error('Failed to create test user');

    const merchant = await db.createMerchant({
      userId: testUser.id,
      businessName: 'Test Flow Business',
      phone: '+966500000666',
    });

    if (!merchant) throw new Error('Failed to create test merchant');

    // 2. Get initial progress
    const initialProgress = await db.getSetupWizardProgress(merchant.id);
    expect(initialProgress?.currentStep).toBe(1);

    // 3. Progress through wizard steps
    await db.updateSetupWizardProgress(merchant.id, {
      currentStep: 2,
      completedSteps: JSON.stringify([1]),
      wizardData: JSON.stringify({ businessType: 'both' }),
    });

    await db.updateSetupWizardProgress(merchant.id, {
      currentStep: 3,
      completedSteps: JSON.stringify([1, 2]),
      wizardData: JSON.stringify({ 
        businessType: 'both',
        selectedTemplate: 1,
      }),
    });

    // 4. Apply template
    const templates = await db.getBusinessTemplatesByType('both');
    const template = templates[0];
    
    const products = JSON.parse(template.products || '[]');
    const services = JSON.parse(template.services || '[]');
    
    for (const product of products) {
      await db.createProduct({
        merchantId: merchant.id,
        ...product,
      });
    }
    
    for (const service of services) {
      await db.createService({
        merchantId: merchant.id,
        ...service,
      });
    }

    // 5. Complete wizard
    await db.completeSetupWizard(merchant.id);

    // 6. Verify final state
    const finalProgress = await db.getSetupWizardProgress(merchant.id);
    expect(finalProgress?.isCompleted).toBe(1);

    const merchantProducts = await db.getProductsByMerchantId(merchant.id);
    const merchantServices = await db.getServicesByMerchantId(merchant.id);
    
    expect(merchantProducts.length).toBeGreaterThan(0);
    expect(merchantServices.length).toBeGreaterThan(0);
  });

  it('should handle wizard reset correctly', async () => {
    // Create test merchant
    const testUser = await db.createUser({
      openId: `test-reset-${Date.now()}`,
      name: 'Test Reset User',
      email: `reset-test-${Date.now()}@test.com`,
      role: 'user',
    });

    if (!testUser) throw new Error('Failed to create test user');

    const merchant = await db.createMerchant({
      userId: testUser.id,
      businessName: 'Test Reset Business',
      phone: '+966500000555',
    });

    if (!merchant) throw new Error('Failed to create test merchant');

    // Progress through wizard
    await db.updateSetupWizardProgress(merchant.id, {
      currentStep: 5,
      completedSteps: JSON.stringify([1, 2, 3, 4]),
      wizardData: JSON.stringify({ test: 'data' }),
    });

    await db.completeSetupWizard(merchant.id);

    // Verify completed
    let progress = await db.getSetupWizardProgress(merchant.id);
    expect(progress?.isCompleted).toBe(1);

    // Reset wizard
    await db.updateSetupWizardProgress(merchant.id, {
      currentStep: 1,
      completedSteps: JSON.stringify([]),
      wizardData: JSON.stringify({}),
      isCompleted: 0,
    });

    // Verify reset
    progress = await db.getSetupWizardProgress(merchant.id);
    expect(progress?.currentStep).toBe(1);
    expect(progress?.isCompleted).toBe(0);
    
    const completedSteps = JSON.parse(progress?.completedSteps || '[]');
    expect(completedSteps).toEqual([]);
  });
});
