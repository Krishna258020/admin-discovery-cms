import { apiClient } from './apiClient';
import { Redemption, DashboardStats } from '../types';

export const redemptionApi = {
  // Get all redemptions
  getAll: async (): Promise<Redemption[]> => {
    return apiClient.get<Redemption[]>('/redemptions');
  },

  // Get redemptions with filters
  getFiltered: async (filters: {
    couponCode?: string;
    scope?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Redemption[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return apiClient.get<Redemption[]>(`/redemptions?${params.toString()}`);
  },

  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/redemptions/stats');
  },

  // Create redemption (for testing)
  create: async (redemption: Partial<Redemption>): Promise<{ message: string; id: string }> => {
    return apiClient.post('/redemptions', redemption);
  },
};
