import * as db from '../db';
import { parseWebhookMessage, sendTextMessage } from '../whatsapp';
import { processIncomingMessage } from '../ai';
import { transcribeVoiceMessage, isVoiceMessage, getVoiceFileUrl } from '../voice-transcription';
import { 
  isOrderRequest, 
  parseOrderMessage, 
  createOrderFromChat,
  generateOrderConfirmationMessage,
  generateGiftOrderConfirmationMessage 
} from '../automation/order-from-chat';
import { trackAbandonedCart, isProductSelectionMessage } from '../automation/abandoned-cart-recovery';

interface WebhookResult {
  success: boolean;
  message: string;
}

/**
 * معالجة Webhook من Green API
 */
export async function handleGreenAPIWebhook(webhookData: any): Promise<WebhookResult> {
  try {
    // تحليل الرسالة الواردة
    const incomingMessage = parseWebhookMessage(webhookData);
    
    if (!incomingMessage) {
      console.log('[Green API Webhook] Could not parse incoming message');
      return {
        success: true,
        message: 'Invalid message format'
      };
    }

    const customerPhone = incomingMessage.from;
    let messageText = incomingMessage.message || '';
    let messageType: 'text' | 'voice' | 'image' | 'video' | 'file' = 'text';

    // فحص إذا كانت رسالة صوتية
    if (isVoiceMessage(webhookData)) {
      console.log(`[Green API Webhook] Voice message detected from ${customerPhone}`);
      messageType = 'voice';
      
      const voiceFileUrl = getVoiceFileUrl(webhookData);
      
      if (!voiceFileUrl) {
        console.error('[Green API Webhook] Could not extract voice file URL');
        return {
          success: false,
          message: 'Voice file URL not found'
        };
      }
      
      try {
        // تحويل الرسالة الصوتية إلى نص
        const transcription = await transcribeVoiceMessage(voiceFileUrl, 'ar');
        messageText = transcription.text;
        
        console.log(`[Green API Webhook] Voice transcribed: ${messageText.substring(0, 100)}...`);
        
        // إرسال تأكيد للعميل بأننا فهمنا الرسالة
        await sendTextMessage(
          customerPhone,
          `✅ فهمت رسالتك الصوتية: "${messageText}"\n\nخليني أعالج طلبك...`
        );
        
      } catch (error: any) {
        console.error('[Green API Webhook] Voice transcription failed:', error.message);
        
        // إرسال رسالة خطأ للعميل
        await sendTextMessage(
          customerPhone,
          `❌ عذراً، ما قدرت أفهم الرسالة الصوتية. ممكن تكتب طلبك بالنص؟`
        );
        
        return {
          success: false,
          message: `Voice transcription failed: ${error.message}`
        };
      }
    } else if (incomingMessage.type !== 'text') {
      console.log('[Green API Webhook] Skipping non-text/non-voice message');
      return {
        success: true,
        message: 'Non-text/non-voice message skipped'
      };
    }

    console.log(`[Green API Webhook] Processing message from ${customerPhone}: ${messageText}`);

    // البحث عن المحادثة الموجودة
    // أولاً نحتاج لمعرفة merchantId من رقم الواتساب
    const whatsappConnection = await db.getWhatsappConnectionByPhone(customerPhone);
    
    if (!whatsappConnection) {
      console.error(`[Green API Webhook] No WhatsApp connection found for phone ${customerPhone}`);
      return {
        success: false,
        message: 'No WhatsApp connection found'
      };
    }

    let conversation = await db.getConversationByCustomerPhone(whatsappConnection.merchantId, customerPhone);
    
    if (!conversation) {
      // إنشاء محادثة جديدة
      const newConv = await db.createConversation({
        merchantId: whatsappConnection.merchantId,
        customerPhone,
        customerName: customerPhone, // يمكن تحديثه لاحقاً
        status: 'active',
        lastMessageAt: new Date(),
      });
      
      if (!newConv) {
        throw new Error('Failed to create conversation');
      }
      
      conversation = newConv;
    }

    // حفظ الرسالة الواردة
    await db.createMessage({
      conversationId: conversation.id,
      direction: 'incoming',
      content: messageText,
      messageType: messageType,
      isProcessed: false,
    });

    // تحديث آخر رسالة في المحادثة
    await db.updateConversation(conversation.id, {
      lastMessageAt: new Date(),
    });

    // فحص إذا كانت الرسالة طلب شراء
    const isOrder = await isOrderRequest(messageText);
    
    if (isOrder) {
      console.log(`[Green API Webhook] Order request detected from ${customerPhone}`);
      
      try {
        // تحليل الطلب
        const parsedOrder = await parseOrderMessage(messageText, conversation.merchantId);
        
        if (parsedOrder && parsedOrder.products.length > 0) {
          // إنشاء الطلب (مع تمرير الرسالة لاكتشاف كودات الخصم)
          const orderResult = await createOrderFromChat(
            conversation.merchantId,
            customerPhone,
            conversation.customerName || customerPhone,
            parsedOrder,
            messageText // تمرير الرسالة لاكتشاف كودات الخصم
          );
          
          if (orderResult) {
            // الحصول على تفاصيل الطلب
            const order = await db.getOrderById(orderResult.orderId);
            if (order) {
              const items = JSON.parse(order.items);
              
              // توليد رسالة التأكيد
              const confirmationMessage = order.isGift
                ? generateGiftOrderConfirmationMessage(
                    order.orderNumber || '',
                    order.giftRecipientName || '',
                    items,
                    order.totalAmount,
                    orderResult.paymentUrl || '',
                    orderResult.discountInfo
                  )
                : generateOrderConfirmationMessage(
                    order.orderNumber || '',
                    items,
                    order.totalAmount,
                    orderResult.paymentUrl || '',
                    orderResult.discountInfo
                  );
              
              // إرسال رسالة التأكيد
              const sendResult = await sendTextMessage(customerPhone, confirmationMessage);
              
              if (sendResult.success) {
                console.log(`[Green API Webhook] Order confirmation sent to ${customerPhone}`);
                
                // حفظ رسالة التأكيد
                await db.createMessage({
                  conversationId: conversation.id,
                  direction: 'outgoing',
                  content: confirmationMessage,
                  messageType: 'text',
                  isProcessed: true,
                });
              }
              
              return {
                success: true,
                message: 'Order created and confirmation sent'
              };
            }
          } else {
            // فشل إنشاء الطلب
            const errorMessage = 'عذراً، لم نتمكن من إنشاء طلبك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.';
            await sendTextMessage(customerPhone, errorMessage);
          }
        } else {
          // لم نتمكن من فهم الطلب
          const clarificationMessage = 'أهلاً بك! 👋\n\nلم أتمكن من فهم طلبك بشكل كامل. هل يمكنك توضيح:\n\n1️⃣ المنتجات المطلوبة\n2️⃣ الكمية\n3️⃣ العنوان (إن أمكن)\n\nمثال: "أبي جوال آيفون عدد 2 وسماعة بلوتوث عدد 1"';
          await sendTextMessage(customerPhone, clarificationMessage);
        }
      } catch (error) {
        console.error('[Green API Webhook] Error processing order:', error);
        const errorMessage = 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.';
        await sendTextMessage(customerPhone, errorMessage);
      }
    } else {
      // رسالة عادية - معالجة بالذكاء الاصطناعي
      const aiResponse = await processIncomingMessage(
        conversation.merchantId,
        conversation.id,
        customerPhone,
        messageText
      );

      if (aiResponse) {
        // إرسال الرد عبر WhatsApp
        const sendResult = await sendTextMessage(customerPhone, aiResponse);
        
        if (sendResult.success) {
          console.log(`[Green API Webhook] AI response sent successfully to ${customerPhone}`);
        } else {
          console.error(`[Green API Webhook] Failed to send AI response: ${sendResult.error}`);
        }
      }
      
      // تتبع السلة المهجورة إذا كانت الرسالة تحتوي على اختيار منتجات
      if (isProductSelectionMessage(messageText)) {
        try {
          // تحليل الرسالة لاستخراج المنتجات
          const parsedOrder = await parseOrderMessage(messageText, conversation.merchantId);
          
          if (parsedOrder && parsedOrder.products.length > 0) {
            // حساب الإجمالي
            const products = await db.getProductsByMerchantId(conversation.merchantId);
            let totalAmount = 0;
            const items = [];
            
            for (const item of parsedOrder.products) {
              const product = products.find(p => 
                p.name.toLowerCase().includes(item.name.toLowerCase()) ||
                item.name.toLowerCase().includes(p.name.toLowerCase())
              );
              
              if (product) {
                items.push({
                  productId: product.id,
                  productName: product.name,
                  quantity: item.quantity,
                  price: product.price
                });
                totalAmount += product.price * item.quantity;
              }
            }
            
            if (items.length > 0) {
              // تتبع السلة المهجورة
              await trackAbandonedCart(
                conversation.merchantId,
                customerPhone,
                conversation.customerName,
                items,
                totalAmount
              );
              
              console.log(`[Green API Webhook] Abandoned cart tracked for ${customerPhone}`);
            }
          }
        } catch (error) {
          console.error('[Green API Webhook] Error tracking abandoned cart:', error);
        }
      }
    }

    return {
      success: true,
      message: 'Message processed successfully'
    };

  } catch (error: any) {
    console.error('[Green API Webhook] Error processing webhook:', error);
    return {
      success: false,
      message: error.message || 'Unknown error'
    };
  }
}
