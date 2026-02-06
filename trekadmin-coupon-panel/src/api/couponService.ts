
import axios from 'axios';
import { Coupon } from '../types';

const API_URL = 'http://localhost:5001/api/coupons';
const BADGE_API_URL = 'http://localhost:5001/api/badges';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// --- Coupon Services ---
export const getCoupons = async (): Promise<Coupon[]> => {
    try {
        const response = await api.get('/coupons');
        return response.data;
    } catch (error) {
        console.error("Error fetching coupons:", error);
        throw error;
    }
};

export const createCoupon = async (couponData: Partial<Coupon>): Promise<Coupon> => {
    try {
        const response = await api.post('/coupons', couponData);
        return response.data; // May return { message, id, code } or full object
    } catch (error) {
        console.error("Error creating coupon:", error);
        throw error;
    }
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<void> => {
    try {
        await api.put(`/coupons/${id}`, updates);
    } catch (error) {
        console.error("Error updating coupon:", error);
        throw error;
    }
};

export const toggleCouponStatus = async (id: string, status: string): Promise<void> => {
    try {
        await api.patch(`/coupons/${id}/status`, { status });
    } catch (error) {
        console.error("Error toggling coupon status:", error);
        throw error;
    }
};

export const deleteCoupon = async (id: string): Promise<void> => {
    try {
        await api.delete(`/coupons/${id}`);
    } catch (error) {
        console.error("Error deleting coupon:", error);
        throw error;
    }
};

// --- Badge Services (if needed here or separate file) ---
// For now keeping them together or separate?
// User asked to "connect frontend to backend", suggesting replacing mock data.
