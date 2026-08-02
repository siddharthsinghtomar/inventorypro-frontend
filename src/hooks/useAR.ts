import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { QUERY_KEYS, STOCK_AFFECTED_QUERY_KEYS } from "@/constants/queryKeys";

export interface ARStats {
  totalInvoiceAmount: number;
  amountCollected: number;
  outstandingAmount: number;
  overdueAmount: number;
  paidInvoices: number;
  partialInvoices: number;
  unpaidInvoices: number;
  todaysCollections: number;
  monthlyCollections: number;
  averageCollectionDays: number;
}

export interface PaymentTransactionItem {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  transactionId?: string;
  notes?: string;
  status: string;
  receivedAt: string;
  receivedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentHistoryResponse {
  invoiceNumber: string;
  grandTotal: number;
  amountPaid: number;
  outstanding: number;
  payments: PaymentTransactionItem[];
}

export interface ReceivePaymentData {
  amount: number;
  method: string;
  reference?: string;
  transactionId?: string;
  notes?: string;
  markAsFullyPaid?: boolean;
}

/**
 * Hook to fetch Accounts Receivable KPIs
 */
export function useARStats() {
  return useQuery({
    queryKey: ["ar-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ARStats }>("/sales/ar-stats");
      return data.data;
    },
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch payment history for a specific invoice
 */
export function useInvoicePaymentHistory(saleId: string, enabled = true) {
  return useQuery({
    queryKey: ["sales", saleId, "payments"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: PaymentHistoryResponse }>(`/sales/${saleId}/payments`);
      return data.data;
    },
    enabled: !!saleId && enabled,
  });
}

/**
 * Hook to receive payment against an invoice
 */
export function useReceivePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ saleId, data }: { saleId: string; data: ReceivePaymentData }) => {
      const res = await apiClient.post(`/sales/${saleId}/payments`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      STOCK_AFFECTED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({ queryKey: ["ar-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sales", variables.saleId, "payments"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    },
  });
}

/**
 * Hook to send payment reminder
 */
export function useSendPaymentReminder() {
  return useMutation({
    mutationFn: async ({ saleId, channel }: { saleId: string; channel: "WHATSAPP" | "SMS" | "EMAIL" }) => {
      const { data } = await apiClient.post(`/sales/${saleId}/send-reminder`, { channel });
      return data.data;
    },
  });
}
