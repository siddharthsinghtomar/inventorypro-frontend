"use client";

import { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowRightLeft, Plus, Search, CheckCircle2, Clock, Truck,
  Warehouse, Send, AlertCircle, X, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

const mockTransfers = [
  {
    id: "TRF-2026-001",
    sourceWarehouse: "Main Distribution Center (WH-MAIN)",
    targetWarehouse: "Branch Store 1 (WH-BRANCH1)",
    status: "IN_TRANSIT",
    items: [
      { name: "Apple iPhone 15 Pro Max (256GB Titanium)", qty: 5, unitCost: 112000 },
      { name: "Sony WH-1000XM5 Headphones", qty: 10, unitCost: 21000 },
    ],
    requestedBy: "Siddharth Singh Tomar",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TRF-2026-002",
    sourceWarehouse: "Main Distribution Center (WH-MAIN)",
    targetWarehouse: "Branch Store 2 (WH-BRANCH2)",
    status: "RECEIVED",
    items: [
      { name: "Amul Pasteurised Butter 500g Pack", qty: 50, unitCost: 220 },
      { name: "Nestle Maggi 2-Min Noodles", qty: 100, unitCost: 125 },
    ],
    requestedBy: "Main Store Manager",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState(mockTransfers);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  // New Transfer Form State
  const [sourceWH, setSourceWH] = useState("Main Distribution Center (WH-MAIN)");
  const [targetWH, setTargetWH] = useState("Branch Store 1 (WH-BRANCH1)");
  const [transferProduct, setTransferProduct] = useState("Samsung Galaxy S24 Ultra 5G");
  const [transferQty, setTransferQty] = useState("4");
  const [transferNotes, setTransferNotes] = useState("");

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const q = search.toLowerCase();
      return (
        !search ||
        t.id.toLowerCase().includes(q) ||
        t.sourceWarehouse.toLowerCase().includes(q) ||
        t.targetWarehouse.toLowerCase().includes(q)
      );
    });
  }, [transfers, search]);

  const handleCreateTransfer = () => {
    if (!transferQty || Number(transferQty) <= 0) {
      toast.error("Please enter a valid transfer quantity");
      return;
    }

    const newTransfer = {
      id: `TRF-2026-00${transfers.length + 1}`,
      sourceWarehouse: sourceWH,
      targetWarehouse: targetWH,
      status: "IN_TRANSIT",
      items: [
        { name: transferProduct, qty: Number(transferQty), unitCost: 98000 }
      ],
      requestedBy: "Siddharth Singh Tomar",
      createdAt: new Date().toISOString(),
    };

    setTransfers([newTransfer, ...transfers]);
    setShowNewModal(false);
    toast.success(`Stock Transfer ${newTransfer.id} dispatched! Items are now IN_TRANSIT.`);
  };

  const handleMarkReceived = (id: string) => {
    setTransfers(
      transfers.map((t) => (t.id === id ? { ...t, status: "RECEIVED" } : t))
    );
    toast.success(`Stock Transfer ${id} marked as RECEIVED and inventory added to target warehouse!`);
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      {/* ─── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ArrowRightLeft className="text-purple-600 dark:text-purple-400" size={26} /> Multi-Warehouse Stock Transfers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Requisition, dispatch, and track inventory movements between Main Distribution Warehouse and Branch Stores.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Plus size={16} /> New Stock Transfer Requisition
        </button>
      </div>

      {/* ─── KPI SUMMARY CARDS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-muted-foreground uppercase">
            <span>Active In-Transit Transfers</span>
            <Truck className="text-purple-600" size={18} />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {transfers.filter((t) => t.status === "IN_TRANSIT").length} Shipments
          </div>
          <div className="text-[10px] text-muted-foreground font-bold">Items Currently En Route</div>
        </div>

        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-emerald-600 uppercase">
            <span>Completed Transfers</span>
            <CheckCircle2 className="text-emerald-600" size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {transfers.filter((t) => t.status === "RECEIVED").length} Received
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Target Stock Updated</div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-muted-foreground uppercase">
            <span>Active Warehouses</span>
            <Warehouse className="text-blue-600" size={18} />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">3 Locations</div>
          <div className="text-[10px] text-muted-foreground font-bold">WH-MAIN, BRANCH1, BRANCH2</div>
        </div>
      </div>

      {/* ─── SEARCH CONTROLS ─────────────────────────────────────────────────── */}
      <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search transfers by ID, source, or target warehouse..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── TRANSFERS LIST TABLE ───────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Transfer ID</th>
                <th className="px-4 py-3">Source Warehouse</th>
                <th className="px-4 py-3">Target Warehouse</th>
                <th className="px-4 py-3">Manifest Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredTransfers.map((t) => {
                const totalValue = t.items.reduce((sum, i) => sum + i.unitCost * i.qty, 0);
                const isInTransit = t.status === "IN_TRANSIT";

                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">{t.id}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{formatDate(t.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{t.sourceWarehouse}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{t.targetWarehouse}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">
                        {t.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">Transfer Value: {formatCurrency(totalValue)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        isInTransit
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isInTransit ? (
                        <button
                          onClick={() => handleMarkReceived(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl inline-flex items-center gap-1 shadow-sm transition-all active:scale-95"
                        >
                          <CheckCircle2 size={13} /> Confirm Stock Arrival
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          Stock Updated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── NEW TRANSFER REQUISITION MODAL ───────────────────────────────────── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <ArrowRightLeft className="text-purple-600" size={20} /> Requisition Stock Transfer
                </h3>
                <p className="text-xs text-muted-foreground">Move inventory between store branches</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Source Warehouse (Dispatch From)</label>
                <select
                  value={sourceWH}
                  onChange={(e) => setSourceWH(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                >
                  <option value="Main Distribution Center (WH-MAIN)">Main Distribution Center (WH-MAIN)</option>
                  <option value="Branch Store 1 (WH-BRANCH1)">Branch Store 1 (WH-BRANCH1)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Target Warehouse (Receive At)</label>
                <select
                  value={targetWH}
                  onChange={(e) => setTargetWH(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                >
                  <option value="Branch Store 1 (WH-BRANCH1)">Branch Store 1 (WH-BRANCH1)</option>
                  <option value="Branch Store 2 (WH-BRANCH2)">Branch Store 2 (WH-BRANCH2)</option>
                  <option value="Main Distribution Center (WH-MAIN)">Main Distribution Center (WH-MAIN)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Select Product to Transfer</label>
                <select
                  value={transferProduct}
                  onChange={(e) => setTransferProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                >
                  <option value="Samsung Galaxy S24 Ultra 5G">Samsung Galaxy S24 Ultra 5G (512GB)</option>
                  <option value="Apple iPhone 15 Pro Max">Apple iPhone 15 Pro Max (256GB)</option>
                  <option value="Sony WH-1000XM5 Headphones">Sony WH-1000XM5 Headphones</option>
                  <option value="Cipla Paracetamol 650mg">Cipla Paracetamol 650mg Strips</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Transfer Quantity</label>
                <input
                  type="number"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none"
                  placeholder="Enter quantity..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTransfer}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Dispatch Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
