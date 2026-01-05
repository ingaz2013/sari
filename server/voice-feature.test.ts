import { describe, it, expect } from 'vitest';
import { isVoiceMessage, getVoiceFileUrl } from './voice-transcription';

describe('Voice Message Feature', () => {
  describe('isVoiceMessage', () => {
    it('should detect audio message type', () => {
      const webhookData = {
        typeMessage: 'audioMessage',
      };
      
      expect(isVoiceMessage(webhookData)).toBe(true);
    });

    it('should detect voice message type', () => {
      const webhookData = {
        typeMessage: 'voiceMessage',
      };
      
      expect(isVoiceMessage(webhookData)).toBe(true);
    });

    it('should detect audio type with audioMessage object', () => {
      const webhookData = {
        type: 'audio',
        audioMessage: {
          downloadUrl: 'https://example.com/audio.ogg',
        },
      };
      
      // هذا النوع يحتاج إلى typeMessage أو voiceMessage ليتم التعرف عليه
      const result = isVoiceMessage(webhookData);
      // الدالة تبحث عن audioMessage لكن تحتاج type === 'audio' و audioMessage معاً
      expect(result).toBe(true);
    });

    it('should return false for text messages', () => {
      const webhookData = {
        typeMessage: 'textMessage',
      };
      
      expect(isVoiceMessage(webhookData)).toBe(false);
    });
  });

  describe('getVoiceFileUrl', () => {
    it('should extract downloadUrl from audioMessage', () => {
      const webhookData = {
        audioMessage: {
          downloadUrl: 'https://example.com/audio.ogg',
        },
      };
      
      const url = getVoiceFileUrl(webhookData);
      expect(url).toBe('https://example.com/audio.ogg');
    });

    it('should extract downloadUrl from voiceMessage', () => {
      const webhookData = {
        voiceMessage: {
          downloadUrl: 'https://example.com/voice.ogg',
        },
      };
      
      const url = getVoiceFileUrl(webhookData);
      expect(url).toBe('https://example.com/voice.ogg');
    });

    it('should extract direct downloadUrl', () => {
      const webhookData = {
        downloadUrl: 'https://example.com/direct.ogg',
      };
      
      const url = getVoiceFileUrl(webhookData);
      expect(url).toBe('https://example.com/direct.ogg');
    });

    it('should return null if no URL found', () => {
      const webhookData = {
        typeMessage: 'audioMessage',
      };
      
      const url = getVoiceFileUrl(webhookData);
      expect(url).toBeNull();
    });
  });
});
