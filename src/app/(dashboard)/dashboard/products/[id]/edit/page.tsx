"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";
import {
  Package, ArrowLeft, Save, Loader2, Plus, X, Upload, Tag, RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Fetch catalog metadata
  const { data: catalogData } = useQuery({
    queryKey: ["catalog-meta"],
    queryFn: async () => {
      const [cats, brands, units] = await Promise.all([
        apiClient.get("/catalog/categories"),
        apiClient.get("/catalog/brands"),
        apiClient.get("/catalog/units"),
      ]);
      return {
        categories: cats.data?.data?.categories || [],
        brands: brands.data?.data?.brands || [],
        units: units.data?.data?.units || [],
      };
    },
    staleTime: 60000,
  });

  // Fetch Product details
  const { data: product, isLoading: isFetchingProduct, isError } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/${productId}`);
      return data.data?.product || data.data;
    },
    enabled: !!productId,
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      barcode: "",
      categoryId: "",
      brandId: "",
      unitId: "",
      purchasePrice: "0",
      sellingPrice: "0",
      mrp: "",
      taxRate: "18",
      hsnCode: "",
      minStockLevel: "0",
      reorderPoint: "0",
      status: "ACTIVE",
    },
  });

  // Reset form when product data arrives
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        unitId: product.unitId || "",
        purchasePrice: (product.purchasePrice ?? 0).toString(),
        sellingPrice: (product.sellingPrice ?? 0).toString(),
        mrp: (product.mrp ?? "").toString(),
        taxRate: (product.taxRate ?? 18).toString(),
        hsnCode: product.hsnCode || "",
        minStockLevel: (product.minStockLevel ?? 0).toString(),
        reorderPoint: (product.reorderPoint ?? 0).toString(),
        status: product.status || "ACTIVE",
      });

      if (Array.isArray(product.tags)) {
        setTags(product.tags);
      } else if (typeof product.tags === "string") {
        try {
          setTags(JSON.parse(product.tags));
        } catch {
          setTags([]);
        }
      }
    }
  }, [product, reset]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (values: Record<string, any>) => {
    setIsLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        sku: values.sku || undefined,
        barcode: values.barcode || undefined,
        categoryId: values.categoryId || undefined,
        brandId: values.brandId || undefined,
        unitId: values.unitId || undefined,
        purchasePrice: Number(values.purchasePrice || 0),
        sellingPrice: Number(values.sellingPrice || 0),
        mrp: values.mrp ? Number(values.mrp) : undefined,
        taxRate: Number(values.taxRate || 0),
        hsnCode: values.hsnCode || undefined,
        minStockLevel: Number(values.minStockLevel || 0),
        reorderPoint: Number(values.reorderPoint || 0),
        status: values.status,
        tags,
      };

      await apiClient.patch(`/products/${productId}`, payload);

      // Invalidate queries so products, POS, and inventory hub update live!
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });

      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update product";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sellingPrice = watch("sellingPrice");
  const purchasePrice = watch("purchasePrice");
  const margin = Number(purchasePrice) > 0
    ? (((Number(sellingPrice) - Number(purchasePrice)) / Number(purchasePrice)) * 100).toFixed(1)
    : "0";

  if (isFetchingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-purple-600" size={32} />
        <p className="text-xs font-semibold text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">!</div>
        <h2 className="text-lg font-bold">Product Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested product could not be loaded.</p>
        <Link href="/dashboard/products" className="btn-secondary text-xs px-4 py-2 mt-2">
          Back to Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in font-sans pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products"
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors border border-border/50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Product — {product.name}</h1>
            <p className="text-xs text-muted-foreground">Update product specifications, prices, category, and stock alert levels</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold flex items-center gap-2 text-sm text-foreground">
                <Package size={17} className="text-purple-600" />
                Basic Specifications
              </h2>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Product Name *</label>
                <input {...register("name", { required: "Name is required" })}
                  placeholder="e.g. Paracetamol 500mg Tablets"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Description</label>
                <textarea {...register("description")}
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">SKU (Stock Keeping Unit)</label>
                  <input {...register("sku")} placeholder="MED-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Barcode / EAN</label>
                  <input {...register("barcode")} placeholder="8901234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
              </div>

              {/* Classification */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Category</label>
                  <select {...register("categoryId")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Select...</option>
                    {catalogData?.categories?.map((c: { id: string; name: string }) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Brand</label>
                  <select {...register("brandId")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Select...</option>
                    {catalogData?.brands?.map((b: { id: string; name: string }) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Unit</label>
                  <select {...register("unitId")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Select...</option>
                    {catalogData?.units?.map((u: { id: string; name: string; abbreviation: string }) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & GST */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-foreground">Pricing & GST Tax Settings</h2>
                {Number(purchasePrice) > 0 && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${Number(margin) >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                    Margin: {margin}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Purchase Cost (₹)</label>
                  <input {...register("purchasePrice")} type="number" step="0.01" placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Selling Price (₹) *</label>
                  <input {...register("sellingPrice", { required: true })} type="number" step="0.01" placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">MRP (Maximum Retail Price)</label>
                  <input {...register("mrp")} type="number" step="0.01" placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">GST Tax Rate (%)</label>
                  <select {...register("taxRate")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% (GST)</option>
                    <option value="12">12% (GST)</option>
                    <option value="18">18% (GST)</option>
                    <option value="28">28% (GST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">HSN / SAC Code</label>
                  <input {...register("hsnCode")} placeholder="e.g. 3004"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            {/* Inventory Controls */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-foreground">Stock Alert & Reorder Thresholds</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Min Stock Alert Level</label>
                  <input {...register("minStockLevel")} type="number" placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-[10px] text-muted-foreground mt-1">Triggers low stock alert dashboard warnings when stock drops to or below this amount.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Reorder Point</label>
                  <input {...register("reorderPoint")} type="number" placeholder="20"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-foreground">Status & Save</h2>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Product Status</label>
                <select {...register("status")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="ACTIVE">Active (Available for POS & Sales)</option>
                  <option value="INACTIVE">Inactive (Hidden from POS)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isLoading ? "Saving Changes..." : "Save Product Changes"}</span>
              </button>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Tag size={16} className="text-purple-600" /> Tags & Keywords
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="button" onClick={addTag} className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold border border-purple-500/20">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-destructive">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
