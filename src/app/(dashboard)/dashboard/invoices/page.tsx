"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  useARStats,
  useReceivePayment,
  useInvoicePaymentHistory,
  useSendPaymentReminder,
  type ReceivePaymentData,
} from "@/hooks/useAR";
import {
  FileText, Search, Printer, Download, Filter, Eye, CheckCircle2,
  AlertCircle, Clock, Building2, User, Phone, MapPin, Receipt, X, ArrowLeft,
  DollarSign, TrendingUp, TrendingDown, CreditCard, Share2, Mail, Send,
  MoreVertical, CheckSquare, Square, RefreshCw, AlertTriangle, ShieldCheck,
  Calendar, ChevronRight, CornerDownRight, Check
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  productId: string;
  product: { name: string; sku: string; hsnCode?: string };
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  dueDate?: string;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID" | "CANCELLED";
  paymentMethod: string;
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue?: number;
  notes?: string;
  terms?: string;
  customer?: { id: string; name: string; email?: string; phone?: string; address?: string; gstNumber?: string };
  warehouse?: { name: string };
  soldBy?: { firstName: string; lastName: string };
  items?: InvoiceItem[];
}

export default function InvoicesPage() {
  const { user } = useAuthStore();
  const isOwner = user?.role === "OWNER" || user?.role === "SUPER_ADMIN";

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("ALL");
  const [outstandingOnly, setOutstandingOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modal / Drawer States
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [receivePaymentModal, setReceivePaymentModal] = useState(false);
  const [paymentHistoryDrawer, setPaymentHistoryDrawer] = useState(false);
  const [printPreviewModal, setPrintPreviewModal] = useState(false);
  const [printFormat, setPrintFormat] = useState<"A4" | "THERMAL">("A4");

  // Receive Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentTxId, setPaymentTxId] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [markFullyPaid, setMarkFullyPaid] = useState<boolean>(false);

  // Bulk Operations State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Fetch Live Invoices from API
  const { data: salesData, isLoading: isSalesLoading, refetch: refetchSales } = useQuery({
    queryKey: ["sales", { page: 1, limit: 100 }],
    queryFn: async () => {
      const { data } = await apiClient.get("/sales?page=1&limit=100");
      return data.data;
    },
  });

  // Fetch AR Stats from API
  const { data: arStats, isLoading: isARLoading } = useARStats();

  // Fetch Payment History for selected invoice
  const { data: paymentHistoryData, isLoading: isHistoryLoading } = useInvoicePaymentHistory(
    selectedInvoice?.id || "",
    paymentHistoryDrawer
  );

  // Mutations
  const receivePaymentMutation = useReceivePayment();
  const sendReminderMutation = useSendPaymentReminder();

  const invoices: Invoice[] = salesData?.sales || [];

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search
      const searchLower = search.toLowerCase();
      const matchSearch =
        !search ||
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customer?.name?.toLowerCase().includes(searchLower) ||
        inv.customer?.phone?.includes(search) ||
        inv.customer?.gstNumber?.toLowerCase().includes(searchLower);

      // Status
      const matchStatus = statusFilter === "ALL" || inv.paymentStatus === statusFilter;

      // Payment Method
      const matchMethod = methodFilter === "ALL" || inv.paymentMethod?.toUpperCase() === methodFilter;

      // Outstanding Only
      const outstanding = Math.max(0, inv.grandTotal - inv.amountPaid);
      const matchOutstanding = !outstandingOnly || outstanding > 0;

      // Overdue Only
      const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && outstanding > 0;
      const matchOverdue = !overdueOnly || isOverdue;

      // Month Filter
      const matchMonth = monthFilter === "ALL" || (inv.createdAt && inv.createdAt.startsWith(monthFilter));

      return matchSearch && matchStatus && matchMethod && matchOutstanding && matchOverdue && matchMonth;
    });
  }, [invoices, search, statusFilter, methodFilter, monthFilter, outstandingOnly, overdueOnly]);

  // Dynamic KPI Stats reacting live to Month Filter & Search Filters
  const displayStats = useMemo(() => {
    const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
    const amountCollected = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amountPaid || 0), 0);
    const paidInvoicesCount = filteredInvoices.filter(inv => inv.paymentStatus === "PAID").length;
    const partialCount = filteredInvoices.filter(inv => inv.paymentStatus === "PARTIAL").length;
    const unpaidCount = filteredInvoices.filter(inv => inv.paymentStatus === "UNPAID").length;
    const outstandingAmount = Math.max(0, totalInvoiced - amountCollected);

    return {
      totalInvoiceAmount: totalInvoiced,
      amountCollected: amountCollected,
      outstandingAmount: outstandingAmount,
      overdueAmount: arStats?.overdueAmount || 0,
      paidInvoices: paidInvoicesCount,
      partialInvoices: partialCount,
      unpaidInvoices: unpaidCount,
      collectionsDisplay: amountCollected,
    };
  }, [filteredInvoices, arStats]);

  // Handle Quick Payment Click
  const handleOpenReceivePayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const remaining = Math.max(0, inv.grandTotal - inv.amountPaid);
    setPaymentAmount(remaining);
    setPaymentMethod("CASH");
    setPaymentRef("");
    setPaymentTxId("");
    setPaymentNotes("");
    setMarkFullyPaid(true);
    setReceivePaymentModal(true);
  };

  // Submit Receive Payment
  const handleSubmitReceivePayment = async () => {
    if (!selectedInvoice) return;
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    try {
      const payload: ReceivePaymentData = {
        amount: Number(paymentAmount),
        method: paymentMethod,
        reference: paymentRef,
        transactionId: paymentTxId,
        notes: paymentNotes,
        markAsFullyPaid: markFullyPaid,
      };

      await receivePaymentMutation.mutateAsync({
        saleId: selectedInvoice.id,
        data: payload,
      });

      toast.success(`Received ₹${paymentAmount} payment for ${selectedInvoice.invoiceNumber}`);
      setReceivePaymentModal(false);
      refetchSales();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record payment.");
    }
  };

  // Send Payment Reminder
  const handleSendReminder = async (inv: Invoice, channel: "WHATSAPP" | "SMS" | "EMAIL") => {
    try {
      await sendReminderMutation.mutateAsync({ saleId: inv.id, channel });
      toast.success(`Payment reminder sent via ${channel} to ${inv.customer?.name || "Customer"}`);
    } catch (err: any) {
      toast.error("Failed to send reminder.");
    }
  };

  // Toggle Bulk Selection
  const toggleSelectAll = () => {
    if (selectedInvoiceIds.length === filteredInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(filteredInvoices.map((i) => i.id));
    }
  };

  const toggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No invoices to export.");
      return;
    }

    const headers = ["Invoice Number", "Date", "Customer", "Phone", "Total", "Paid", "Outstanding", "Status"];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      new Date(inv.createdAt).toLocaleDateString("en-IN"),
      inv.customer?.name || "Walk-in",
      inv.customer?.phone || "-",
      inv.grandTotal,
      inv.amountPaid,
      Math.max(0, inv.grandTotal - inv.amountPaid),
      inv.paymentStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoices_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* ─── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Receipt className="text-blue-600 dark:text-blue-500" size={32} />
            Accounts Receivable & Billing Hub
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Commercial invoicing, instant payment collection, customer credit ledgers & AR management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-bold text-xs rounded-xl shadow-sm text-slate-700 dark:text-slate-200 transition-all flex items-center gap-2"
          >
            <Download size={15} /> Export CSV / Excel
          </button>
          <button
            onClick={() => refetchSales()}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs rounded-xl shadow-sm text-slate-700 dark:text-slate-200 transition-all"
            title="Refresh Invoices"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ─── Commercial Header KPIs ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Invoiced */}
        <div className="enterprise-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Invoiced</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono-data">
            {isARLoading ? "..." : formatCurrency(displayStats.totalInvoiceAmount)}
          </p>
          <div className="text-[10px] font-bold text-slate-400 mt-2">
            {monthFilter === "ALL" ? "All time sales total" : "Selected month total"}
          </div>
        </div>

        {/* Amount Collected */}
        <div className="enterprise-card bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Amount Collected</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono-data">
            {isARLoading ? "..." : formatCurrency(displayStats.amountCollected)}
          </p>
          <div className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 mt-2 font-mono-data">
            {displayStats.paidInvoices} Paid Invoices
          </div>
        </div>

        {/* Outstanding Amount */}
        <div className="enterprise-card bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono-data">
            {isARLoading ? "..." : formatCurrency(displayStats.outstandingAmount)}
          </p>
          <div className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 mt-2 font-mono-data">
            {displayStats.partialInvoices} Partial · {displayStats.unpaidInvoices} Unpaid
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="enterprise-card bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20">
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Overdue Amount</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono-data">
            {isARLoading ? "..." : formatCurrency(displayStats.overdueAmount)}
          </p>
          <div className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} /> Requires Collection
          </div>
        </div>

        {/* Collections */}
        <div className="enterprise-card bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/20">
          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            {monthFilter === "ALL" ? "All-Time Collections" : "Selected Month Collections"}
          </p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono-data">
            {isARLoading ? "..." : formatCurrency(displayStats.collectionsDisplay)}
          </p>
          <div className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 mt-2 font-mono-data">
            Total: {formatCurrency(displayStats.collectionsDisplay)}
          </div>
        </div>

      </div>

      {/* ─── Advanced Sticky Filters Bar ────────────────────────────────────── */}
      <div className="enterprise-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Invoice #, Customer Name, Phone, GSTIN..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PARTIAL">Partial Only</option>
              <option value="UNPAID">Unpaid Only</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
            </select>

            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">📅 All Months</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-03">March 2026</option>
            </select>

            {/* Quick Toggle Checkboxes */}
            <button
              onClick={() => setOutstandingOnly(!outstandingOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                outstandingOnly
                  ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              Outstanding Only
            </button>

            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                overdueOnly
                  ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              Overdue Only
            </button>
          </div>
        </div>
      </div>

      {/* ─── Commercial Invoice Table ────────────────────────────────────────── */}
      <div className="enterprise-card bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-0 overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    {selectedInvoiceIds.length === filteredInvoices.length && filteredInvoices.length > 0 ? (
                      <CheckSquare size={16} className="text-blue-500" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Invoice #</th>
                <th className="py-4 px-4">Date & Due</th>
                <th className="py-4 px-4">Customer Details</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4 text-right">Grand Total</th>
                <th className="py-4 px-4 text-right">Paid</th>
                <th className="py-4 px-4 text-right">Outstanding</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Quick Action</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isSalesLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={11} className="py-4 px-4">
                      <Skeleton className="h-6 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-semibold">
                    No invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const outstanding = Math.max(0, inv.grandTotal - inv.amountPaid);
                  const isSelected = selectedInvoiceIds.includes(inv.id);
                  const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && outstanding > 0;

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-blue-500/5 dark:bg-blue-950/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleSelectInvoice(inv.id)}
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                        </button>
                      </td>

                      {/* Invoice # */}
                      <td className="py-4 px-4">
                        <span
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setViewDetailModal(true);
                          }}
                          className="font-black text-blue-600 dark:text-blue-400 font-mono-data hover:underline cursor-pointer"
                        >
                          {inv.invoiceNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          by {inv.soldBy ? `${inv.soldBy.firstName}` : "POS"}
                        </div>
                      </td>

                      {/* Date & Due */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        {isOverdue ? (
                          <span className="text-[10px] font-extrabold text-rose-500 flex items-center gap-1 mt-0.5">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "On Receipt"}
                          </div>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {inv.customer?.name || "Walk-in Customer"}
                        </div>
                        {inv.customer?.phone && (
                          <div className="text-[10px] font-medium text-slate-400 font-mono-data mt-0.5">
                            {inv.customer.phone}
                          </div>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {inv.paymentMethod || "CASH"}
                      </td>

                      {/* Grand Total */}
                      <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white font-mono-data text-sm">
                        {formatCurrency(inv.grandTotal)}
                      </td>

                      {/* Paid */}
                      <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono-data">
                        {formatCurrency(Math.min(inv.grandTotal, inv.amountPaid))}
                      </td>

                      {/* Outstanding */}
                      <td className="py-4 px-4 text-right font-black font-mono-data">
                        <span className={outstanding > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}>
                          {formatCurrency(outstanding)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : inv.paymentStatus === "PARTIAL"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : inv.paymentStatus === "CANCELLED"
                              ? "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>

                      {/* Quick Action Button */}
                      <td className="py-4 px-4 text-center">
                        {inv.paymentStatus === "PAID" ? (
                          <span className="text-[10px] font-extrabold text-emerald-500 flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} /> Settled
                          </span>
                        ) : inv.paymentStatus === "PARTIAL" ? (
                          <button
                            onClick={() => handleOpenReceivePayment(inv)}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] rounded-lg shadow-sm shadow-amber-500/30 transition-all"
                          >
                            Collect ₹{outstanding}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReceivePayment(inv)}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-lg shadow-sm shadow-rose-500/30 transition-all"
                          >
                            Collect ₹{outstanding}
                          </button>
                        )}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setViewDetailModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="View Invoice Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPrintPreviewModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                            title="Print Invoice"
                          >
                            <Printer size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentHistoryDrawer(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                            title="Payment History"
                          >
                            <Clock size={15} />
                          </button>

                          {outstanding > 0 && (
                            <button
                              onClick={() => handleSendReminder(inv, "WHATSAPP")}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                              title="Send WhatsApp Reminder"
                            >
                              <Send size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── RECEIVE PAYMENT MODAL ──────────────────────────────────────────── */}
      {receivePaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="text-emerald-500" size={20} /> Receive Payment
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Record collection for Invoice <span className="font-bold text-blue-600 font-mono-data">{selectedInvoice.invoiceNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setReceivePaymentModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Invoice Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Invoice Total</p>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono-data">{formatCurrency(selectedInvoice.grandTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase">Already Paid</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono-data">{formatCurrency(selectedInvoice.amountPaid)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-500 uppercase">Balance Due</p>
                <p className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono-data">
                  {formatCurrency(Math.max(0, selectedInvoice.grandTotal - selectedInvoice.amountPaid))}
                </p>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono-data font-black text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="WALLET">Digital Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reference / Cheque #
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. CHQ-998811"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  UPI / Bank Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentTxId}
                  onChange={(e) => setPaymentTxId(e.target.value)}
                  placeholder="e.g. TXN9988776655"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono-data font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received via GPay"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="markFullyPaid"
                  checked={markFullyPaid}
                  onChange={(e) => setMarkFullyPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="markFullyPaid" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Mark Invoice as Fully Settled & Paid
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                onClick={() => setReceivePaymentModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReceivePayment}
                disabled={receivePaymentMutation.isPending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                <Check size={16} /> Record Payment Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PAYMENT HISTORY DRAWER ───────────────────────────────────────────── */}
      {paymentHistoryDrawer && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="text-purple-500" size={20} /> Payment History Timeline
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Audit trail for Invoice <span className="font-bold text-blue-600 font-mono-data">{selectedInvoice.invoiceNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setPaymentHistoryDrawer(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Grand Total:</span>
                <span className="font-mono-data">{formatCurrency(selectedInvoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Total Collected:</span>
                <span className="font-mono-data">{formatCurrency(selectedInvoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-amber-600 dark:text-amber-400 pt-1 border-t border-purple-500/10">
                <span>Balance Remaining:</span>
                <span className="font-mono-data">{formatCurrency(Math.max(0, selectedInvoice.grandTotal - selectedInvoice.amountPaid))}</span>
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Timeline</h4>
              
              {isHistoryLoading ? (
                <Skeleton className="h-24 w-full rounded-xl" />
              ) : !paymentHistoryData?.payments || paymentHistoryData.payments.length === 0 ? (
                <div className="p-6 text-center text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  No payments recorded yet for this invoice.
                </div>
              ) : (
                paymentHistoryData.payments.map((pt, idx) => (
                  <div key={pt.id} className="relative pl-6 border-l-2 border-purple-500 space-y-1 py-1">
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-purple-600 border-2 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                      <span>{pt.method} Receipt</span>
                      <span className="font-mono-data text-emerald-600 dark:text-emerald-400 font-black">+{formatCurrency(pt.amount)}</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                      {new Date(pt.receivedAt).toLocaleString("en-IN")} by {pt.receivedBy?.firstName} {pt.receivedBy?.lastName}
                    </div>
                    {pt.transactionId && (
                      <div className="text-[10px] font-mono text-slate-500">TxID: {pt.transactionId}</div>
                    )}
                    {pt.notes && (
                      <div className="text-[10px] italic text-slate-500">{pt.notes}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PRINT PREVIEW MODAL ────────────────────────────────────────────── */}
      {printPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6">
            
            {/* Format Toggle & Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPrintFormat("A4")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    printFormat === "A4" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Standard A4 GST
                </button>
                <button
                  onClick={() => setPrintFormat("THERMAL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    printFormat === "THERMAL" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  80mm Thermal Receipt
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <Printer size={15} /> Print Invoice
                </button>
                <button
                  onClick={() => setPrintPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document */}
            <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 space-y-6 font-sans">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-blue-600">INVENTORYPRO ERP</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Commercial Retail & Wholesale Solutions</p>
                  <p className="text-xs text-slate-600 mt-2 font-medium">GSTIN: 27AABCB1234C1ZV</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 uppercase tracking-widest">TAX INVOICE</span>
                  <div className="text-sm font-black text-blue-600 font-mono-data mt-1">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    Date: {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Customer / Billed To</p>
                  <p className="font-black text-sm text-slate-900">{selectedInvoice.customer?.name || "Walk-in Customer"}</p>
                  {selectedInvoice.customer?.phone && <p className="font-mono text-slate-600">{selectedInvoice.customer.phone}</p>}
                  {selectedInvoice.customer?.address && <p className="text-slate-600 mt-1">{selectedInvoice.customer.address}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Payment & Due Date</p>
                  <p className="font-bold text-slate-900">Status: <span className="font-black uppercase">{selectedInvoice.paymentStatus}</span></p>
                  <p className="text-slate-600 mt-1">Method: {selectedInvoice.paymentMethod || "CASH"}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 font-black text-slate-700">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">GST %</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-bold">{item.product?.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{item.taxRate}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{formatCurrency(item.total)}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="py-4 text-center font-medium text-slate-500">Standard Sales Items</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Calculation Summary */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-2 text-xs font-bold">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (GST):</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-base font-black border-t-2 border-slate-900 pt-2">
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Amount Paid:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 font-black">
                    <span>Balance Due:</span>
                    <span className="font-mono">{formatCurrency(Math.max(0, selectedInvoice.grandTotal - selectedInvoice.amountPaid))}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-700">Terms & Conditions:</p>
                  <p>1. Goods once sold will not be taken back.</p>
                  <p>2. Subject to local jurisdiction.</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-slate-400 w-32 mb-1" />
                  <p className="font-bold text-slate-900">Authorized Signatory</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
