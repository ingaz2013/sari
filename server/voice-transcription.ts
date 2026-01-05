/**
 * Voice Transcription Module
 * 
 * Converts voice messages from WhatsApp to text using OpenAI Whisper API
 */

import { invokeLLM } from './_core/llm';
import axios from 'axios';
import FormData from 'form-data';
import { ENV } from './_core/env';

/**
 * Download voice message file from Green API
 */
async function downloadVoiceFile(fileUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('[Voice] Failed to download voice file:', error);
    throw new Error('فشل تحميل الملف الصوتي');
  }
}

/**
 * Transcribe voice message to text using OpenAI Whisper
 */
export async function transcribeVoiceMessage(
  fileUrl: string,
  language: 'ar' | 'en' = 'ar'
): Promise<{
  text: string;
  duration?: number;
  language: string;
}> {
  const startTime = Date.now();
  
  try {
    console.log('[Voice] Starting transcription:', { fileUrl, language });
    
    // Download the voice file
    const audioBuffer = await downloadVoiceFile(fileUrl);
    console.log('[Voice] Downloaded file, size:', audioBuffer.length, 'bytes');
    
    // Check file size (max 25MB for Whisper API)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new Error('الملف الصوتي كبير جداً (الحد الأقصى 25 ميجابايت)');
    }
    
    // Create form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'voice.ogg',
      contentType: 'audio/ogg',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');
    
    // Call OpenAI Whisper API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${ENV.openaiApiKey}`,
        },
        timeout: 60000, // 60 seconds
      }
    );
    
    const duration = Date.now() - startTime;
    const text = response.data.text;
    
    console.log('[Voice] Transcription successful:', {
      text: text.substring(0, 100) + '...',
      duration: `${duration}ms`,
      language: response.data.language || language,
    });
    
    return {
      text,
      duration,
      language: response.data.language || language,
    };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[Voice] Transcription failed:', {
      error: error.message,
      duration: `${duration}ms`,
    });
    
    // Return user-friendly error message
    if (error.response?.status === 429) {
      throw new Error('تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً');
    } else if (error.response?.status === 401) {
      throw new Error('خطأ في مفتاح OpenAI API');
    } else if (error.message.includes('timeout')) {
      throw new Error('انتهت مهلة معالجة الملف الصوتي');
    } else {
      throw new Error('فشل تحويل الرسالة الصوتية إلى نص');
    }
  }
}

/**
 * Check if a message is a voice message based on Green API webhook data
 */
export function isVoiceMessage(messageData: any): boolean {
  return (
    messageData.typeMessage === 'audioMessage' ||
    messageData.typeMessage === 'voiceMessage' ||
    (messageData.type === 'audio' && !!messageData.audioMessage) ||
    (messageData.type === 'voice' && !!messageData.voiceMessage)
  );
}

/**
 * Extract voice file URL from Green API webhook data
 */
export function getVoiceFileUrl(messageData: any): string | null {
  // Try different possible structures from Green API
  const fileUrl =
    messageData.downloadUrl ||
    messageData.fileUrl ||
    messageData.audioMessage?.downloadUrl ||
    messageData.voiceMessage?.downloadUrl ||
    messageData.url;
  
  return fileUrl || null;
}
