"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/member/orders";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah");
    } else {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(callbackUrl);
        }
      } catch {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          className="w-full px-4 py-3 border border-brand-beige rounded-lg text-sm focus:outline-none focus:border-brand-gold"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-10 border border-brand-beige rounded-lg text-sm focus:outline-none focus:border-brand-gold"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-beige hover:text-brand-brown"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-brand-gold text-white font-semibold rounded-lg text-sm tracking-wide hover:bg-brand-brown transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          "MASUK"
        )}
      </button>
    </form>
  );
}
