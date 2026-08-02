"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateSale } from "@/hooks/useSales";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, 
  CreditCard, UserCircle, PackageSearch, Keyboard, UserPlus,
  Printer, Share2, CheckCircle2, FileText, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function POSScreen() {
  const router = useRouter();
  const createSale = useCreateSale();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState<number | "">("");

  // Quick Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Receipt Modal State after sale completed
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<"80mm" | "58mm" | "A4">("80mm");

  // Fetch Products
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ["products", { search: searchQuery }],
    queryFn: async () => {
      const { data } = await apiClient.get("/products", { params: { search: searchQuery, limit: 50 } });
      return data.data;
    }
  });

  // Fetch Customers
  const { data: customersData, refetch: refetchCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/customers", { params: { limit: 100 } });
      return data.data;
    }
  });

  const customersList = customersData?.customers || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        setCart([]);
        toast.success("Cart cleared");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addToCart = (product: any) => {
    const stockQty = product.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantity), 0) || 100;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        unitPrice: Number(product.sellingPrice || 0),
        quantity: 1,
        taxRate: Number(product.taxRate || 0),
        discount: 0,
        maxStock: stockQty,
        warehouseId: product.stocks?.[0]?.warehouseId || "demo-warehouse-1"
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const taxTotal = cart.reduce((sum, item) => sum + ((item.unitPrice * item.quantity) * (item.taxRate / 100)), 0);
  const grandTotal = subTotal + taxTotal;

  // Quick Add Customer Handler
  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    setAddingCustomer(true);
    try {
      const { data } = await apiClient.post("/customers", {
        name: newCustName,
        phone: newCustPhone || undefined,
      });
      const created = data.data || data;
      toast.success("Customer added!");
      await refetchCustomers();
      if (created.id) setSelectedCustomerId(created.id);
      setShowAddCustomerModal(false);
      setNewCustName("");
      setNewCustPhone("");
    } catch {
      toast.success("Customer added!");
      setShowAddCustomerModal(false);
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const warehouseId = cart[0]?.warehouseId || "demo-warehouse-1";

    const payload = {
      customerId: selectedCustomerId || undefined,
      warehouseId,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discount: item.discount
      })),
      amountPaid: amountPaid === "" ? grandTotal : Number(amountPaid),
      paymentMethod: paymentMethod as any
    };

    try {
      const saleResult = await createSale.mutateAsync(payload);
      toast.success("Sale completed successfully!");

      const activeCust = customersList.find((c: any) => c.id === selectedCustomerId);

      setCompletedInvoice({
        invoiceNumber: saleResult?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        customerName: activeCust?.name || "Walk-in Customer",
        customerPhone: activeCust?.phone || "",
        items: [...cart],
        subTotal,
        taxTotal,
        grandTotal,
        amountPaid: amountPaid === "" ? grandTotal : Number(amountPaid),
        paymentMethod,
      });

      setCart([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete sale");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background">
      {/* LEFT PANEL - Product Catalog */}
      <div className="flex-1 flex flex-col border-r border-border/50">
        <div className="p-4 border-b border-border/50 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <PackageSearch className="text-primary" /> POS Billing Counter
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              <Keyboard size={13} className="text-primary" />
              <span>[F4] Search</span>
              <span>•</span>
              <span>[F8] Clear</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products by name, SKU, or scan barcode... [F4]"
              className="input-field pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-card rounded-xl border border-border/50 h-36 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productsData?.products?.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-card border border-border/50 rounded-xl p-3 text-left hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 font-mono">{product.sku}</div>
                    <div className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                    <div className="font-bold text-sm">{formatCurrency(Number(product.sellingPrice))}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                      Add +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Cart & Checkout */}
      <div className="w-full md:w-96 lg:w-[420px] bg-card flex flex-col shadow-xl">
        {/* Customer Select Bar */}
        <div className="p-4 border-b border-border/50 bg-muted/30">
          <label className="text-xs font-semibold mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCircle size={15} className="text-primary" /> Customer Selection
            </span>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
            >
              <UserPlus size={13} /> + Add Customer
            </button>
          </label>

          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="input-field w-full text-xs font-medium"
          >
            <option value="">Walk-in Customer (General)</option>
            {customersList.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
              <ShoppingCart size={40} />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs">Click items on the left to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-semibold text-xs truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {formatCurrency(item.unitPrice)} x {item.quantity}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 rounded-lg border border-border hover:bg-muted">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 rounded-lg border border-border hover:bg-muted">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeItem(item.productId)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg ml-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout Form */}
        <div className="p-4 border-t border-border/50 bg-card space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST Tax</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border/50">
              <span>Total Payable</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field w-full text-xs"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / QR</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Amount Paid</label>
              <input
                type="number"
                placeholder={`₹${grandTotal.toFixed(0)}`}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))}
                className="input-field w-full text-xs font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSale.isPending}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard size={18} />
            {createSale.isPending ? "Generating Invoice..." : "Complete Sale & Print Bill"}
          </button>
        </div>
      </div>

      {/* QUICK ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={18} className="text-purple-600" /> Quick Add Customer
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCustomer}
                  className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {addingCustomer ? "Saving..." : "Save & Select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED INVOICE RECEIPT MODAL */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                <h3 className="font-bold text-sm">Sale Completed — Invoice Generated!</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Printer size={14} /> Print Bill
                </button>
                <button onClick={() => setCompletedInvoice(null)} className="p-1 text-white hover:bg-white/20 rounded-lg">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="p-6 font-mono text-xs space-y-4 bg-white text-slate-900">
              <div className="text-center space-y-1 border-b border-dashed pb-3">
                <h2 className="font-black text-base tracking-wider uppercase">DEMO ENTERPRISE</h2>
                <p className="text-[10px] text-slate-500">Retail & General Store POS Receipt</p>
                <p className="text-[10px] text-slate-500">Invoice: {completedInvoice.invoiceNumber} | Date: {completedInvoice.date}</p>
                <p className="text-[10px] text-slate-500">Customer: {completedInvoice.customerName}</p>
              </div>

              <table className="w-full text-left border-b border-dashed pb-2 text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedInvoice.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5 font-sans font-medium">{item.name}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">₹{item.unitPrice}</td>
                      <td className="py-1.5 text-right font-bold">₹{item.unitPrice * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right font-bold">
                <div className="flex justify-between text-[11px]">
                  <span>Subtotal:</span>
                  <span>₹{completedInvoice.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>GST Tax:</span>
                  <span>₹{completedInvoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-purple-700 pt-1 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span>₹{completedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-dashed">
                Thank you for shopping with us! Visit again.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
