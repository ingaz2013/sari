/**
 * Plans Router Module
 * Handles subscription plan management
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

export const plansRouter = router({
    // Get all active plans
    list: publicProcedure.query(async () => {
        return db.getAllPlans();
    }),

    // Get plan by ID
    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            return await db.getPlanById(input.id);
        }),

    // Create plan (Admin only)
    create: adminProcedure
        .input(z.object({
            name: z.string(),
            nameAr: z.string(),
            priceMonthly: z.number(),
            conversationLimit: z.number(),
            voiceMessageLimit: z.number(),
            features: z.string(),
        }))
        .mutation(async ({ input }) => {
            return db.createPlan(input);
        }),

    // Update plan (Admin only)
    update: adminProcedure
        .input(z.object({
            id: z.number(),
            name: z.string().optional(),
            nameAr: z.string().optional(),
            priceMonthly: z.number().optional(),
            conversationLimit: z.number().optional(),
            voiceMessageLimit: z.number().optional(),
            features: z.string().optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;

            const oldPlan = await db.getPlanById(id);
            if (!oldPlan) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
            }

            await db.updatePlan(id, updateData);

            // Log changes
            const changedBy = typeof ctx.user.id === 'string' ? parseInt(ctx.user.id) : ctx.user.id;
            const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

            if (updateData.priceMonthly !== undefined && updateData.priceMonthly !== oldPlan.priceMonthly) {
                changes.push({ field: 'priceMonthly', oldValue: oldPlan.priceMonthly.toString(), newValue: updateData.priceMonthly.toString() });
            }
            if (updateData.conversationLimit !== undefined && updateData.conversationLimit !== oldPlan.conversationLimit) {
                changes.push({ field: 'conversationLimit', oldValue: oldPlan.conversationLimit.toString(), newValue: updateData.conversationLimit.toString() });
            }
            if (updateData.voiceMessageLimit !== undefined && updateData.voiceMessageLimit !== oldPlan.voiceMessageLimit) {
                changes.push({ field: 'voiceMessageLimit', oldValue: oldPlan.voiceMessageLimit.toString(), newValue: updateData.voiceMessageLimit.toString() });
            }
            if (updateData.name !== undefined && updateData.name !== oldPlan.name) {
                changes.push({ field: 'name', oldValue: oldPlan.name, newValue: updateData.name });
            }
            if (updateData.nameAr !== undefined && updateData.nameAr !== oldPlan.nameAr) {
                changes.push({ field: 'nameAr', oldValue: oldPlan.nameAr, newValue: updateData.nameAr });
            }
            if (updateData.isActive !== undefined && updateData.isActive !== oldPlan.isActive) {
                changes.push({ field: 'isActive', oldValue: oldPlan.isActive.toString(), newValue: updateData.isActive.toString() });
            }

            for (const change of changes) {
                await db.createPlanChangeLog({
                    planId: id,
                    changedBy,
                    fieldName: change.field,
                    oldValue: change.oldValue,
                    newValue: change.newValue,
                });
            }

            return { success: true };
        }),

    // Get change logs (Admin only)
    getChangeLogs: adminProcedure
        .input(z.object({ planId: z.number().optional() }))
        .query(async ({ input }) => {
            if (input.planId) {
                return db.getPlanChangeLogs(input.planId);
            }
            return db.getAllPlanChangeLogs();
        }),
});

export type PlansRouter = typeof plansRouter;
