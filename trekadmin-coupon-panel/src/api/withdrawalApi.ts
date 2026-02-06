import { apiClient } from './apiClient';
import { WithdrawalRequest, CommissionLog, PayoutBatch } from '../types';

export const withdrawalApi = {
  // Get all withdrawal requests
  getAll: async (): Promise<WithdrawalRequest[]> => {
    return apiClient.get<WithdrawalRequest[]>('/withdrawals');
  },

  // Create withdrawal request
  create: async (request: Partial<WithdrawalRequest>): Promise<{ message: string; id: string }> => {
    return apiClient.post('/withdrawals', request);
  },

  // Approve withdrawal
  approve: async (id: string, processedBy: string): Promise<{ message: string }> => {
    return apiClient.put(`/withdrawals/${id}/approve`, { processedBy });
  },

  // Reject withdrawal
  reject: async (id: string, processedBy: string, rejectionReason: string): Promise<{ message: string }> => {
    return apiClient.put(`/withdrawals/${id}/reject`, { processedBy, rejectionReason });
  },
};

export const commissionApi = {
  // Get commission logs
  getLogs: async (couponCode?: string): Promise<CommissionLog[]> => {
    const endpoint = couponCode ? `/commission-logs?couponCode=${couponCode}` : '/commission-logs';
    return apiClient.get<CommissionLog[]>(endpoint);
  },

  // Create commission log
  createLog: async (log: Partial<CommissionLog>): Promise<{ message: string }> => {
    return apiClient.post('/commission-logs', log);
  },
};

export const payoutApi = {
  // Get payout batches
  getAll: async (couponCode?: string): Promise<PayoutBatch[]> => {
    const endpoint = couponCode ? `/payout-batches?couponCode=${couponCode}` : '/payout-batches';
    return apiClient.get<PayoutBatch[]>(endpoint);
  },

  // Create payout batch
  create: async (batch: Partial<PayoutBatch>): Promise<{ message: string; id: string }> => {
    return apiClient.post('/payout-batches', batch);
  },
};
