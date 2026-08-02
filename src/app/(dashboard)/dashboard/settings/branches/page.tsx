"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Building2, Plus, Search, MapPin, User, Phone, CheckCircle2,
  Warehouse, ShieldCheck, Settings
} from "lucide-react";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  code: string;
  type: "RETAIL" | "WAREHOUSE" | "HQ";
  address: string;
  city: string;
  managerName: string;
  phone: string;
  monthlyRevenue: number;
  status: "ACTIVE" | "INACTIVE";
}

const mockBranches: Branch[] = [
  { id: "b1", name: "Main HQ & Distribution Hub", code: "HQ-01", type: "HQ", address: "Plot 42, Tech Park", city: "Mumbai", managerName: "Siddharth (Owner)", phone: "+91 98765 43210", monthlyRevenue: 4564990, status: "ACTIVE" },
  { id: "b2", name: "Downtown Retail Flagship Outlet", code: "RET-01", type: "RETAIL", address: "MG Road Mall, Shop 104", city: "Bengaluru", managerName: "Rahul Sharma", phone: "+91 98123 45678", monthlyRevenue: 1845000, status: "ACTIVE" },
  { id: "b3", name: "Airport Metro Superstore Branch", code: "RET-02", type: "RETAIL", address: "Terminal 2 Galleria", city: "Delhi NCR", managerName: "Priya Patel", phone: "+91 97890 12345", monthlyRevenue: 1250000, status: "ACTIVE" },
];

export default function MultiBranchPage() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [type, setType] = useState<"RETAIL" | "WAREHOUSE" | "HQ">("RETAIL");

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setBranches([
      ...branches,
      {
        id: `br-${Date.now()}`,
        name,
        code: code || `BR-${branches.length + 1}`,
        type,
        address: "Commercial Market Road",
        city,
        managerName: "Branch Store Manager",
        phone: "+91 99000 11223",
        monthlyRevenue: 0,
        status: "ACTIVE",
      },
    ]);
    toast.success(`Created new branch "${name}"!`);
    setShowAddModal(false);
    setName(""); setCode("");
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="text-purple-600 dark:text-purple-400" size={26} /> Multi-Branch Store & Franchise Control Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage multi-store retail outlets, distribution warehouses, assign store managers, and isolate branch performance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={16} /> Add New Branch Outlet
        </button>
      </div>

      {/* ─── BRANCHES GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div key={b.id} className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-4 hover:border-purple-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 border border-purple-500/20 flex items-center justify-center font-black">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{b.name}</h3>
                  <p className="text-[10px] font-mono text-purple-600 font-bold">{b.code} · {b.type}</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                {b.status}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-border/50 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} className="text-purple-500 shrink-0" />
                <span>{b.address}, {b.city}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={14} className="text-purple-500 shrink-0" />
                <span className="font-bold text-foreground">Manager: {b.managerName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-mono">
                <Phone size={14} className="text-purple-500 shrink-0" />
                <span>{b.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Branch Sales</div>
                <div className="text-lg font-black text-emerald-500 font-mono">{formatCurrency(b.monthlyRevenue)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── CREATE BRANCH MODAL ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBranch} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in">
            <h3 className="text-base font-black text-foreground border-b border-border/50 pb-3">Add New Store Branch</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Branch Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Metro Retail Superstore"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Branch Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-mono focus:outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BR-04"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">City Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold focus:outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                Create Branch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
