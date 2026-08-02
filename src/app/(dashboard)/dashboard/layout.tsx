"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth.store";
import { cn, getInitials } from "@/lib/utils";
import ChatGPTCopilotDrawer from "@/components/ai/ChatGPTCopilotDrawer";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  BarChart3, Settings, LogOut, Menu, X, Sun, Moon,
  Bell, ChevronDown, Building2, Receipt, RefreshCw,
  TrendingUp, Warehouse, UserCog, CreditCard, Tags, Sparkles, FileText,
  Search, Command, HelpCircle, ArrowRightLeft, Smartphone
} from "lucide-react";

const navItems = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/ai-assistant", label: "AI Copilot", icon: Sparkles },
    ],
  },
  {
    section: "Sales",
    items: [
      { href: "/dashboard/pos", label: "POS Terminal", icon: ShoppingCart },
      { href: "/dashboard/sales", label: "Sales Directory", icon: Receipt },
      { href: "/dashboard/returns", label: "Returns", icon: RefreshCw },
      { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    section: "Inventory",
    items: [
      { href: "/dashboard/inventory", label: "Inventory Hub", icon: Warehouse },
      { href: "/dashboard/products", label: "Products Catalog", icon: Package },
      { href: "/dashboard/products/barcodes", label: "Barcode Label Studio", icon: Tags },
      { href: "/dashboard/inventory/batches", label: "Batch & Expiry", icon: RefreshCw },
      { href: "/dashboard/inventory/serials", label: "IMEI / Serial Tracker", icon: Smartphone },
      { href: "/dashboard/inventory/reconcile", label: "Stock Count Audit", icon: TrendingUp },
      { href: "/dashboard/inventory/transfers", label: "Stock Transfers", icon: ArrowRightLeft },
      { href: "/dashboard/categories", label: "Categories", icon: Tags },
    ],
  },
  {
    section: "Purchases",
    items: [
      { href: "/dashboard/purchases", label: "Purchase Orders", icon: TrendingUp },
      { href: "/dashboard/purchases/auto-po", label: "Auto PO Generator", icon: Sparkles },
      { href: "/dashboard/purchases/returns", label: "Supplier Debit Notes", icon: Truck },
      { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    section: "Customers & Staff",
    items: [
      { href: "/dashboard/customers", label: "Customers Directory", icon: Users },
      { href: "/dashboard/customers/ledger", label: "Udhar & Credit Ledger", icon: CreditCard },
      { href: "/dashboard/customers/loyalty", label: "Loyalty & Vouchers", icon: Tags },
      { href: "/dashboard/staff", label: "Staff & Payroll", icon: UserCog },
      { href: "/dashboard/staff/targets", label: "Sales Staff Targets", icon: Sparkles },
    ],
  },
  {
    section: "Finance & Reports",
    items: [
      { href: "/dashboard/expenses", label: "Expenses", icon: CreditCard },
      { href: "/dashboard/expenses/pnl", label: "Profit & Loss (P&L)", icon: FileText },
      { href: "/dashboard/reports", label: "Reports & Analytics", icon: BarChart3 },
      { href: "/dashboard/analytics/forecasting", label: "AI Stockout Forecast", icon: Sparkles },
      { href: "/dashboard/reports/gst", label: "GST Tax Filing", icon: FileText },
    ],
  },
  {
    section: "Manage",
    items: [
      { href: "/dashboard/settings/branches", label: "Multi-Branch Outlets", icon: Building2 },
      { href: "/dashboard/team", label: "Team & HR", icon: Users },
      { href: "/dashboard/settings/audit", label: "Security & DB Backup", icon: Settings },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, tenant, logout, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");
      if (!isAuthenticated && !hasToken) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isMounted, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#05070A] overflow-hidden font-sans text-slate-900 dark:text-slate-100 select-none">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── ENTERPRISE FLOATING SIDEBAR ────────────────────────────────────── */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:static lg:block lg:flex-none lg:h-full lg:p-4",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "transition-transform duration-300 ease-in-out"
      )}>
        <aside
          className={cn(
            "flex flex-col h-full",
            "w-[260px] bg-[#0B1220]/95 backdrop-blur-3xl border-r lg:border border-white/10 text-slate-300",
            "lg:rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] overflow-hidden",
            "transition-all duration-300 ease-in-out relative z-50"
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/5 bg-[#0B1220]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/40">
                <Package size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate tracking-tight">
                  {tenant?.name || "InventoryPro"}
                </div>
                <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-0.5">Enterprise</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
          {navItems.map((section) => (
            <div key={section.section}>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                      )}
                    >
                      <item.icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-3 bg-[#080D18]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      </div>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar (Raycast / Linear Style) */}
            <div className="relative hidden md:flex items-center w-72">
              <Search size={14} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, orders, customers... [Ctrl+K]"
                className="w-full pl-9 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <span className="absolute right-2 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-blue-500/20">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950">
          <div className="p-4 sm:p-6 pb-24">
            {children}
          </div>
          <ChatGPTCopilotDrawer />
        </main>
      </div>
    </div>
  );
}
