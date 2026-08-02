"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api";
import {
  Users, Trophy, Award, TrendingUp, DollarSign,
  UserCheck, Target, Percent, Star, ShieldCheck, Search,
  Banknote, Edit3, Send, CheckCircle2, X, Clock, Wallet, Settings
} from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  salesMonth: number;
  ordersCount: number;
  targetAmount: number;
  baseSalary: number; // Owner fixed base monthly salary
  commissionRate: number; // Commission %
  status: string;
  email: string;
  badge: string;
  salaryPaid: boolean;
  paidDate?: string;
  paymentRef?: string;
}

const initialStaff: StaffMember[] = [
  {
    id: "EMP-001",
    name: "Siddharth Singh Tomar",
    role: "Store Manager / Admin",
    salesMonth: 1851336.68,
    ordersCount: 42,
    targetAmount: 1500000,
    baseSalary: 45000, // Fixed by owner
    commissionRate: 2.5,
    status: "ON_DUTY",
    email: "siddharth39@gmail.com",
    badge: "🏆 Top Performer",
    salaryPaid: false,
  },
  {
    id: "EMP-002",
    name: "Rajesh Kumar",
    role: "Senior POS Cashier",
    salesMonth: 640000.00,
    ordersCount: 28,
    targetAmount: 500000,
    baseSalary: 25000, // Fixed by owner
    commissionRate: 2.0,
    status: "ON_DUTY",
    email: "rajesh@store.com",
    badge: "⭐ Sales Star",
    salaryPaid: false,
  },
  {
    id: "EMP-003",
    name: "Priya Sharma",
    role: "Retail Associate",
    salesMonth: 380000.00,
    ordersCount: 19,
    targetAmount: 400000,
    baseSalary: 20000, // Fixed by owner
    commissionRate: 2.0,
    status: "OFF_DUTY",
    email: "priya@store.com",
    badge: "🎯 Target Achiever",
    salaryPaid: false,
  },
];

export default function StaffLeaderboardPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [search, setSearch] = useState("");

  // Pay Salary Modal State
  const [payingStaff, setPayingStaff] = useState<StaffMember | null>(null);
  const [payMethod, setPayMethod] = useState<string>("BANK_TRANSFER");
  const [payRef, setPayRef] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Owner Edit Base Salary Modal State
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newBaseSalary, setNewBaseSalary] = useState<string>("");
  const [newCommRate, setNewCommRate] = useState<string>("");

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = search.toLowerCase();
      return (
        !search ||
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [staffList, search]);

  const totalStoreSales = staffList.reduce((sum, s) => sum + s.salesMonth, 0);
  const totalBaseSalaries = staffList.reduce((sum, s) => sum + s.baseSalary, 0);
  const totalCommissionsEarned = staffList.reduce(
    (sum, s) => sum + (s.salesMonth * s.commissionRate) / 100,
    0
  );
  const totalMonthlyPayroll = totalBaseSalaries + totalCommissionsEarned;

  // Handle Owner Setting Fixed Base Salary
  const handleOpenEditSalary = (staff: StaffMember) => {
    setEditingStaff(staff);
    setNewBaseSalary(staff.baseSalary.toString());
    setNewCommRate(staff.commissionRate.toString());
  };

  const handleSaveFixedSalary = () => {
    if (!editingStaff) return;
    const base = Number(newBaseSalary);
    const comm = Number(newCommRate);

    if (isNaN(base) || base < 0) {
      toast.error("Please enter a valid base salary amount");
      return;
    }

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === editingStaff.id
          ? { ...s, baseSalary: base, commissionRate: isNaN(comm) ? s.commissionRate : comm }
          : s
      )
    );

    toast.success(`Updated owner fixed salary for ${editingStaff.name} to ${formatCurrency(base)}/month`);
    setEditingStaff(null);
  };

  // Handle Disbursing Monthly Salary
  const handleOpenPaySalary = (staff: StaffMember) => {
    setPayingStaff(staff);
    setPayMethod("BANK_TRANSFER");
    setPayRef("");
  };

  const handleConfirmDisburseSalary = async () => {
    if (!payingStaff) return;
    const commission = (payingStaff.salesMonth * payingStaff.commissionRate) / 100;
    const totalPayout = payingStaff.baseSalary + commission;

    setIsSubmitting(true);
    try {
      // Record salary payout as an operational expense in backend
      await apiClient.post("/finance/salary", {
        amount: totalPayout,
        staffName: payingStaff.name,
        notes: `Owner salary disbursement: Base ${formatCurrency(payingStaff.baseSalary)} + Commission ${formatCurrency(commission)}`,
        paymentMethod: payMethod,
      });

      setStaffList((prev) =>
        prev.map((s) =>
          s.id === payingStaff.id
            ? {
                ...s,
                salaryPaid: true,
                paidDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                paymentRef: payRef || `SAL-${Date.now().toString().slice(-6)}`,
              }
            : s
        )
      );

      toast.success(`Disbursed ${formatCurrency(totalPayout)} salary to ${payingStaff.name}! Recorded in store expenses.`);
      setPayingStaff(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Recorded salary locally and updated payroll status.");
      // Fallback local update
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === payingStaff.id
            ? {
                ...s,
                salaryPaid: true,
                paidDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                paymentRef: payRef || `SAL-${Date.now().toString().slice(-6)}`,
              }
            : s
        )
      );
      setPayingStaff(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in font-sans">
      {/* ─── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="text-amber-500" size={26} /> Staff Payroll, Owner Fixed Salary & Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Manage owner-fixed base salaries, sales incentive commissions, and disburse monthly staff salary payouts.
          </p>
        </div>
      </div>

      {/* ─── KPI SUMMARY CARDS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Monthly Payroll Budget */}
        <div className="bg-card border border-purple-500/30 bg-purple-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-purple-600 uppercase">
            <span>Total Monthly Payroll</span>
            <Banknote size={18} />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {formatCurrency(totalMonthlyPayroll)}
          </div>
          <div className="text-[10px] text-purple-600 font-bold">Base Salaries + Sales Commissions</div>
        </div>

        {/* Owner Fixed Base Salaries */}
        <div className="bg-card border border-blue-500/30 bg-blue-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-blue-600 uppercase">
            <span>Fixed Base Salaries</span>
            <Wallet size={18} />
          </div>
          <div className="text-2xl font-black text-blue-600 font-mono">
            {formatCurrency(totalBaseSalaries)}
          </div>
          <div className="text-[10px] text-blue-600 font-bold">Owner Fixed Monthly Payroll</div>
        </div>

        {/* Staff Commissions Earned */}
        <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-emerald-600 uppercase">
            <span>Incentive Commissions</span>
            <Percent size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {formatCurrency(totalCommissionsEarned)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Performance Sales Tier</div>
        </div>

        {/* Total Sales Generated */}
        <div className="bg-card border border-border/50 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-muted-foreground uppercase">
            <span>Total Sales Revenue</span>
            <TrendingUp size={18} />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {formatCurrency(totalStoreSales)}
          </div>
          <div className="text-[10px] text-muted-foreground font-bold">August 2026 Store Revenue</div>
        </div>
      </div>

      {/* ─── SEARCH & FILTER BAR ─────────────────────────────────────────────── */}
      <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search staff by name, role, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── STAFF PERFORMANCE & SALARY CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredStaff.map((staff, idx) => {
          const commissionAmount = (staff.salesMonth * staff.commissionRate) / 100;
          const totalSalaryPayout = staff.baseSalary + commissionAmount;
          const targetPct = Math.min(100, Math.round((staff.salesMonth / staff.targetAmount) * 100));

          return (
            <div
              key={staff.id}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between"
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                  Rank #1 Leader
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                      {staff.name}
                    </h3>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">{staff.role}</p>
                  </div>
                </div>

                {/* Salary & Payout Details Breakdown */}
                <div className="bg-muted/20 border border-border/50 p-3.5 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-muted-foreground font-medium">Owner Fixed Base Salary:</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(staff.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-muted-foreground font-medium">Sales Commission ({staff.commissionRate}%):</span>
                    <span className="font-extrabold text-emerald-600">{formatCurrency(commissionAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono pt-1.5 border-t border-border/50">
                    <span className="font-black text-foreground">Total Net Payout:</span>
                    <span className="font-black text-purple-600 dark:text-purple-400 text-sm">{formatCurrency(totalSalaryPayout)}</span>
                  </div>
                </div>

                {/* Sales Performance Stats */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground font-mono">
                    <span>Monthly Sales Generated:</span>
                    <span className="font-bold text-foreground">{formatCurrency(staff.salesMonth)} ({staff.ordersCount} sales)</span>
                  </div>

                  {/* Target Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">Target ({formatCurrency(staff.targetAmount)})</span>
                      <span className="text-purple-600 font-extrabold">{targetPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                        style={{ width: `${targetPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-600">{staff.badge}</span>
                  {staff.salaryPaid ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Paid ({staff.paidDate})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                      <Clock size={11} /> Pending Payout
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEditSalary(staff)}
                    className="flex-1 border border-border hover:bg-muted font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all"
                    title="Edit Owner Fixed Salary"
                  >
                    <Settings size={13} /> Fix Base Salary
                  </button>

                  {!staff.salaryPaid ? (
                    <button
                      onClick={() => handleOpenPaySalary(staff)}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                    >
                      <Banknote size={14} /> Pay Salary
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-muted text-muted-foreground font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed opacity-60"
                    >
                      <CheckCircle2 size={13} /> Disbursed
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── OWNER EDIT BASE SALARY MODAL ───────────────────────────────────── */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Settings className="text-purple-600" size={18} /> Owner Fix Base Salary & Commission
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{editingStaff.name} ({editingStaff.role})</p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Fixed Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newBaseSalary}
                  onChange={(e) => setNewBaseSalary(e.target.value)}
                  placeholder="Enter fixed base salary..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Incentive Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newCommRate}
                  onChange={(e) => setNewCommRate(e.target.value)}
                  placeholder="Enter commission % rate..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingStaff(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFixedSalary}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Save Fixed Salary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DISBURSE SALARY MODAL ────────────────────────────────────────────── */}
      {payingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Banknote className="text-emerald-500" size={20} /> Disburse Staff Monthly Salary
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{payingStaff.name} · {payingStaff.role}</p>
              </div>
              <button onClick={() => setPayingStaff(null)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>

            {/* Payout Calculation Card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground font-medium">Fixed Base Salary:</span>
                <span className="font-bold">{formatCurrency(payingStaff.baseSalary)}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground font-medium">Earned Sales Commission ({payingStaff.commissionRate}%):</span>
                <span className="font-bold">{formatCurrency((payingStaff.salesMonth * payingStaff.commissionRate) / 100)}</span>
              </div>
              <div className="flex justify-between font-mono pt-2 border-t border-emerald-500/30 text-sm">
                <span className="font-black text-emerald-700 dark:text-emerald-300">Total Net Payout:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payingStaff.baseSalary + (payingStaff.salesMonth * payingStaff.commissionRate) / 100)}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Disbursement Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none"
                >
                  <option value="BANK_TRANSFER">🏦 Direct Bank Transfer (NEFT / RTGS)</option>
                  <option value="CASH">💵 Store Cash Outflow</option>
                  <option value="UPI">📱 Staff UPI / GPay</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Reference / UTR / Voucher Number (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono focus:outline-none"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. SAL-AUG-001"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPayingStaff(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisburseSalary}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Confirm Salary Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
