"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Users, Plus, Search, Phone, MapPin, Mail,
  Star, CreditCard, TrendingUp, UserCheck, UserX, Eye, Edit,
  LayoutGrid, List, ShieldCheck, ArrowUpRight, DollarSign, Filter, RefreshCw
} from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  ACTIVE: { label: "ACTIVE", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  VIP: { label: "VIP MEMBER", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  INACTIVE: { label: "INACTIVE", badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  BLOCKED: { label: "BLOCKED", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customers", search, status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("limit", "50");
      const { data } = await apiClient.get(`/customers?${params.toString()}`);
      return data.data;
    },
    staleTime: 0,
  });

  const customers: any[] = data?.customers || [];
  const pagination = data?.pagination;

  const totalCredit = customers.reduce((sum: number, c: any) => sum + Math.max(0, Number(c.currentBalance ?? c.openingBalance ?? 0)), 0);
  const totalRevenueSum = customers.reduce((sum: number, c: any) => sum + Number(c.totalPurchases || 0), 0);

  return (
    <div className="space-y-6 animate-in font-sans p-6 max-w-[1600px] mx-auto">
      {/* ─── HEADER BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="text-purple-600 dark:text-purple-400" size={26} /> Customer Directory & Credit Ledgers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage registered accounts, accounts receivable credit, lifetime purchases, and loyalty rewards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/customers/new"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-500/20 flex items-center gap-2 transition-all active:scale-98"
          >
            <Plus size={16} />
            <span>Add New Customer</span>
          </Link>
        </div>
      </div>

      {/* ─── KPI METRIC CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{pagination?.total ?? customers.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            Registered Business Accounts
          </div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">VIP Members</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Star size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {customers.filter((c: any) => c.status === "VIP").length}
          </div>
          <div className="text-[11px] text-slate-500">Premium Reward Tier</div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Credit Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalCredit)}</div>
          <div className="text-[11px] text-amber-600 font-medium">Accounts Receivable Due</div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Lifetime Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(totalRevenueSum)}</div>
          <div className="text-[11px] text-slate-500">Combined Order Revenue</div>
        </div>
      </div>

      {/* ─── CONTROLS & SEARCH BAR ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer name, phone, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses ({customers.length})</option>
              <option value="ACTIVE">Active Only</option>
              <option value="VIP">VIP Members Only</option>
              <option value="INACTIVE">Inactive Only</option>
              <option value="BLOCKED">Blocked Only</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-card text-purple-600 shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-card text-purple-600 shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CUSTOMER DIRECTORY DISPLAY ───────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <RefreshCw className="animate-spin text-purple-600" size={28} />
          <p className="text-xs font-semibold text-muted-foreground">Loading customer profiles...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-base text-foreground">No Customers Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">No customer records match your filter criteria. Click below to add a customer.</p>
          <Link href="/dashboard/customers/new" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md">
            <Plus size={15} /> Add First Customer
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {customers.map((c: any) => {
            const balance = Number(c.currentBalance ?? c.openingBalance ?? 0);
            const isOwed = balance > 0;
            const statusConfig = STATUS_CONFIG[c.status || "ACTIVE"] || STATUS_CONFIG.ACTIVE;

            return (
              <div
                key={c.id}
                className="bg-card border border-border/50 rounded-2xl p-5 hover:border-purple-500/40 hover:shadow-lg transition-all duration-200 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md flex-shrink-0">
                      {String(c.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-foreground flex items-center gap-2">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-medium">
                        <span className="flex items-center gap-1"><Phone size={12} /> {c.phone || "No phone"}</span>
                        {c.email && <span className="flex items-center gap-1 truncate max-w-40"><Mail size={12} /> {c.email}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusConfig.badge}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Metrics 3-Col Bar */}
                <div className="grid grid-cols-3 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40 text-center">
                  <div>
                    <div className="text-xs font-black text-foreground">{formatCurrency(Number(c.totalPurchases || 0))}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Total Spent</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-600">{c.totalOrders || 0}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Orders</div>
                  </div>
                  <div>
                    <div className={`text-xs font-black ${isOwed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                      {isOwed ? `${formatCurrency(balance)}` : "Settled ₹0"}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold">{isOwed ? "Credit Due" : "Balance"}</div>
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                    <Star size={13} className="text-amber-500" />
                    <span>{c.loyaltyPoints || 0} Points</span>
                    {c.city && <span className="truncate max-w-28 font-medium">· {c.city}</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/customers/${c.id}`}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
                      title="View Orders & Ledger"
                    >
                      <Eye size={13} />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      href={`/dashboard/customers/${c.id}/edit`}
                      className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit Customer"
                    >
                      <Edit size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Customer Account</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Total Purchases</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Outstanding Credit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {customers.map((c: any) => {
                  const balance = Number(c.currentBalance ?? c.openingBalance ?? 0);
                  const isOwed = balance > 0;
                  const statusConfig = STATUS_CONFIG[c.status || "ACTIVE"] || STATUS_CONFIG.ACTIVE;

                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0">
                            {String(c.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{c.name}</div>
                            {c.city && <div className="text-[11px] text-muted-foreground">{c.city}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-foreground">{c.phone || "No phone"}</div>
                        {c.email && <div className="text-[11px] text-muted-foreground">{c.email}</div>}
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">
                        {formatCurrency(Number(c.totalPurchases || 0))}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{c.totalOrders || 0}</td>
                      <td className="px-4 py-3">
                        <div className={`font-black ${isOwed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                          {isOwed ? `${formatCurrency(balance)} Due` : "Settled ₹0"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${statusConfig.badge}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/customers/${c.id}`}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] flex items-center gap-1"
                          >
                            <Eye size={13} /> View
                          </Link>
                          <Link
                            href={`/dashboard/customers/${c.id}/edit`}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Edit size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
