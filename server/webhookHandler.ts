import { Request, Response } from 'express';
import { parseWebhookMessage, IncomingMessage, sendTextMessage } from './whatsapp';
import * as db from './db';
import { transcribeAudio } from './_core/voiceTranscription';
import { processIncomingMessage } from './ai';

/**
 * Webhook Handler for Green API
 * 
 * This handler processes incoming WhatsApp messages from Green API webhooks.
 * It saves messages to the database and can trigger AI responses.
 * 
 * Webhook URL should be: https://your-domain.com/api/webhook/whatsapp
 */

export async function handleWhatsAppWebhook(req: Request, res: Response) {
  try {
    // Parse the incoming webhook data
    const webhookData = req.body;
    
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2));

    // Parse the message
    const incomingMessage = parseWebhookMessage(webhookData);
    
    if (!incomingMessage) {
      // Not a message we care about, acknowledge and return
      return res.status(200).json({ received: true });
    }

    // Find the merchant by phone number (from whatsappConnections table)
    const connection = await db.getWhatsappConnectionByPhone(incomingMessage.from);
    
    if (!connection) {
      console.log(`No merchant found for phone number: ${incomingMessage.from}`);
      return res.status(200).json({ received: true, message: 'No merchant found' });
    }

    // Find or create conversation
    let conversation = await db.getConversationByCustomerPhone(
      connection.merchantId,
      incomingMessage.from
    ) || null;

    if (!conversation) {
      // Create new conversation
      const newConv = await db.createConversation({
        merchantId: connection.merchantId,
        customerPhone: incomingMessage.from,
        customerName: incomingMessage.from, // Will be updated later if we get the name
        status: 'active',
        lastMessageAt: new Date(incomingMessage.timestamp),
      });
      conversation = newConv || null;
    } else {
      // Update last message time
      await db.updateConversation(conversation!.id, {
        lastMessageAt: new Date(incomingMessage.timestamp),
        status: 'active',
      });
    }

    // Save the message to database
    const messageType = incomingMessage.type === 'audio' ? 'voice' : 
                       incomingMessage.type === 'video' || incomingMessage.type === 'document' ? 'image' : 
                       incomingMessage.type;
    
    const savedMessage = await db.createMessage({
      conversationId: conversation!.id,
      direction: 'incoming',
      messageType: messageType as 'text' | 'voice' | 'image',
      content: incomingMessage.message || '',
      voiceUrl: incomingMessage.type === 'audio' ? incomingMessage.fileUrl : undefined,
      imageUrl: incomingMessage.type === 'image' ? incomingMessage.fileUrl : undefined,
      isProcessed: false,
    });

    // Process the message and generate AI response
    let messageText = incomingMessage.message || '';
    
    // If it's a voice message, transcribe it first
    if (incomingMessage.type === 'audio' && incomingMessage.fileUrl) {
      try {
        console.log('[Webhook] Transcribing voice message...');
        const transcription = await transcribeAudio({
          audioUrl: incomingMessage.fileUrl,
          language: 'ar',
        });
        
        if ('text' in transcription && transcription.text) {
          messageText = transcription.text;
          console.log('[Webhook] Transcription successful:', messageText);
          
          // Update the message with transcribed text
          if (savedMessage) {
            await db.updateMessage(savedMessage.id, {
              content: messageText,
              isProcessed: true,
            });
          }
        } else {
          console.error('[Webhook] Transcription failed:', transcription);
          messageText = 'رسالة صوتية (فشل التحويل إلى نص)';
        }
      } catch (error) {
        console.error('[Webhook] Error transcribing voice message:', error);
        messageText = 'رسالة صوتية (حدث خطأ في التحويل)';
      }
    }
    
    // Generate AI response if we have text
    if (messageText && messageText.trim()) {
      const aiResponse = await processIncomingMessage(
        connection.merchantId,
        conversation!.id,
        incomingMessage.from,
        messageText
      );
      
      // Send the AI response back via WhatsApp
      if (aiResponse) {
        const sendResult = await sendTextMessage(incomingMessage.from, aiResponse);
        
        if (!sendResult.success) {
          console.error('[Webhook] Failed to send AI response:', sendResult.error);
        } else {
          console.log('[Webhook] AI response sent successfully');
        }
      }
    }

    // For now, just acknowledge receipt
    res.status(200).json({ 
      received: true, 
      conversationId: conversation?.id,
      message: 'Message saved successfully' 
    });

  } catch (error: any) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Setup webhook route
 * This should be called in your Express app setup
 */
export function setupWebhookRoutes(app: any) {
  // WhatsApp webhook endpoint
  app.post('/api/webhook/whatsapp', handleWhatsAppWebhook);
  
  // Health check endpoint
  app.get('/api/webhook/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
}
