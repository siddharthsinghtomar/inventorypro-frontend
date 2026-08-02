"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await login(data.email, data.password);

      if (result.requiresTenantSelection) {
        router.push("/select-business");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel â€” Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12
                      bg-gradient-to-br from-brand-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">InventoryPro</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Your business,{" "}
            <br />
            at your fingertips
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Manage inventory, process sales, track customers, and get real-time insights -
            all from one powerful platform.
          </p>

          {/* Fake stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { value: "50K+", label: "Businesses" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9 ★", label: "Rating" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <div className="text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40 relative z-10">© 2026 InventoryPro. Made in India.</p>
      </div>

      {/* Right Panel â€” Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">InventoryPro</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-foreground mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                {...register("email")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background
                           text-sm placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all duration-200"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-input bg-background
                             text-sm placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm
                         bg-gradient-to-r from-brand-500 to-purple-600 text-white
                         hover:opacity-90 transition-all duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-lg shadow-brand-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
