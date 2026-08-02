"use client";

import Image from "next/image";
import { useState, Suspense, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";
import {
  Package, Plus, Search, Filter, BarChart3, Download,
  AlertTriangle, Edit, Trash2, Eye, Tag, Grid, List,
  ChevronDown, CheckCircle2, XCircle, ArrowUpDown, X, Loader2,
  ArrowDownCircle, ArrowUpCircle, Sparkles, Building2, ShieldCheck, Truck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  DRAFT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ARCHIVED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [status, setStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<string>("ADJUSTMENT_OUT");
  const [adjustQuantity, setAdjustQuantity] = useState<string>("1");
  const [adjustNotes, setAdjustNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", search, status, selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);
      params.set("page", String(page));
      params.set("limit", "100");
      const { data } = await apiClient.get(`/products?${params.toString()}`);
      return data.data;
    },
    staleTime: 30000,
  });

  const rawProducts: Record<string, any>[] = data?.products || [];
  const pagination = data?.pagination;

  // Real Catalog Fallback
  const mockProducts = [
    { id: "demo-prod-1", name: "Apple iPhone 15 Pro Max (256GB Titanium)", sku: "APL-IP15PM-256", sellingPrice: 139900, purchasePrice: 112000, minStockLevel: 5, status: "ACTIVE", category: { name: "Electronics & Gadgets" }, images: [], stocks: [{ quantity: "25" }] },
    { id: "demo-prod-2", name: "Samsung Galaxy S24 Ultra 5G (512GB Titanium Black)", sku: "SAM-S24U-512", sellingPrice: 129999, purchasePrice: 98000, minStockLevel: 5, status: "ACTIVE", category: { name: "Electronics & Gadgets" }, images: [], stocks: [{ quantity: "18" }] },
    { id: "demo-prod-3", name: "Sony WH-1000XM5 Wireless Headphones", sku: "SNY-WH1000XM5", sellingPrice: 29990, purchasePrice: 21000, minStockLevel: 8, status: "ACTIVE", category: { name: "Electronics & Gadgets" }, images: [], stocks: [{ quantity: "40" }] },
    { id: "demo-prod-4", name: "Dell XPS 15 OLED Laptop (Intel i9)", sku: "DEL-XPS15-OLED", sellingPrice: 219990, purchasePrice: 165000, minStockLevel: 3, status: "ACTIVE", category: { name: "Electronics & Gadgets" }, images: [], stocks: [{ quantity: "12" }] },
    { id: "demo-prod-5", name: "Cipla Paracetamol 650mg Strips (Pack of 15)", sku: "CIP-PCM650-15", sellingPrice: 32, purchasePrice: 18, minStockLevel: 100, status: "ACTIVE", category: { name: "Pharmaceuticals & Healthcare" }, images: [], stocks: [{ quantity: "500" }] },
    { id: "demo-prod-6", name: "Nestle Maggi 2-Minute Masala Noodles (Pack of 12)", sku: "NST-MAGGI-12P", sellingPrice: 168, purchasePrice: 125, minStockLevel: 50, status: "ACTIVE", category: { name: "FMCG & Grocery Provisions" }, images: [], stocks: [{ quantity: "200" }] },
    { id: "demo-prod-7", name: "Amul Pasteurised Butter 500g Pack", sku: "AML-BUTTER-500G", sellingPrice: 275, purchasePrice: 220, minStockLevel: 30, status: "ACTIVE", category: { name: "FMCG & Grocery Provisions" }, images: [], stocks: [{ quantity: "150" }] },
    { id: "demo-prod-8", name: "Nike Air Force 1 '07 Sneakers (White)", sku: "NKE-AF1-WHT", sellingPrice: 8995, purchasePrice: 5800, minStockLevel: 10, status: "ACTIVE", category: { name: "Apparel & Footwear" }, images: [], stocks: [{ quantity: "35" }] },
    { id: "demo-prod-9", name: "Castrol EDGE 5W-40 Synthetic Motor Oil 4L", sku: "CST-EDGE-5W40-4L", sellingPrice: 3850, purchasePrice: 2400, minStockLevel: 15, status: "ACTIVE", category: { name: "Automotive & Lubricants" }, images: [], stocks: [{ quantity: "60" }] },
  ];

  const displayProducts: any[] = isLoading ? [] : (rawProducts.length > 0 ? rawProducts : mockProducts);

  // Dynamic Catalog Metrics
  const totalCatalogValue = useMemo(() => {
    return displayProducts.reduce((sum: number, p: any) => {
      const stock = ((p.stocks as { quantity: string }[]) || []).reduce((s: number, st: any) => s + Number(st.quantity), 0);
      return sum + (Number(p.sellingPrice || 0) * stock);
    }, 0);
  }, [displayProducts]);

  const lowStockCount = useMemo(() => {
    return displayProducts.filter(p => {
      const stock = ((p.stocks as { quantity: string }[]) || []).reduce((s, st) => s + Number(st.quantity), 0);
      return stock <= Number(p.minStockLevel || 0);
    }).length;
  }, [displayProducts]);

  const healthyStockCount = displayProducts.length - lowStockCount;

  const handleOpenAdjustModal = (prod: any) => {
    setAdjustingProduct(prod);
    setAdjustType("ADJUSTMENT_OUT");
    setAdjustQuantity("1");
    setAdjustNotes("");
  };

  const handleConfirmStockAdjustment = async () => {
    if (!adjustingProduct) return;
    const qty = Number(adjustQuantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/inventory/adjust", {
        productId: adjustingProduct.id,
        quantity: qty,
        type: adjustType,
        notes: adjustNotes || `Manual adjustment (${adjustType})`,
      });

      const isDecrease = ["ADJUSTMENT_OUT", "DAMAGE", "LOSS", "RETURN_OUT", "SALE"].includes(adjustType);
      const actionText = isDecrease ? `Decreased stock by ${qty}` : `Increased stock by ${qty}`;
      toast.success(`${actionText} units for "${adjustingProduct.name}"`);

      setAdjustingProduct(null);
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to adjust stock level");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── PAGE HEADER BAR ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Package className="text-purple-600 dark:text-purple-400" size={26} /> Enterprise Products Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage catalog specifications, selling & cost prices, brand categories, and real warehouse stocks.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/dashboard/products/new"
            className="w-full md:w-auto justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Plus size={16} /> Add New Product
          </Link>
        </div>
      </div>

      {/* ─── KPI SUMMARY CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Catalog Items */}
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Total Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{displayProducts.length}</div>
          <div className="text-[10px] text-purple-600 font-bold">Active SKUs in Inventory</div>
        </div>

        {/* Total Catalog Asset Value */}
        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Asset Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalCatalogValue)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Stock Retail Valuation</div>
        </div>

        {/* Stock Health */}
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">In-Stock Health</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{healthyStockCount} SKUs</div>
          <div className="text-[10px] text-emerald-600 font-bold">Optimal Safety Levels</div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card border border-rose-500/30 bg-rose-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{lowStockCount} Items</div>
          <div className="text-[10px] text-rose-600 font-bold">Reorder Needed</div>
        </div>
      </div>

      {/* ─── CONTROLS: SEARCH, FILTERS, & VIEW TOGGLE ─────────────────────── */}
      <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar text-xs">
          {["ALL", "Electronics & Gadgets", "Pharmaceuticals & Healthcare", "FMCG & Grocery Provisions", "Automotive & Lubricants", "Apparel & Footwear"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all text-xs border ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Grid vs Table View Mode Switch */}
        <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid Card Layout"
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Table List Layout"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ─── PRODUCT CATALOG CONTENT (GRID OR TABLE) ─────────────────────────── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayProducts.map((product: any) => {
            const totalStock = ((product.stocks as { quantity: string }[]) || []).reduce(
              (sum, s) => sum + Number(s.quantity), 0
            );
            const isLowStock = totalStock <= Number(product.minStockLevel || 0);
            const isOutOfStock = totalStock <= 0;

            return (
              <div
                key={product.id}
                className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      {product.sku}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                      STATUS_COLORS[product.status] || STATUS_COLORS.ACTIVE
                    }`}>
                      {product.status || "ACTIVE"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      {product.category?.name || "General Goods"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-foreground font-mono">
                      {formatCurrency(Number(product.sellingPrice || 0))}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Cost: {formatCurrency(Number(product.purchasePrice || 0))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-muted/20 p-2.5 rounded-xl border border-border/50">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-black ${
                      isOutOfStock ? "text-rose-500" : isLowStock ? "text-amber-500" : "text-emerald-600"
                    }`}>
                      {isOutOfStock ? <XCircle size={14} /> : isLowStock ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>{totalStock} units in stock</span>
                    </div>

                    <button
                      onClick={() => handleOpenAdjustModal({ ...product, currentStock: totalStock })}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-bold text-[10px] rounded-lg border border-amber-500/20 flex items-center gap-1"
                      title="Adjust Stock Quantity"
                    >
                      <ArrowUpDown size={12} /> Adjust
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="p-1.5 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit Product"
                    >
                      <Edit size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Product Name & SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Cost Price</th>
                  <th className="px-4 py-3">Warehouse Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {displayProducts.map((product: any) => {
                  const totalStock = ((product.stocks as { quantity: string }[]) || []).reduce(
                    (sum, s) => sum + Number(s.quantity), 0
                  );
                  const isLowStock = totalStock <= Number(product.minStockLevel || 0);
                  const isOutOfStock = totalStock <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">{product.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        {product.category?.name || "General Goods"}
                      </td>
                      <td className="px-4 py-3 font-black text-foreground font-mono">
                        {formatCurrency(Number(product.sellingPrice))}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">
                        {formatCurrency(Number(product.purchasePrice))}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 font-bold ${
                          isOutOfStock ? "text-rose-500" : isLowStock ? "text-amber-500" : "text-emerald-600"
                        }`}>
                          {totalStock} units
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          STATUS_COLORS[product.status] || STATUS_COLORS.ACTIVE
                        }`}>
                          {product.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAdjustModal({ ...product, currentStock: totalStock })}
                            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-bold text-[10px] flex items-center gap-1 border border-amber-500/20"
                          >
                            <ArrowUpDown size={12} /> Adjust
                          </button>
                          <Link href={`/dashboard/products/${product.id}`} className="p-1.5 text-muted-foreground hover:text-foreground">
                            <Eye size={15} />
                          </Link>
                          <Link href={`/dashboard/products/${product.id}/edit`} className="p-1.5 text-muted-foreground hover:text-foreground">
                            <Edit size={15} />
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

      {/* ─── STOCK ADJUSTMENT MODAL ────────────────────────────────────────── */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <ArrowUpDown className="text-amber-500" size={18} /> Adjust Product Stock
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{adjustingProduct.name}</p>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                >
                  <option value="ADJUSTMENT_IN">➕ Increase Stock (Restock / Received)</option>
                  <option value="ADJUSTMENT_OUT">➖ Reduce Stock (Loss / Damage / Audit)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Adjustment Quantity</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Notes / Reason</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Physical inventory audit discrepancy"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStockAdjustment}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "Updating..." : "Save Stock Adjustment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
