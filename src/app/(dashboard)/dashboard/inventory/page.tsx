"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";
import {
  Package, Tags, Warehouse, RefreshCw, AlertTriangle, XCircle, CheckCircle2,
  TrendingUp, TrendingDown, Plus, Download, Upload, Barcode, ArrowLeftRight,
  ArrowUpDown, Search, Filter, Layers, Eye, Edit, Trash2, ShieldCheck, Printer,
  FileSpreadsheet, Sparkles, X, ChevronRight, DollarSign, Clock, Truck, ChevronDown, Check, Building2, ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CommercialInventoryHub() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "stock" | "movements" | "low_stock" | "out_of_stock" | "warehouses" | "barcodes"
  >("products");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Side Drawer

  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustNewQty, setAdjustNewQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("MANUAL_CORRECTION");

  // Fetch Products & Inventory Context
  const { data: productsData, isLoading: loadingProducts, refetch } = useQuery({
    queryKey: ["inventory-hub-products", search, categoryFilter],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/products");
        return data.data?.products || data.products || [];
      } catch { return []; }
    }
  });

  const { data: stocksData } = useQuery({
    queryKey: ["inventory-hub-stocks"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/inventory/stocks");
        return data.data?.stocks || data.stocks || [];
      } catch { return []; }
    }
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["inventory-hub-categories"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/catalog/categories");
        return data.data?.categories || data.categories || [];
      } catch { return []; }
    }
  });

  const mockProducts = [
    { id: "demo-prod-1", name: "Wireless Headphones", sku: "WH-100", barcode: "8901234567890", category: { name: "Electronics" }, brand: "Sony", unit: "pcs", purchasePrice: 1800, sellingPrice: 2499, mrp: 2999, minStockLevel: 10, reorderPoint: 20, status: "ACTIVE", stocks: [{ quantity: 153, reservedQty: 5 }] },
    { id: "demo-prod-2", name: "Paracetamol 500mg (Pack)", sku: "MED-001", barcode: "8901111222333", category: { name: "Medicines" }, brand: "Cipla", unit: "strip", purchasePrice: 140, sellingPrice: 200, mrp: 220, minStockLevel: 50, reorderPoint: 100, status: "ACTIVE", stocks: [{ quantity: 8, reservedQty: 0 }] },
    { id: "demo-prod-3", name: "Basmati Rice 5kg Premium", sku: "GRC-101", barcode: "8904444555666", category: { name: "Grocery" }, brand: "India Gate", unit: "bag", purchasePrice: 950, sellingPrice: 1200, mrp: 1350, minStockLevel: 20, reorderPoint: 40, status: "ACTIVE", stocks: [{ quantity: 189, reservedQty: 10 }] },
    { id: "demo-prod-4", name: "Motor Oil 5L Synthetic", sku: "AUTO-032", barcode: "8907777888999", category: { name: "Auto" }, brand: "Castrol", unit: "can", purchasePrice: 1800, sellingPrice: 2225, mrp: 2500, minStockLevel: 10, reorderPoint: 20, status: "ACTIVE", stocks: [{ quantity: 0, reservedQty: 0 }] },
  ];

  const productList = productsData && productsData.length > 0 ? productsData : mockProducts;
  const categoryList = categoriesData && categoriesData.length > 0 ? categoriesData : [{ id: "1", name: "Electronics" }, { id: "2", name: "Medicines" }, { id: "3", name: "Grocery" }, { id: "4", name: "Auto" }];

  // Calculations
  const filteredProducts = useMemo(() => {
    return productList.filter((p: any) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || p.category?.name === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [productList, search, categoryFilter]);

  const totalProducts = productList.length;
  const activeProducts = productList.filter((p: any) => p.status === "ACTIVE").length;
  
  const totalStockValue = productList.reduce((sum: number, p: any) => {
    const qty = ((p.stocks as any[]) || []).reduce((s, st) => s + Number(st.quantity), 0);
    return sum + (qty * Number(p.sellingPrice || 0));
  }, 0);

  const purchaseValue = productList.reduce((sum: number, p: any) => {
    const qty = ((p.stocks as any[]) || []).reduce((s, st) => s + Number(st.quantity), 0);
    return sum + (qty * Number(p.purchasePrice || 0));
  }, 0);

  const expectedProfit = Math.max(0, totalStockValue - purchaseValue);

  const lowStockItems = productList.filter((p: any) => {
    const qty = ((p.stocks as any[]) || []).reduce((s, st) => s + Number(st.quantity), 0);
    return qty > 0 && qty <= Number(p.minStockLevel || 10);
  });

  const outOfStockItems = productList.filter((p: any) => {
    const qty = ((p.stocks as any[]) || []).reduce((s, st) => s + Number(st.quantity), 0);
    return qty <= 0;
  });

  // Stock Adjustment Submit
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(adjustNewQty);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await apiClient.post("/inventory/adjust", {
        productId: adjustProductId || productList[0]?.id,
        quantity: qty,
        type: adjustReason,
      });

      const isDecrease = ["ADJUSTMENT_OUT", "DAMAGE", "LOSS", "RETURN_OUT", "SALE"].includes(adjustReason);
      const actionText = isDecrease ? `Decreased stock by ${qty}` : `Increased stock by ${qty}`;
      toast.success(`${actionText} units!`);

      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      refetch();
      setShowAdjustModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to adjust stock quantity");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── TOP GLOBAL ACTION BAR & HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-purple-600 dark:text-purple-400" /> Commercial Inventory Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized inventory control, real-time stock valuation, multi-warehouse transfers, and PO reorders.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <Link
            href="/dashboard/purchases/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all font-bold"
          >
            <ShoppingCart size={15} /> Reorder Stock / Create PO
          </Link>

          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all"
          >
            <Plus size={15} /> New Product
          </Link>

          <Link
            href="/dashboard/inventory/adjust"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
          >
            <ArrowUpDown size={14} /> Adjust Stock
          </Link>

          <Link
            href="/dashboard/inventory/transfer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeftRight size={14} /> Transfer Stock
          </Link>

          <Link
            href="/dashboard/products/barcodes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
          >
            <Barcode size={14} /> Barcode Stickers
          </Link>

          <button
            onClick={() => window.print()}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl"
            title="Export & Print"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* ─── TOP KPI STAT CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Products</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{totalProducts}</div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <CheckCircle2 size={10} /> {activeProducts} Active
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Selling Stock Value</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(totalStockValue)}</div>
          <div className="text-[10px] text-slate-400">At Retail Price</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Purchase Value</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(purchaseValue)}</div>
          <div className="text-[10px] text-slate-400">At Wholesale Cost</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Expected Profit</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(expectedProfit)}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Gross Profit Margin</div>
        </div>

        <div
          onClick={() => setActiveTab("low_stock")}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-orange-200 dark:border-orange-950 shadow-sm space-y-1 cursor-pointer hover:border-orange-400 transition-all"
        >
          <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase flex items-center justify-between">
            <span>Low Stock</span> <AlertTriangle size={13} />
          </div>
          <div className="text-xl font-black text-orange-600 dark:text-orange-400">{lowStockItems.length}</div>
          <div className="text-[10px] text-orange-500 font-semibold">Requires Restock</div>
        </div>

        <div
          onClick={() => setActiveTab("out_of_stock")}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-red-200 dark:border-red-950 shadow-sm space-y-1 cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase flex items-center justify-between">
            <span>Out of Stock</span> <XCircle size={13} />
          </div>
          <div className="text-xl font-black text-red-600 dark:text-red-400">{outOfStockItems.length}</div>
          <div className="text-[10px] text-red-500 font-semibold">Critical Refill</div>
        </div>
      </div>

      {/* ─── CENTRAL TABS NAVIGATION ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: "products", label: "Products Catalog", icon: Package },
          { id: "categories", label: "Categories & Brands", icon: Tags },
          { id: "stock", label: "Stock Balances", icon: Warehouse },
          { id: "low_stock", label: `Low Stock (${lowStockItems.length})`, icon: AlertTriangle },
          { id: "out_of_stock", label: `Out of Stock (${outOfStockItems.length})`, icon: XCircle },
          { id: "movements", label: "Stock Movements Log", icon: ArrowUpDown },
          { id: "warehouses", label: "Warehouses", icon: Building2 },
          { id: "barcodes", label: "Barcode Generator", icon: Barcode },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: PRODUCTS CATALOG DATA GRID ───────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none dark:text-white"
              >
                <option value="ALL">All Categories</option>
                {categoryList.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Product Info</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Cost Price</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">MRP</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredProducts.map((p: any) => {
                  const totalStock = ((p.stocks as any[]) || []).reduce((s, st) => s + Number(st.quantity), 0);
                  const isLow = totalStock > 0 && totalStock <= Number(p.minStockLevel || 10);
                  const isOut = totalStock <= 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="hover:bg-purple-500/5 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-purple-600">
                            <Package size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">SKU: {p.sku} | Barcode: {p.barcode || "N/A"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {p.category?.name || "General"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-slate-500 font-semibold">₹{p.purchasePrice}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{p.sellingPrice}</td>
                      <td className="px-4 py-3 text-right text-slate-400 line-through">₹{p.mrp || p.sellingPrice}</td>

                      <td className="px-4 py-3 text-center">
                        <div className={`inline-flex items-center gap-1.5 font-bold ${
                          isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-emerald-600"
                        }`}>
                          {isOut && <XCircle size={13} />}
                          {!isOut && isLow && <AlertTriangle size={13} />}
                          {!isOut && !isLow && <CheckCircle2 size={13} />}
                          {totalStock} {p.unit || "pcs"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold uppercase">
                          {p.status || "ACTIVE"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            href={`/dashboard/products/${p.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Product"
                          >
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

      {/* ─── TAB 2: CATEGORIES & BRANDS HUB ────────────────────────────────────── */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Tags className="text-purple-600" /> Item Categories
            </h3>
            <div className="space-y-2">
              {categoryList.map((c: any) => (
                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <span>{c.name}</span>
                  <span className="text-slate-400">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="text-emerald-600" /> Product Brands
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              {["Sony", "Cipla", "India Gate", "Castrol", "Nestle", "Samsung"].map((b) => (
                <div key={b} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                  <span>{b}</span>
                  <span className="text-purple-600">Verified Brand</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: LOW STOCK CARDS ────────────────────────────────────────────── */}
      {activeTab === "low_stock" && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Low Stock Warnings ({lowStockItems.length} items requiring restock)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {lowStockItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-bold">All stock levels are healthy!</p>
              </div>
            ) : (
              lowStockItems.map((item: any) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-orange-200 dark:border-orange-950 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-extrabold flex items-center gap-1">
                      <AlertTriangle size={11} /> Low Stock
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-slate-400">Current Qty</div>
                      <div className="text-lg font-black text-orange-600">{item.stocks?.[0]?.quantity || 8}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Min Threshold</div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.minStockLevel || 10}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link
                      href="/dashboard/purchases/new"
                      className="flex-1 text-center py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md"
                    >
                      Restock via PO
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: OUT OF STOCK CARDS ──────────────────────────────────────────── */}
      {activeTab === "out_of_stock" && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Out of Stock Critical Alerts ({outOfStockItems.length} items out of stock)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {outOfStockItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-bold">No out of stock items!</p>
              </div>
            ) : (
              outOfStockItems.map((item: any) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-950 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-extrabold flex items-center gap-1">
                      <XCircle size={11} /> Out of Stock
                    </span>
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Supplier:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Global Tech Supplies</span>
                  </div>

                  <Link
                    href="/dashboard/purchases/new"
                    className="block text-center py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Generate Emergency PO
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: WAREHOUSES DIRECTORY ────────────────────────────────────────── */}
      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="text-purple-600" /> Main Distribution Center
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold">PRIMARY</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p>Code: <strong className="text-slate-900 dark:text-white">WH-MAIN</strong></p>
              <p>Location: Industrial Area Phase 1, Mumbai</p>
              <p>Capacity: 10,000 Units</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="text-blue-600" /> Branch 1 Retail Counter
              </h3>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-bold">BRANCH</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p>Code: <strong className="text-slate-900 dark:text-white">STORE-DEL</strong></p>
              <p>Location: Main Market Road, Delhi</p>
              <p>Capacity: 2,500 Units</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRODUCT DETAILS SIDE DRAWER ────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto space-y-6 border-l border-slate-200 dark:border-slate-800 animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">{selectedProduct.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">SKU: {selectedProduct.sku}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">Selling Price</span>
                  <span className="text-lg font-black text-emerald-600">₹{selectedProduct.sellingPrice}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Cost Price</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300">₹{selectedProduct.purchasePrice}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Product Metadata</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
                  <div className="flex justify-between"><span className="text-slate-400">Barcode:</span><span className="font-mono font-bold">{selectedProduct.barcode || "8901234567890"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Category:</span><span className="font-bold">{selectedProduct.category?.name || "General"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">GST Tax Rate:</span><span className="font-bold">{selectedProduct.taxRate || 18}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Min Stock Threshold:</span><span className="font-bold">{selectedProduct.minStockLevel || 10}</span></div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link
                  href={`/dashboard/products/${selectedProduct.id}/edit`}
                  className="flex-1 py-3 text-center bg-purple-600 text-white rounded-xl font-bold shadow-md"
                >
                  Edit Product Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
