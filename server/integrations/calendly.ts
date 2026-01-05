import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import * as db from '../db';

// Calendly API Base URL
const CALENDLY_API_BASE = 'https://api.calendly.com';

// Helper function to make Calendly API requests
async function calendlyApiRequest(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const response = await fetch(`${CALENDLY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendly API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Calendly Integration Router
export const calendlyRouter = router({
  // Get connection status
  getConnection: protectedProcedure
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const integration = await db.getIntegrationByType(input.merchantId, 'calendly');
      
      if (!integration) {
        return { connected: false };
      }

      return {
        connected: integration.isActive,
        userName: integration.storeName, // Using storeName to store user name
        userUri: integration.storeUrl, // Using storeUrl to store user URI
        lastSync: integration.lastSyncAt,
        settings: integration.settings ? JSON.parse(integration.settings) : null,
      };
    }),

  // Connect to Calendly
  connect: protectedProcedure
    .input(z.object({
      merchantId: z.number(),
      apiKey: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Verify the API key by fetching current user
        const userInfo = await calendlyApiRequest('/users/me', input.apiKey);

        // Save integration
        await db.createIntegration({
          merchantId: input.merchantId,
          type: 'calendly',
          storeName: userInfo.resource.name || 'Calendly User',
          storeUrl: userInfo.resource.uri,
          accessToken: input.apiKey,
          isActive: true,
          settings: JSON.stringify({
            autoConfirm: true,
            sendReminders: true,
            syncToWhatsApp: true,
          }),
        });

        return { success: true, message: 'تم ربط حساب Calendly بنجاح' };
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'فشل الاتصال بـ Calendly',
        });
      }
    }),

  // Disconnect from Calendly
  disconnect: protectedProcedure
    .input(z.object({ merchantId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteIntegrationByType(input.merchantId, 'calendly');
      return { success: true, message: 'تم فصل حساب Calendly' };
    }),

  // Sync now
  syncNow: protectedProcedure
    .input(z.object({ merchantId: z.number() }))
    .mutation(async ({ input }) => {
      const integration = await db.getIntegrationByType(input.merchantId, 'calendly');
      
      if (!integration || !integration.accessToken) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'لم يتم العثور على تكامل Calendly',
        });
      }

      try {
        // Get user URI
        const userUri = integration.storeUrl;
        
        // Fetch scheduled events
        const events = await calendlyApiRequest(
          `/scheduled_events?user=${encodeURIComponent(userUri)}&status=active`,
          integration.accessToken
        );

        let syncedEvents = 0;
        
        if (events.collection) {
          for (const event of events.collection) {
            await db.upsertAppointmentFromCalendly(input.merchantId, event);
            syncedEvents++;
          }
        }

        // Update last sync time
        await db.updateIntegrationLastSync(integration.id);

        // Log sync
        await db.createSyncLog({
          merchantId: input.merchantId,
          type: 'calendly_sync',
          status: 'success',
          message: `تمت مزامنة ${syncedEvents} موعد`,
        });

        return { 
          success: true, 
          message: `تمت مزامنة ${syncedEvents} موعد بنجاح` 
        };
      } catch (error: any) {
        await db.createSyncLog({
          merchantId: input.merchantId,
          type: 'calendly_sync',
          status: 'error',
          message: error.message,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'فشلت المزامنة',
        });
      }
    }),

  // Update settings
  updateSettings: protectedProcedure
    .input(z.object({
      merchantId: z.number(),
      autoConfirm: z.boolean(),
      sendReminders: z.boolean(),
      syncToWhatsApp: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const integration = await db.getIntegrationByType(input.merchantId, 'calendly');
      
      if (!integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'لم يتم العثور على تكامل Calendly',
        });
      }

      await db.updateIntegrationSettings(integration.id, {
        autoConfirm: input.autoConfirm,
        sendReminders: input.sendReminders,
        syncToWhatsApp: input.syncToWhatsApp,
      });

      return { success: true };
    }),

  // Get upcoming events
  getUpcomingEvents: protectedProcedure
    .input(z.object({ 
      merchantId: z.number(),
      limit: z.number().optional().default(5),
    }))
    .query(async ({ input }) => {
      const integration = await db.getIntegrationByType(input.merchantId, 'calendly');
      
      if (!integration || !integration.accessToken) {
        return [];
      }

      try {
        const userUri = integration.storeUrl;
        const now = new Date().toISOString();
        
        const events = await calendlyApiRequest(
          `/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&min_start_time=${now}&count=${input.limit}`,
          integration.accessToken
        );

        return events.collection?.map((event: any) => ({
          uri: event.uri,
          name: event.name,
          startTime: event.start_time,
          endTime: event.end_time,
          status: event.status,
          inviteeName: event.invitees_counter?.total > 0 ? 'عميل' : '-',
        })) || [];
      } catch (error) {
        console.error('[Calendly] Error fetching events:', error);
        return [];
      }
    }),

  // Get event types
  getEventTypes: protectedProcedure
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const integration = await db.getIntegrationByType(input.merchantId, 'calendly');
      
      if (!integration || !integration.accessToken) {
        return [];
      }

      try {
        const userUri = integration.storeUrl;
        
        const eventTypes = await calendlyApiRequest(
          `/event_types?user=${encodeURIComponent(userUri)}&active=true`,
          integration.accessToken
        );

        return eventTypes.collection?.map((et: any) => ({
          uri: et.uri,
          name: et.name,
          duration: et.duration,
          schedulingUrl: et.scheduling_url,
          active: et.active,
        })) || [];
      } catch (error) {
        console.error('[Calendly] Error fetching event types:', error);
        return [];
      }
    }),

  // Get stats
  getStats: protectedProcedure
    .input(z.object({ merchantId: z.number() }))
    .query(async ({ input }) => {
      const integration = await db.getIntegrationByType(input.merchantId, 'calendly');
      
      if (!integration) {
        return null;
      }

      // Get appointment stats from database
      const stats = await db.getAppointmentStatsByMerchant(input.merchantId);
      
      return {
        totalEvents: stats.total || 0,
        upcomingEvents: stats.upcoming || 0,
        eventTypes: stats.eventTypes || 0,
        remindersSent: stats.remindersSent || 0,
      };
    }),
});

// Webhook handler for Calendly events
export async function handleCalendlyWebhook(merchantId: number, event: string, payload: any) {
  console.log(`[Calendly Webhook] Merchant ${merchantId} - Event: ${event}`);

  const integration = await db.getIntegrationByType(merchantId, 'calendly');
  if (!integration || !integration.isActive) {
    console.log('[Calendly Webhook] Integration not found or inactive');
    return;
  }

  const settings = integration.settings ? JSON.parse(integration.settings) : {};

  switch (event) {
    case 'invitee.created':
      // New appointment booked
      await db.upsertAppointmentFromCalendly(merchantId, payload);
      
      // Send WhatsApp notification if enabled
      if (settings.syncToWhatsApp) {
        const invitee = payload.payload?.invitee;
        if (invitee?.phone_number) {
          await db.createScheduledMessage({
            merchantId,
            customerPhone: invitee.phone_number,
            message: `مرحباً ${invitee.name}! تم تأكيد موعدك بنجاح.\n\n📅 التاريخ: ${new Date(payload.payload?.event?.start_time).toLocaleDateString('ar-SA')}\n⏰ الوقت: ${new Date(payload.payload?.event?.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}\n\nنتطلع لرؤيتك!`,
            scheduledAt: new Date(),
            status: 'pending',
          });
        }
      }

      await db.createSyncLog({
        merchantId,
        type: 'calendly_webhook',
        status: 'success',
        message: `تم حجز موعد جديد: ${payload.payload?.event?.name}`,
      });
      break;

    case 'invitee.canceled':
      // Appointment canceled
      await db.cancelAppointmentFromCalendly(merchantId, payload);
      
      await db.createSyncLog({
        merchantId,
        type: 'calendly_webhook',
        status: 'success',
        message: `تم إلغاء موعد: ${payload.payload?.event?.name}`,
      });
      break;

    case 'routing_form_submission.created':
      // Form submitted - could be used for lead capture
      await db.createSyncLog({
        merchantId,
        type: 'calendly_webhook',
        status: 'success',
        message: 'تم استلام نموذج جديد',
      });
      break;

    default:
      console.log(`[Calendly Webhook] Unknown event: ${event}`);
  }
}
