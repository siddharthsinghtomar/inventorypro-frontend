"use client";

import { useState } from "react";
import {
  Award, Gift, Tag, Plus, CheckCircle2, Copy, Sparkles,
  Edit, Trash2, Settings, ShieldCheck, X, Check, Search, Percent
} from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
  status: "ACTIVE" | "EXPIRED";
}

const mockCoupons: Coupon[] = [
  { id: "c1", code: "SAVE100", type: "FIXED", value: 100, minSpend: 1000, status: "ACTIVE" },
  { id: "c2", code: "PROMO50", type: "FIXED", value: 50, minSpend: 500, status: "ACTIVE" },
  { id: "c3", code: "FESTIVE15", type: "PERCENT", value: 15, minSpend: 2000, status: "ACTIVE" },
];

export default function LoyaltyRewardsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [search, setSearch] = useState("");

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [value, setValue] = useState("100");
  const [minSpend, setMinSpend] = useState("500");
  const [status, setStatus] = useState<"ACTIVE" | "EXPIRED">("ACTIVE");

  // Loyalty Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loyaltyRate, setLoyaltyRate] = useState(100);
  const [goldMembersCount, setGoldMembersCount] = useState(148);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setType("FIXED");
    setValue("100");
    setMinSpend("500");
    setStatus("ACTIVE");
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMinSpend(coupon.minSpend.toString());
    setStatus(coupon.status);
    setShowModal(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error("Please enter a voucher code");
      return;
    }

    const valNum = Number(value) || 0;
    const minNum = Number(minSpend) || 0;

    if (editingCoupon) {
      // Update existing coupon
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, code: code.toUpperCase(), type, value: valNum, minSpend: minNum, status }
            : c
        )
      );
      toast.success(`Updated voucher coupon "${code.toUpperCase()}"!`);
    } else {
      // Create new coupon
      const newCoupon: Coupon = {
        id: `c-${Date.now()}`,
        code: code.toUpperCase(),
        type,
        value: valNum,
        minSpend: minNum,
        status,
      };
      setCoupons([newCoupon, ...coupons]);
      toast.success(`Created new promo voucher "${code.toUpperCase()}"!`);
    }

    setShowModal(false);
  };

  const handleDeleteCoupon = (id: string, couponCode: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Deleted promo voucher "${couponCode}"`);
  };

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    toast.success(`Copied "${codeStr}" to clipboard!`);
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Award className="text-purple-600 dark:text-purple-400" size={26} /> Customer Loyalty Program & Voucher Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage promo vouchers, edit coupon discounts, configure member reward points, and issue store gift cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2.5 bg-card border border-border hover:bg-muted text-foreground font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Settings size={15} className="text-purple-500" />
            <span>Loyalty Settings</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shadow-purple-500/20"
          >
            <Plus size={16} /> Create Promo Voucher
          </button>
        </div>
      </div>

      {/* ─── MEMBERSHIP TIERS KPI CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Gold VIP Members</span>
            <Award className="text-amber-500" size={20} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{goldMembersCount} VIP Members</div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">10% Automatic POS Discounts</div>
        </div>

        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Active Promo Vouchers</span>
            <Gift className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{coupons.filter(c => c.status === "ACTIVE").length} Active Coupons</div>
          <div className="text-[10px] text-purple-600 font-bold">Redeemable at POS & Online Checkout</div>
        </div>

        <div className="bg-card border border-border/50 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Loyalty Point Rate</span>
            <Sparkles className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">1 Point = ₹1</div>
          <div className="text-[10px] text-muted-foreground font-bold">Earn 1 Point per ₹{loyaltyRate} Spent</div>
        </div>
      </div>

      {/* ─── CONTROLS: SEARCH BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search promo vouchers by code or type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── ACTIVE VOUCHERS TABLE WITH EDIT & DELETE CONTROLS ───────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Tag size={16} className="text-purple-600" /> Active Promo Voucher Coupons ({filteredCoupons.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3.5">Voucher Code</th>
                <th className="px-4 py-3.5">Discount Type</th>
                <th className="px-4 py-3.5">Discount Value</th>
                <th className="px-4 py-3.5">Min Order Spend</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(c.code)}
                        className="p-1 text-muted-foreground hover:text-purple-500 rounded-md"
                        title="Copy Coupon Code"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-bold">{c.type === "FIXED" ? "💵 Flat Cash Off" : " % Percentage Off"}</td>
                  <td className="px-4 py-3.5 font-mono font-black text-emerald-600 text-sm">
                    {c.type === "FIXED" ? `₹${c.value}.00 Off` : `${c.value}% Off`}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-muted-foreground">₹{c.minSpend}.00</td>
                  <td className="px-4 py-3.5">
                    {c.status === "ACTIVE" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold rounded-xl text-xs border border-purple-500/20 flex items-center gap-1 transition-all"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-xl transition-all"
                        title="Delete Voucher"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-semibold">
                    No promo vouchers found. Click &quot;Create Promo Voucher&quot; to add new discount codes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CREATE / EDIT VOUCHER MODAL ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCoupon} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                {editingCoupon ? <Edit size={18} className="text-purple-500" /> : <Plus size={18} className="text-purple-500" />}
                {editingCoupon ? "Edit Promo Voucher" : "Create New Promo Voucher"}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Voucher Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background uppercase font-mono font-black text-purple-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SAVE200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold text-xs focus:outline-none"
                  >
                    <option value="FIXED">Flat Cash (₹ Off)</option>
                    <option value="PERCENT">Percentage (% Off)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Discount Value ({type === "FIXED" ? "₹" : "%"})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Min Order Spend (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono font-bold focus:outline-none"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Voucher Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold text-xs focus:outline-none"
                  >
                    <option value="ACTIVE">✅ Active</option>
                    <option value="EXPIRED">❌ Expired</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md">
                {editingCoupon ? "Save Voucher Changes" : "Create Voucher"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── EDIT LOYALTY SETTINGS MODAL ────────────────────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Settings size={18} className="text-purple-500" /> Configure Loyalty Point Rules
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Spend Amount for 1 Point (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-mono font-bold focus:outline-none"
                  value={loyaltyRate}
                  onChange={(e) => setLoyaltyRate(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Gold VIP Members Count</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-mono font-bold focus:outline-none"
                  value={goldMembersCount}
                  onChange={(e) => setGoldMembersCount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                Save Loyalty Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
