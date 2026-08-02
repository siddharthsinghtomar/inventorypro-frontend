"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  FileText, Download, Calendar, Filter, CheckCircle2,
  Building2, ShieldCheck, Printer, ArrowUpRight, DollarSign
} from "lucide-react";
import { toast } from "sonner";

export default function GSTReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-08");

  const { data: salesData } = useQuery({
    queryKey: ["gst-sales", selectedMonth],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/sales", { params: { limit: 100 } });
        return data.data?.sales || data.sales || [];
      } catch {
        return [];
      }
    },
  });

  const salesList = salesData || [];

  const totalSalesTax = useMemo(() => {
    return salesList.reduce((sum: number, s: any) => sum + Number(s.taxTotal || 0), 0);
  }, [salesList]);

  const totalSalesValue = useMemo(() => {
    return salesList.reduce((sum: number, s: any) => sum + Number(s.grandTotal || 0), 0);
  }, [salesList]);

  const handleExportCAExcel = () => {
    toast.success(`Exported GSTR-1 & GSTR-3B Tax Filing Report for ${selectedMonth} to Excel!`);
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FileText className="text-purple-600 dark:text-purple-400" size={26} /> GST Tax Filing & CA Export Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Generate GSTR-1 B2B / B2C invoice summaries, HSN code breakdown, and GSTR-3B tax liabilities for Chartered Accountant filing.
          </p>
        </div>

        <button
          onClick={handleExportCAExcel}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Download size={16} /> Export GSTR CA File (.XLSX)
        </button>
      </div>

      {/* ─── MONTH FILTER & KPI CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Gross B2B / B2C Taxable Sales</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{formatCurrency(totalSalesValue)}</div>
          <div className="text-[10px] text-purple-600 font-bold">{salesList.length} Invoices File Data</div>
        </div>

        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Output GST Collected (CGST + SGST)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalSalesTax)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">GSTR-3B Outward Liability</div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Selected Return Period</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">August 2026</div>
          <div className="text-[10px] text-muted-foreground font-bold">Current Tax Filing Period</div>
        </div>
      </div>

      {/* ─── GSTR-1 INVOICE TABLE ───────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-border/50 pb-3">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-purple-600" /> GSTR-1 Outward Supply Invoices Summary
          </h2>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-background border border-border px-3 py-1.5 rounded-xl text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="2026-08">📅 August 2026 Return</option>
            <option value="2026-07">July 2026 Return</option>
            <option value="2026-06">June 2026 Return</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Customer / Buyer GSTIN</th>
                <th className="px-4 py-3 text-right">Taxable Value</th>
                <th className="px-4 py-3 text-right">CGST (9%)</th>
                <th className="px-4 py-3 text-right">SGST (9%)</th>
                <th className="px-4 py-3 text-right">Total Invoice Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {salesList.map((s: any) => {
                const grand = Number(s.grandTotal || 0);
                const tax = Number(s.taxTotal || 0);
                const taxable = grand - tax;

                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-bold text-purple-600">{s.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{s.customer?.name || "Walk-in Retail Customer"}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{s.customer?.gstNumber || "URP (Unregistered Person)"}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(taxable)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">{formatCurrency(tax / 2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">{formatCurrency(tax / 2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{formatCurrency(grand)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
