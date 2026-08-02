"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  RotateCcw, Search, Plus, ArrowLeftRight, CheckCircle2, AlertTriangle,
  Package, Calendar, User, Building2, RefreshCw, X, FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReturnRecord {
  id: string;
  returnNumber: string;
  type: "SALES_RETURN" | "PURCHASE_RETURN";
  referenceInvoice: string;
  customerOrSupplier: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  reason: "DAMAGED" | "EXPIRED" | "WRONG_ITEM" | "CUSTOMER_CHOICE";
  restockStatus: "RESTOCKED" | "DISCARDED";
  createdAt: string;
}

const mockReturns: ReturnRecord[] = [
  {
    id: "ret-1",
    returnNumber: "RET-2026-001",
    type: "SALES_RETURN",
    referenceInvoice: "INV-2026-001",
    customerOrSupplier: "Ramesh Sharma",
    productName: "Wireless Headphones",
    quantity: 1,
    refundAmount: 1720,
    reason: "WRONG_ITEM",
    restockStatus: "RESTOCKED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ret-2",
    returnNumber: "RET-2026-002",
    type: "SALES_RETURN",
    referenceInvoice: "INV-2026-002",
    customerOrSupplier: "Anita Verma",
    productName: "Paracetamol 500mg (Pack)",
    quantity: 2,
    refundAmount: 448,
    reason: "EXPIRED",
    restockStatus: "DISCARDED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ret-3",
    returnNumber: "RET-2026-003",
    type: "PURCHASE_RETURN",
    referenceInvoice: "PO-2026-089",
    customerOrSupplier: "Global Tech Supplies",
    productName: "Motor Oil 5L Can",
    quantity: 1,
    refundAmount: 2225,
    reason: "DAMAGED",
    restockStatus: "DISCARDED",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "SALES_RETURN" | "PURCHASE_RETURN">("ALL");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [returnType, setReturnType] = useState<"SALES_RETURN" | "PURCHASE_RETURN">("SALES_RETURN");
  const [referenceInvoice, setReferenceInvoice] = useState("");
  const [customerOrSupplier, setCustomerOrSupplier] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [refundAmount, setRefundAmount] = useState(0);
  const [reason, setReason] = useState<"DAMAGED" | "EXPIRED" | "WRONG_ITEM" | "CUSTOMER_CHOICE">("CUSTOMER_CHOICE");
  const [restockItem, setRestockItem] = useState(true);

  const [returnsList, setReturnsList] = useState<ReturnRecord[]>(mockReturns);

  const filteredReturns = returnsList.filter((ret) => {
    const matchesTab = activeTab === "ALL" || ret.type === activeTab;
    const matchesSearch =
      ret.returnNumber.toLowerCase().includes(search.toLowerCase()) ||
      ret.referenceInvoice.toLowerCase().includes(search.toLowerCase()) ||
      ret.customerOrSupplier.toLowerCase().includes(search.toLowerCase()) ||
      ret.productName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceInvoice || !productName || quantity <= 0) return;

    const newReturn: ReturnRecord = {
      id: `ret-${Date.now()}`,
      returnNumber: `RET-2026-00${returnsList.length + 1}`,
      type: returnType,
      referenceInvoice,
      customerOrSupplier: customerOrSupplier || "Walk-in Customer",
      productName,
      quantity: Number(quantity),
      refundAmount: Number(refundAmount),
      reason,
      restockStatus: restockItem ? "RESTOCKED" : "DISCARDED",
      createdAt: new Date().toISOString(),
    };

    setReturnsList([newReturn, ...returnsList]);
    setIsModalOpen(false);
    // Reset Form
    setReferenceInvoice("");
    setCustomerOrSupplier("");
    setProductName("");
    setQuantity(1);
    setRefundAmount(0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="text-purple-600 dark:text-purple-400" /> Sales & Purchase Returns
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process customer refunds, supplier returns, and auto-restock inventory.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
        >
          <Plus size={18} /> Process New Return
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by return #, invoice #, customer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Returns" },
            { key: "SALES_RETURN", label: "Sales Returns" },
            { key: "PURCHASE_RETURN", label: "Supplier Returns" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredReturns.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Return Records</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Process a new return to manage customer or supplier refunds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Return No</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Ref Invoice</th>
                  <th className="px-4 py-3">Customer / Supplier</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Refund Amount</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-center">Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-purple-600 dark:text-purple-400">
                      {ret.returnNumber}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold">
                      {ret.type === "SALES_RETURN" ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          Sales Return
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Purchase Return
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      {ret.referenceInvoice}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                      {ret.customerOrSupplier}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {ret.productName}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900 dark:text-white">
                      {ret.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ret.refundAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="capitalize">{ret.reason.replace("_", " ").toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {ret.restockStatus === "RESTOCKED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={12} /> Restocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <AlertTriangle size={12} /> Discarded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw size={18} className="text-purple-600" /> Process Return Order
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Return Type</label>
                  <select
                    value={returnType}
                    onChange={(e: any) => setReturnType(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                  >
                    <option value="SALES_RETURN">Customer Sales Return</option>
                    <option value="PURCHASE_RETURN">Supplier Purchase Return</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reference Invoice / PO #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-001"
                    value={referenceInvoice}
                    onChange={(e) => setReferenceInvoice(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer / Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={customerOrSupplier}
                  onChange={(e) => setCustomerOrSupplier(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Return Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Refund Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Return Reason</label>
                  <select
                    value={reason}
                    onChange={(e: any) => setReason(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                  >
                    <option value="CUSTOMER_CHOICE">Customer Choice</option>
                    <option value="WRONG_ITEM">Wrong Item Sent</option>
                    <option value="DAMAGED">Damaged Product</option>
                    <option value="EXPIRED">Expired Product</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={restockItem}
                      onChange={(e) => setRestockItem(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    Restock into Warehouse
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Confirm & Process Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
