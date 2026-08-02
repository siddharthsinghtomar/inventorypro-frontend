import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3, Package, ShoppingCart, Users, ArrowRight,
  CheckCircle2, Zap, Shield, Globe2, Sparkles,
  TrendingUp, Building2, Warehouse, QrCode,
} from "lucide-react";

export const metadata: Metadata = {
  title: "InventoryPro — Smart Business Management Platform",
  description:
    "The all-in-one inventory, POS, CRM, and analytics platform for modern Indian businesses. GST-ready, cloud-based, and insanely fast.",
};

const features = [
  {
    icon: Package,
    title: "Smart Inventory",
    desc: "Real-time stock tracking, low stock alerts, barcode scanning, and automatic updates on every sale.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: ShoppingCart,
    title: "Blazing POS",
    desc: "Touch-screen POS with offline mode, split payments, hold bills, and lightning-fast checkout.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Profit & loss, sales trends, top products, customer insights — all in real-time.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Users,
    title: "CRM Built-in",
    desc: "Customer loyalty points, purchase history, credit management, and WhatsApp invoicing.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Sparkles,
    title: "AI Powered",
    desc: "Sales prediction, demand forecasting, smart reorder suggestions, and AI-driven insights.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "JWT auth, RBAC, audit logs, 2FA, encrypted data, and automatic backups.",
    color: "from-slate-500 to-gray-600",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/forever",
    desc: "For getting started",
    features: ["2 users", "100 products", "Basic POS", "Basic reports"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Basic",
    price: "₹999",
    period: "/month",
    desc: "For small businesses",
    features: ["5 users", "1,000 products", "GST invoicing", "WhatsApp invoice", "Excel export"],
    cta: "Start 14-day Trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹2,499",
    period: "/month",
    desc: "For growing businesses",
    features: ["20 users", "10,000 products", "3 branches", "Barcode & QR", "Advanced reports", "HR & Payroll"],
    cta: "Start 14-day Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹7,999",
    period: "/month",
    desc: "For large enterprises",
    features: ["Unlimited users", "Unlimited products", "Unlimited branches", "AI features", "API access", "Dedicated support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const stats = [
  { value: "50K+", label: "Businesses" },
  { value: "₹500Cr+", label: "Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <Package className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="text-lg font-bold gradient-text">InventoryPro</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "Pricing", "About", "Blog"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg
                           bg-gradient-to-r from-brand-500 to-purple-600 text-white
                           hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25"
              >
                Get Started Free
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-40 right-10 w-60 h-60 bg-cyan-500/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center animate-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                          bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-6">
            <Sparkles size={12} />
            <span>Now with AI-powered insights</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Run Your Business{" "}
            <span className="gradient-text">Smarter</span>,{" "}
            <br className="hidden sm:block" />
            Not Harder
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for inventory, POS billing, CRM, and analytics.
            GST-ready for Indian businesses. Launch in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl
                         font-semibold text-base text-white
                         bg-gradient-to-r from-brand-500 to-purple-600
                         hover:opacity-90 transition-all hover:scale-105 active:scale-95
                         shadow-xl shadow-brand-500/30"
            >
              Start for Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl
                         font-semibold text-base border border-border hover:bg-muted
                         transition-all duration-200"
            >
              <BarChart3 size={18} />
              See Features
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto mt-20 animate-in-slow">
          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/20
                          bg-gradient-to-b from-muted/50 to-background">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="ml-4 flex-1 h-5 rounded-md bg-muted/70 max-w-xs" />
            </div>

            {/* Dashboard mockup */}
            <div className="p-6 bg-background/50">
              {/* Top stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Today's Sales", value: "₹1,24,500", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Products", value: "2,847", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Customers", value: "1,203", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Low Stock", value: "14", icon: Warehouse, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                      <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                        <s.icon size={14} className={s.color} />
                      </div>
                    </div>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-xs text-emerald-500 mt-1 font-medium">↑ 12.5%</div>
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="bg-card rounded-xl border p-4 h-40 flex items-end gap-1 overflow-hidden">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500/80 to-brand-400/40"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Glow under card */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50" />
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                            bg-muted text-muted-foreground mb-4">
              <Zap size={12} />
              Everything you need
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              A Complete Business{" "}
              <span className="gradient-text">Operating System</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From a single kirana store to an enterprise chain — InventoryPro scales with you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-card border border-border rounded-2xl p-6
                           hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1
                           transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300
                                bg-gradient-to-br from-white to-transparent" />

                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-base font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Module Highlights ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: Building2, label: "Multi-Branch" },
              { icon: Warehouse, label: "Warehouses" },
              { icon: QrCode, label: "Barcode & QR" },
              { icon: Globe2, label: "Multi-Currency" },
              { icon: Shield, label: "GST Ready" },
              { icon: Sparkles, label: "AI Insights" },
            ].map((item) => (
              <div key={item.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border
                           hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-center">
                <item.icon size={22} className="text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-muted-foreground">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col
                  ${plan.highlight
                    ? "border-brand-500 bg-gradient-to-b from-brand-500/10 to-background shadow-xl shadow-brand-500/20 scale-105"
                    : "border-border bg-card hover:border-border/80 hover:shadow-lg"
                  } transition-all duration-300`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                                     bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-lg">
                      <Sparkles size={10} />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-base font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${plan.highlight
                      ? "bg-gradient-to-r from-brand-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-brand-500/30"
                      : "border border-border hover:bg-muted"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center
                          bg-gradient-to-br from-brand-600 via-purple-600 to-cyan-600">
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
            />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 relative">
              Ready to transform your business?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 relative">
              Join 50,000+ businesses already using InventoryPro.
              Start free — no credit card required.
            </p>
            <Link
              href="/register"
              className="relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base
                         bg-white text-brand-600 hover:bg-white/90 transition-all
                         hover:scale-105 active:scale-95 shadow-xl"
            >
              Start for Free Today
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Package size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm gradient-text">InventoryPro</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 InventoryPro. Made with ❤️ in India. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Support"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
