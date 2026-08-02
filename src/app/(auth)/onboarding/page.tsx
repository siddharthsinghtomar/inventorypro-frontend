"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import apiClient from "@/lib/api";
import { registerTenantSchema, type RegisterTenantInput } from "@/lib/validators";
import {
  Building2, MapPin, Phone, Globe, FileText, Loader2,
  ArrowRight, ArrowLeft, CheckCircle2, Package,
} from "lucide-react";

const steps = [
  { id: 1, title: "Business Info", desc: "Tell us about your business" },
  { id: 2, title: "Location", desc: "Where are you based?" },
  { id: 3, title: "Tax & Settings", desc: "Configure tax and billing" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setTenant } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterTenantInput>({
    resolver: zodResolver(registerTenantSchema),
    defaultValues: {
      country: "India",
      currency: "INR",
      timezone: "Asia/Kolkata",
    },
  });

  const nextStep = async () => {
    const fieldsToValidate: (keyof RegisterTenantInput)[] = [];
    if (currentStep === 1) fieldsToValidate.push("businessName", "businessType", "phone");
    if (currentStep === 2) fieldsToValidate.push("address", "city", "state", "pincode");

    const valid = await trigger(fieldsToValidate);
    if (valid) setCurrentStep((s) => s + 1);
  };

  const onSubmit = async (data: RegisterTenantInput) => {
    setIsLoading(true);
    try {
      const { data: res } = await apiClient.post("/tenants", data);
      const tenant = res.data.tenant;
      setTenant({ id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status });
      toast.success("Business set up successfully! Welcome to InventoryPro 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Setup failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Package size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold">Set up your business</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome, {user?.firstName}! Let&apos;s get you up and running in minutes.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                  ${currentStep > step.id
                    ? "bg-emerald-500 text-white"
                    : currentStep === step.id
                    ? "bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {currentStep > step.id ? <CheckCircle2 size={14} /> : step.id}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 transition-all duration-300 ${currentStep > step.id ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step title */}
        <div className="mb-6 text-center">
          <h2 className="text-base font-bold">{steps[currentStep - 1].title}</h2>
          <p className="text-xs text-muted-foreground">{steps[currentStep - 1].desc}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Building2 size={14} className="inline mr-1.5" />Business Name *
                  </label>
                  <input
                    {...register("businessName")}
                    placeholder="e.g. Sharma Medical Store"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                               placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {errors.businessName && <p className="mt-1 text-xs text-destructive">{errors.businessName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Business Type</label>
                  <select
                    {...register("businessType")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                               focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    <option value="">Select type...</option>
                    <option value="retail">Retail Store</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="restaurant">Restaurant / Food</option>
                    <option value="electronics">Electronics</option>
                    <option value="grocery">Grocery / Kirana</option>
                    <option value="clothing">Clothing / Textiles</option>
                    <option value="hardware">Hardware / Construction</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <Phone size={14} className="inline mr-1.5" />Business Phone
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                               placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                </div>
              </>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <MapPin size={14} className="inline mr-1.5" />Address
                  </label>
                  <input
                    {...register("address")}
                    placeholder="Shop 12, Market Road"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm
                               placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <input {...register("city")} placeholder="Mumbai"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">State</label>
                    <input {...register("state")} placeholder="Maharashtra"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Pincode</label>
                    <input {...register("pincode")} placeholder="400001"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Country</label>
                    <select {...register("country")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Tax & Settings */}
            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <FileText size={14} className="inline mr-1.5" />GST Number
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    {...register("gstNumber")}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm uppercase
                               placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {errors.gstNumber && <p className="mt-1 text-xs text-destructive">{errors.gstNumber.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Currency</label>
                    <select {...register("currency")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <Globe size={14} className="inline mr-1.5" />Timezone
                    </label>
                    <select {...register("timezone")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="Asia/Kolkata">IST (India)</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Asia/Dubai">GST (Dubai)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    🎉 Almost done! You can change all these settings later from the dashboard.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium
                         hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm
                           bg-gradient-to-r from-brand-500 to-purple-600 text-white
                           hover:opacity-90 transition-all shadow-lg shadow-brand-500/25"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm
                           bg-gradient-to-r from-emerald-500 to-teal-600 text-white
                           hover:opacity-90 transition-all disabled:opacity-60 shadow-lg"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" />Setting up...</>
                ) : (
                  <><CheckCircle2 size={16} />Launch My Business</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
