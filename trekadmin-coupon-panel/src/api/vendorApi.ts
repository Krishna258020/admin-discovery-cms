import { apiClient } from './apiClient';
import { Vendor, VendorRequest } from '../types';

export const vendorApi = {
  // Get all vendors
  getAll: async (): Promise<Vendor[]> => {
    return apiClient.get<Vendor[]>('/vendors');
  },

  // Get vendor by ID
  getById: async (id: string): Promise<Vendor> => {
    return apiClient.get<Vendor>(`/vendors/${id}`);
  },

  // Vendor Requests
  requests: {
    getAll: async (): Promise<VendorRequest[]> => {
      return apiClient.get<VendorRequest[]>('/vendor-requests');
    },

    create: async (request: Partial<VendorRequest>): Promise<{ message: string; id: string }> => {
      return apiClient.post('/vendor-requests', request);
    },

    approve: async (id: string, processedBy: string): Promise<{ message: string }> => {
      return apiClient.put(`/vendor-requests/${id}/approve`, { processedBy });
    },

    reject: async (id: string, processedBy: string, reason?: string): Promise<{ message: string }> => {
      return apiClient.put(`/vendor-requests/${id}/reject`, { processedBy, reason });
    },
  },
};
