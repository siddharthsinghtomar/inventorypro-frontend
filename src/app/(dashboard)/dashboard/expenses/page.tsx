"use client";

import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/useFinance";
import { usePurchases } from "@/hooks/usePurchases";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet, Plus, Search, Filter, TrendingDown, Clock,
  CheckCircle2, DollarSign, Building2, Truck, FileText,
  CalendarDays, ArrowUpRight, ShieldCheck, Layers, CreditCard
} from "lucide-react";
import Link from "next/link";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "expenses" | "purchases">("all");
  
  // Default to Current Month ("2026-08")
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-08");

  const { data: expenseData, isLoading: isExpensesLoading } = useExpenses(1, 100);
  const { data: purchaseData, isLoading: isPurchasesLoading } = usePurchases({ limit: 100 });

  // Combined Outflows (Direct Expenses + Supplier Purchase Orders)
  const allOutflows = useMemo(() => {
    const expensesList = (expenseData?.expenses || []).map((exp: any) => {
      const rawDate = exp.date || exp.expenseDate || exp.createdAt || new Date().toISOString();
      const isoDate = typeof rawDate === "string" ? rawDate : new Date(rawDate).toISOString();
      return {
        id: `exp-${exp.id}`,
        originalId: exp.id,
        date: isoDate,
        type: "DIRECT_EXPENSE",
        categoryOrSupplier: exp.category?.name || exp.category || "Store Operational Expense",
        notes: exp.notes || exp.title || exp.description || "Store Expense",
        paymentMethod: exp.paymentMethod || "CASH",
        paymentStatus: "PAID",
        amount: Number(exp.amount || 0),
        amountPaid: Number(exp.amount || 0),
      };
    });

    const purchasesList = (purchaseData?.purchases || []).map((po: any) => {
      const grand = Number(po.grandTotal || 0);
      const paid = Number(po.amountPaid || 0);
      const due = Math.max(0, grand - paid);
      const rawDate = po.createdAt || new Date().toISOString();
      const isoDate = typeof rawDate === "string" ? rawDate : new Date(rawDate).toISOString();
      return {
        id: `po-${po.id}`,
        originalId: po.id,
        date: isoDate,
        type: "SUPPLIER_PURCHASE",
        categoryOrSupplier: po.supplier?.name || "Supplier Vendor",
        notes: `Purchase Order ${po.purchaseNumber || ""}`,
        paymentMethod: "BANK_TRANSFER",
        paymentStatus: po.paymentStatus || (due === 0 ? "PAID" : "PARTIAL"),
        amount: grand,
        amountPaid: paid,
        amountDue: due,
      };
    });

    return [...expensesList, ...purchasesList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenseData, purchaseData]);

  // Month Filtered Outflows
  const monthFilteredOutflows = useMemo(() => {
    if (selectedMonth === "ALL") return allOutflows;
    return allOutflows.filter(i => {
      if (!i.date) return false;
      const dStr = typeof i.date === "string" ? i.date : new Date(i.date).toISOString();
      return dStr.startsWith(selectedMonth);
    });
  }, [allOutflows, selectedMonth]);

  // Dynamic KPI Card Calculations
  const totalStoreOutflow = useMemo(() => {
    return monthFilteredOutflows.reduce((sum, item) => sum + item.amount, 0);
  }, [monthFilteredOutflows]);

  const supplierPurchasesSum = useMemo(() => {
    return monthFilteredOutflows
      .filter(item => item.type === "SUPPLIER_PURCHASE")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [monthFilteredOutflows]);

  const directExpensesSum = useMemo(() => {
    return monthFilteredOutflows
      .filter(item => item.type === "DIRECT_EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [monthFilteredOutflows]);

  const pendingPayablesSum = useMemo(() => {
    return monthFilteredOutflows
      .filter(item => item.type === "SUPPLIER_PURCHASE")
      .reduce((sum, item) => sum + (item.amountDue || 0), 0);
  }, [monthFilteredOutflows]);

  // Search & Tab Filtered Outflows
  const filteredOutflows = useMemo(() => {
    return monthFilteredOutflows.filter((item) => {
      const matchSearch =
        !search ||
        item.categoryOrSupplier.toLowerCase().includes(search.toLowerCase()) ||
        item.notes.toLowerCase().includes(search.toLowerCase());
      
      if (activeTab === "expenses") return matchSearch && item.type === "DIRECT_EXPENSE";
      if (activeTab === "purchases") return matchSearch && item.type === "SUPPLIER_PURCHASE";
      return matchSearch;
    });
  }, [monthFilteredOutflows, search, activeTab]);

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      {/* ─── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="text-purple-600 dark:text-purple-400" size={26} /> Store Outflows, Expenses & PO Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Complete store cashbook tracking direct bills, operational expenses, and supplier inventory purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/purchases/new"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98"
          >
            <Truck size={15} /> Reorder Stock (PO)
          </Link>
          <Link
            href="/dashboard/expenses/new"
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98"
          >
            <Plus size={15} /> Record Direct Expense
          </Link>
        </div>
      </div>

      {/* ─── KPI CARDS ROW (MONTH RESPONSIVE) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Store Outflow */}
        <div className="bg-card border border-rose-500/30 bg-rose-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Store Outflow</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(totalStoreOutflow)}</div>
          <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
            {selectedMonth === "ALL" ? "All Time Combined Cash & Credit Outflow" : "Selected Month Total Outflow"}
          </div>
        </div>

        {/* Supplier Stock Orders */}
        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Supplier Stock Orders (PO)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(supplierPurchasesSum)}</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">
            {monthFilteredOutflows.filter(i => i.type === "SUPPLIER_PURCHASE").length} Purchase Orders
          </div>
        </div>

        {/* Direct Operational Expenses */}
        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Direct Operational Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{formatCurrency(directExpensesSum)}</div>
          <div className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
            {monthFilteredOutflows.filter(i => i.type === "DIRECT_EXPENSE").length} Operational Bills
          </div>
        </div>

        {/* Pending Payables (To Be Paid) */}
        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Payables (To Be Paid)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs">
              AP
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(pendingPayablesSum)}</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
            <Clock size={12} /> Outstanding Vendor Credit Balance
          </div>
        </div>
      </div>

      {/* ─── CONTROLS: SEARCH, MONTH SELECTOR, & TABS ─────────────────────────── */}
      <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input
              type="text"
              placeholder="Search supplier, category, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Month Selector Filter Dropdown */}
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl shadow-sm w-full sm:w-auto">
            <CalendarDays size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-foreground focus:outline-none cursor-pointer w-full"
            >
              <option value="2026-08">📅 August 2026 (Current Month)</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-03">March 2026</option>
              <option value="ALL">All Months Combined</option>
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Outflows ({monthFilteredOutflows.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "expenses" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Expenses Only
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "purchases" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Stock POs Only
          </button>
        </div>
      </div>

      {/* ─── CASHBOOK OUTFLOW TABLE ──────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Outflow Entry</th>
                <th className="px-4 py-3">Category / Supplier</th>
                <th className="px-4 py-3">Description / Order</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Paid / Outstanding</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredOutflows.map((item) => {
                const isPO = item.type === "SUPPLIER_PURCHASE";
                const isUnpaid = (item.amountDue || 0) > 0;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          isPO ? "bg-amber-500/10 text-amber-600" : "bg-purple-500/10 text-purple-600"
                        }`}>
                          {isPO ? <Truck size={16} /> : <Building2 size={16} />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground">
                            {isPO ? "Supplier Purchase Order" : "Store Direct Expense"}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">{formatDate(item.date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{item.categoryOrSupplier}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-medium max-w-xs truncate">
                      {item.notes}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-[11px]">
                      {item.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-black text-rose-600 dark:text-rose-400 text-sm font-mono">
                      -{formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-emerald-600 font-bold">{formatCurrency(item.amountPaid)}</div>
                      {isUnpaid ? (
                        <div className="text-amber-600 font-extrabold text-[10px] flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> To Pay: {formatCurrency(item.amountDue!)}
                        </div>
                      ) : (
                        <div className="text-emerald-600 text-[10px] font-bold">Paid & Cleared</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPO && isUnpaid ? (
                        <Link
                          href="/dashboard/purchases"
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl inline-flex items-center gap-1 shadow-sm transition-all active:scale-95"
                        >
                          <CreditCard size={13} /> Pay Balance
                        </Link>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOutflows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-semibold">
                    No store outflows or purchase orders found for the selected month or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
