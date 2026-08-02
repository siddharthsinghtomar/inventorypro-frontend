import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CreatePurchaseInput, PaginationInput } from "@/lib/validators";
import { QUERY_KEYS, STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";

export function usePurchases(pagination: PaginationInput) {
  return useQuery({
    queryKey: [...QUERY_KEYS.purchases, pagination],
    queryFn: async () => {
      const { data } = await apiClient.get("/purchases", { params: pagination });
      return data.data;
    },
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.purchaseDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/purchases/${id}`);
      return data.data.purchase;
    },
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePurchaseInput) => {
      const { data } = await apiClient.post("/purchases", input);
      return data.data.purchase;
    },
    onSuccess: () => {
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
    },
  });
}

export function useRecordPurchasePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      purchaseId,
      amount,
      method,
      reference,
      notes,
    }: {
      purchaseId: string;
      amount: number;
      method: string;
      reference?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post(`/purchases/${purchaseId}/payments`, {
        amount,
        method,
        reference,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
    },
  });
}
