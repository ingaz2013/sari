import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { verifyGoogleToken, findOrCreateGoogleUser } from "./google-auth";
import { TRPCError } from "@trpc/server";

export const googleAuthRouter = router({
  /**
   * تسجيل الدخول عبر Google
   */
  googleLogin: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Google token مطلوب"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // التحقق من صحة Google Token
        const googleData = await verifyGoogleToken(input.token);

        // البحث عن المستخدم أو إنشاء واحد جديد
        const user = await findOrCreateGoogleUser(googleData);

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء أو جلب المستخدم",
          });
        }

        // تعيين المستخدم في السياق (سيتم حفظه في الجلسة)
        ctx.user = {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role,
          openId: "",
        };

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          message: "تم تسجيل الدخول بنجاح عبر Google",
        };
      } catch (error) {
        console.error("خطأ في تسجيل الدخول عبر Google:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            error instanceof Error
              ? error.message
              : "فشل تسجيل الدخول عبر Google",
        });
      }
    }),
});
