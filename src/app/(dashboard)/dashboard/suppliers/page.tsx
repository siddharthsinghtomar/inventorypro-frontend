"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Truck, Plus, Search, Phone, Mail, Building2,
  CreditCard, AlertTriangle, Eye, Edit, CheckCircle2,
  Loader2, DollarSign, X
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payingSupplier, setPayingSupplier] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await apiClient.get(`/suppliers?${params.toString()}`);
      return data.data;
    },
  });

  const suppliers: any[] = data?.suppliers || [];
  const totalOwed = suppliers.reduce(
    (sum: number, s: any) => sum + Math.abs(Math.min(0, Number(s.currentBalance || 0))),
    0
  );

  const handleStatusChange = async (supplierId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/suppliers/${supplierId}`, { status: newStatus });
      toast.success(`Supplier status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update supplier status");
    }
  };

  const handleOpenPayModal = (supplier: any) => {
    setPayingSupplier(supplier);
    const balance = Math.abs(Math.min(0, Number(supplier.currentBalance || 0)));
    setPayAmount(balance > 0 ? balance.toString() : "0");
    setPaymentMethod("BANK_TRANSFER");
    setReference("");
    setNotes("");
  };

  const handleConfirmSupplierPayment = async () => {
    if (!payingSupplier) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmittingPay(true);
    try {
      await apiClient.post(`/suppliers/${payingSupplier.id}/payments`, {
        amount,
        method: paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      });

      toast.success(`Recorded ₹${amount} payment for ${payingSupplier.name}`);
      setPayingSupplier(null);
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record supplier payment");
    } finally {
      setIsSubmittingPay(false);
    }
  };

  return (
    <div className="space-y-6 animate-in font-sans p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers & Vendor Directory</h1>
          <p className="text-sm text-muted-foreground">Manage vendors, purchase history, accounts payable, and status control</p>
        </div>
        <Link href="/dashboard/suppliers/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all">
          <Plus size={16} />
          Add New Supplier
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Total Suppliers</div>
          <div className="text-2xl font-extrabold text-foreground">{suppliers.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <Truck size={12} /> Registered Vendors
          </div>
        </div>

        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Active Vendors</div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {suppliers.filter((s: any) => s.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-slate-500">Ready for Purchases</div>
        </div>

        <div className="bg-card border border-amber-500/30 p-4 rounded-xl shadow-sm space-y-1 bg-amber-500/5">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Total Outstanding Payable</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{formatCurrency(totalOwed)}</div>
          <div className="text-[11px] text-amber-600 font-medium">Vendor Liabilities</div>
        </div>

        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Inactive / Blocked</div>
          <div className="text-2xl font-extrabold text-rose-600">
            {suppliers.filter((s: any) => s.status !== "ACTIVE").length}
          </div>
          <div className="text-[11px] text-slate-500">Disabled Vendors</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor name, phone, or company..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-muted-foreground">Filter Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Statuses ({suppliers.length})</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="BLACKLISTED">Blacklisted Only</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <Loader2 className="animate-spin text-purple-600" size={30} />
          <p className="text-xs font-semibold text-muted-foreground">Loading suppliers list...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="card p-12 text-center border border-border/50 rounded-2xl bg-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto font-bold">
            <Truck size={24} />
          </div>
          <h3 className="text-base font-bold text-foreground">No Suppliers Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">There are no suppliers matching your search criteria. Click below to add a new vendor.</p>
          <Link href="/dashboard/suppliers/new" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md">
            <Plus size={15} /> Add First Supplier
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Supplier / Vendor</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Outstanding Due</th>
                  <th className="px-4 py-3">Status Control</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {suppliers.map((s: any) => {
                  const balance = Number(s.currentBalance || 0);
                  const isOwed = balance < 0;
                  const dueAmount = Math.abs(Math.min(0, balance));

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0">
                            {String(s.name || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{s.name}</div>
                            {s.company && <div className="text-[11px] text-muted-foreground font-medium">{s.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <Phone size={12} className="text-muted-foreground" />{s.phone || "No phone"}
                        </div>
                        {s.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <Mail size={11} />{s.email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{s.city || "—"}</td>
                      <td className="px-4 py-3">
                        <div className={`text-sm font-black ${isOwed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                          {isOwed ? `${formatCurrency(dueAmount)} Due` : "Settled ₹0"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={s.status || "ACTIVE"}
                          onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border outline-none cursor-pointer ${
                            s.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : s.status === "BLACKLISTED"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="BLACKLISTED">BLACKLISTED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOwed && (
                            <button
                              onClick={() => handleOpenPayModal(s)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-all"
                              title="Pay Supplier & Clear Outstanding Balance"
                            >
                              <CreditCard size={13} />
                              <span>Pay ₹{dueAmount.toLocaleString("en-IN")}</span>
                            </button>
                          )}
                          <Link
                            href={`/dashboard/suppliers/${s.id}`}
                            className="p-1.5 hover:bg-muted rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                            title="View Supplier Profile & Statement"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/suppliers/${s.id}/edit`}
                            className="p-1.5 hover:bg-muted rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                            title="Edit Supplier Profile"
                          >
                            <Edit size={16} />
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

      {/* SUPPLIER PAYMENT SETTLEMENT MODAL */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <CreditCard className="text-amber-500" size={20} /> Pay Supplier — {payingSupplier.name}
              </h3>
              <button onClick={() => setPayingSupplier(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">Vendor: <strong>{payingSupplier.name}</strong></div>
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white pt-1">
                <span className="text-amber-600">Total Due Balance: ₹{Math.abs(Math.min(0, Number(payingSupplier.currentBalance || 0))).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount to pay..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border rounded-xl font-medium bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref / Cheque No. (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="UTR Number / Cheque No. / Ref ID"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPayingSupplier(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSupplierPayment}
                disabled={isSubmittingPay}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>{isSubmittingPay ? "Processing..." : "Confirm Payment & Clear Balance"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
