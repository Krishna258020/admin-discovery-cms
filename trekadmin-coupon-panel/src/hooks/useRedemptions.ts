import { useState, useEffect, useCallback } from 'react';
import { Redemption } from '../types';
import { redemptionApi } from '../api';

interface UseRedemptionsReturn {
  redemptions: Redemption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setRedemptions: React.Dispatch<React.SetStateAction<Redemption[]>>;
}

export const useRedemptions = (): UseRedemptionsReturn => {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRedemptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await redemptionApi.getAll();
      setRedemptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch redemptions');
      console.error('Failed to fetch redemptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  return {
    redemptions,
    loading,
    error,
    refetch: fetchRedemptions,
    setRedemptions
  };
};
