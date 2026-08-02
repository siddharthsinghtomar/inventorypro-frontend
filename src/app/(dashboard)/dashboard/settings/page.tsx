"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon, Building, Receipt, Sliders, Bell, Save, Check, Printer
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "billing" | "pos" | "inventory">("store");
  const [saved, setSaved] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState("Demo Enterprise");
  const [gstin, setGstin] = useState("27AAACG0000A1Z5");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("123 Market Road, Mumbai, Maharashtra");
  const [currency, setCurrency] = useState("₹ (INR)");

  const [invoicePrefix, setInvoicePrefix] = useState("INV-2026-");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for shopping with us! Goods returned within 7 days.");
  const [thermalSize, setThermalSize] = useState("80mm");
  const [lowStockAlert, setLowStockAlert] = useState(10);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="text-purple-600 dark:text-purple-400" /> General Store Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure business GSTIN, receipt formats, POS printer preferences, and alert thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? "Settings Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: "store", label: "Business Profile", icon: Building },
          { key: "billing", label: "Invoice & Tax", icon: Receipt },
          { key: "pos", label: "POS Printer Setup", icon: Printer },
          { key: "inventory", label: "Inventory Thresholds", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Panels */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {activeTab === "store" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-2">
              Business Directory Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Tax Registration Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                <input
                  type="text"
                  disabled
                  value={currency}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Store Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-2">
              Invoice Formatting & Customization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Tax Mode</label>
                <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white">
                  <option value="EXCLUSIVE">Tax Exclusive (Added at Checkout)</option>
                  <option value="INCLUSIVE">Tax Inclusive (Included in Product MRP)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Footer Message & Return Policy</label>
              <textarea
                rows={3}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "pos" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-2">
              POS Terminal & Printer Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Thermal Paper Width</label>
                <select
                  value={thermalSize}
                  onChange={(e) => setThermalSize(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                >
                  <option value="80mm">80mm Standard POS Printer</option>
                  <option value="58mm">58mm Mini Portable Bluetooth Printer</option>
                  <option value="A4">A4 Full Sheet Printer</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  Auto-trigger Browser Print Dialog after POS Checkout
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-2">
              Stock Thresholds & Low Stock Alerts
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Global Default Low Stock Threshold</label>
              <input
                type="number"
                min="1"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(Number(e.target.value))}
                className="w-full sm:w-64 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Products with inventory below this quantity will automatically trigger Low Stock badges.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
