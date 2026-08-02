"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { 
  Building2, Phone, Mail, MapPin, 
  ArrowLeft, Edit, AlertCircle, ShoppingCart, 
  Clock, CheckCircle2 
} from "lucide-react";

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: supplier, isLoading, error } = useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/suppliers/${id}`);
      return data.data.supplier;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
        <h3 className="font-semibold text-lg">Supplier not found</h3>
        <p className="text-sm">The supplier you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/dashboard/suppliers" className="mt-4 inline-block text-brand-600 hover:underline text-sm font-medium">
          &larr; Back to Suppliers
        </Link>
      </div>
    );
  }

  const balance = Number(supplier.currentBalance || 0);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/suppliers" className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
              {String(supplier.name).charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {String(supplier.name)}
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                  supplier.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-gray-100 text-gray-600 border-gray-200"
                }`}>
                  {String(supplier.status)}
                </span>
              </h1>
              {supplier.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 size={14} /> {String(supplier.company)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/suppliers/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border bg-card hover:bg-muted transition-colors">
            <Edit size={16} /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0"><Phone size={16} /></div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Phone</div>
                  <div className="text-sm font-medium text-foreground">{supplier.phone ? String(supplier.phone) : "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0"><Mail size={16} /></div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                  <div className="text-sm font-medium text-foreground">{supplier.email ? String(supplier.email) : "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0"><MapPin size={16} /></div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Address</div>
                  <div className="text-sm font-medium text-foreground">
                    {[supplier.address, supplier.city, supplier.state, supplier.pincode].filter(Boolean).join(", ") || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Financials</h3>
            
            <div className="p-4 rounded-xl mb-4 bg-muted/50 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
              <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {balance < 0 ? `${formatCurrency(Math.abs(balance))} To Pay` : "Settled"}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Credit Limit</span>
                <span className="font-semibold">{supplier.creditLimit ? formatCurrency(Number(supplier.creditLimit)) : "None"}</span>
              </div>
              {supplier.taxId && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tax ID / GST</span>
                  <span className="font-semibold">{String(supplier.taxId)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col - Activity/Purchases */}
        <div className="md:col-span-2">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Recent Purchases</h3>
              <button className="text-sm text-brand-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/20">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
                <ShoppingCart size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No purchases yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                You haven&apos;t recorded any purchases from {String(supplier.name)} yet. Start by creating a new purchase order.
              </p>
              <Link href={`/dashboard/purchases/new?supplier=${id}`}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Create Purchase
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
