import { apiClient } from './apiClient';
import { DashboardStats, TrendDataPoint, TimeFilter } from '../types';

interface DashboardStatsResponse extends DashboardStats {
  trends?: {
    revenueTrend: number;
    redemptionsTrend: number;
    savingsTrend: number;
  } | null;
}

interface ScopeDistribution {
  name: string;
  value: number;
  color: string;
}

export const dashboardApi = {
  /**
   * Get dashboard KPI stats
   */
  async getStats(timeFilter: TimeFilter = 'ALL', fromDate?: string, toDate?: string): Promise<DashboardStatsResponse> {
    const params = new URLSearchParams();
    if (timeFilter) params.append('timeFilter', timeFilter);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await apiClient.get(`/dashboard/stats?${params.toString()}`);
    return response.data;
  },

  /**
   * Get trend data for charts
   */
  async getTrendData(timeFilter: TimeFilter = 'ALL', fromDate?: string, toDate?: string): Promise<TrendDataPoint[]> {
    const params = new URLSearchParams();
    if (timeFilter) params.append('timeFilter', timeFilter);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await apiClient.get(`/dashboard/trend?${params.toString()}`);
    return response.data;
  },

  /**
   * Get scope distribution for pie chart
   */
  async getScopeDistribution(timeFilter: TimeFilter = 'ALL', fromDate?: string, toDate?: string): Promise<ScopeDistribution[]> {
    const params = new URLSearchParams();
    if (timeFilter) params.append('timeFilter', timeFilter);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await apiClient.get(`/dashboard/scope-distribution?${params.toString()}`);
    return response.data;
  }
};
