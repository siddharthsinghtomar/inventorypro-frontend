"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Search, Plus, Minus, Trash2, Truck, 
  CreditCard, UserCircle, PackageSearch, ArrowLeft,
  Building2, Warehouse, FileText, CheckCircle2, ShoppingCart, DollarSign
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewPurchaseOrder() {
  const router = useRouter();
  const createPurchase = useCreatePurchase();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [amountPaid, setAmountPaid] = useState<number | "">("");

  // Fetch Products
  const { data: productsData } = useQuery({
    queryKey: ["products", { search: searchQuery }],
    queryFn: async () => {
      const { data } = await apiClient.get("/products", { params: { search: searchQuery, limit: 15 } });
      return data.data;
    }
  });

  // Fetch Suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/suppliers", { params: { limit: 100 } });
      return data.data;
    }
  });

  // Fetch Warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/catalog/warehouses");
        return data.data?.warehouses || data.warehouses || data.data || [];
      } catch { return []; }
    }
  });

  const mockWarehouses = [
    { id: "demo-warehouse-1", name: "Main Distribution Center (WH-MAIN)" },
    { id: "w2", name: "Branch 1 Retail Store" },
  ];

  const warehouseList = (Array.isArray(warehousesData) && warehousesData.length > 0)
    ? warehousesData
    : (warehousesData?.warehouses?.length > 0 ? warehousesData.warehouses : mockWarehouses);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, orderedQty: item.orderedQty + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        sku: product.sku || "SKU-000",
        unitCost: Number(product.purchasePrice || product.costPrice || 0),
        orderedQty: 1,
        taxRate: Number(product.taxRate || 0),
        discount: 0,
      }];
    });
  };

  const updateCartItem = (productId: string, field: string, value: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + (item.unitCost * item.orderedQty), 0);
  const taxTotal = cart.reduce((sum, item) => sum + ((item.unitCost * item.orderedQty) * (item.taxRate / 100)), 0);
  const grandTotal = subTotal + taxTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Please add at least one product to the purchase order.");
      return;
    }

    if (!selectedSupplierId) {
      toast.error("Please select a vendor supplier.");
      return;
    }

    const warehouseIdToUse = selectedWarehouseId || warehouseList[0]?.id || "demo-warehouse-1";

    const payload = {
      supplierId: selectedSupplierId,
      warehouseId: warehouseIdToUse,
      items: cart.map(item => ({
        productId: item.productId,
        orderedQty: item.orderedQty,
        unitCost: item.unitCost,
        taxRate: item.taxRate,
        discount: item.discount
      })),
      amountPaid: amountPaid === "" ? 0 : Number(amountPaid),
      paymentMethod
    };

    try {
      await createPurchase.mutateAsync(payload as any);
      toast.success("Purchase Order created & inventory received successfully!");
      router.push("/dashboard/purchases");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create Purchase Order.");
    }
  };

  return (
    <div className="space-y-6 animate-in font-sans p-6 max-w-[1600px] mx-auto">
      {/* ─── HEADER BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases" className="p-2.5 rounded-xl border border-border/50 hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Truck className="text-purple-600 dark:text-purple-400" size={26} /> Create Purchase Order (PO)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Order stock from suppliers, set receiving warehouse, and update vendor accounts payable.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT COLUMN: FORM & PRODUCTS SELECTION ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Details Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 size={15} className="text-purple-600" /> Supplier & Receiving Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block">
                  Supplier / Vendor <span className="text-rose-500">*</span>
                </label>
                <select 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">-- Select a Supplier --</option>
                  {suppliersData?.suppliers?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.company ? `(${s.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block">
                  Receiving Warehouse <span className="text-rose-500">*</span>
                </label>
                <select 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                >
                  <option value="">-- Select Receiving Warehouse --</option>
                  {warehouseList.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add Products & Order Line Items Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShoppingCart size={15} className="text-purple-600" /> Add Order Items & Quantities
            </h2>

            {/* Product Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search products by name or SKU to add to order..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Search Dropdown Results */}
            {searchQuery && (
              <div className="bg-card border border-border rounded-xl p-2 max-h-60 overflow-y-auto space-y-1 shadow-lg">
                {productsData?.products?.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-2.5 hover:bg-muted/40 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{product.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">SKU: {product.sku || 'N/A'} · Cost: {formatCurrency(Number(product.purchasePrice || 0))}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        addToCart(product);
                        setSearchQuery("");
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      + Add Item
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Added Items Data Table */}
            <div className="overflow-x-auto border border-border/50 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Unit Cost (₹)</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {cart.map(item => (
                    <tr key={item.productId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1.5 rounded-lg border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={item.unitCost}
                          onChange={(e) => updateCartItem(item.productId, "unitCost", Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateCartItem(item.productId, "orderedQty", Math.max(1, item.orderedQty - 1))}
                            className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                          >
                            <Minus size={12} />
                          </button>
                          <input 
                            type="number"
                            min="1"
                            className="w-16 text-center px-2 py-1.5 rounded-lg border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={item.orderedQty}
                            onChange={(e) => updateCartItem(item.productId, "orderedQty", Math.max(1, Number(e.target.value)))}
                          />
                          <button
                            onClick={() => updateCartItem(item.productId, "orderedQty", item.orderedQty + 1)}
                            className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-foreground text-sm font-mono">
                        {formatCurrency(item.unitCost * item.orderedQty)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.productId)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs font-semibold">
                        No items added to the purchase order yet. Search products above to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: SUMMARY & PAYMENT ───────────────────────── */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm h-fit space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText size={15} className="text-purple-600" /> Order Financial Summary
          </h2>
          
          <div className="space-y-2 text-xs border-b border-border/50 pb-3">
            <div className="flex justify-between items-center text-muted-foreground font-semibold">
              <span>Subtotal</span>
              <span className="font-bold text-foreground font-mono">{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground font-semibold">
              <span>GST Tax</span>
              <span className="font-bold text-foreground font-mono">{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-foreground pt-2 border-t border-border/50">
              <span>Grand Total</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Advance Payment Amount (₹)</label>
              <input 
                type="number"
                min="0"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Payment Method</label>
              <select 
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                <option value="CASH">Cash Payment</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDIT">Vendor Accounts Payable (Pay Later)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={createPurchase.isPending || cart.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            <Truck size={16} />
            <span>{createPurchase.isPending ? "Creating Purchase Order..." : "Confirm & Create PO"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
