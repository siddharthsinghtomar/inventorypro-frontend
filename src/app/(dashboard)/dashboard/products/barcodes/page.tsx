"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Printer, Tag, Search, Plus, Minus, Trash2, CheckCircle2,
  Sliders, Grid, Layers, Download, Sparkles, RefreshCw, Barcode as BarcodeIcon
} from "lucide-react";
import { toast } from "sonner";

interface SelectedLabelItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  mrp: number;
  labelCount: number;
}

export default function BarcodeGeneratorPage() {
  const [search, setSearch] = useState("");
  const [labelSize, setLabelSize] = useState<"38x25" | "50x25" | "A4-24">("38x25");
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showMrp, setShowMrp] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  const [selectedItems, setSelectedItems] = useState<SelectedLabelItem[]>([]);

  // Fetch catalog products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["barcode-products", search],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/products", { params: { search, limit: 100 } });
        return data.data?.products || data.products || [];
      } catch {
        return [];
      }
    },
  });

  const productsList = productsData || [];

  const handleAddItemToLabels = (product: any) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, labelCount: i.labelCount + 10 } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode || product.sku,
          sellingPrice: Number(product.sellingPrice || 0),
          mrp: Number(product.mrp || product.sellingPrice || 0),
          labelCount: 10,
        },
      ];
    });
    toast.success(`Added "${product.name}" to label print queue (+10 stickers)`);
  };

  const updateLabelCount = (id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newCnt = Math.max(1, i.labelCount + delta);
          return { ...i, labelCount: newCnt };
        }
        return i;
      })
    );
  };

  const removeLabelItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalStickersToPrint = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.labelCount, 0);
  }, [selectedItems]);

  const handlePrintLabels = () => {
    if (selectedItems.length === 0) {
      toast.error("Please add at least one product to the label print queue.");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Tag className="text-purple-600 dark:text-purple-400" size={26} /> Thermal Barcode & Price Tag Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Generate and print barcode sticker labels for TVS, TSC, Zebra thermal printers or A4 sticker sheets.
          </p>
        </div>

        <button
          onClick={handlePrintLabels}
          disabled={selectedItems.length === 0}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${
            selectedItems.length === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20"
          }`}
        >
          <Printer size={16} /> Print {totalStickersToPrint} Sticker Labels
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT COLUMN: PRODUCT SELECTION & PRINTER SETTINGS ───────────────────── */}
        <div className="space-y-6">
          
          {/* Printer Label Config Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-purple-600" /> Label Layout & Printer Config
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Label Size Format</label>
                <select
                  value={labelSize}
                  onChange={(e: any) => setLabelSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                >
                  <option value="38x25">🏷️ Standard Thermal Roll (38mm x 25mm)</option>
                  <option value="50x25">🏷️ Dual Column Thermal Roll (50mm x 25mm)</option>
                  <option value="A4-24">📄 A4 Sticker Sheet (24 Labels per page)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="font-bold text-foreground">Sticker Content Display</label>
                
                <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showBusinessName}
                    onChange={(e) => setShowBusinessName(e.target.checked)}
                    className="rounded border-border bg-background text-purple-600"
                  />
                  <span>Show Store / Business Name</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded border-border bg-background text-purple-600"
                  />
                  <span>Show Selling Price</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showMrp}
                    onChange={(e) => setShowMrp(e.target.checked)}
                    className="rounded border-border bg-background text-purple-600"
                  />
                  <span>Show MRP Price</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Picker Catalog */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Search size={16} className="text-purple-600" /> Catalog Product Picker
            </h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
              {isLoading ? (
                <div className="text-center py-6 text-muted-foreground">Loading catalog products...</div>
              ) : productsList.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No products found</div>
              ) : (
                productsList.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-muted/20 border border-border/50 p-2.5 rounded-xl flex items-center justify-between hover:border-purple-500/50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-foreground">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.sku} · {formatCurrency(Number(p.sellingPrice))}</div>
                    </div>
                    <button
                      onClick={() => handleAddItemToLabels(p)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] rounded-lg shadow-sm"
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: SELECTED STICKER QUEUE & PREVIEW ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Label Queue Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-purple-600" /> Print Queue ({selectedItems.length} Products · {totalStickersToPrint} Labels)
              </h2>
              {selectedItems.length > 0 && (
                <button onClick={() => setSelectedItems([])} className="text-xs text-rose-500 font-bold hover:underline">
                  Clear Queue
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs font-medium space-y-2">
                <Tag size={36} className="mx-auto text-muted-foreground/40" />
                <div>No products in label queue. Select products from the left catalog picker to build stickers.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="bg-muted/20 border border-border/50 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-foreground text-sm">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        SKU: {item.sku} · Barcode: {item.barcode} · Selling: {formatCurrency(item.sellingPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-background border border-border p-1 rounded-xl">
                        <button onClick={() => updateLabelCount(item.id, -5)} className="px-2 py-0.5 font-bold hover:bg-muted rounded-md text-xs">-5</button>
                        <span className="font-mono font-bold w-12 text-center text-purple-600">{item.labelCount} pcs</span>
                        <button onClick={() => updateLabelCount(item.id, 5)} className="px-2 py-0.5 font-bold hover:bg-muted rounded-md text-xs">+5</button>
                      </div>
                      <button onClick={() => removeLabelItem(item.id)} className="p-1.5 text-muted-foreground hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── LIVE THERMAL STICKER PREVIEW STUDIO ─────────────────────────────── */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" /> Live Thermal Sticker Preview
            </h2>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-4 justify-center overflow-x-auto min-h-[220px] items-center">
              {selectedItems.length === 0 ? (
                <div className="text-slate-500 font-mono text-xs text-center">Add products above to preview thermal stickers.</div>
              ) : (
                selectedItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white text-slate-950 p-3 rounded-lg border border-slate-300 w-[170px] shadow-lg text-center space-y-1 font-mono font-bold select-none text-[11px]"
                  >
                    {showBusinessName && <div className="text-[9px] uppercase tracking-wider text-slate-700 font-extrabold border-b border-slate-300 pb-0.5">STORE POS</div>}
                    <div className="text-[10px] font-black line-clamp-1 leading-tight">{item.name}</div>
                    <div className="text-[9px] text-slate-600">SKU: {item.sku}</div>
                    
                    {/* Mock Barcode Pattern */}
                    <div className="py-1 flex justify-center gap-0.5 h-7 items-center">
                      {[2,1,3,1,2,1,4,1,2,1,3,2,1,2].map((w, idx) => (
                        <div key={idx} className="bg-slate-950 h-full" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>

                    <div className="text-[9px] text-slate-800">{item.barcode}</div>
                    
                    <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-slate-300">
                      {showMrp && <span className="line-through text-slate-500 text-[9px]">MRP: ₹{item.mrp}</span>}
                      {showPrice && <span className="font-extrabold text-slate-950 text-xs">₹{item.sellingPrice}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
