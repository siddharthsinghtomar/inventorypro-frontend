"use client";

import { useState } from "react";
import { useSales } from "@/hooks/useSales";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText, Plus, Search, Eye, Filter,
  CheckCircle2, AlertTriangle, XCircle, Printer, MessageSquare,
  TrendingUp, CreditCard, ShoppingCart, DollarSign, X
} from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  PARTIAL: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20",
  UNPAID: "text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20",
};

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const limit = 20;

  const { data, isLoading } = useSales({ page, limit, search });

  const salesList = data?.sales || [];
  const totalCount = data?.pagination?.total || salesList.length;

  const totalRevenue = salesList.reduce((sum: number, s: any) => sum + Number(s.grandTotal || 0), 0);
  const paidSalesCount = salesList.filter((s: any) => s.paymentStatus === "PAID" || s.status === "COMPLETED").length;
  const unpaidSalesCount = salesList.length - paidSalesCount;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Directory & Invoices</h1>
          <p className="text-sm text-muted-foreground">Monitor real-time POS sales transactions, customer receipts, and revenue ledgers.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard/pos" className="btn-primary w-full md:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <ShoppingCart size={18} />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Total Sales Volume</div>
          <div className="text-2xl font-extrabold text-foreground">{formatCurrency(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> {salesList.length} Transactions
          </div>
        </div>

        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Completed Orders</div>
          <div className="text-2xl font-extrabold text-emerald-600">{paidSalesCount}</div>
          <div className="text-[11px] text-slate-500">Paid & Fulfilled</div>
        </div>

        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Pending / Credit</div>
          <div className="text-2xl font-extrabold text-amber-600">{unpaidSalesCount}</div>
          <div className="text-[11px] text-amber-600">Awaiting Settlement</div>
        </div>

        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Average Ticket Size</div>
          <div className="text-2xl font-extrabold text-purple-600">
            {formatCurrency(salesList.length ? Math.round(totalRevenue / salesList.length) : 0)}
          </div>
          <div className="text-[11px] text-slate-500">Per Customer Sale</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            className="input-field pl-10 w-full text-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-border/50 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Invoice Details</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {salesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart size={32} className="text-muted-foreground/40" />
                      <p className="font-semibold text-sm">No sales records found</p>
                      <p className="text-xs text-muted-foreground">Completed sales and POS checkouts will appear here in real-time.</p>
                      <Link href="/dashboard/pos" className="mt-2 text-xs font-bold text-purple-600 hover:underline">
                        + Open POS Terminal to make a sale
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                salesList.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{sale.invoiceNumber}</div>
                          <div className="text-[11px] text-muted-foreground">{formatDate(sale.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {sale.customer ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{sale.customer.name}</div>
                          <div className="text-[11px] text-muted-foreground">{sale.customer.phone || "No phone"}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Walk-in Customer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-black text-emerald-600 text-sm">{formatCurrency(Number(sale.grandTotal))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${PAYMENT_COLORS[sale.paymentStatus] || PAYMENT_COLORS.PAID}`}>
                        {sale.paymentStatus || "PAID"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${STATUS_COLORS[sale.status] || STATUS_COLORS.COMPLETED}`}>
                        {sale.status || "COMPLETED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-1.5 hover:bg-muted rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 hover:bg-muted rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                          title="Print Invoice"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SALE RECEIPT MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-purple-600" /> Receipt — {selectedSale.invoiceNumber}
              </h3>
              <button onClick={() => setSelectedSale(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSale.customer?.name || "Walk-in Customer"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Date:</span>
                <span>{formatDate(selectedSale.createdAt)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">Grand Total:</span>
                <span className="font-black text-emerald-600 text-sm">{formatCurrency(selectedSale.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
