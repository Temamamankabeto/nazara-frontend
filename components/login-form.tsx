"use client";

import { cn, saveUserToLocalStorage, setToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LoginFormInputs, loginSchema } from "@/lib/schemas/loginSchema";
import { useLogin } from "@/hooks/use-auth";
import { useDispatch } from "react-redux";
import { setUser } from "@/stores/slices/userSlice";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const dispatch = useDispatch();

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin(); // mutation 

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      login(data, {
        onSuccess(response) {
          reset();
          console.log("Login response from backend:", response);
          console.log("User object from backend:", response.user);
          
          // Ensure response has the expected structure
          if (!response || !response.user) {
            console.error('Invalid login response structure:', response);
            toast.error("Invalid response from server");
            return;
          }
          
          // Dispatch to Redux store
          setToken(response.token);
          saveUserToLocalStorage(response.user);
          
          const payload = { user: response.user };
          console.log("Dispatching payload to Redux:", payload);
          dispatch(setUser(payload));
          
          toast.success("Login successful!");
          router.push("/");
        },
        onError(error) {
          toast.error(error.message || "Invalid credentials");
        },
        
      });
      
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password with show/hide toggle */}
        <div className="grid gap-3 relative">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            aria-invalid={!!errors.password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <span className="mr-2 animate-spin inline-block">⏳</span> Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>

      <div className="text-muted-foreground text-center text-xs *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
        &copy; {new Date().getFullYear()} AIG. All rights reserved. <br />
      </div>

    </form>
  );
}
