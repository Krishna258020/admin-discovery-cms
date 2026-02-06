

export type PayoutStatus = 
  | 'PENDING'           // Request submitted, waiting admin approval
  | 'ADMIN_APPROVED'    // Admin approved, sent to gateway
  | 'PROCESSING'        // Payment gateway processing
  | 'COMPLETED'         // Successfully paid
  | 'FAILED'            // Payment gateway failed
  | 'REJECTED';         // Admin rejected

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER';

export type NotificationType = 'SUCCESS' | 'FAILED' | 'PROCESSING' | 'WARNING';

export interface PayoutRequest {
  id: string;
  requestedAt: string;
  amount: number;
  pendingAtRequest: number;
  status: PayoutStatus;
  couponCode: string;
  influencerName?: string;
  influencerEmail?: string;
  influencerMobile?: string;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    upiId?: string;
    bankAccount?: string;
    bankIfsc?: string;
    accountHolder?: string;
    bankName?: string;
  };
  
  // Admin approval fields
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  
  // Processing fields
  processingStartedAt?: string;
  completedAt?: string;
  
  // Failure fields
  failedAt?: string;
  failureReason?: string;
  
  // Rejection fields
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  
  // Transaction tracking
  transactionId?: string;
  gatewayResponse?: any;
}

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  autoHide?: boolean;
  duration?: number;
}

export interface PayoutTransaction {
  id: string;
  date: string;
  amount: number;
  status: PayoutStatus;
  method: PaymentMethod;
  transactionId?: string;
  requestId: string;
}

export interface CommissionUpdate {
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
  totalBookings: number;
}

// ==========================================
// PAYMENT GATEWAY SIMULATOR
// Simulates real payment gateway behavior
// ==========================================

class PaymentGatewaySimulator {
  private static readonly PROCESSING_DELAY = 3000; // 3 seconds
  private static readonly SUCCESS_RATE = 0.85; // 85% success rate
  
  /**
   * Simulate payment processing
   * Returns success/failure after realistic delay
   */
  static async processPayment(
    request: PayoutRequest
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    
    // Simulate network delay
    await this.delay(this.PROCESSING_DELAY);
    
    // Simulate random success/failure
    const success = Math.random() < this.SUCCESS_RATE;
    
    if (success) {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
    } else {
      const errors = [
        'Insufficient funds in merchant account',
        'Invalid payment details',
        'Bank server timeout',
        'Transaction limit exceeded',
        'UPI ID not found',
        'Network error'
      ];
      
      return {
        success: false,
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==========================================
// PAYOUT API SERVICE CLASS
// ==========================================

export class PayoutAPIService {
  private static instance: PayoutAPIService;
  
  // Event listeners
  private notificationCallbacks: Set<(msg: NotificationMessage) => void> = new Set();
  private statusChangeCallbacks: Set<(request: PayoutRequest) => void> = new Set();
  
  // Storage keys
  private readonly STORAGE_KEYS = {
    REQUESTS: 'PAYOUT_REQUESTS',
    TRANSACTIONS: 'PAYOUT_TRANSACTIONS',
    ADMIN_REQUESTS: 'ADMIN_WITHDRAWAL_REQUESTS',
    PUBLIC_REQUESTS: 'PUBLIC_WITHDRAWAL_REQUESTS'
  };
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): PayoutAPIService {
    if (!PayoutAPIService.instance) {
      PayoutAPIService.instance = new PayoutAPIService();
    }
    return PayoutAPIService.instance;
  }
  
  // ==========================================
  // EVENT SUBSCRIPTION
  // ==========================================
  
  /**
   * Subscribe to notification events
   */
  onNotification(callback: (msg: NotificationMessage) => void): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }
  
  /**
   * Subscribe to status change events
   */
  onStatusChange(callback: (request: PayoutRequest) => void): () => void {
    this.statusChangeCallbacks.add(callback);
    return () => this.statusChangeCallbacks.delete(callback);
  }
  
  /**
   * Emit notification to all subscribers
   */
  private notify(msg: Omit<NotificationMessage, 'id' | 'timestamp'>) {
    const notification: NotificationMessage = {
      ...msg,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      duration: msg.autoHide ? 5000 : undefined
    };
    
    this.notificationCallbacks.forEach(cb => cb(notification));
  }
  
  /**
   * Emit status change to all subscribers
   */
  private emitStatusChange(request: PayoutRequest) {
    this.statusChangeCallbacks.forEach(cb => cb(request));
  }
  
  // ==========================================
  // STORAGE OPERATIONS
  // ==========================================
  
  private saveRequest(request: PayoutRequest, isPublic: boolean = false) {
    const key = isPublic 
      ? this.STORAGE_KEYS.PUBLIC_REQUESTS 
      : this.STORAGE_KEYS.ADMIN_REQUESTS;
    
    const existing = this.getRequests(isPublic);
    const updated = [request, ...existing.filter(r => r.id !== request.id)];
    
    localStorage.setItem(key, JSON.stringify(updated));
  }
  
  private getRequests(isPublic: boolean = false): PayoutRequest[] {
    const key = isPublic 
      ? this.STORAGE_KEYS.PUBLIC_REQUESTS 
      : this.STORAGE_KEYS.ADMIN_REQUESTS;
    
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }
  
  private saveTransaction(transaction: PayoutTransaction) {
    try {
      const existing = JSON.parse(
        localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS) || '[]'
      );
      
      localStorage.setItem(
        this.STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify([transaction, ...existing])
      );
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  }
  
  // ==========================================
  // 1. CREATE PAYOUT REQUEST (Influencer)
  // ==========================================
  
  /**
   * Create a new payout request
   * Called by influencer from public page
   */
  async createPayoutRequest(data: {
    amount: number;
    pendingBalance: number;
    couponCode: string;
    influencerName: string;
    influencerEmail: string;
    influencerMobile: string;
    paymentMethod: PaymentMethod;
    paymentDetails: PayoutRequest['paymentDetails'];
  }): Promise<{ success: boolean; requestId?: string; error?: string }> {
    
    // Simulate API delay
    await this.delay(800);
    
    // Validation
    if (data.amount < 100) {
      return { success: false, error: 'Minimum withdrawal amount is ₹100' };
    }
    
    if (data.amount > data.pendingBalance) {
      return { success: false, error: 'Amount exceeds pending balance' };
    }
    
    if (data.paymentMethod === 'UPI' && !data.paymentDetails.upiId) {
      return { success: false, error: 'UPI ID is required' };
    }
    
    if (data.paymentMethod === 'BANK_TRANSFER' && 
        (!data.paymentDetails.bankAccount || !data.paymentDetails.bankIfsc)) {
      return { success: false, error: 'Bank details are incomplete' };
    }
    
    // Create request
    const request: PayoutRequest = {
      id: `WDR-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      amount: data.amount,
      pendingAtRequest: data.pendingBalance,
      status: 'PENDING',
      couponCode: data.couponCode,
      influencerName: data.influencerName,
      influencerEmail: data.influencerEmail,
      influencerMobile: data.influencerMobile,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
    };
    
    // Save to both storages
    this.saveRequest(request, false); // Admin storage
    this.saveRequest(request, true);  // Public storage
    
    // Notify influencer
    this.notify({
      type: 'SUCCESS',
      title: 'Payout Request Submitted',
      message: `Your withdrawal request for ₹${data.amount.toLocaleString()} has been sent to admin for approval.`,
      autoHide: true,
    });
    
    // Emit status change
    this.emitStatusChange(request);
    
    return { success: true, requestId: request.id };
  }
  
  // ==========================================
  // 2. ADMIN APPROVE REQUEST
  // ==========================================
  
  /**
   * Admin approves payout request
   * Triggers payment gateway processing
   */
  async approvePayoutRequest(
    requestId: string,
    adminName: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> {
    
    // Get request
    const requests = this.getRequests(false);
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    
    if (request.status !== 'PENDING') {
      return { success: false, error: 'Request already processed' };
    }
    
    // Update to ADMIN_APPROVED
    const approvedRequest: PayoutRequest = {
      ...request,
      status: 'ADMIN_APPROVED',
      adminApprovedAt: new Date().toISOString(),
      adminApprovedBy: adminName
    };
    
    this.saveRequest(approvedRequest, false);
    this.saveRequest(approvedRequest, true);
    
    // Notify influencer
    this.notify({
      type: 'INFO',
      title: 'Request Approved',
      message: `Your payout request for ₹${request.amount.toLocaleString()} has been approved by admin. Processing payment...`,
      autoHide: true,
    });
    
    this.emitStatusChange(approvedRequest);
    
    // Start payment processing (async - don't wait)
    this.processPaymentGateway(approvedRequest);
    
    return { success: true };
  }
  
  // ==========================================
  // 3. PAYMENT GATEWAY PROCESSING
  // ==========================================
  
  /**
   * Send to payment gateway and handle response
   * This runs asynchronously after admin approval
   */
  private async processPaymentGateway(request: PayoutRequest) {
    
    // Update status to PROCESSING
    const processingRequest: PayoutRequest = {
      ...request,
      status: 'PROCESSING',
      processingStartedAt: new Date().toISOString()
    };
    
    this.saveRequest(processingRequest, false);
    this.saveRequest(processingRequest, true);
    
    // Notify influencer
    this.notify({
      type: 'INFO',
      title: 'Payment Processing',
      message: `Payment of ₹${request.amount.toLocaleString()} is being processed by payment gateway. This may take a few moments.`,
      autoHide: false,
    });
    
    this.emitStatusChange(processingRequest);
    
    try {
      // Call payment gateway
      const result = await PaymentGatewaySimulator.processPayment(request);
      
      if (result.success) {
        // SUCCESS
        await this.handlePaymentSuccess(processingRequest, result.transactionId!);
      } else {
        // FAILURE
        await this.handlePaymentFailure(processingRequest, result.error!);
      }
      
    } catch (error: any) {
      // Exception during processing
      await this.handlePaymentFailure(
        processingRequest, 
        error.message || 'Unknown error occurred'
      );
    }
  }
  
  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(request: PayoutRequest, transactionId: string) {
    
    const completedRequest: PayoutRequest = {
      ...request,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      transactionId: transactionId,
      gatewayResponse: {
        success: true,
        transactionId,
        timestamp: new Date().toISOString()
      }
    };
    
    this.saveRequest(completedRequest, false);
    this.saveRequest(completedRequest, true);
    
    // Save transaction history
    this.saveTransaction({
      id: `PB-${completedRequest.id}`,
      date: completedRequest.completedAt!,
      amount: completedRequest.amount,
      status: 'COMPLETED',
      method: completedRequest.paymentMethod,
      transactionId: transactionId,
      requestId: completedRequest.id
    });
    
    // Notify influencer
    this.notify({
      type: 'SUCCESS',
      title: 'Payment Completed',
      message: `₹${request.amount.toLocaleString()} has been successfully transferred to your ${request.paymentMethod === 'UPI' ? 'UPI ID' : 'bank account'}. Transaction ID: ${transactionId}`,
      autoHide: true,
      duration: 10000
    });
    
    this.emitStatusChange(completedRequest);
  }
  
  /**
   * Handle payment failure
   */
  private async handlePaymentFailure(request: PayoutRequest, errorMessage: string) {
    
    const failedRequest: PayoutRequest = {
      ...request,
      status: 'FAILED',
      failedAt: new Date().toISOString(),
      failureReason: errorMessage,
      gatewayResponse: {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }
    };
    
    this.saveRequest(failedRequest, false);
    this.saveRequest(failedRequest, true);
    
    // Save transaction history
    this.saveTransaction({
      id: `PB-${failedRequest.id}`,
      date: failedRequest.failedAt!,
      amount: failedRequest.amount,
      status: 'FAILED',
      method: failedRequest.paymentMethod,
      requestId: failedRequest.id
    });
    
    // Notify influencer
    this.notify({
      type: 'ERROR',
      title: 'Payment Failed',
      message: `Payment of ₹${request.amount.toLocaleString()} failed. Reason: ${errorMessage}. Please contact support or submit a new request.`,
      autoHide: false,
    });
    
    this.emitStatusChange(failedRequest);
  }
  
  // ==========================================
  // 4. ADMIN REJECT REQUEST
  // ==========================================
  
  /**
   * Admin rejects payout request
   */
  async rejectPayoutRequest(
    requestId: string,
    reason: string,
    adminName: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> {
    
    const requests = this.getRequests(false);
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    
    if (request.status !== 'PENDING') {
      return { success: false, error: 'Request already processed' };
    }
    
    const rejectedRequest: PayoutRequest = {
      ...request,
      status: 'REJECTED',
      rejectionReason: reason,
      rejectedBy: adminName,
      rejectedAt: new Date().toISOString()
    };
    
    this.saveRequest(rejectedRequest, false);
    this.saveRequest(rejectedRequest, true);
    
    // Notify influencer
    this.notify({
      type: 'ERROR',
      title: 'Request Rejected',
      message: `Your payout request for ₹${request.amount.toLocaleString()} was rejected. Reason: ${reason}`,
      autoHide: false,
    });
    
    this.emitStatusChange(rejectedRequest);
    
    return { success: true };
  }
  
  // ==========================================
  // QUERY METHODS
  // ==========================================
  
  /**
   * Get all requests for a specific coupon
   */
  getRequestsByCoupon(couponCode: string, isPublic: boolean = false): PayoutRequest[] {
    return this.getRequests(isPublic).filter(r => r.couponCode === couponCode);
  }
  
  /**
   * Get request by ID
   */
  getRequestById(requestId: string, isPublic: boolean = false): PayoutRequest | null {
    return this.getRequests(isPublic).find(r => r.id === requestId) || null;
  }
  
  /**
   * Get all pending requests (for admin)
   */
  getPendingRequests(): PayoutRequest[] {
    return this.getRequests(false).filter(r => r.status === 'PENDING');
  }
  
  /**
   * Get payout transaction history
   */
  getTransactionHistory(): PayoutTransaction[] {
    try {
      return JSON.parse(
        localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS) || '[]'
      );
    } catch {
      return [];
    }
  }
  
  /**
   * Calculate commission stats for a coupon
   */
  calculateCommissionStats(
    couponCode: string,
    totalEarned: number
  ): CommissionUpdate {
    const requests = this.getRequestsByCoupon(couponCode, false);
    
    // Only COMPLETED requests count as paid out
    const paidOut = requests
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const pendingPayout = Math.max(totalEarned - paidOut, 0);
    
    return {
      totalEarned,
      pendingPayout,
      paidOut,
      totalBookings: 0 // This should come from redemptions
    };
  }
  
  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Clear all data (for testing)
   */
  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const payoutAPI = PayoutAPIService.getInstance();