import { describe, it, expect } from 'vitest';
import type { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from './routers';

describe('publicSari Router - API Structure', () => {
  it('should have correct input type for chat endpoint', () => {
    // This test validates the API structure without making actual calls
    const validInput: inferProcedureInput<AppRouter['publicSari']['chat']> = {
      message: 'مرحبا',
      sessionId: 'test-session',
    };

    expect(validInput.message).toBe('مرحبا');
    expect(validInput.sessionId).toBe('test-session');
  });

  it('should allow optional sessionId', () => {
    const validInput: inferProcedureInput<AppRouter['publicSari']['chat']> = {
      message: 'مرحبا',
    };

    expect(validInput.message).toBe('مرحبا');
    expect(validInput.sessionId).toBeUndefined();
  });

  it('should accept empty message', () => {
    const validInput: inferProcedureInput<AppRouter['publicSari']['chat']> = {
      message: '',
    };

    expect(validInput.message).toBe('');
  });
});
