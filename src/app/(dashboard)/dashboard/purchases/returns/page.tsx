"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingDown, Truck, Search, Plus, CheckCircle2, Clock,
  FileText, ArrowUpRight, DollarSign, ShieldCheck, X, Phone
} from "lucide-react";
import { toast } from "sonner";

interface DebitNote {
  id: string;
  debitNoteNumber: string;
  supplierName: string;
  purchaseNumber: string;
  amount: number;
  reason: string;
  createdAt: string;
  status: "ISSUED" | "SETTLED";
}

const mockDebitNotes: DebitNote[] = [
  { id: "dn-1", debitNoteNumber: "DN-2026-001", supplierName: "Apple India Authorised Logistics", purchaseNumber: "PO-2026-001", amount: 139900, reason: "Damaged screen during transit", createdAt: "2026-07-28", status: "ISSUED" },
  { id: "dn-2", debitNoteNumber: "DN-2026-002", supplierName: "Samsung Electronics Distribution", purchaseNumber: "PO-2026-002", amount: 45000, reason: "Incorrect color variant sent", createdAt: "2026-07-20", status: "SETTLED" },
];

export default function SupplierReturnsPage() {
  const [search, setSearch] = useState("");
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>(mockDebitNotes);

  // Settlement Modal State
  const [selectedNote, setSelectedNote] = useState<DebitNote | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleMethod, setSettleMethod] = useState("CREDITED_TO_ACCOUNT");

  // Create Debit Note Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [purchaseNumber, setPurchaseNumber] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const filteredNotes = useMemo(() => {
    return debitNotes.filter((dn) => {
      return (
        !search ||
        dn.debitNoteNumber.toLowerCase().includes(search.toLowerCase()) ||
        dn.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        dn.purchaseNumber.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [debitNotes, search]);

  const totalDebitClaimValue = useMemo(() => {
    return debitNotes.reduce((sum, dn) => sum + dn.amount, 0);
  }, [debitNotes]);

  // Handle Settle Claim
  const handleSettleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;

    setDebitNotes((prev) =>
      prev.map((dn) => (dn.id === selectedNote.id ? { ...dn, status: "SETTLED" } : dn))
    );

    toast.success(`Debit Note ${selectedNote.debitNoteNumber} settled successfully! Claim credited.`);
    setSelectedNote(null);
  };

  // Handle Create Debit Note
  const handleCreateDebitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !claimAmount) {
      toast.error("Please fill in required fields");
      return;
    }

    const newNote: DebitNote = {
      id: `dn-${Date.now()}`,
      debitNoteNumber: `DN-2026-00${debitNotes.length + 1}`,
      supplierName,
      purchaseNumber: purchaseNumber || `PO-2026-00${debitNotes.length + 1}`,
      amount: Number(claimAmount),
      reason: returnReason || "Returned damaged goods",
      createdAt: new Date().toISOString().split("T")[0],
      status: "ISSUED",
    };

    setDebitNotes([newNote, ...debitNotes]);
    toast.success(`Issued Debit Note ${newNote.debitNoteNumber} for ${formatCurrency(newNote.amount)}!`);
    setShowCreateModal(false);
    setSupplierName(""); setPurchaseNumber(""); setClaimAmount(""); setReturnReason("");
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Truck className="text-purple-600 dark:text-purple-400" size={26} /> Supplier Returns & Debit Note Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Issue Debit Notes to vendors for damaged or returned inventory stock, claiming credit refunds against future PO payables.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shadow-purple-500/20"
        >
          <Plus size={16} /> Issue Debit Note
        </button>
      </div>

      {/* ─── SUMMARY KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Debit Note Claim Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{formatCurrency(totalDebitClaimValue)}</div>
          <div className="text-[10px] text-purple-600 font-bold">{debitNotes.length} Total Vendor Debit Notes Issued</div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Supplier Refund Claims</span>
            <Clock className="text-amber-500" size={18} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {debitNotes.filter((dn) => dn.status === "ISSUED").length} Claims
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Awaiting Vendor Credit Note Settlement</div>
        </div>

        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Settled Debit Claims</span>
            <CheckCircle2 className="text-emerald-500" size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {debitNotes.filter((dn) => dn.status === "SETTLED").length} Settled
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Credited to Vendor AP Ledger</div>
        </div>
      </div>

      {/* ─── CONTROLS ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search debit notes by vendor, PO number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── DEBIT NOTES TABLE WITH VENDOR REMINDER & SETTLE CONTROLS ───────── */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3.5">Debit Note #</th>
                <th className="px-4 py-3.5">Supplier Name</th>
                <th className="px-4 py-3.5">PO Reference</th>
                <th className="px-4 py-3.5">Return Reason</th>
                <th className="px-4 py-3.5 text-right">Debit Claim Amount</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredNotes.map((dn) => (
                <tr key={dn.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-purple-600 text-sm">{dn.debitNoteNumber}</td>
                  <td className="px-4 py-3.5 font-bold text-foreground">{dn.supplierName}</td>
                  <td className="px-4 py-3.5 font-mono text-muted-foreground">{dn.purchaseNumber}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{dn.reason}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-black text-rose-500 text-base">
                    {formatCurrency(dn.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {dn.status === "ISSUED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                        Issued / Pending
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        Settled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {dn.status === "ISSUED" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const text = `Hello ${dn.supplierName}, this is a reminder regarding Debit Note #${dn.debitNoteNumber} for ${formatCurrency(dn.amount)} (PO: ${dn.purchaseNumber}). Please confirm vendor credit note settlement. Thank you!`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                            toast.success(`WhatsApp Debit Note Reminder sent to ${dn.supplierName}!`);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>📲 Reminder</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNote(dn);
                            setSettleAmount(dn.amount.toString());
                          }}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <DollarSign size={14} /> Settle Claim
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-500 flex items-center justify-end gap-1">
                        <CheckCircle2 size={14} /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SETTLE DEBIT CLAIM MODAL ────────────────────────────────────────── */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSettleClaim} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="border-b border-border/50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Settle Supplier Debit Claim</h3>
                <p className="text-xs text-purple-600 font-bold">{selectedNote.debitNoteNumber} · {selectedNote.supplierName}</p>
              </div>
              <button type="button" onClick={() => setSelectedNote(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Settlement Amount (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Settlement Credit Type</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none"
                >
                  <option value="CREDITED_TO_ACCOUNT">🏦 Credited to Vendor AP Payables Ledger</option>
                  <option value="REFUNDED_CASH">💵 Vendor Cash / Bank Refund</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button type="button" onClick={() => setSelectedNote(null)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                Confirm Settlement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── CREATE DEBIT NOTE MODAL ────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateDebitNote} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="border-b border-border/50 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Plus size={18} className="text-purple-500" /> Issue Vendor Debit Note
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Supplier / Vendor Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-bold text-foreground focus:outline-none"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Apple India Authorised Logistics"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">PO Reference</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background font-mono focus:outline-none"
                    value={purchaseNumber}
                    onChange={(e) => setPurchaseNumber(e.target.value)}
                    placeholder="e.g. PO-2026-001"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Claim Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono font-bold text-rose-500 focus:outline-none"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Return Reason / Damage Notes</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Damaged screen during transit"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                Issue Debit Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
