"use client";

import { useState, useMemo } from "react";
import { usePurchases, useRecordPurchasePayment } from "@/hooks/usePurchases";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Truck, Plus, Search, Eye, Filter, Printer,
  FileText, CheckCircle2, AlertTriangle, Clock, X,
  CreditCard, DollarSign, ArrowRight, CalendarDays, RefreshCw, Send
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  PARTIAL: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20",
  UNPAID: "text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20",
};

const mockPurchases = [
  { id: "po-1", purchaseNumber: "PO-2026-001", supplier: { name: "Apple India Authorised Logistics", email: "orders@apple.co.in" }, warehouse: { name: "Main Distribution Center" }, grandTotal: 2800000, amountPaid: 2800000, paymentStatus: "PAID", status: "RECEIVED", createdAt: new Date().toISOString() },
  { id: "po-2", purchaseNumber: "PO-2026-002", supplier: { name: "Samsung Electronics Distribution", email: "supply@samsung.com" }, warehouse: { name: "Main Distribution Center" }, grandTotal: 1764000, amountPaid: 800000, paymentStatus: "PARTIAL", status: "RECEIVED", createdAt: new Date().toISOString() },
  { id: "po-3", purchaseNumber: "PO-2026-003", supplier: { name: "Cipla Healthcare Pharma Supplies", email: "dist@cipla.com" }, warehouse: { name: "Main Distribution Center" }, grandTotal: 9000, amountPaid: 0, paymentStatus: "UNPAID", status: "RECEIVED", createdAt: new Date().toISOString() },
];

export default function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPO, setSelectedPO] = useState<any>(null);
  
  // Default to Current Calendar Month ("2026-08")
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-08");

  // Settlement Modal State
  const [settlingPO, setSettlingPO] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const limit = 50;

  const { data, isLoading, refetch } = usePurchases({ page, limit, search });
  const recordPaymentMutation = useRecordPurchasePayment();

  const rawPurchaseList = data?.purchases?.length > 0 ? data.purchases : mockPurchases;

  // Month-Filtered Purchase Orders
  const monthFilteredList = useMemo(() => {
    if (selectedMonth === "ALL") return rawPurchaseList;
    return rawPurchaseList.filter((p: any) => p.createdAt && p.createdAt.startsWith(selectedMonth));
  }, [rawPurchaseList, selectedMonth]);

  // Search-Filtered Purchase Orders
  const filteredPurchases = useMemo(() => {
    return monthFilteredList.filter((p: any) => {
      const searchLower = search.toLowerCase();
      return (
        !search ||
        p.purchaseNumber?.toLowerCase().includes(searchLower) ||
        p.supplier?.name?.toLowerCase().includes(searchLower) ||
        p.warehouse?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [monthFilteredList, search]);

  // Dynamic KPI Sums Based on Selected Month
  const totalSpend = useMemo(() => {
    return filteredPurchases.reduce((sum: number, p: any) => sum + Number(p.grandTotal || 0), 0);
  }, [filteredPurchases]);

  const totalPaid = useMemo(() => {
    return filteredPurchases.reduce((sum: number, p: any) => sum + Number(p.amountPaid || 0), 0);
  }, [filteredPurchases]);

  const totalPending = Math.max(0, totalSpend - totalPaid);
  const receivedCount = filteredPurchases.filter((p: any) => p.status === "RECEIVED" || p.status === "COMPLETED").length;
  const activeSuppliersCount = new Set(filteredPurchases.map((p: any) => p.supplier?.name)).size;

  const handleOpenSettleModal = (po: any) => {
    setSettlingPO(po);
    const due = Math.max(0, Number(po.grandTotal || 0) - Number(po.amountPaid || 0));
    setSettleAmount(due > 0 ? due.toString() : Number(po.grandTotal || 0).toString());
    setPaymentMethod("BANK_TRANSFER");
    setReference("");
    setNotes("");
  };

  const handleConfirmSettlePayment = async () => {
    if (!settlingPO) return;
    const amount = Number(settleAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        purchaseId: settlingPO.id,
        amount,
        method: paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      });

      toast.success(`Successfully paid ${formatCurrency(amount)} to ${settlingPO.supplier?.name || "Supplier"}`);
      setSettlingPO(null);
      if (selectedPO?.id === settlingPO.id) {
        setSelectedPO(null);
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Truck className="text-purple-600 dark:text-purple-400" size={26} /> Purchase Orders & Procurement
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage supplier invoices, purchase orders, clear pending vendor balances after delivery, and receive inventory.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard/purchases/new" className="w-full md:w-auto justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-98">
            <Plus size={16} />
            <span>New Purchase Order</span>
          </Link>
        </div>
      </div>

      {/* ─── KPI CARDS ROW (CLEAR PAYABLE LABELS) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Procurement Value */}
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Total Procurement Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{formatCurrency(totalSpend)}</div>
          <div className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
            <Truck size={12} /> {filteredPurchases.length} Orders ({selectedMonth === "ALL" ? "All Time" : "Selected Month"})
          </div>
        </div>

        {/* Pending Supplier Payables (To Be Paid) */}
        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Payables (To Be Paid)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs">
              AP
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(totalPending)}</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
            <Clock size={12} /> Money Owed To Suppliers (Payable)
          </div>
        </div>

        {/* Goods Received */}
        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Goods Received</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{receivedCount}</div>
          <div className="text-[10px] text-emerald-600 font-bold">In Stock & Verified</div>
        </div>

        {/* Active Suppliers */}
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Active Suppliers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{activeSuppliersCount}</div>
          <div className="text-[10px] text-muted-foreground font-bold">Vendor Partners</div>
        </div>
      </div>

      {/* ─── CONTROLS: SEARCH & MONTH SELECTOR ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        
        {/* Search Box */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search by PO number, supplier, or warehouse..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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

      {/* ─── DATA TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Receiving Warehouse</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Paid / Outstanding</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredPurchases.map((po: any) => {
                const grand = Number(po.grandTotal || 0);
                const paid = Number(po.amountPaid || 0);
                const due = Math.max(0, grand - paid);
                const isPaid = due === 0 || po.paymentStatus === "PAID";

                return (
                  <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                          <Truck size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground font-mono">{po.purchaseNumber || `PO-${po.id.slice(-6).toUpperCase()}`}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{formatDate(po.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{po.supplier?.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{po.supplier?.email || "No email"}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-medium">
                      {po.warehouse?.name || "Main Distribution Center"}
                    </td>
                    <td className="px-4 py-3 font-black text-foreground text-sm font-mono">
                      {formatCurrency(grand)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-emerald-600 font-bold">{formatCurrency(paid)}</div>
                      {due > 0 ? (
                        <div className="text-amber-600 font-extrabold text-[10px] flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> To Pay: {formatCurrency(due)}
                        </div>
                      ) : (
                        <div className="text-emerald-600 text-[10px] font-bold">Fully Settled</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        PAYMENT_COLORS[po.paymentStatus] || PAYMENT_COLORS.PAID
                      }`}>
                        {po.paymentStatus || "PAID"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        STATUS_COLORS[po.status] || STATUS_COLORS.RECEIVED
                      }`}>
                        {po.status || "RECEIVED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 💳 Interactive "Pay Vendor / Clear Balance" Button */}
                        {!isPaid && (
                          <button
                            onClick={() => handleOpenSettleModal(po)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
                            title="Pay Vendor Balance"
                          >
                            <CreditCard size={13} />
                            <span>Pay Balance</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Print PO Invoice"
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-semibold">
                    No purchase orders found for the selected month or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PAY VENDOR / SETTLE BALANCE MODAL ────────────────────────────────────── */}
      {settlingPO && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <CreditCard className="text-amber-500" size={18} /> Pay Supplier / Clear Balance
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{settlingPO.purchaseNumber || "PO"}</p>
              </div>
              <button onClick={() => setSettlingPO(null)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Supplier: {settlingPO.supplier?.name}</div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Total Order Value:</span>
                <span className="font-bold">{formatCurrency(Number(settlingPO.grandTotal || 0))}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-700 dark:text-amber-300 font-bold">Outstanding Payable (To Pay):</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {formatCurrency(Math.max(0, Number(settlingPO.grandTotal || 0) - Number(settlingPO.amountPaid || 0)))}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Payment Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  placeholder="Enter amount to pay vendor..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none"
                >
                  <option value="BANK_TRANSFER">🏦 Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">📱 UPI / QR Code</option>
                  <option value="CASH">💵 Store Cash Outflow</option>
                  <option value="CHEQUE">📝 Bank Cheque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Reference / UTR Number (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono focus:outline-none"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. UTR178559201"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSettlingPO(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSettlePayment}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Confirm Vendor Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PO DETAIL MODAL ─────────────────────────────────────────────────── */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Truck className="text-purple-600" size={20} />
                  Purchase Order #{selectedPO.purchaseNumber || selectedPO.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">Issued Date: {formatDate(selectedPO.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedPO(null)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-muted/20 p-3 rounded-xl border border-border/50 space-y-1">
                <div className="font-semibold text-muted-foreground uppercase text-[10px]">Supplier / Vendor</div>
                <div className="font-bold text-foreground text-sm">{selectedPO.supplier?.name}</div>
                <div className="text-muted-foreground font-mono">{selectedPO.supplier?.email || "N/A"}</div>
              </div>

              <div className="bg-muted/20 p-3 rounded-xl border border-border/50 space-y-1">
                <div className="font-semibold text-muted-foreground uppercase text-[10px]">Receiving Warehouse</div>
                <div className="font-bold text-foreground text-sm">{selectedPO.warehouse?.name || "Main Distribution Center"}</div>
                <div className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Status: {selectedPO.status || "RECEIVED"}
                </div>
              </div>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-center">Ordered Qty</th>
                    <th className="px-3 py-2 text-right">Unit Cost</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {selectedPO.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-bold text-foreground">{item.product?.name || "Product"}</td>
                      <td className="px-3 py-2 text-center font-mono">{item.orderedQty}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(Number(item.unitCost))}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">{formatCurrency(Number(item.unitCost) * item.orderedQty)}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">Standard Inventory Restock Order</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl gap-3">
              <div>
                <div className="text-xs font-bold text-purple-600">Grand Total PO Amount</div>
                <div className="text-[10px] text-muted-foreground">Vendor Payment Status: {selectedPO.paymentStatus || "PAID"}</div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-2xl font-black text-purple-600 font-mono">
                  {formatCurrency(Number(selectedPO.grandTotal || 0))}
                </div>
                {selectedPO.paymentStatus !== "PAID" && (
                  <button
                    onClick={() => {
                      const poToSettle = selectedPO;
                      setSelectedPO(null);
                      handleOpenSettleModal(poToSettle);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <CreditCard size={14} /> Pay Vendor Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
