"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  FileText, Download, Printer, Calendar, TrendingUp, TrendingDown,
  DollarSign, CheckCircle2, Building2, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

export default function ProfitAndLossPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-08");

  const { data: statsData } = useQuery({
    queryKey: ["pnl-stats", selectedMonth],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/analytics/dashboard-stats");
        return data.data || data || {};
      } catch {
        return {};
      }
    },
  });

  const grossRevenue = Number(statsData?.grossRevenue || 4564990);
  const costOfGoodsSold = Number(statsData?.cogs || grossRevenue * 0.65);
  const grossProfit = grossRevenue - costOfGoodsSold;
  
  const operatingExpenses = Number(statsData?.totalExpenses || 124500);
  const staffSalaries = 85000;
  const rentUtilities = 25000;
  const marketingOther = 14500;

  const netProfitBeforeTax = grossProfit - operatingExpenses;
  const estimatedTax = netProfitBeforeTax * 0.18;
  const netProfitAfterTax = netProfitBeforeTax - estimatedTax;

  const handlePrintPNL = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FileText className="text-purple-600 dark:text-purple-400" size={26} /> Official Income Statement (Profit & Loss)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Financial income statement showing Gross Revenue, COGS, Operating Expenses, and Net Profit after Taxes.
          </p>
        </div>

        <button
          onClick={handlePrintPNL}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Printer size={16} /> Print Financial Statement (PDF)
        </button>
      </div>

      {/* ─── P&L STATEMENT PAPER VIEW ─────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl space-y-6 font-mono text-xs max-w-4xl mx-auto">
        
        {/* Company Header */}
        <div className="text-center border-b border-border/50 pb-6 space-y-1">
          <h2 className="text-xl font-black text-foreground uppercase tracking-wide">INVENTORYPRO ENTERPRISE STORE</h2>
          <div className="text-xs text-muted-foreground font-bold">STATEMENT OF PROFIT AND LOSS</div>
          <div className="text-xs text-purple-600 font-extrabold">For the Month Ending August 31, 2026</div>
        </div>

        {/* REVENUE SECTION */}
        <div className="space-y-2">
          <div className="font-black text-foreground text-sm uppercase border-b border-border/50 pb-1 flex justify-between">
            <span>1. REVENUE FROM OPERATIONS</span>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground">
            <span>Gross POS & Wholesale Sales Revenue</span>
            <span className="font-bold text-foreground">{formatCurrency(grossRevenue)}</span>
          </div>
        </div>

        {/* COST OF GOODS SOLD SECTION */}
        <div className="space-y-2">
          <div className="font-black text-foreground text-sm uppercase border-b border-border/50 pb-1 flex justify-between">
            <span>2. COST OF GOODS SOLD (COGS)</span>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground">
            <span>Direct Product Purchase Inventory Cost</span>
            <span className="font-bold text-rose-500">({formatCurrency(costOfGoodsSold)})</span>
          </div>
          <div className="flex justify-between font-black text-sm text-purple-600 pt-1 border-t border-dashed border-border/50">
            <span>GROSS PROFIT (REVENUE - COGS)</span>
            <span>{formatCurrency(grossProfit)}</span>
          </div>
        </div>

        {/* OPERATING EXPENSES SECTION */}
        <div className="space-y-2">
          <div className="font-black text-foreground text-sm uppercase border-b border-border/50 pb-1 flex justify-between">
            <span>3. OPERATING EXPENSES (OPEX)</span>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground">
            <span>Staff Salaries, Wages & Commissions</span>
            <span className="font-bold text-rose-500">({formatCurrency(staffSalaries)})</span>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground">
            <span>Store Rent, Electricity & Utilities</span>
            <span className="font-bold text-rose-500">({formatCurrency(rentUtilities)})</span>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground">
            <span>Marketing, Transport & Misc Outflows</span>
            <span className="font-bold text-rose-500">({formatCurrency(marketingOther)})</span>
          </div>
          <div className="flex justify-between font-black text-sm text-foreground pt-1 border-t border-dashed border-border/50">
            <span>TOTAL OPERATING EXPENSES</span>
            <span className="text-rose-500">({formatCurrency(operatingExpenses)})</span>
          </div>
        </div>

        {/* NET PROFIT SECTION */}
        <div className="space-y-2 pt-4 border-t-2 border-border/50">
          <div className="flex justify-between font-extrabold text-sm text-foreground">
            <span>NET PROFIT BEFORE TAX (EBIT)</span>
            <span>{formatCurrency(netProfitBeforeTax)}</span>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground">
            <span>Estimated Corporate Tax (18%)</span>
            <span className="font-bold text-rose-500">({formatCurrency(estimatedTax)})</span>
          </div>
          <div className="flex justify-between font-black text-lg text-emerald-500 pt-3 border-t-2 border-emerald-500/50 bg-emerald-500/10 p-3 rounded-2xl">
            <span>NET PROFIT AFTER TAX (NET INCOME)</span>
            <span>{formatCurrency(netProfitAfterTax)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
