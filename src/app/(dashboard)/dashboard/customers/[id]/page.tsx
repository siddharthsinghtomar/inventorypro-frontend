"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { 
  User, Phone, Mail, MapPin, 
  ArrowLeft, Edit, AlertCircle, ShoppingBag, 
  Star, CreditCard, Activity, FileText, CheckCircle2,
  Clock, DollarSign, ArrowUpRight, ArrowDownRight, Layers,
  Printer, X, Receipt, PackageCheck, ShoppingCart
} from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"orders" | "items" | "ledger">("orders");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ["customer-detail", id],
    queryFn: async () => {
      // 1. Try direct fetch
      try {
        const { data } = await apiClient.get(`/customers/${id}`);
        const res = data.data?.customer || data.data;
        if (res && res.name) return res;
      } catch {}

      // 2. Search customers list by ID, phone, or name
      const { data: listRes } = await apiClient.get(`/customers?limit=100`);
      const allCusts = listRes.data?.customers || listRes.customers || [];
      const match = allCusts.find((c: any) => c.id === id || c.phone === id || c.name === id) || allCusts[0];
      if (match) {
        const { data: detailRes } = await apiClient.get(`/customers/${match.id}`);
        return detailRes.data?.customer || detailRes.data;
      }
      throw new Error("Customer profile not found");
    },
    enabled: !!id,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600 max-w-md mx-auto my-12 space-y-3">
        <AlertCircle className="mx-auto h-8 w-8" />
        <h3 className="font-bold text-lg">Customer Profile Not Found</h3>
        <p className="text-xs text-rose-500">The customer record you are looking for does not exist in your database.</p>
        <Link href="/dashboard/customers" className="inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md">
          &larr; Return to Customer Directory
        </Link>
      </div>
    );
  }

  const balance = Number(customer?.currentBalance || 0);
  const sales: any[] = customer?.sales || [];
  const ledgers: any[] = customer?.ledgers || [];

  // Compute Purchased Items Summary across all sales
  const itemSummaryMap: Record<string, { id: string; name: string; sku: string; totalQty: number; totalSpent: number; lastDate: string }> = {};
  sales.forEach((sale: any) => {
    (sale.items || []).forEach((item: any) => {
      const prodId = item.productId || item.product?.id || item.product?.sku || "item";
      const name = item.product?.name || "Purchased Product";
      const sku = item.product?.sku || "SKU-000";
      const qty = Number(item.quantity || 1);
      const spent = Number(item.unitPrice || 0) * qty;

      if (!itemSummaryMap[prodId]) {
        itemSummaryMap[prodId] = {
          id: prodId,
          name,
          sku,
          totalQty: 0,
          totalSpent: 0,
          lastDate: sale.createdAt,
        };
      }
      itemSummaryMap[prodId].totalQty += qty;
      itemSummaryMap[prodId].totalSpent += spent;
    });
  });
  const purchasedItems = Object.values(itemSummaryMap);

  return (
    <div className="space-y-6 animate-in font-sans p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers" className="p-2.5 rounded-xl border border-border/50 hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md">
              {String(customer?.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {String(customer?.name || "Customer Profile")}
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-black ${
                  customer?.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                  customer?.status === "VIP" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {String(customer?.status || "ACTIVE")}
                </span>
              </h1>
              {customer?.group && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                  <User size={13} /> Group: {String(customer.group.name)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {customer?.id && (
            <Link href={`/dashboard/customers/${customer.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border border-border bg-card hover:bg-muted transition-colors shadow-sm">
              <Edit size={15} /> Edit Customer Profile
            </Link>
          )}
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase">Total Purchases</div>
            <div className="text-xl font-black text-foreground">{formatCurrency(Number(customer?.totalPurchases || 0))}</div>
          </div>
        </div>

        <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase">Total Orders</div>
            <div className="text-xl font-black text-emerald-600">{customer?.totalOrders || sales.length}</div>
          </div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 shadow-sm rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold uppercase">Current Balance</div>
            <div className={`text-xl font-black ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {balance > 0 ? `${formatCurrency(balance)} Due` : 'Settled ₹0'}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Star size={20} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase">Loyalty Points</div>
            <div className="text-xl font-black text-blue-600">{customer?.loyaltyPoints || 0} pts</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Contact & Address Details</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-xl text-muted-foreground shrink-0"><Phone size={15} /></div>
                <div>
                  <div className="text-muted-foreground font-medium mb-0.5">Phone Number</div>
                  <div className="font-bold text-foreground">{customer?.phone ? String(customer.phone) : "—"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-xl text-muted-foreground shrink-0"><Mail size={15} /></div>
                <div>
                  <div className="text-muted-foreground font-medium mb-0.5">Email Address</div>
                  <div className="font-bold text-foreground">{customer?.email ? String(customer.email) : "—"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-xl text-muted-foreground shrink-0"><MapPin size={15} /></div>
                <div>
                  <div className="text-muted-foreground font-medium mb-0.5">Full Address</div>
                  <div className="font-medium text-foreground">
                    {[customer?.address, customer?.city, customer?.state, customer?.pincode].filter(Boolean).join(", ") || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Tabbed Orders, Item Purchase History & Ledgers */}
        <div className="lg:col-span-2 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex border-b border-border/50 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === "orders"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 font-black"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={16} />
              <span>POS Sales & Bills ({sales.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("items")}
              className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === "items"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 font-black"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <PackageCheck size={16} />
              <span>Item Purchase History ({purchasedItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === "ledger"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 font-black"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers size={16} />
              <span>Financial Credit Ledger ({ledgers.length})</span>
            </button>
          </div>

          {/* TAB 1: POS SALES & BILLS */}
          {activeTab === "orders" && (
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden min-h-[350px]">
              {sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">No POS Sales Recorded</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No sales receipts or POS checkout orders logged for this customer yet.
                  </p>
                  <Link
                    href="/dashboard/pos"
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Open POS Terminal
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Purchased Items</th>
                        <th className="px-4 py-3">Grand Total</th>
                        <th className="px-4 py-3">Payment Status</th>
                        <th className="px-4 py-3 text-right">Bill Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-medium">
                      {sales.map((sale: any) => (
                        <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                              {sale.invoiceNumber}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(sale.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground max-w-xs truncate">
                              {sale.items?.map((i: any) => `${i.product?.name || 'Item'} (${i.quantity})`).join(", ") || `${sale.items?.length || 1} items`}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-black text-foreground text-sm">
                            {formatCurrency(Number(sale.grandTotal))}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              sale.paymentStatus === "PAID"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : sale.paymentStatus === "PARTIAL"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            }`}>
                              {sale.paymentStatus || "PAID"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedReceipt(sale)}
                              className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] inline-flex items-center gap-1"
                            >
                              <Receipt size={13} /> View Bill
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ITEM PURCHASED HISTORY */}
          {activeTab === "items" && (
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden min-h-[350px]">
              {purchasedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                    <PackageCheck size={24} />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">No Items Purchased Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No product purchase history recorded for this customer yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Total Qty Bought</th>
                        <th className="px-4 py-3">Total Amount Spent</th>
                        <th className="px-4 py-3">Last Purchased</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-medium">
                      {purchasedItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-muted-foreground text-xs">
                            {item.sku}
                          </td>
                          <td className="px-4 py-3 font-black text-emerald-600 text-xs">
                            {item.totalQty} units
                          </td>
                          <td className="px-4 py-3 font-black text-foreground">
                            {formatCurrency(item.totalSpent)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(item.lastDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCIAL LEDGER */}
          {activeTab === "ledger" && (
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden min-h-[350px]">
              {ledgers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                    <Layers size={24} />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">No Ledger Postings</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No financial credit postings or payment entries recorded for this customer yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Transaction Type</th>
                        <th className="px-4 py-3">Notes</th>
                        <th className="px-4 py-3">Debit (Sale)</th>
                        <th className="px-4 py-3">Credit (Paid)</th>
                        <th className="px-4 py-3">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-medium">
                      {ledgers.map((l: any) => (
                        <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(l.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-xs text-foreground">
                              {l.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {l.notes || "—"}
                          </td>
                          <td className="px-4 py-3 font-bold text-rose-600">
                            {l.debit > 0 ? formatCurrency(Number(l.debit)) : "—"}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            {l.credit > 0 ? formatCurrency(Number(l.credit)) : "—"}
                          </td>
                          <td className="px-4 py-3 font-black text-foreground">
                            {formatCurrency(Number(l.balance))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POS RECEIPT / BILL MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Receipt className="text-purple-600" size={20} /> Sales Receipt — {selectedReceipt.invoiceNumber}
              </h3>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-3 font-mono">
              <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-3 space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white uppercase">Store POS Checkout Receipt</div>
                <div className="text-[11px] text-slate-500">Invoice: {selectedReceipt.invoiceNumber}</div>
                <div className="text-[11px] text-slate-500">Date: {formatDate(selectedReceipt.createdAt)}</div>
                <div className="text-[11px] text-purple-600 font-bold">Customer: {customer.name}</div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                {(selectedReceipt.items || []).map((i: any, index: number) => (
                  <div key={index} className="flex justify-between text-slate-600 dark:text-slate-400">
                    <div>
                      <div>{i.product?.name || "Product"}</div>
                      <div className="text-[10px] opacity-75">{i.quantity} x {formatCurrency(Number(i.unitPrice))}</div>
                    </div>
                    <div className="font-bold">{formatCurrency(Number(i.unitPrice) * Number(i.quantity))}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(selectedReceipt.subTotal || selectedReceipt.grandTotal))}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Grand Total</span>
                  <span className="text-purple-600 dark:text-purple-400">{formatCurrency(Number(selectedReceipt.grandTotal))}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer size={15} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
