import { useState, useEffect, useCallback } from 'react';
import { VendorRequest } from '../types';
import { vendorApi } from '../api';

interface UseVendorsReturn {
  requests: VendorRequest[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveRequest: (id: string, approverName: string) => Promise<void>;
  rejectRequest: (id: string, rejectorName: string, reason: string) => Promise<void>;
}

export const useVendors = (): UseVendorsReturn => {
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorApi.requests.getAll();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendor requests');
      console.error('Failed to fetch vendor requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const approveRequest = useCallback(async (id: string, approverName: string) => {
    try {
      setError(null);
      await vendorApi.requests.approve(id, approverName);
      await fetchRequests(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRequests]);

  const rejectRequest = useCallback(async (id: string, rejectorName: string, reason: string) => {
    try {
      setError(null);
      await vendorApi.requests.reject(id, rejectorName, reason);
      await fetchRequests(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    approveRequest,
    rejectRequest
  };
};
