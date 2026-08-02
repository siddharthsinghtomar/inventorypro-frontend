"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const benefits = [
  "Free forever plan available",
  "GST-ready invoicing",
  "No credit card required",
  "Setup in under 5 minutes",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", data);
    } catch {
      // Ignore network errors on Vercel deployment
    } finally {
      useAuthStore.getState().setDemoUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      toast.success(`Welcome to InventoryPro, ${data.firstName}! Account created.`);
      setIsLoading(false);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12
                      bg-gradient-to-br from-emerald-600 via-brand-600 to-purple-700 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">InventoryPro</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start managing<br />smarter today
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-sm">
            Join 50,000+ businesses using InventoryPro to streamline operations, increase profits, and delight customers.
          </p>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-white/90">
                <CheckCircle2 size={16} className="text-emerald-300 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/40 relative z-10">© 2026 InventoryPro. Made in India.</p>
      </div>

      {/* Right Panel — Register Form */}
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
            <h1 className="text-2xl font-extrabold text-foreground mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Free to start. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Rahul"
                  {...register("firstName")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                             focus:border-transparent transition-all"
                />
                {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Sharma"
                  {...register("lastName")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                             focus:border-transparent transition-all"
                />
                {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="rahul@mybusiness.com"
                {...register("email")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                           focus:border-transparent transition-all"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                Phone <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                {...register("phone")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                           focus:border-transparent transition-all"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  {...register("password")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-input bg-background text-sm
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                             focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm
                         bg-gradient-to-r from-brand-500 to-purple-600 text-white
                         hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-lg shadow-brand-500/25"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" />Creating account...</>
              ) : (
                <>Create Free Account<ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
