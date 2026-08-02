"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  FileText, Search, ShieldCheck, CheckCircle2, Clock, Filter,
  Smartphone, Barcode, Layers, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

interface SerialTrack {
  id: string;
  serialOrImei: string;
  productName: string;
  sku: string;
  purchaseInvoice: string;
  saleInvoice?: string;
  customerName?: string;
  warrantyStatus: "ACTIVE_WARRANTY" | "SOLD" | "IN_STOCK";
}

const mockSerials: SerialTrack[] = [
  { id: "s1", serialOrImei: "IMEI-3589201948201", productName: "Apple iPhone 15 Pro Max (256GB)", sku: "APL-IP15PM-256", purchaseInvoice: "PO-2026-001", saleInvoice: "INV-109283", customerName: "Rajesh Kumar", warrantyStatus: "ACTIVE_WARRANTY" },
  { id: "s2", serialOrImei: "IMEI-3540918274910", productName: "Samsung Galaxy S24 Ultra 5G", sku: "SAM-S24U-512", purchaseInvoice: "PO-2026-002", saleInvoice: "INV-109284", customerName: "Anita Sharma", warrantyStatus: "ACTIVE_WARRANTY" },
  { id: "s3", serialOrImei: "SN-SNY5902183920", productName: "Sony WH-1000XM5 Wireless Headphones", sku: "SNY-WH1000XM5", purchaseInvoice: "PO-2026-001", warrantyStatus: "IN_STOCK" },
  { id: "s4", serialOrImei: "SN-DEL9402194821", productName: "Dell XPS 15 OLED Laptop", sku: "DEL-XPS15-OLED", purchaseInvoice: "PO-2026-003", warrantyStatus: "IN_STOCK" },
];

export default function SerialImeiPage() {
  const [search, setSearch] = useState("");
  const [serials, setSerials] = useState<SerialTrack[]>(mockSerials);

  const filteredSerials = useMemo(() => {
    return serials.filter((s) => {
      return (
        !search ||
        s.serialOrImei.toLowerCase().includes(search.toLowerCase()) ||
        s.productName.toLowerCase().includes(search.toLowerCase()) ||
        s.sku.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [serials, search]);

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Smartphone className="text-purple-600 dark:text-purple-400" size={26} /> High-Value IMEI & Serial Number Tracker
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Track individual unit Serial Numbers and Mobile IMEI codes from vendor PO receipt to customer POS billing for warranty claims.
          </p>
        </div>
      </div>

      {/* ─── SUMMARY KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Warranty Units</span>
            <ShieldCheck className="text-emerald-500" size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {serials.filter((s) => s.warrantyStatus === "ACTIVE_WARRANTY").length} Units
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Sold & Registered Customer Warranty</div>
        </div>

        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">In-Stock Tracked Serials</span>
            <Barcode className="text-purple-500" size={18} />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {serials.filter((s) => s.warrantyStatus === "IN_STOCK").length} Units
          </div>
          <div className="text-[10px] text-purple-600 font-bold">Available in Store Warehouses</div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Total Tracked IMEI / Serials</span>
            <Layers size={18} className="text-muted-foreground" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{serials.length} Total</div>
          <div className="text-[10px] text-muted-foreground font-bold">100% Traceability Audit</div>
        </div>
      </div>

      {/* ─── CONTROLS ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search by IMEI / Serial number or product name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── SERIALS TABLE ────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3">Serial / IMEI Code</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Vendor PO</th>
                <th className="px-4 py-3">Customer Invoice</th>
                <th className="px-4 py-3">Customer Buyer</th>
                <th className="px-4 py-3">Warranty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredSerials.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold text-purple-600">{s.serialOrImei}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{s.productName}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.purchaseInvoice}</td>
                  <td className="px-4 py-3 font-mono text-emerald-600 font-bold">{s.saleInvoice || "N/A"}</td>
                  <td className="px-4 py-3 text-foreground">{s.customerName || "In Warehouse"}</td>
                  <td className="px-4 py-3">
                    {s.warrantyStatus === "ACTIVE_WARRANTY" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        🛡️ Active Warranty
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase tracking-wider">
                        📦 In Stock
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
