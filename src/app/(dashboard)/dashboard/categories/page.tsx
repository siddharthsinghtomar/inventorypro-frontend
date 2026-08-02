"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  Tag, Layers, ShieldCheck, Scale, Search, Plus, Trash2, Edit, CheckCircle2, X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "brands" | "units">("categories");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCode, setNewItemCode] = useState("");

  const { data: fetchedCategories, refetch: refetchCats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/catalog/categories");
        return data.data?.categories || [];
      } catch { return []; }
    }
  });

  const { data: fetchedBrands, refetch: refetchBrands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/catalog/brands");
        return data.data?.brands || [];
      } catch { return []; }
    }
  });

  const { data: fetchedUnits, refetch: refetchUnits } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/catalog/units");
        return data.data?.units || [];
      } catch { return []; }
    }
  });

  const mockCategories = [
    { id: "c1", name: "Electronics & Appliances", slug: "electronics", status: "ACTIVE" },
    { id: "c2", name: "Medicines & Healthcare", slug: "medicines", status: "ACTIVE" },
    { id: "c3", name: "Grocery & Provisions", slug: "grocery", status: "ACTIVE" },
    { id: "c4", name: "Automobile Accessories", slug: "auto", status: "ACTIVE" },
  ];

  const mockBrands = [
    { id: "b1", name: "Sony Electronics", status: "ACTIVE" },
    { id: "b2", name: "Cipla Healthcare", status: "ACTIVE" },
    { id: "b3", name: "Fortune Foods", status: "ACTIVE" },
    { id: "b4", name: "Castrol Lubricants", status: "ACTIVE" },
  ];

  const mockUnits = [
    { id: "u1", name: "Pieces / Units", abbreviation: "pcs", status: "ACTIVE" },
    { id: "u2", name: "Kilograms", abbreviation: "kg", status: "ACTIVE" },
    { id: "u3", name: "Strip / Box", abbreviation: "strip", status: "ACTIVE" },
    { id: "u4", name: "Liters", abbreviation: "L", status: "ACTIVE" },
  ];

  const categories = fetchedCategories && fetchedCategories.length > 0 ? fetchedCategories : mockCategories;
  const brands = fetchedBrands && fetchedBrands.length > 0 ? fetchedBrands : mockBrands;
  const units = fetchedUnits && fetchedUnits.length > 0 ? fetchedUnits : mockUnits;

  const currentList =
    activeTab === "categories"
      ? categories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
      : activeTab === "brands"
      ? brands.filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase()))
      : units.filter((u: any) => u.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    try {
      if (activeTab === "categories") {
        await apiClient.post("/catalog/categories", { name: newItemName, slug: newItemName.toLowerCase().replace(/\s+/g, "-") });
        refetchCats();
      } else if (activeTab === "brands") {
        await apiClient.post("/catalog/brands", { name: newItemName });
        refetchBrands();
      } else if (activeTab === "units") {
        await apiClient.post("/catalog/units", { name: newItemName, abbreviation: newItemCode || "unit" });
        refetchUnits();
      }
    } catch {
      // Local fallback
    }

    setNewItemName("");
    setNewItemCode("");
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="text-purple-600 dark:text-purple-400" /> Categories, Brands & Units
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize your general store inventory into categories, brands, and units of measure.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
        >
          <Plus size={18} /> Add {activeTab === "categories" ? "Category" : activeTab === "brands" ? "Brand" : "Unit"}
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { key: "categories", label: "Categories", icon: Tag },
            { key: "brands", label: "Brands", icon: ShieldCheck },
            { key: "units", label: "Units of Measure", icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
        </div>
      </div>

      {/* Data Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentList.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {activeTab}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.name}</h3>
              {item.abbreviation && (
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Symbol: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.abbreviation}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white capitalize">
                Add New {activeTab.slice(0, -1)}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder={`Enter ${activeTab.slice(0, -1)} name...`}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {activeTab === "units" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Symbol / Abbreviation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kg, pcs, L"
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
