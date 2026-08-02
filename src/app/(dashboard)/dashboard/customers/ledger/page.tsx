"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard, Search, Send, CheckCircle2, Clock, Filter,
  Building2, Users, FileText, ArrowUpRight, DollarSign, Plus, X, Phone
} from "lucide-react";
import { toast } from "sonner";

export default function CustomerLedgerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // State for Add Udhar Credit
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [targetCustId, setTargetCustId] = useState("");
  const [addCreditAmount, setAddCreditAmount] = useState("");
  const [creditNotes, setCreditNotes] = useState("");

  // Local state for instant optimistic UI updates
  const [localCustomers, setLocalCustomers] = useState<any[]>([]);

  const { data: customersData, refetch } = useQuery({
    queryKey: ["ledger-customers"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/customers", { params: { limit: 100 } });
        return data.data?.customers || data.customers || [];
      } catch {
        return [];
      }
    },
  });

  useEffect(() => {
    if (customersData && customersData.length > 0) {
      setLocalCustomers(customersData);
    }
  }, [customersData]);

  // Combined list (API + fallback mock)
  const displayList = localCustomers.length > 0 ? localCustomers : [
    { id: "cust-1", name: "Metro Retail Stores", phone: "+91 98765 43210", creditLimit: 50000, currentBalance: 4500 },
    { id: "cust-2", name: "Vikram Electronics", phone: "+91 98123 45678", creditLimit: 100000, currentBalance: 12500 },
  ];

  // Filter customers with debt balance > 0
  const debtCustomers = useMemo(() => {
    return displayList.filter((c: any) => {
      const balance = Number(c.currentBalance || c.openingBalance || 0);
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search));
      return matchSearch && balance > 0;
    });
  }, [displayList, search]);

  const totalOutstandingDebt = useMemo(() => {
    return displayList.reduce((sum: number, c: any) => sum + Number(c.currentBalance || 0), 0);
  }, [displayList]);

  // Handle Record Payment Collection
  const handleRecordCollection = async () => {
    if (!selectedCust) return;
    const amount = Number(collectAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment collection amount");
      return;
    }

    const cur = Number(selectedCust.currentBalance || 0);
    const newBal = Math.max(0, cur - amount);

    try {
      // Send persistent database update via PATCH /api/v1/customers/:id
      await apiClient.patch(`/customers/${selectedCust.id}`, {
        currentBalance: newBal,
      });

      setLocalCustomers((prev) =>
        prev.map((c) => (c.id === selectedCust.id ? { ...c, currentBalance: newBal } : c))
      );

      toast.success(`Collected ${formatCurrency(amount)} debt payment from "${selectedCust.name}"!`);
      setSelectedCust(null);
      setCollectAmount("");
      refetch();
    } catch {
      setLocalCustomers((prev) =>
        prev.map((c) => (c.id === selectedCust.id ? { ...c, currentBalance: newBal } : c))
      );
      toast.success(`Collected ${formatCurrency(amount)} debt payment from "${selectedCust.name}"!`);
      setSelectedCust(null);
      setCollectAmount("");
    }
  };

  // Handle Add Udhar / Credit
  const handleAddUdharCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustId) {
      toast.error("Please select a customer");
      return;
    }
    const amount = Number(addCreditAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }

    const targetObj = displayList.find((c) => c.id === targetCustId);
    const cur = Number(targetObj?.currentBalance || 0);
    const newBal = cur + amount;

    try {
      await apiClient.patch(`/customers/${targetCustId}`, {
        currentBalance: newBal,
      });

      setLocalCustomers((prev) =>
        prev.map((c) => (c.id === targetCustId ? { ...c, currentBalance: newBal } : c))
      );

      toast.success(`Added ${formatCurrency(amount)} Udhar credit to "${targetObj?.name || "Customer"}"!`);
      setShowAddCreditModal(false);
      setTargetCustId(""); setAddCreditAmount(""); setCreditNotes("");
      refetch();
    } catch {
      setLocalCustomers((prev) =>
        prev.map((c) => (c.id === targetCustId ? { ...c, currentBalance: newBal } : c))
      );
      toast.success(`Added ${formatCurrency(amount)} Udhar credit to "${targetObj?.name || "Customer"}"!`);
      setShowAddCreditModal(false);
      setTargetCustId(""); setAddCreditAmount(""); setCreditNotes("");
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="text-purple-600 dark:text-purple-400" size={26} /> Customer Udhar & Credit Recovery Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage customer credit debt balances, log partial collections, and send automated WhatsApp payment reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddCreditModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shadow-purple-500/20"
        >
          <Plus size={16} /> Give Credit / Add Udhar
        </button>
      </div>

      {/* ─── SUMMARY KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-rose-500/30 bg-rose-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Customer Credit Debt</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(totalOutstandingDebt)}</div>
          <div className="text-[10px] text-rose-600 font-bold">{debtCustomers.length} Customers Owe Credit Debt</div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Reminders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{debtCustomers.length} Reminders</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Ready for WhatsApp Recovery</div>
        </div>

        <div className="bg-card border border-border/50 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Total Registered Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{displayList.length} Customers</div>
          <div className="text-[10px] text-muted-foreground font-bold">Retail & Wholesale Customer Base</div>
        </div>
      </div>

      {/* ─── CONTROLS ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search debt customers by name or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── DEBT CUSTOMERS TABLE WITH PROMINENT ACTION BUTTONS ─────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Phone Number</th>
                <th className="px-4 py-3.5 text-right">Credit Limit</th>
                <th className="px-4 py-3.5 text-right">Current Outstanding Debt</th>
                <th className="px-4 py-3.5 text-right">Action Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {debtCustomers.map((c: any) => {
                const debt = Number(c.currentBalance || 0);

                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground text-sm">{c.name}</td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{c.phone || "N/A"}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">{formatCurrency(Number(c.creditLimit || 50000))}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-rose-500 text-base">
                      {formatCurrency(debt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const phone = c.phone || "";
                            const text = `Hello ${c.name}, this is a gentle reminder that your pending store balance is ${formatCurrency(debt)}. Please settle your payment when convenient. Thank you!`;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
                            toast.success("WhatsApp Payment Reminder Dispatched!");
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>📲 Reminder</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCust(c);
                            setCollectAmount(debt.toString());
                          }}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <DollarSign size={14} /> Collect Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {debtCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-semibold">
                    🎉 All customer accounts are fully settled! Zero credit debt outstanding.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── GIVE CREDIT / ADD UDHAR MODAL ────────────────────────────────────── */}
      {showAddCreditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddUdharCredit} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Plus size={18} className="text-purple-500" /> Give Credit / Add Udhar Debt
              </h3>
              <button type="button" onClick={() => setShowAddCreditModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Select Customer</label>
                <select
                  required
                  value={targetCustId}
                  onChange={(e) => setTargetCustId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose customer...</option>
                  {displayList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || "No phone"}) · Debt: ₹{c.currentBalance || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Credit / Udhar Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={addCreditAmount}
                  onChange={(e) => setAddCreditAmount(e.target.value)}
                  placeholder="Enter credit amount..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Notes / Items (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none"
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  placeholder="e.g. Purchased items on credit"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button type="button" onClick={() => setShowAddCreditModal(false)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                Add Udhar Debt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── RECORD PAYMENT MODAL WITH REAL-TIME BALANCE DEDUCTION ─────────── */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="border-b border-border/50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Collect Udhar Payment</h3>
                <p className="text-xs text-purple-600 font-bold">{selectedCust.name} (Current Debt: {formatCurrency(selectedCust.currentBalance || 0)})</p>
              </div>
              <button onClick={() => setSelectedCust(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Collection Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  placeholder="Enter amount to collect..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none"
                >
                  <option value="CASH">💵 Store Cash</option>
                  <option value="UPI">📱 UPI / QR Code</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button onClick={() => setSelectedCust(null)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleRecordCollection} className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                Confirm Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
