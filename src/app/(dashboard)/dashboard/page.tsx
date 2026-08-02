"use client";

import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useAnalytics";
import {
  TrendingUp, TrendingDown, Package, Users, ShoppingCart,
  Warehouse, AlertTriangle, DollarSign, BarChart3, ArrowUpRight,
  ArrowRightLeft, Trophy, CreditCard, Sparkles, Truck, Banknote, ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, tenant } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayStats = [
    {
      title: "Today's Revenue",
      value: stats ? formatCurrency(stats.todaysRevenue, tenant?.currency) : "₹0",
      change: "Today",
      trend: "up",
      icon: DollarSign,
      bg: "bg-emerald-500/10",
      textColor: "text-emerald-500",
      borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      change: "Active catalog",
      trend: "up",
      icon: Package,
      bg: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderHover: "hover:border-blue-500/50 hover:shadow-blue-500/10"
    },
    {
      title: "Active Customers",
      value: stats?.activeCustomers || 0,
      change: "Total registered",
      trend: "up",
      icon: Users,
      bg: "bg-purple-500/10",
      textColor: "text-purple-500",
      borderHover: "hover:border-purple-500/50 hover:shadow-purple-500/10"
    },
    {
      title: "Today's Orders",
      value: stats?.todaysOrders || 0,
      change: "Completed sales",
      trend: "up",
      icon: ShoppingCart,
      bg: "bg-orange-500/10",
      textColor: "text-orange-500",
      borderHover: "hover:border-orange-500/50 hover:shadow-orange-500/10"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount || 0,
      change: stats?.lowStockCount > 0 ? "Action needed" : "All good",
      trend: stats?.lowStockCount > 0 ? "down" : "up",
      icon: AlertTriangle,
      bg: stats?.lowStockCount > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
      textColor: stats?.lowStockCount > 0 ? "text-rose-500" : "text-emerald-500",
      borderHover: stats?.lowStockCount > 0 ? "hover:border-rose-500/50 hover:shadow-rose-500/10" : "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
    },
    {
      title: "Monthly Profit",
      value: stats ? formatCurrency(stats.monthlyProfit, tenant?.currency) : "₹0",
      change: "Revenue - Expenses",
      trend: (stats?.monthlyProfit || 0) >= 0 ? "up" : "down",
      icon: BarChart3,
      bg: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderHover: "hover:border-blue-500/50 hover:shadow-blue-500/10"
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-2 sm:p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="enterprise-card h-[130px]">
              <Skeleton className="h-4 w-24 mb-4 rounded-xl" />
              <div className="flex justify-between items-end">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500 font-sans">
      
      {/* ─── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {greeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening at{" "}
            <span className="font-bold text-slate-900 dark:text-white">{tenant?.name || "your business"}</span> today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm">
          <span>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span>
        </div>
      </div>

      {/* ─── NEW COMPETITOR PRO SUITE SHOWCASE HUB ───────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                PRO COMPETITOR SUITE MODULES
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  Vyapar + Zoho + Lightspeed + QuickBooks
                </span>
              </h2>
              <p className="text-xs text-slate-400">All top market features built directly into your InventoryPro account</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl self-start sm:self-auto">
            100% Live & Ready
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Vyapar Udhar Ledger */}
          <Link
            href="/dashboard/customers/ledger"
            className="bg-slate-900/90 hover:bg-indigo-600/30 border border-indigo-500/30 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard size={18} />
            </div>
            <span className="text-xs font-bold text-white leading-tight">Vyapar Udhar Ledger</span>
            <span className="text-[9px] text-indigo-300 font-mono bg-indigo-500/20 px-2 py-0.5 rounded-full">WhatsApp Reminders</span>
          </Link>

          {/* Vyapar Barcode Studio */}
          <Link
            href="/dashboard/products/barcodes"
            className="bg-slate-900/90 hover:bg-amber-600/30 border border-amber-500/30 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package size={18} />
            </div>
            <span className="text-xs font-bold text-white leading-tight">Barcode Label Studio</span>
            <span className="text-[9px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded-full">Print Sticker Tags</span>
          </Link>

          {/* Zoho Batch Expiry */}
          <Link
            href="/dashboard/inventory/batches"
            className="bg-slate-900/90 hover:bg-rose-600/30 border border-rose-500/30 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle size={18} />
            </div>
            <span className="text-xs font-bold text-white leading-tight">Zoho Batch Expiry</span>
            <span className="text-[9px] text-rose-300 font-mono bg-rose-500/20 px-2 py-0.5 rounded-full">FEFO Date Tracker</span>
          </Link>

          {/* Lightspeed Fast POS */}
          <Link
            href="/dashboard/pos"
            className="bg-slate-900/90 hover:bg-purple-600/30 border border-purple-500/30 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={18} />
            </div>
            <span className="text-xs font-bold text-white leading-tight">Lightspeed Retail POS</span>
            <span className="text-[9px] text-purple-300 font-mono bg-purple-500/20 px-2 py-0.5 rounded-full">Touch Register Grid</span>
          </Link>

          {/* QuickBooks P&L */}
          <Link
            href="/dashboard/expenses/pnl"
            className="bg-slate-900/90 hover:bg-emerald-600/30 border border-emerald-500/30 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={18} />
            </div>
            <span className="text-xs font-bold text-white leading-tight">QuickBooks P&L</span>
            <span className="text-[9px] text-emerald-300 font-mono bg-emerald-500/20 px-2 py-0.5 rounded-full">Net Profit Statement</span>
          </Link>

          {/* GST Tax Filing */}
          <Link
            href="/dashboard/reports/gst"
            className="bg-slate-900/90 hover:bg-teal-600/30 border border-teal-500/30 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all group hover:-translate-y-1 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={18} />
            </div>
            <span className="text-xs font-bold text-white leading-tight">GST Tax Filing</span>
            <span className="text-[9px] text-teal-300 font-mono bg-teal-500/20 px-2 py-0.5 rounded-full">GSTR-1 & GSTR-3B</span>
          </Link>
        </div>
      </div>

      {/* ─── Premium Stats Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayStats.map((stat) => (
          <div 
            key={stat.title} 
            className={`enterprise-card group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all duration-300 ${stat.borderHover}`}
          >
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 tracking-widest uppercase">{stat.title}</p>
                <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white font-mono-data">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={22} className={stat.textColor} strokeWidth={2.5} />
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 mt-4">
              {stat.trend === "up" ? (
                <TrendingUp size={14} className="text-emerald-500 drop-shadow-sm" strokeWidth={3} />
              ) : (
                <TrendingDown size={14} className="text-rose-500 drop-shadow-sm" strokeWidth={3} />
              )}
              <span className={`text-[11px] font-bold ${stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Revenue Chart & Layout ───────────────────────────────────────────── */}
      <div className="enterprise-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Revenue Overview</h2>
            <p className="text-xs font-semibold text-slate-500">Last 12 months performance</p>
          </div>
          <select className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 12 months</option>
            <option>Last 6 months</option>
            <option>Last 30 days</option>
          </select>
        </div>

        {/* Minimal Bar Chart Mockup */}
        <div className="flex items-end gap-3 h-56 overflow-hidden mt-4">
          {[
            { month: "Aug", val: 65 }, { month: "Sep", val: 78 }, { month: "Oct", val: 55 },
            { month: "Nov", val: 90 }, { month: "Dec", val: 72 }, { month: "Jan", val: 88 },
            { month: "Feb", val: 60 }, { month: "Mar", val: 95 }, { month: "Apr", val: 70 },
            { month: "May", val: 85 }, { month: "Jun", val: 75 }, { month: "Jul", val: 100 },
          ].map((bar) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group/bar">
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-blue-100 dark:bg-blue-900/30 transition-all duration-500
                           group-hover/bar:bg-blue-500 dark:group-hover/bar:bg-blue-600 shadow-sm
                           cursor-pointer relative overflow-hidden"
                style={{ height: `${bar.val}%` }}
              >
                 <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover/bar:text-slate-900 dark:group-hover/bar:text-white transition-colors uppercase tracking-wider">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
