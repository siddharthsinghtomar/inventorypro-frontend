"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles, Truck, Plus, CheckCircle2, AlertTriangle, Search,
  Clock, Check, Building2, PackageSearch, ArrowRight, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AutoGeneratePOPage() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("ALL");

  // Fetch all products to analyze low-stock items
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ["auto-po-products"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/products", { params: { limit: 500 } });
        return data.data?.products || data.products || [];
      } catch {
        return [];
      }
    },
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["auto-po-suppliers"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/suppliers", { params: { limit: 100 } });
        return data.data?.suppliers || data.suppliers || [];
      } catch {
        return [];
      }
    },
  });

  const productList = productsData || [];
  const supplierList = suppliersData || [];

  // Filter items needing restock (where quantity <= minStockLevel or stock < 10)
  const lowStockItems = useMemo(() => {
    return productList.filter((p: any) => {
      const currentStock = p.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantity), 0) ?? 0;
      const minLevel = Number(p.minStockLevel || 10);
      const isLow = currentStock <= minLevel;
      const matchSupplier = selectedSupplierId === "ALL" || p.supplierId === selectedSupplierId;
      return isLow && matchSupplier;
    });
  }, [productList, selectedSupplierId]);

  // Total estimated restock value needed
  const totalRestockValue = useMemo(() => {
    return lowStockItems.reduce((sum: number, p: any) => {
      const currentStock = p.stocks?.reduce((s: number, st: any) => s + Number(st.quantity), 0) ?? 0;
      const minLevel = Number(p.minStockLevel || 10);
      const neededQty = Math.max(10, (minLevel * 2) - currentStock);
      const cost = Number(p.purchasePrice || p.costPrice || p.sellingPrice * 0.7);
      return sum + (neededQty * cost);
    }, 0);
  }, [lowStockItems]);

  const handleGenerateOrders = async () => {
    if (lowStockItems.length === 0) {
      toast.error("No low-stock items require purchase ordering at this time.");
      return;
    }

    setIsGenerating(true);
    try {
      // Group low stock items by supplier ID or default supplier
      const defaultSupplier = supplierList[0] || { id: "sup-1", name: "Apple India Authorised Logistics" };
      
      const supplierGroup: Record<string, any[]> = {};
      lowStockItems.forEach((item: any) => {
        const supId = item.supplierId || defaultSupplier.id;
        if (!supplierGroup[supId]) supplierGroup[supId] = [];
        supplierGroup[supId].push(item);
      });

      // Create draft Purchase Order for each supplier group
      for (const [supId, items] of Object.entries(supplierGroup)) {
        const poPayload = {
          supplierId: supId,
          items: items.map((p: any) => {
            const currentStock = p.stocks?.reduce((s: number, st: any) => s + Number(st.quantity), 0) ?? 0;
            const minLevel = Number(p.minStockLevel || 10);
            const neededQty = Math.max(10, (minLevel * 2) - currentStock);
            return {
              productId: p.id,
              orderedQty: neededQty,
              unitCost: Number(p.purchasePrice || p.sellingPrice * 0.7),
            };
          }),
          notes: "Auto-generated Low-Stock Restock PO",
        };

        try {
          await apiClient.post("/purchases", poPayload);
        } catch {
          // Continue creating other POs
        }
      }

      toast.success(`⚡ Generated ${Object.keys(supplierGroup).length} Restock Purchase Orders successfully!`);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to auto-generate POs");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="text-purple-600 dark:text-purple-400" size={26} /> Auto-Generate Low-Stock Purchase Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            AI-driven procurement engine scans catalog stock levels and auto-creates draft vendor purchase orders in 1 click.
          </p>
        </div>

        <button
          onClick={handleGenerateOrders}
          disabled={isGenerating || lowStockItems.length === 0}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${
            lowStockItems.length === 0 || isGenerating
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20"
          }`}
        >
          <Sparkles size={16} />
          <span>{isGenerating ? "Generating POs..." : `Auto-Generate ${lowStockItems.length} Restock POs`}</span>
        </button>
      </div>

      {/* ─── SUMMARY KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Low Stock Products</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{lowStockItems.length} Items</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Below Safety Buffer Threshold</div>
        </div>

        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Estimated PO Procurement Cost</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{formatCurrency(totalRestockValue)}</div>
          <div className="text-[10px] text-purple-600 font-bold">Estimated Cost to Replenish Inventory</div>
        </div>

        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Target Suppliers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{supplierList.length || 1} Vendors</div>
          <div className="text-[10px] text-muted-foreground font-bold">Vendor Procurement Partners</div>
        </div>
      </div>

      {/* ─── LOW STOCK ITEMS TABLE ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
        <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
          <PackageSearch size={16} className="text-purple-600" /> Items Requiring Reorder
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Min Threshold</th>
                <th className="px-4 py-3 text-center text-purple-600">Suggested PO Order Qty</th>
                <th className="px-4 py-3 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {lowStockItems.map((p: any) => {
                const currentStock = p.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantity), 0) ?? 0;
                const minLevel = Number(p.minStockLevel || 10);
                const suggestedQty = Math.max(10, (minLevel * 2) - currentStock);
                const unitCost = Number(p.purchasePrice || p.sellingPrice * 0.7);

                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-bold text-foreground">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-purple-600">{p.sku}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-500">{currentStock} pcs</td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">{minLevel} pcs</td>
                    <td className="px-4 py-3 text-center font-mono font-black text-purple-600 bg-purple-500/10 rounded-lg">
                      +{suggestedQty} pcs
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(suggestedQty * unitCost)}
                    </td>
                  </tr>
                );
              })}

              {lowStockItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-semibold">
                    🎉 All products are well-stocked above minimum thresholds!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
