import { useState, useEffect, useCallback } from 'react';
import { Coupon, CouponStatus } from '../types';
import { couponApi } from '../api';

interface UseCouponsReturn {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCoupon: (coupon: Partial<Coupon>) => Promise<{ id: string; code: string }>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<void>;
  toggleCouponStatus: (id: string, status: CouponStatus) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
}

export const useCoupons = (): UseCouponsReturn => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await couponApi.getAll();
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons');
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = useCallback(async (coupon: Partial<Coupon>) => {
    try {
      setError(null);
      const response = await couponApi.create(coupon);
      await fetchCoupons(); // Refetch to get the complete coupon with all fields
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create coupon';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCoupons]);

  const updateCoupon = useCallback(async (id: string, coupon: Partial<Coupon>) => {
    try {
      setError(null);
      await couponApi.update(id, coupon);
      await fetchCoupons(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update coupon';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCoupons]);

  const toggleCouponStatus = useCallback(async (id: string, status: CouponStatus) => {
    try {
      setError(null);
      await couponApi.toggleStatus(id, status, 'ADM-991', 'Super Admin');
      await fetchCoupons(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle coupon status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCoupons]);

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      setError(null);
      await couponApi.delete(id);
      await fetchCoupons(); // Refetch to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete coupon';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCoupons]);

  return {
    coupons,
    loading,
    error,
    refetch: fetchCoupons,
    createCoupon,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon
  };
};
