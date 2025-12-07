import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { ENV } from './_core/env';

describe('OpenAI API Key Validation', () => {
  it('should have a valid OpenAI API key', async () => {
    expect(ENV.openaiApiKey).toBeTruthy();
    expect(ENV.openaiApiKey.length).toBeGreaterThan(20);
    expect(ENV.openaiApiKey.startsWith('sk-')).toBe(true);
  });

  it('should be able to call OpenAI API with the key', async () => {
    // Test with a simple API call to verify the key works
    try {
      const response = await axios.get(
        'https://api.openai.com/v1/models',
        {
          headers: {
            'Authorization': `Bearer ${ENV.openaiApiKey}`,
          },
          timeout: 10000,
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
      
      // Check if whisper-1 model is available
      const whisperModel = response.data.data.find((model: any) => model.id === 'whisper-1');
      expect(whisperModel).toBeDefined();
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key - Authentication failed');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - Please check your OpenAI account');
      } else {
        throw error;
      }
    }
  }, 15000); // 15 second timeout
});
