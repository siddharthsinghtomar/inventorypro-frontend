"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { useAuthStore } from "@/store/auth.store";
import { useExpenseCategories, useCreateExpense, useCreateExpenseCategory } from "@/hooks/useFinance";

// Use same schema as backend but adapted for frontend
const newExpenseSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "CREDIT"]),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type ExpenseFormData = z.infer<typeof newExpenseSchema>;

export default function NewExpensePage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const { data: categories, isLoading: isLoadingCategories } = useExpenseCategories();
  const createExpense = useCreateExpense();
  const createCategory = useCreateExpenseCategory();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(newExpenseSchema),
    defaultValues: {
      paymentMethod: "CASH",
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createExpense.mutateAsync({
        ...data,
        date: new Date().toISOString(),
      });
      toast.success("Expense recorded successfully");
      router.push("/dashboard/expenses");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record expense");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newCatName.trim() });
      toast.success("Category added");
      setNewCatName("");
      setIsAddingCategory(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record Expense</h1>
          <p className="text-muted-foreground text-sm mt-1">Log a new operational expense for your business.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ({tenant?.currency}) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className={`input-field ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method <span className="text-red-500">*</span></label>
              <select {...register("paymentMethod")} className="input-field">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDIT">Credit</option>
              </select>
              {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> {isAddingCategory ? "Cancel" : "Add New Category"}
                </button>
              </div>
              
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Rent, Office Supplies"
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={createCategory.isPending || !newCatName.trim()}
                    className="btn-primary whitespace-nowrap"
                  >
                    {createCategory.isPending ? "Adding..." : "Add"}
                  </button>
                </div>
              ) : (
                <select
                  {...register("categoryId")}
                  className={`input-field ${errors.categoryId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a category...</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
            </div>

            {/* Reference */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Reference / Receipt Number</label>
              <input
                type="text"
                {...register("reference")}
                className="input-field"
                placeholder="Optional reference number"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                {...register("notes")}
                className="input-field min-h-[100px] resize-y"
                placeholder="Additional details about this expense..."
              />
            </div>

          </div>

          <div className="pt-4 border-t border-border/50 flex justify-end gap-3">
            <Link href="/dashboard/expenses" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || createExpense.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {(isSubmitting || createExpense.isPending) && <Loader2 size={16} className="animate-spin" />}
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
