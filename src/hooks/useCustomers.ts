import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export interface CustomerInput {
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  groupId?: string;
  openingBalance?: number;
  creditLimit?: number;
  creditDays?: number;
  notes?: string;
}

export function useCustomers(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.customers, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.status) searchParams.set("status", params.status);
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit || 20));

      const { data } = await apiClient.get(`/customers?${searchParams.toString()}`);
      return data.data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.customerDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/customers/${id}`);
      return data.data.customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      const { data } = await apiClient.post("/customers", input);
      return data.data.customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerInput> }) => {
      const res = await apiClient.patch(`/customers/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerDetail(variables.id) });
    },
  });
}
