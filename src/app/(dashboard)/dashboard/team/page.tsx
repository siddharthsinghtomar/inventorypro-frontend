"use client";

import { useState } from "react";
import { Users, Plus, Shield, Mail, Phone, CheckCircle2, UserCheck, X } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "CASHIER" | "ACCOUNTANT";
  status: "ACTIVE" | "INACTIVE";
}

const mockTeam: Employee[] = [
  { id: "e1", name: "Siddharth Tomar", email: "siddharthtomar2933@gmail.com", phone: "+91 98765 43210", role: "OWNER", status: "ACTIVE" },
  { id: "e2", name: "Rohan Gupta", email: "rohan.cashier@store.in", phone: "+91 91234 56789", role: "CASHIER", status: "ACTIVE" },
  { id: "e3", name: "Priya Sharma", email: "priya.mgr@store.in", phone: "+91 99887 76655", role: "MANAGER", status: "ACTIVE" },
];

export default function TeamPage() {
  const [team, setTeam] = useState<Employee[]>(mockTeam);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Employee["role"]>("CASHIER");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newEmp: Employee = {
      id: `e-${Date.now()}`,
      name,
      email,
      phone: phone || "+91 90000 00000",
      role,
      status: "ACTIVE",
    };

    setTeam([...team, newEmp]);
    setIsModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-purple-600 dark:text-purple-400" /> Team & Employee Roles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage cashier accounts, store managers, and role-based access permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
        >
          <Plus size={18} /> Add Team Member
        </button>
      </div>

      {/* Employee List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Employee Name</th>
                <th className="px-5 py-3.5">Contact Info</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Access Scope</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {team.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p>{emp.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs space-y-0.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {emp.email}</div>
                    <div className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" /> {emp.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                      <Shield size={13} /> {emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {emp.role === "OWNER" && "Full System & Financial Access"}
                    {emp.role === "MANAGER" && "Inventory, Sales, Purchasing & Supplier Access"}
                    {emp.role === "CASHIER" && "POS Billing & Customer Management Only"}
                    {emp.role === "ACCOUNTANT" && "Financial Reports, Invoices & Tax Only"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck size={18} className="text-purple-600" /> Add New Staff Member
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rohan@store.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                >
                  <option value="CASHIER">Cashier (POS & Sales Only)</option>
                  <option value="MANAGER">Store Manager (Full Operations)</option>
                  <option value="ACCOUNTANT">Accountant (Invoices & Reports)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
