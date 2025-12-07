import { describe, it, expect, beforeAll } from 'vitest';
import { parseWebhookMessage } from '../whatsapp';
import * as db from '../db';

describe('Webhook Voice Integration', () => {
  let testUserId: number;
  let testMerchantId: number;

  beforeAll(async () => {
    // إنشاء مستخدم تجريبي
    const testUser = await db.createUser({
      openId: `test-webhook-voice-${Date.now()}`,
      name: 'Webhook Voice Test User',
      email: `webhook-voice-test-${Date.now()}@test.com`,
      role: 'user',
    });
    testUserId = testUser.id;

    // إنشاء متجر تجريبي
    const testMerchant = await db.createMerchant({
      userId: testUserId,
      businessName: 'Webhook Voice Test Store',
      phone: '+966501234567',
      autoReplyEnabled: true,
    });
    testMerchantId = testMerchant.id;
  });

  describe('parseWebhookMessage', () => {
    it('should parse text message correctly', () => {
      const webhookData = {
        typeWebhook: 'incomingMessageReceived',
        messageData: {
          chatId: '966501234567@c.us',
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: 'مرحباً',
          },
          timestamp: Date.now(),
        },
      };

      const result = parseWebhookMessage(webhookData);

      expect(result).toBeDefined();
      expect(result?.type).toBe('text');
      expect(result?.from).toBe('966501234567');
      expect(result?.message).toBe('مرحباً');
    });

    it('should parse audio message correctly', () => {
      const webhookData = {
        typeWebhook: 'incomingMessageReceived',
        messageData: {
          chatId: '966501234567@c.us',
          typeMessage: 'audioMessage',
          downloadUrl: 'https://example.com/audio.ogg',
          timestamp: Date.now(),
        },
      };

      const result = parseWebhookMessage(webhookData);

      expect(result).toBeDefined();
      expect(result?.type).toBe('audio');
      expect(result?.from).toBe('966501234567');
      expect(result?.fileUrl).toBe('https://example.com/audio.ogg');
    });

    it('should return null for non-incoming messages', () => {
      const webhookData = {
        typeWebhook: 'outgoingMessageStatus',
        messageData: {
          chatId: '966501234567@c.us',
        },
      };

      const result = parseWebhookMessage(webhookData);

      expect(result).toBeNull();
    });

    it('should return null for invalid webhook data', () => {
      const result = parseWebhookMessage(null);
      expect(result).toBeNull();

      const result2 = parseWebhookMessage({});
      expect(result2).toBeNull();
    });
  });

  describe('Voice Message Processing Flow', () => {
    it('should handle voice message type correctly', async () => {
      // إنشاء محادثة تجريبية
      const conversation = await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: '+966501234567',
        customerName: 'Test Customer',
        status: 'active',
        lastMessageAt: new Date(),
      });

      // حفظ رسالة صوتية
      const voiceMessage = await db.createMessage({
        conversationId: conversation.id,
        direction: 'incoming',
        messageType: 'voice',
        content: '', // سيتم تحديثه بعد التحويل
        voiceUrl: 'https://example.com/voice.ogg',
        isProcessed: false,
      });

      expect(voiceMessage).toBeDefined();
      expect(voiceMessage.messageType).toBe('voice');
      expect(voiceMessage.voiceUrl).toBe('https://example.com/voice.ogg');
      expect(voiceMessage.isProcessed).toBe(false);
    });

    it('should update message content after transcription', async () => {
      // إنشاء محادثة تجريبية
      const conversation = await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: '+966509876543',
        customerName: 'Test Customer 2',
        status: 'active',
        lastMessageAt: new Date(),
      });

      // حفظ رسالة صوتية
      const voiceMessage = await db.createMessage({
        conversationId: conversation.id,
        direction: 'incoming',
        messageType: 'voice',
        content: '',
        voiceUrl: 'https://example.com/voice2.ogg',
        isProcessed: false,
      });

      // محاكاة تحديث الرسالة بعد التحويل
      const transcribedText = 'أريد شراء جوال آيفون';
      await db.updateMessage(voiceMessage.id, {
        content: transcribedText,
        isProcessed: true,
      });

      // التحقق من التحديث
      const messages = await db.getMessagesByConversationId(conversation.id);
      const updatedMessage = messages.find(m => m.id === voiceMessage.id);

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.content).toBe(transcribedText);
      expect(updatedMessage?.isProcessed).toBe(true);
    });

    it('should create AI response after voice transcription', async () => {
      // إنشاء محادثة تجريبية
      const conversation = await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: '+966508888888',
        customerName: 'Test Customer 3',
        status: 'active',
        lastMessageAt: new Date(),
      });

      // حفظ رسالة صوتية محولة
      await db.createMessage({
        conversationId: conversation.id,
        direction: 'incoming',
        messageType: 'voice',
        content: 'كم سعر الجوال؟',
        voiceUrl: 'https://example.com/voice3.ogg',
        isProcessed: true,
      });

      // حفظ رد ساري
      const aiResponse = await db.createMessage({
        conversationId: conversation.id,
        direction: 'outgoing',
        messageType: 'text',
        content: 'أهلاً! أسعار الجوالات تبدأ من 1500 ريال',
        isProcessed: true,
        aiResponse: 'أهلاً! أسعار الجوالات تبدأ من 1500 ريال',
      });

      expect(aiResponse).toBeDefined();
      expect(aiResponse.direction).toBe('outgoing');
      expect(aiResponse.messageType).toBe('text');
      expect(aiResponse.aiResponse).toBeDefined();
    });
  });

  describe('Conversation Flow', () => {
    it('should maintain conversation history with voice messages', async () => {
      const conversation = await db.createConversation({
        merchantId: testMerchantId,
        customerPhone: '+966507777777',
        customerName: 'Test Customer 4',
        status: 'active',
        lastMessageAt: new Date(),
      });

      // رسالة صوتية 1
      await db.createMessage({
        conversationId: conversation.id,
        direction: 'incoming',
        messageType: 'voice',
        content: 'عندكم جوالات سامسونج؟',
        voiceUrl: 'https://example.com/v1.ogg',
        isProcessed: true,
      });

      // رد ساري
      await db.createMessage({
        conversationId: conversation.id,
        direction: 'outgoing',
        messageType: 'text',
        content: 'نعم، عندنا جوالات سامسونج متنوعة',
        isProcessed: true,
      });

      // رسالة صوتية 2
      await db.createMessage({
        conversationId: conversation.id,
        direction: 'incoming',
        messageType: 'voice',
        content: 'كم سعر Galaxy S23؟',
        voiceUrl: 'https://example.com/v2.ogg',
        isProcessed: true,
      });

      const messages = await db.getMessagesByConversationId(conversation.id);

      expect(messages.length).toBe(3);
      expect(messages[0].messageType).toBe('voice');
      expect(messages[1].direction).toBe('outgoing');
      expect(messages[2].messageType).toBe('voice');
    });
  });
});
