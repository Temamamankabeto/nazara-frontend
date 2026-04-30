"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForgotPassword } from "@/hooks/use-auth";
import { ForgotPasswordFormInputs, forgotPasswordSchema } from "@/lib/schemas/forgotSchema";


export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  // here call the mutation 
  const { mutate: forgotPassword, isPending } = useForgotPassword(); // mutation 
  const router = useRouter();

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      forgotPassword(data,{
        onSuccess(response) {
          reset();
          // Replace this with your actual forgot password API call logic
          toast.success(`Reset link sent to ${data.email}`);
          router.push("/auth/login"); // Redirect after success
        },
        onError(error: unknown) {
          const message = error instanceof Error ? error.message : "Something went wrong";
          toast.error(message);
        }
      }); 
    } catch (error) {
      toast.error("Failed to send reset link, please try again.");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email and we’ll send you a link to reset your password.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <>
            <span className="mr-2 animate-spin inline-block">⏳</span> Sending...
          </>  : "Send Reset Link"}
        </Button>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        <a href="/auth/login" className="hover:underline underline-offset-4">
          Back to login
        </a>
      </div>
    </form>
  );
}
