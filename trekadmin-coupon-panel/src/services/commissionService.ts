import { Redemption, Coupon, CommissionStatus } from '../types';

/**
 * Commission Service - Business logic for commission calculations
 */
export class CommissionService {
  /**
   * Calculate commission amount based on coupon configuration
   */
  static calculateCommission(
    redemption: Redemption,
    coupon: Coupon
  ): { amount: number; rate: string; base: number } {
    if (coupon.scope !== 'INFLUENCER' || !coupon.config.commissionType) {
      return { amount: 0, rate: '-', base: 0 };
    }

    // Calculate base amount
    let base = 0;
    const bookingAmount = redemption.bookingAmount;
    const discountAmount = redemption.discountAmount;

    switch (coupon.config.commissionBasis) {
      case 'BOOKING_BEFORE_DISCOUNT':
        base = bookingAmount;
        break;
      case 'BOOKING_AFTER_DISCOUNT':
        base = bookingAmount - discountAmount;
        break;
      case 'DISCOUNT_AMOUNT':
        base = discountAmount;
        break;
      default:
        base = bookingAmount;
    }

    // Calculate commission amount
    let amount = 0;
    let rate = '-';

    if (coupon.config.commissionType === 'FLAT') {
      amount = coupon.config.commissionValue || 0;
      rate = `₹${amount}`;
    } else if (coupon.config.commissionType === 'PERCENTAGE') {
      amount = Math.floor(base * ((coupon.config.commissionValue || 0) / 100));
      rate = `${coupon.config.commissionValue}%`;
    }

    return { amount, rate, base };
  }

  /**
   * Determine commission status based on time and booking status
   */
  static getCommissionStatus(
    redemption: Redemption,
    hoursSinceBooking: number
  ): CommissionStatus {
    if (redemption.status === 'CANCELLED') {
      return 'REVERSED';
    }

    if (redemption.commissionStatus === 'PAID') {
      return 'PAID';
    }

    // High-risk bookings (>40k) stay pending for manual review
    if (redemption.bookingAmount > 40000 && hoursSinceBooking < 48) {
      return 'PENDING';
    }

    // After 24 hours, move to payable
    if (hoursSinceBooking > 24) {
      return 'PAYABLE';
    }

    return 'PENDING';
  }

  /**
   * Check if commission should be paid out (Wednesday payout cycle)
   */
  static shouldPayOut(): boolean {
    return new Date().getDay() === 3; // Wednesday
  }

  /**
   * Get commission status color
   */
  static getStatusColor(status: CommissionStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PAYABLE':
        return 'bg-blue-100 text-blue-700';
      case 'PAID':
        return 'bg-emerald-100 text-emerald-700';
      case 'REVERSED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  /**
   * Calculate total commission for a set of redemptions
   */
  static calculateTotalCommission(redemptions: Redemption[]): number {
    return redemptions.reduce((total, r) => {
      if (r.commissionStatus === 'PAID' || r.commissionStatus === 'PAYABLE') {
        return total + (r.commissionAmount || 0);
      }
      return total;
    }, 0);
  }
}
