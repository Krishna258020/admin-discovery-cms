import { useState, useEffect, useCallback } from 'react';
import { WithdrawalRequest, CommissionLog } from '../types';
import { withdrawalApi, commissionApi } from '../api';

interface UseWithdrawalsReturn {
  withdrawalRequests: WithdrawalRequest[];
  commissionLogs: CommissionLog[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  setCommissionLogs: React.Dispatch<React.SetStateAction<CommissionLog[]>>;
}

export const useWithdrawals = (): UseWithdrawalsReturn => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [commissionLogs, setCommissionLogs] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [withdrawals, logs] = await Promise.all([
        withdrawalApi.getAll(),
        commissionApi.getLogs()
      ]);
      setWithdrawalRequests(withdrawals);
      setCommissionLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return {
    withdrawalRequests,
    commissionLogs,
    loading,
    error,
    refetch: fetchWithdrawals,
    setWithdrawalRequests,
    setCommissionLogs
  };
};
