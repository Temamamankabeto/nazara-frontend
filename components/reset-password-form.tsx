"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/services/auth.service";
import {
  ResetPasswordFormInputs,
  resetPasswordSchema,
} from "@/lib/schemas/resetPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Don't show form if token or email is missing
  if (!token || !email) {
    return (
      <div className="text-center text-red-600 mt-8">
        Invalid or missing reset link. Please check your email again.
      </div>
    );
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /\d/.test(password)) return "Strong";
    return "Medium";
  };

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      setIsLoading(true);
      await resetPassword({ ...data, token, email });
      toast.success("Password has been reset successfully!");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={passwordVisible ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
            onChange={(e) =>
              setPasswordStrength(getPasswordStrength(e.target.value))
            }
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setPasswordVisible((prev) => !prev)}
            tabIndex={-1}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
        <p className="text-sm text-gray-500">
          Password strength:{" "}
          <span className="font-medium">{passwordStrength}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={confirmVisible ? "text" : "password"}
            placeholder="••••••••"
            {...register("password_confirmation")}
            aria-invalid={!!errors.password_confirmation}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setConfirmVisible((prev) => !prev)}
            tabIndex={-1}
          >
            {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="text-sm text-red-500">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
