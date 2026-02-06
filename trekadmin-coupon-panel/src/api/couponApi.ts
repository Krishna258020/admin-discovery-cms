import { apiClient } from './apiClient';
import { Coupon } from '../types';
import { normalizeStatus } from './transformers';

export const couponApi = {
  // Get all coupons
  getAll: async (): Promise<Coupon[]> => {
    const coupons = await apiClient.get<Coupon[]>('/coupons');
    // Normalize status from database format (lowercase/empty) to frontend format (UPPERCASE)
    return coupons.map(coupon => ({
      ...coupon,
      status: normalizeStatus(coupon.status) as any
    }));
  },

  // Get coupon by ID
  getById: async (id: string): Promise<Coupon> => {
    const coupon = await apiClient.get<Coupon>(`/coupons/${id}`);
    // Normalize status from database format (lowercase/empty) to frontend format (UPPERCASE)
    return {
      ...coupon,
      status: normalizeStatus(coupon.status) as any
    };
  },

  // Create coupon
  create: async (coupon: Partial<Coupon>): Promise<{ message: string; id: string; code: string }> => {
    return apiClient.post('/coupons', coupon);
  },

  // Update coupon
  update: async (id: string, coupon: Partial<Coupon>): Promise<{ message: string }> => {
    return apiClient.put(`/coupons/${id}`, coupon);
  },

  // Toggle status
  toggleStatus: async (id: string, status: string, performerId?: string, performerName?: string): Promise<{ message: string }> => {
    return apiClient.patch(`/coupons/${id}/status`, { status, performerId, performerName });
  },

  // Delete coupon (soft delete)
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/coupons/${id}`);
  },
};
