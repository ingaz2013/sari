/**
 * Webhook Handler for Green API
 * 
 * This handler processes incoming WhatsApp messages from Green API webhooks.
 * It integrates with Sari AI for intelligent responses.
 * 
 * Webhook URL should be: https://your-domain.com/api/webhook/whatsapp
 */

import { Request, Response } from 'express';
import { handleGreenAPIWebhook } from './webhooks/greenapi';

/**
 * Express route handler for WhatsApp webhook
 */
export async function handleWhatsAppWebhook(req: Request, res: Response) {
  try {
    console.log('[Webhook Handler] Received webhook request');
    
    // Call the main webhook handler
    const result = await handleGreenAPIWebhook(req.body);
    
    // Always return 200 to acknowledge receipt
    res.status(200).json({
      received: true,
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[Webhook Handler] Error:', error);
    
    // Still return 200 to prevent Green API from retrying
    res.status(200).json({
      received: true,
      success: false,
      error: error.message || 'Unknown error',
    });
  }
}

/**
 * Setup webhook routes
 * This should be called in your Express app setup
 */
export function setupWebhookRoutes(app: any) {
  // WhatsApp webhook endpoint
  app.post('/api/webhook/whatsapp', handleWhatsAppWebhook);
  
  // Health check endpoint
  app.get('/api/webhook/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Sari AI Webhook'
    });
  });
  
  console.log('[Webhook] Routes registered:');
  console.log('  POST /api/webhook/whatsapp');
  console.log('  GET  /api/webhook/health');
}
