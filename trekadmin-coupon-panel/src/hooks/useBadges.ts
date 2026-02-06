import { useState, useEffect, useCallback } from 'react';
import { Badge } from '../types';
import { badgeApi } from '../api';

interface UseBadgesReturn {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createBadge: (badge: Partial<Badge>) => Promise<void>;
  updateBadge: (id: string, badge: Partial<Badge>) => Promise<void>;
  toggleBadgeStatus: (id: string) => Promise<void>;
  deleteBadge: (id: string) => Promise<void>;
}

export const useBadges = (): UseBadgesReturn => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await badgeApi.getAll();
      setBadges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
      console.error('Failed to fetch badges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const createBadge = useCallback(async (badge: Partial<Badge>) => {
    try {
      setError(null);
      const response = await badgeApi.create(badge);
      await fetchBadges(); // Refetch to get the complete badge with all fields
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create badge';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBadges]);

  const updateBadge = useCallback(async (id: string, badge: Partial<Badge>) => {
    try {
      setError(null);
      await badgeApi.update(id, badge);
      await fetchBadges(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update badge';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBadges]);

  const toggleBadgeStatus = useCallback(async (id: string) => {
    try {
      setError(null);
      const badge = badges.find(b => b.id === id);
      if (!badge) throw new Error('Badge not found');

      const newStatus = badge.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await badgeApi.toggleStatus(id, newStatus, 'ADM-991', 'Super Admin');
      await fetchBadges(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle badge status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [badges, fetchBadges]);

  const deleteBadge = useCallback(async (id: string) => {
    try {
      setError(null);
      await badgeApi.delete(id, 'ADM-991', 'Super Admin');
      await fetchBadges(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete badge';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBadges]);

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
    createBadge,
    updateBadge,
    toggleBadgeStatus,
    deleteBadge
  };
};
