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

      {/* ─── NEW ENTERPRISE SUITE QUICK ACCESS LAUNCHER ───────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0F1626] to-purple-950 p-5 rounded-3xl border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm uppercase tracking-wider">
            <Sparkles className="text-amber-400" size={18} /> Enterprise Feature Modules Quick Access
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
            All 5 Suite Modules Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* POS Terminal */}
          <Link
            href="/dashboard/pos"
            className="bg-slate-900/80 hover:bg-purple-600/30 border border-purple-500/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={18} />
            </div>
            <span className="text-xs font-bold text-white">POS Terminal</span>
            <span className="text-[9px] text-purple-300 font-mono">10,000+ Items</span>
          </Link>

          {/* Staff Payroll */}
          <Link
            href="/dashboard/staff"
            className="bg-slate-900/80 hover:bg-amber-600/30 border border-amber-500/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={18} />
            </div>
            <span className="text-xs font-bold text-white">Staff Payroll</span>
            <span className="text-[9px] text-amber-300 font-mono">Fixed Salaries</span>
          </Link>

          {/* Stock Transfers */}
          <Link
            href="/dashboard/inventory/transfers"
            className="bg-slate-900/80 hover:bg-blue-600/30 border border-blue-500/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRightLeft size={18} />
            </div>
            <span className="text-xs font-bold text-white">Stock Transfers</span>
            <span className="text-[9px] text-blue-300 font-mono">Multi-Warehouse</span>
          </Link>

          {/* Vendor Payables */}
          <Link
            href="/dashboard/purchases"
            className="bg-slate-900/80 hover:bg-emerald-600/30 border border-emerald-500/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck size={18} />
            </div>
            <span className="text-xs font-bold text-white">Purchase Orders</span>
            <span className="text-[9px] text-emerald-300 font-mono">Pay Vendors</span>
          </Link>

          {/* Expenses Outflows */}
          <Link
            href="/dashboard/expenses"
            className="bg-slate-900/80 hover:bg-rose-600/30 border border-rose-500/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard size={18} />
            </div>
            <span className="text-xs font-bold text-white">Store Outflows</span>
            <span className="text-[9px] text-rose-300 font-mono">Bills & Cashbook</span>
          </Link>

          {/* Reports Analytics */}
          <Link
            href="/dashboard/reports"
            className="bg-slate-900/80 hover:bg-teal-600/30 border border-teal-500/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 transition-all group hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={18} />
            </div>
            <span className="text-xs font-bold text-white">Cash Waterfall</span>
            <span className="text-[9px] text-teal-300 font-mono">Profit Analytics</span>
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
