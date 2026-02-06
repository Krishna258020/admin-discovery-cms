// ==========================================
// REACT HOOKS FOR PAYOUT API
// Custom hooks to integrate API with React
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { 
  payoutAPI, 
  PayoutRequest, 
  NotificationMessage,
  PayoutTransaction,
  CommissionUpdate 
} from './PayoutAPI';

// ==========================================
// NOTIFICATION HOOK
// ==========================================

export function usePayoutNotifications() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  
  useEffect(() => {
    const unsubscribe = payoutAPI.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Auto-remove if autoHide is true
      if (notification.autoHide) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration || 5000);
      }
    });
    
    return unsubscribe;
  }, []);
  
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return {
    notifications,
    dismissNotification,
    clearAll
  };
}

// ==========================================
// PAYOUT REQUESTS HOOK
// ==========================================

export function usePayoutRequests(couponCode: string, isPublic: boolean = false) {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadRequests = useCallback(() => {
    const data = payoutAPI.getRequestsByCoupon(couponCode, isPublic);
    setRequests(data);
  }, [couponCode, isPublic]);
  
  useEffect(() => {
    loadRequests();
    
    // Subscribe to status changes
    const unsubscribe = payoutAPI.onStatusChange((updatedRequest) => {
      if (updatedRequest.couponCode === couponCode) {
        loadRequests();
      }
    });
    
    return unsubscribe;
  }, [couponCode, loadRequests]);
  
  return {
    requests,
    loading,
    refresh: loadRequests
  };
}

// ==========================================
// CREATE PAYOUT REQUEST HOOK
// ==========================================

export function useCreatePayoutRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createRequest = useCallback(async (data: {
    amount: number;
    pendingBalance: number;
    couponCode: string;
    influencerName: string;
    influencerEmail: string;
    influencerMobile: string;
    paymentMethod: 'UPI' | 'BANK_TRANSFER';
    paymentDetails: any;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await payoutAPI.createPayoutRequest(data);
      
      if (result.success) {
        return { success: true, requestId: result.requestId };
      } else {
        setError(result.error || 'Failed to create request');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    createRequest,
    loading,
    error
  };
}

// ==========================================
// ADMIN APPROVE/REJECT HOOK
// ==========================================

export function useAdminPayoutActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const approveRequest = useCallback(async (
    requestId: string,
    adminName: string = 'Admin'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await payoutAPI.approvePayoutRequest(requestId, adminName);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Failed to approve');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const rejectRequest = useCallback(async (
    requestId: string,
    reason: string,
    adminName: string = 'Admin'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await payoutAPI.rejectPayoutRequest(requestId, reason, adminName);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Failed to reject');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    approveRequest,
    rejectRequest,
    loading,
    error
  };
}

// ==========================================
// TRANSACTION HISTORY HOOK
// ==========================================

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  
  const loadTransactions = useCallback(() => {
    const data = payoutAPI.getTransactionHistory();
    setTransactions(data);
  }, []);
  
  useEffect(() => {
    loadTransactions();
    
    // Reload when any request status changes
    const unsubscribe = payoutAPI.onStatusChange(() => {
      loadTransactions();
    });
    
    return unsubscribe;
  }, [loadTransactions]);
  
  return {
    transactions,
    refresh: loadTransactions
  };
}

// ==========================================
// COMMISSION STATS HOOK
// ==========================================

export function useCommissionStats(
  couponCode: string,
  totalEarned: number
): CommissionUpdate {
  const [stats, setStats] = useState<CommissionUpdate>({
    totalEarned: 0,
    pendingPayout: 0,
    paidOut: 0,
    totalBookings: 0
  });
  
  const updateStats = useCallback(() => {
    const calculated = payoutAPI.calculateCommissionStats(couponCode, totalEarned);
    setStats(calculated);
  }, [couponCode, totalEarned]);
  
  useEffect(() => {
    updateStats();
    
    // Update when any request changes status
    const unsubscribe = payoutAPI.onStatusChange((request) => {
      if (request.couponCode === couponCode) {
        updateStats();
      }
    });
    
    return unsubscribe;
  }, [couponCode, updateStats]);
  
  return stats;
}