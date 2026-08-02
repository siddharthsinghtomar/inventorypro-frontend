import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/finance/categories");
      return res.data.data.categories;
    },
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/finance/categories", data);
      return res.data.data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}

export function useExpenses(page = 1, limit = 10, categoryId?: string) {
  return useQuery({
    queryKey: ["expenses", page, limit, categoryId],
    queryFn: async () => {
      const res = await apiClient.get("/finance", {
        params: { page, limit, categoryId },
      });
      return res.data.data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/finance", data);
      return res.data.data.expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
