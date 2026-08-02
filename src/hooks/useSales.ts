import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CreateSaleInput, PaginationInput } from "@/lib/validators";
import { QUERY_KEYS, STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";

export function useSales(pagination: PaginationInput) {
  return useQuery({
    queryKey: [...QUERY_KEYS.sales, pagination],
    queryFn: async () => {
      const { data } = await apiClient.get("/sales", { params: pagination });
      return data.data;
    },
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.saleDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/sales/${id}`);
      return data.data.sale;
    },
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSaleInput) => {
      const { data } = await apiClient.post("/sales", input);
      return data.data.sale;
    },
    onSuccess: () => {
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    },
  });
}
