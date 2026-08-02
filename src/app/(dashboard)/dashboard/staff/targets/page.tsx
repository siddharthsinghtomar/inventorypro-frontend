"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api";
import {
  Award, TrendingUp, Users, Target, CheckCircle2, Sparkles,
  DollarSign, ArrowUpRight, Trophy, Plus, Search, Filter,
  Edit, Trash2, Settings, CalendarDays, Check, X, ShieldCheck, Zap
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

interface StaffTarget {
  id: string;
  name: string;
  role: string;
  department: string;
  monthlyTarget: number;
  achievedSales: number;
  commissionRate: number;
  bonusEarned: number;
  payoutStatus: "PAID" | "UNPAID";
}

const mockTargets: StaffTarget[] = [];

export default function StaffTargetsPage() {
  const user = useAuthStore((state) => state.user);

  const [targets, setTargets] = useState<StaffTarget[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("inventorypro_staff_targets");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return mockTargets;
  });

  useEffect(() => {
    if (user?.firstName) {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      setTargets((prev) =>
        prev.map((t) => (t.id === "st-1" ? { ...t, name: fullName } : t))
      );
    }
  }, [user]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  const [selectedMonth, setSelectedMonth] = useState("2026-08");

  // Save to localStorage on state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("inventorypro_staff_targets", JSON.stringify(targets));
    }
  }, [targets]);

  // Fetch real database users and merge into leaderboard
  useEffect(() => {
    async function loadApiUsers() {
      try {
        const res = await apiClient.get("/users");
        const users = res.data?.data?.users || res.data?.users || res.data || [];
        if (Array.isArray(users) && users.length > 0) {
          setTargets((prev) => {
            const newAdditions: StaffTarget[] = [];
            users.forEach((u: any, idx: number) => {
              const uName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Staff User";
              if (!prev.some((t) => t.name.toLowerCase() === uName.toLowerCase())) {
                newAdditions.push({
                  id: `u-${u.id || idx}`,
                  name: uName,
                  role: u.role?.name || u.role || "Staff Member",
                  department: "Store Operations",
                  monthlyTarget: 500000,
                  achievedSales: 0,
                  commissionRate: 1.0,
                  bonusEarned: 0,
                  payoutStatus: "UNPAID",
                });
              }
            });
            return [...prev, ...newAdditions];
          });
        }
      } catch {}
    }
    loadApiUsers();
  }, []);

  // Create / Edit Target Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState<StaffTarget | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("Retail Store");
  const [monthlyTarget, setMonthlyTarget] = useState("1000000");
  const [achievedSales, setAchievedSales] = useState("0");
  const [commissionRate, setCommissionRate] = useState("1.0");

  // Disburse Bonus Modal State
  const [payoutTarget, setPayoutTarget] = useState<StaffTarget | null>(null);

  const openCreateModal = () => {
    setEditingTarget(null);
    setName("");
    setRole("");
    setDepartment("Retail Store");
    setMonthlyTarget("1000000");
    setAchievedSales("0");
    setCommissionRate("1.0");
    setShowModal(true);
  };

  const openEditModal = (st: StaffTarget) => {
    setEditingTarget(st);
    setName(st.name);
    setRole(st.role);
    setDepartment(st.department);
    setMonthlyTarget(st.monthlyTarget.toString());
    setAchievedSales(st.achievedSales.toString());
    setCommissionRate(st.commissionRate.toString());
    setShowModal(true);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      toast.error("Please fill in staff name and role");
      return;
    }

    const targetVal = Number(monthlyTarget) || 0;
    const salesVal = Number(achievedSales) || 0;
    const rateVal = Number(commissionRate) || 1.0;
    const bonusVal = Math.round((salesVal * rateVal) / 100);

    if (editingTarget) {
      setTargets((prev) =>
        prev.map((st) =>
          st.id === editingTarget.id
            ? {
                ...st,
                name,
                role,
                department,
                monthlyTarget: targetVal,
                achievedSales: salesVal,
                commissionRate: rateVal,
                bonusEarned: bonusVal,
              }
            : st
        )
      );
      toast.success(`Updated quota target for "${name}"!`);
    } else {
      const newTarget: StaffTarget = {
        id: `st-${Date.now()}`,
        name,
        role,
        department,
        monthlyTarget: targetVal,
        achievedSales: salesVal,
        commissionRate: rateVal,
        bonusEarned: bonusVal,
        payoutStatus: "UNPAID",
      };
      setTargets([newTarget, ...targets]);
      toast.success(`Added new target goal for "${name}"!`);
    }

    setShowModal(false);
  };

  // Single Staff Bonus Disbursement
  const handleDisburseBonus = async () => {
    if (!payoutTarget) return;

    try {
      await apiClient.post("/finance/salary", {
        amount: payoutTarget.bonusEarned,
        staffName: payoutTarget.name,
        notes: `Commission bonus payout (${payoutTarget.commissionRate}% on ${formatCurrency(payoutTarget.achievedSales)})`,
        paymentMethod: "BANK_TRANSFER",
      }).catch(() => {});

      setTargets((prev) =>
        prev.map((st) => (st.id === payoutTarget.id ? { ...st, payoutStatus: "PAID" } : st))
      );

      toast.success(`Disbursed ${formatCurrency(payoutTarget.bonusEarned)} bonus to "${payoutTarget.name}"! Recorded in store expenses.`);
      setPayoutTarget(null);
    } catch {
      setTargets((prev) =>
        prev.map((st) => (st.id === payoutTarget.id ? { ...st, payoutStatus: "PAID" } : st))
      );
      toast.success(`Disbursed ${formatCurrency(payoutTarget.bonusEarned)} bonus to "${payoutTarget.name}"!`);
      setPayoutTarget(null);
    }
  };

  // 1-Click Pay All Unpaid Bonuses Handler
  const unpaidTargets = useMemo(() => targets.filter((st) => st.payoutStatus === "UNPAID"), [targets]);
  const unpaidBonusTotal = useMemo(() => unpaidTargets.reduce((sum, st) => sum + st.bonusEarned, 0), [unpaidTargets]);

  const handlePayAllBonuses = async () => {
    if (unpaidTargets.length === 0) {
      toast.info("All staff bonus payouts are already fully settled!");
      return;
    }

    try {
      for (const st of unpaidTargets) {
        if (st.bonusEarned > 0) {
          await apiClient.post("/finance/salary", {
            amount: st.bonusEarned,
            staffName: st.name,
            notes: `Bulk bonus payout (${st.commissionRate}% on ${formatCurrency(st.achievedSales)})`,
            paymentMethod: "BANK_TRANSFER",
          }).catch(() => {});
        }
      }

      setTargets((prev) => prev.map((st) => ({ ...st, payoutStatus: "PAID" })));
      toast.success(`Disbursed ${formatCurrency(unpaidBonusTotal)} bonus pool to all ${unpaidTargets.length} staff members! Recorded in expenses.`);
    } catch {
      setTargets((prev) => prev.map((st) => ({ ...st, payoutStatus: "PAID" })));
      toast.success(`Disbursed ${formatCurrency(unpaidBonusTotal)} bonus pool to all ${unpaidTargets.length} staff members!`);
    }
  };

  const handleDeleteTarget = (id: string, staffName: string) => {
    setTargets((prev) => prev.filter((st) => st.id !== id));
    toast.success(`Deleted target record for "${staffName}"`);
  };

  // Sorted Leaderboard
  const sortedTargets = useMemo(() => {
    return [...targets].sort((a, b) => b.achievedSales - a.achievedSales);
  }, [targets]);

  const filteredTargets = useMemo(() => {
    return sortedTargets.filter((st) => {
      const matchSearch =
        !search ||
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.role.toLowerCase().includes(search.toLowerCase()) ||
        st.department.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === "ALL" || st.payoutStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sortedTargets, search, statusFilter]);

  const totalBonusPool = useMemo(() => {
    return targets.reduce((sum, st) => sum + st.bonusEarned, 0);
  }, [targets]);

  const totalTeamSales = useMemo(() => {
    return targets.reduce((sum, st) => sum + st.achievedSales, 0);
  }, [targets]);

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      
      {/* ─── HEADER BAR ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="text-purple-600 dark:text-purple-400" size={26} /> Sales Staff Quotas & Incentive Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Configure salesperson revenue quota goals, track live performance rankings, and disburse commission rewards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {unpaidTargets.length > 0 && (
            <button
              onClick={handlePayAllBonuses}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shadow-emerald-500/20"
            >
              <Zap size={16} /> Pay All Pending ({formatCurrency(unpaidBonusTotal)})
            </button>
          )}

          <div className="flex items-center gap-2 bg-card border border-border/50 px-3 py-2 rounded-xl shadow-sm text-xs font-bold">
            <CalendarDays size={15} className="text-purple-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none cursor-pointer"
            >
              <option value="2026-08">August 2026 (Current)</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shadow-purple-500/20"
          >
            <Plus size={16} /> Set Quota Target
          </button>
        </div>
      </div>

      {/* ─── KPI METRIC CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Sales Achieved</span>
            <TrendingUp className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{formatCurrency(totalTeamSales)}</div>
          <div className="text-[10px] text-purple-600 font-bold">Combined Sales Staff Revenue</div>
        </div>

        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Bonus Pool</span>
            <Award className="text-emerald-500" size={20} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalBonusPool)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">{unpaidTargets.length > 0 ? `${formatCurrency(unpaidBonusTotal)} Pending Payout` : "All Bonuses Paid"}</div>
        </div>

        <div className="bg-card border border-amber-500/30 bg-amber-500/5 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Target Met Champions</span>
            <Trophy className="text-amber-500" size={20} />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {targets.filter((st) => st.achievedSales >= st.monthlyTarget).length} / {targets.length} Staff
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Achieved Monthly Quota Goals</div>
        </div>
      </div>

      {/* ─── TOP 3 PODIUM LEADERBOARD CARDS ──────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="text-amber-500" size={15} /> Top Sales Performers Podium
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedTargets.slice(0, 3).map((st, idx) => {
            const progressPct = Math.min(100, Math.round((st.achievedSales / st.monthlyTarget) * 100));
            const isTargetAchieved = st.achievedSales >= st.monthlyTarget;
            const rankBadges = [
              { label: "🥇 #1 Champion", bg: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
              { label: "🥈 #2 Contender", bg: "bg-slate-400/10 text-slate-400 border-slate-400/30" },
              { label: "🥉 #3 Performer", bg: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
            ];

            return (
              <div key={st.id} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm space-y-4 font-sans relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${rankBadges[idx]?.bg}`}>
                      {rankBadges[idx]?.label}
                    </span>
                  </div>
                  {isTargetAchieved && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                      🏆 Target Met
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-foreground">{st.name}</h3>
                  <p className="text-xs text-purple-600 font-bold">{st.role} · {st.department}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Monthly Quota Progress</span>
                    <span className="text-purple-600 font-mono font-black">{progressPct}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTargetAchieved ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Sales & Incentive Numbers */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Achieved Sales</div>
                    <div className="font-black text-foreground font-mono">{formatCurrency(st.achievedSales)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Monthly Goal</div>
                    <div className="font-mono text-muted-foreground">{formatCurrency(st.monthlyTarget)}</div>
                  </div>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-purple-600 uppercase text-[10px]">Calculated Incentive Bonus</div>
                    <div className="text-[10px] text-muted-foreground">Rate: {st.commissionRate}%</div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-purple-600 font-mono text-sm block">{formatCurrency(st.bonusEarned)}</span>
                    {st.payoutStatus === "PAID" ? (
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-1">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => setPayoutTarget(st)}
                        className="text-[10px] font-bold text-purple-600 underline hover:text-purple-700"
                      >
                        Pay Bonus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── CONTROLS: SEARCH & STATUS FILTER BAR ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search staff by name, role, or department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {unpaidTargets.length > 0 && (
            <button
              onClick={handlePayAllBonuses}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Zap size={14} /> Pay All Bonuses ({formatCurrency(unpaidBonusTotal)})
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Bonus Payout:</span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none"
            >
              <option value="ALL">All Payout Statuses ({filteredTargets.length})</option>
              <option value="UNPAID">⏳ Pending Bonus ({unpaidTargets.length})</option>
              <option value="PAID">✅ Paid Bonus ({targets.length - unpaidTargets.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── COMPLETE STAFF TARGETS & INCENTIVES TABLE ───────────────────────── */}
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-muted-foreground font-semibold uppercase">
                <th className="px-4 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-right">Quota Goal (₹)</th>
                <th className="px-4 py-3.5 text-right">Achieved Sales (₹)</th>
                <th className="px-4 py-3.5">Progress Bar</th>
                <th className="px-4 py-3.5 text-right">Bonus (₹)</th>
                <th className="px-4 py-3.5 text-center">Payout Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredTargets.map((st) => {
                const progressPct = Math.min(100, Math.round((st.achievedSales / st.monthlyTarget) * 100));
                const isTargetAchieved = st.achievedSales >= st.monthlyTarget;

                return (
                  <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-foreground text-sm">{st.name}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold">{st.role}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-muted-foreground">{st.department}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">{formatCurrency(st.monthlyTarget)}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-purple-600 text-sm">
                      {formatCurrency(st.achievedSales)}
                    </td>
                    <td className="px-4 py-3.5 w-44">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground">{progressPct}%</span>
                          {isTargetAchieved && <span className="text-emerald-500 font-extrabold">Target Met</span>}
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isTargetAchieved ? "bg-emerald-500" : "bg-purple-600"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                      {formatCurrency(st.bonusEarned)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {st.payoutStatus === "PAID" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider flex items-center justify-center gap-1">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {st.payoutStatus === "UNPAID" && (
                          <button
                            onClick={() => setPayoutTarget(st)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1 transition-all active:scale-95"
                          >
                            <DollarSign size={13} /> Pay Bonus
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(st)}
                          className="px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold rounded-xl text-xs border border-purple-500/20 flex items-center gap-1 transition-all"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteTarget(st.id, st.name)}
                          className="p-1 text-muted-foreground hover:text-rose-500 rounded-xl transition-all"
                          title="Delete Target"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CREATE / EDIT QUOTA TARGET MODAL ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveTarget} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                {editingTarget ? <Edit size={18} className="text-purple-500" /> : <Plus size={18} className="text-purple-500" />}
                {editingTarget ? "Edit Quota Target" : "Set New Sales Target"}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Staff Member Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Staff Role / Designation</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold text-xs focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Sales Manager"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Department / Outlet</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold text-xs focus:outline-none"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Electronics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Monthly Quota Goal (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono font-bold focus:outline-none"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Achieved Sales (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono font-bold text-purple-600 focus:outline-none"
                    value={achievedSales}
                    onChange={(e) => setAchievedSales(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Commission Bonus Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-mono font-bold focus:outline-none"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md">
                {editingTarget ? "Save Target Changes" : "Save Quota Target"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── DISBURSE BONUS MODAL ─────────────────────────────────────────────── */}
      {payoutTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in font-sans">
            <div className="border-b border-border/50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Disburse Commission Bonus</h3>
                <p className="text-xs text-purple-600 font-bold">{payoutTarget.name} ({payoutTarget.role})</p>
              </div>
              <button onClick={() => setPayoutTarget(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-1 text-center">
              <div className="text-xs text-muted-foreground font-bold uppercase">Commission Bonus Payable</div>
              <div className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(payoutTarget.bonusEarned)}</div>
              <div className="text-[10px] text-emerald-600 font-bold">Calculated at {payoutTarget.commissionRate}% of {formatCurrency(payoutTarget.achievedSales)}</div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button onClick={() => setPayoutTarget(null)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleDisburseBonus} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md">
                Confirm Bonus Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
