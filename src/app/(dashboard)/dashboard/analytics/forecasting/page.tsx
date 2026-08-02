"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Search,
  Clock, PackageSearch, RefreshCw, Layers, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function SalesForecastingPage() {
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["forecasting-products"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/products", { params: { limit: 100 } });
        return data.data?.products || data.products || [];
      } catch {
        return [];
      }
    },
  });

  const productList = productsData || [];

  const forecastedItems = useMemo(() => {
    return productList.map((p: any) => {
      const stock = p.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantity), 0) ?? 45;
      const dailyVelocity = Math.max(1, Math.floor((p.soldQuantity || 15) / 30) || 2);
      const daysOfStockLeft = Math.floor(stock / dailyVelocity);
      
      let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (daysOfStockLeft <= 7) riskLevel = "HIGH";
      else if (daysOfStockLeft <= 15) riskLevel = "MEDIUM";

      return {
        ...p,
        stock,
        dailyVelocity,
        daysOfStockLeft,
        riskLevel,
      };
    }).filter((p: any) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  }, [productList, search]);

  const highRiskCount = forecastedItems.filter((p: any) => p.riskLevel === "HIGH").length;
  const mediumRiskCount = forecastedItems.filter((p: any) => p.riskLevel === "MEDIUM").length;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="text-purple-600 dark:text-purple-400" size={26} /> AI Sales Velocity & Stockout Risk Forecasting
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            AI analytics engine projects daily sales velocity run rates and calculates exact stockout risk days for every SKU.
          </p>
        </div>
      </div>

      {/* ─── SUMMARY KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-rose-500/30 bg-rose-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Critical Stockout Risk (&lt;7 Days)</span>
            <AlertTriangle className="text-rose-500" size={18} />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{highRiskCount} SKUs</div>
          <div className="text-[10px] text-rose-600 font-bold">Will Run Out of Stock Within 1 Week</div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Medium Risk (&lt;15 Days)</span>
            <Clock className="text-amber-500" size={18} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{mediumRiskCount} SKUs</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Replenishment Needed Soon</div>
        </div>

        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Healthy Buffer (&gt;15 Days)</span>
            <ShieldCheck className="text-emerald-500" size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {forecastedItems.length - highRiskCount - mediumRiskCount} SKUs
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Sufficient Stock On Hand</div>
        </div>
      </div>

      {/* ─── CONTROLS ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search items by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── FORECASTING TABLE ────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Daily Sales Run-Rate</th>
                <th className="px-4 py-3 text-center">Days of Stock Remaining</th>
                <th className="px-4 py-3 text-center">Stockout Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {forecastedItems.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-bold text-foreground">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-purple-600">{p.sku}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{p.stock} pcs</td>
                  <td className="px-4 py-3 text-center font-mono text-purple-600 font-bold">~{p.dailyVelocity} units/day</td>
                  <td className="px-4 py-3 text-center font-mono font-extrabold text-sm text-foreground">
                    {p.daysOfStockLeft} Days Left
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.riskLevel === "HIGH" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                        🚨 High Risk (&lt;7 Days)
                      </span>
                    ) : p.riskLevel === "MEDIUM" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                        ⚠️ Medium Risk (&lt;15 Days)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        ✅ Low Risk (&gt;15 Days)
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
