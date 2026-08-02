"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  Package, ArrowLeft, Save, Loader2, Plus, X, Upload, Tag,
} from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { data: catalogData } = useQuery({
    queryKey: ["catalog-meta"],
    queryFn: async () => {
      const [cats, brands, units] = await Promise.all([
        apiClient.get("/catalog/categories"),
        apiClient.get("/catalog/brands"),
        apiClient.get("/catalog/units"),
      ]);
      return { categories: cats.data.data.categories, brands: brands.data.data.brands, units: units.data.data.units };
    },
    staleTime: 60000,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
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
      trackExpiry: false,
      trackBatch: false,
      status: "ACTIVE",
    },
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const onSubmit = async (values: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      await apiClient.post("/products", { ...values, tags });
      toast.success("Product created successfully!");
      router.push("/dashboard/products");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create product";
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

  return (
    <div className="max-w-4xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/products"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Fill in the details to add a product to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Package size={17} className="text-primary" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                  <input {...register("name", { required: "Name is required" })}
                    placeholder="e.g. Paracetamol 500mg Tablets"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea {...register("description")}
                    rows={3}
                    placeholder="Product description..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">SKU <span className="text-muted-foreground font-normal">(auto if blank)</span></label>
                    <input {...register("sku")} placeholder="MED-001"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Barcode / EAN</label>
                    <input {...register("barcode")} placeholder="8901234567890"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                  </div>
                </div>

                {/* Classification */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Category</label>
                    <select {...register("categoryId")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select...</option>
                      {catalogData?.categories?.map((c: { id: string; name: string }) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Brand</label>
                    <select {...register("brandId")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select...</option>
                      {catalogData?.brands?.map((b: { id: string; name: string }) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Unit</label>
                    <select {...register("unitId")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select...</option>
                      {catalogData?.units?.map((u: { id: string; name: string; abbreviation: string }) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-4">Pricing & Tax</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Purchase Price (₹) *</label>
                  <input type="number" step="0.01" {...register("purchasePrice", { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Selling Price (₹) *</label>
                  <input type="number" step="0.01" {...register("sellingPrice", { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">MRP (₹)</label>
                  <input type="number" step="0.01" {...register("mrp")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              {/* Margin indicator */}
              <div className={`p-3 rounded-lg text-sm font-medium mb-4 ${
                Number(margin) >= 20 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : Number(margin) >= 5 ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}>
                Profit Margin: <strong>{margin}%</strong>
                {Number(margin) < 5 && " — Very low margin, consider pricing adjustment"}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tax Rate (GST %)</label>
                  <select {...register("taxRate")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {["0", "5", "12", "18", "28"].map(r => (
                      <option key={r} value={r}>{r}%</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">HSN Code</label>
                  <input {...register("hsnCode")} placeholder="3003"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-4">Stock Settings</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Min Stock Level</label>
                  <input type="number" {...register("minStockLevel")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below this</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Reorder Point</label>
                  <input type="number" {...register("reorderPoint")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <p className="text-xs text-muted-foreground mt-1">Suggested reorder quantity</p>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register("trackExpiry")}
                    className="w-4 h-4 accent-brand-500 rounded" />
                  Track Expiry Dates
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register("trackBatch")}
                    className="w-4 h-4 accent-brand-500 rounded" />
                  Track Batch Numbers
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-4">Status & Visibility</h2>
              <select {...register("status")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Tag size={15} />
                Tags
              </h2>
              <div className="flex gap-2 mb-3">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Type and press Enter"
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={addTag}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} type="button">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Image Upload placeholder */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <Upload size={15} />
                Product Images
              </h2>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload size={20} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link href="/dashboard/products"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm
                       bg-gradient-to-r from-brand-500 to-purple-600 text-white
                       hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-brand-500/20">
            {isLoading ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
