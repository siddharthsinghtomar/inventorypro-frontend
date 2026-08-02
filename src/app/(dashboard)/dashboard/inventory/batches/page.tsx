"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Clock, AlertTriangle, ShieldCheck, Search, Filter,
  Calendar, Layers, CheckCircle2, RefreshCw, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface BatchItem {
  id: string;
  batchNumber: string;
  productName: string;
  sku: string;
  quantity: number;
  mfdDate: string;
  expiryDate: string;
  warehouseName: string;
  status: "HEALTHY" | "EXPIRING_SOON" | "EXPIRED";
}

const mockBatches: BatchItem[] = [
  { id: "b1", batchNumber: "BAT-2026-CIP01", productName: "Cipla Paracetamol 650mg Strips", sku: "CIP-PCM650-15", quantity: 350, mfdDate: "2026-01-10", expiryDate: "2026-08-20", warehouseName: "Main Distribution Center", status: "EXPIRING_SOON" },
  { id: "b2", batchNumber: "BAT-2026-AML04", productName: "Amul Pasteurised Butter 500g", sku: "AML-BUTTER-500G", quantity: 85, mfdDate: "2026-07-01", expiryDate: "2026-08-15", warehouseName: "Main Distribution Center", status: "EXPIRING_SOON" },
  { id: "b3", batchNumber: "BAT-2026-NST09", productName: "Nestle Maggi Masala Noodles 12P", sku: "NST-MAGGI-12P", quantity: 180, mfdDate: "2026-03-01", expiryDate: "2027-03-01", warehouseName: "Main Distribution Center", status: "HEALTHY" },
  { id: "b4", batchNumber: "BAT-2025-CST02", productName: "Castrol EDGE 5W-40 Synthetic 4L", sku: "CST-EDGE-5W40-4L", quantity: 45, mfdDate: "2025-06-01", expiryDate: "2028-06-01", warehouseName: "Main Distribution Center", status: "HEALTHY" },
];

export default function BatchExpiryPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const { data: movementsData } = useQuery({
    queryKey: ["batch-movements"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/inventory/movements", { params: { limit: 100 } });
        return data.data?.movements || data.movements || [];
      } catch {
        return [];
      }
    },
  });

  const batchList = mockBatches;

  const filteredBatches = useMemo(() => {
    return batchList.filter((b) => {
      const matchSearch =
        !search ||
        b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.productName.toLowerCase().includes(search.toLowerCase()) ||
        b.sku.toLowerCase().includes(search.toLowerCase());

      const matchFilter = filterStatus === "ALL" || b.status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [batchList, search, filterStatus]);

  const expiringSoonCount = batchList.filter((b) => b.status === "EXPIRING_SOON").length;
  const healthyCount = batchList.filter((b) => b.status === "HEALTHY").length;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Clock className="text-purple-600 dark:text-purple-400" size={26} /> Batch Number & Expiry Date Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Monitor batch lot numbers, manufacturing dates, expiry alerts, and FEFO (First-Expired, First-Out) compliance.
          </p>
        </div>
      </div>

      {/* ─── SUMMARY KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Healthy Stock Batches</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{healthyCount} Batches</div>
          <div className="text-[10px] text-emerald-600 font-bold">Valid Expiry Window (&gt;90 Days)</div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Expiring Soon (Under 30 Days)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{expiringSoonCount} Batches</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Prioritize FEFO Clearance Sale</div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Total Active Batches</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{batchList.length} Batches</div>
          <div className="text-[10px] text-muted-foreground font-bold">Across All Warehouses</div>
        </div>
      </div>

      {/* ─── CONTROLS: SEARCH & FILTER ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search by batch lot number, product name, or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl shadow-sm">
          <Filter size={15} className="text-purple-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="ALL">All Expiry Statuses</option>
            <option value="EXPIRING_SOON">⚠️ Expiring Soon (&lt; 30 Days)</option>
            <option value="HEALTHY">✅ Healthy Batches</option>
          </select>
        </div>
      </div>

      {/* ─── BATCH TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3">Batch Lot #</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3 text-center">In-Stock Qty</th>
                <th className="px-4 py-3">Mfg Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">FEFO Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold text-purple-600">{b.batchNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-foreground">{b.productName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{b.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.warehouseName}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{b.quantity} pcs</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{formatDate(b.mfdDate)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-rose-500">{formatDate(b.expiryDate)}</td>
                  <td className="px-4 py-3">
                    {b.status === "EXPIRING_SOON" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                        ⚠️ Expiring Soon
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        ✅ Valid / Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
