import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { QUERY_KEYS } from "@/constants/queryKeys";

export interface DashboardStats {
  totalSalesToday?: number;
  totalOrdersToday?: number;
  totalProducts?: number;
  lowStockAlerts?: number;
  revenueTrend?: any[];
  [key: string]: any;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>("/analytics/dashboard-stats");
      return data.data;
    },
    refetchInterval: 30000,
  });
}
