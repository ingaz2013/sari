import { GoogleLogin } from "@react-oauth/google";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export function GoogleLoginButton() {
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();
  const googleLoginMutation = trpc.googleAuth.googleLogin.useMutation();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await googleLoginMutation.mutateAsync({
        token: credentialResponse.credential,
      });

      if (result.success) {
        // تحديث حالة المستخدم
        await refetch();

        // إعادة التوجيه حسب الدور
        if (result.user.role === "admin") {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/merchant/dashboard");
        }

        toast.success("تم تسجيل الدخول بنجاح عبر Google");
      }
    } catch (error) {
      console.error("خطأ في تسجيل الدخول عبر Google:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "فشل تسجيل الدخول عبر Google"
      );
    }
  };

  const handleGoogleError = () => {
    toast.error("فشل تسجيل الدخول عبر Google");
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text="signin_with"
        locale="ar"
      />
    </div>
  );
}
