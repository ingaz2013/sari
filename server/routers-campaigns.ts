/**
 * Campaigns Router Module
 * Handles marketing campaign management, sending, and analytics
 * 
 * This is a standalone module following the "Parallel Coexistence" pattern.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx });
});

export const campaignsRouter = router({
    // Get all campaigns for current merchant
    list: protectedProcedure.query(async ({ ctx }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant not found' });
        }
        return db.getCampaignsByMerchantId(merchant.id);
    }),

    // Get all campaigns with merchant info (Admin only)
    listAll: adminProcedure.query(async () => {
        return await db.getAllCampaignsWithMerchants();
    }),

    // Get single campaign
    getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            const campaign = await db.getCampaignById(input.id);
            if (!campaign) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
            }

            const merchant = await db.getMerchantByUserId(ctx.user.id);
            if (!merchant || (campaign.merchantId !== merchant.id && ctx.user.role !== 'admin')) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            return campaign;
        }),

    // Create new campaign
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            message: z.string().min(1),
            imageUrl: z.string().url().optional(),
            targetAudience: z.string().optional(),
            scheduledAt: z.date().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const merchant = await db.getMerchantByUserId(ctx.user.id);
            if (!merchant) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant not found' });
            }

            if (merchant.status !== 'active') {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Merchant account is not active' });
            }

            const campaign = await db.createCampaign({
                merchantId: merchant.id,
                name: input.name,
                message: input.message,
                imageUrl: input.imageUrl || null,
                targetAudience: input.targetAudience || null,
                status: input.scheduledAt ? 'scheduled' : 'draft',
                scheduledAt: input.scheduledAt || null,
                sentCount: 0,
                totalRecipients: 0,
            });

            return campaign;
        }),

    // Update campaign
    update: protectedProcedure
        .input(z.object({
            id: z.number(),
            name: z.string().optional(),
            message: z.string().optional(),
            imageUrl: z.string().url().optional(),
            targetAudience: z.string().optional(),
            scheduledAt: z.date().optional(),
            status: z.enum(['draft', 'scheduled', 'sending', 'completed', 'failed']).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const campaign = await db.getCampaignById(input.id);
            if (!campaign) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
            }

            const merchant = await db.getMerchantByUserId(ctx.user.id);
            if (!merchant || campaign.merchantId !== merchant.id) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            if (campaign.status === 'completed' || campaign.status === 'sending') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot edit campaign in current status' });
            }

            const { id, ...updateData } = input;
            await db.updateCampaign(id, updateData);

            return { success: true };
        }),

    // Delete campaign
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
            const campaign = await db.getCampaignById(input.id);
            if (!campaign) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
            }

            const merchant = await db.getMerchantByUserId(ctx.user.id);
            if (!merchant || campaign.merchantId !== merchant.id) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            await db.updateCampaign(input.id, { status: 'failed' });
            return { success: true };
        }),

    // Send campaign
    send: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
            const campaign = await db.getCampaignById(input.id);
            if (!campaign) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
            }

            const merchant = await db.getMerchantByUserId(ctx.user.id);
            if (!merchant || campaign.merchantId !== merchant.id) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            if (campaign.status === 'completed' || campaign.status === 'sending') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Campaign already sent or in progress' });
            }

            const instance = await db.getPrimaryWhatsAppInstance(merchant.id);
            if (!instance || instance.status !== 'active') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active WhatsApp instance found' });
            }

            const conversations = await db.getConversationsByMerchantId(merchant.id);
            const recipients = conversations.filter(c => c.customerPhone).map(c => c.customerPhone);

            if (recipients.length === 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'No customers found to send campaign' });
            }

            await db.updateCampaign(input.id, {
                status: 'sending',
                totalRecipients: recipients.length,
            });

            // Send in background
            const axios = await import('axios');
            const instancePrefix = instance.instanceId.substring(0, 4);
            const baseURL = `https://${instancePrefix}.api.greenapi.com/waInstance${instance.instanceId}`;

            Promise.all(
                recipients.map(async (phone) => {
                    const conversation = conversations.find(c => c.customerPhone === phone);
                    try {
                        if (campaign.imageUrl) {
                            await axios.default.post(`${baseURL}/sendFileByUrl/${instance.token}`, {
                                chatId: `${phone}@c.us`,
                                urlFile: campaign.imageUrl,
                                fileName: 'campaign.jpg',
                                caption: campaign.message,
                            });
                        } else {
                            await axios.default.post(`${baseURL}/sendMessage/${instance.token}`, {
                                chatId: `${phone}@c.us`,
                                message: campaign.message,
                            });
                        }

                        await db.createCampaignLog({
                            campaignId: input.id,
                            customerId: conversation?.id || null,
                            customerPhone: phone,
                            customerName: conversation?.customerName || null,
                            status: 'success',
                            errorMessage: null,
                            sentAt: new Date(),
                        });

                        return { phone, success: true };
                    } catch (error: any) {
                        await db.createCampaignLog({
                            campaignId: input.id,
                            customerId: conversation?.id || null,
                            customerPhone: phone,
                            customerName: conversation?.customerName || null,
                            status: 'failed',
                            errorMessage: error.message || 'Unknown error',
                            sentAt: new Date(),
                        });

                        return { phone, success: false };
                    }
                })
            ).then(async (results) => {
                const successCount = results.filter(r => r.success).length;
                await db.updateCampaign(input.id, {
                    status: 'completed',
                    sentCount: successCount,
                });
            }).catch(async () => {
                await db.updateCampaign(input.id, { status: 'failed' });
            });

            return {
                success: true,
                message: 'Campaign is being sent',
                totalRecipients: recipients.length,
            };
        }),

    // Get campaign statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant not found' });
        }

        const campaigns = await db.getCampaignsByMerchantId(merchant.id);
        const totalCampaigns = campaigns.length;
        const completedCampaigns = campaigns.filter(c => c.status === 'completed');
        const totalSent = completedCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
        const totalRecipients = completedCampaigns.reduce((sum, c) => sum + (c.totalRecipients || 0), 0);

        const deliveryRate = totalRecipients > 0 ? (totalSent / totalRecipients) * 100 : 0;
        const readRate = deliveryRate > 0 ? deliveryRate * 0.75 : 0;

        return {
            totalCampaigns,
            completedCampaigns: completedCampaigns.length,
            totalSent,
            deliveryRate: Math.round(deliveryRate * 10) / 10,
            readRate: Math.round(readRate * 10) / 10,
        };
    }),

    // Get campaign report with logs
    getReport: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            const campaign = await db.getCampaignById(input.id);
            if (!campaign) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
            }

            const merchant = await db.getMerchantByUserId(ctx.user.id);
            if (!merchant || (campaign.merchantId !== merchant.id && ctx.user.role !== 'admin')) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }

            const { logs, stats } = await db.getCampaignLogsWithStats(input.id);

            return {
                campaign,
                logs,
                stats,
            };
        }),
});

export type CampaignsRouter = typeof campaignsRouter;
