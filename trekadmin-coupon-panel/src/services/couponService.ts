import { Coupon, CouponStatus } from '../types';

/**
 * Coupon Service - Business logic for coupon operations
 */
export class CouponService {
  /**
   * Validate coupon data before creation/update
   */
  static validateCoupon(coupon: Partial<Coupon>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!coupon.code || coupon.code.trim().length === 0) {
      errors.push('Coupon code is required');
    }

    if (!coupon.description || coupon.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!coupon.scope) {
      errors.push('Coupon scope is required');
    }

    if (!coupon.mode) {
      errors.push('Discount mode is required');
    }

    if (!coupon.validFrom) {
      errors.push('Valid from date is required');
    }

    if (coupon.config) {
      if (coupon.config.discountValue === undefined || coupon.config.discountValue <= 0) {
        errors.push('Discount value must be greater than 0');
      }

      if (coupon.mode === 'PERCENTAGE' && coupon.config.discountValue > 100) {
        errors.push('Percentage discount cannot exceed 100%');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate discount amount based on coupon configuration
   */
  static calculateDiscount(coupon: Coupon, bookingAmount: number): number {
    if (coupon.mode === 'FLAT') {
      return coupon.config.discountValue;
    } else if (coupon.mode === 'PERCENTAGE') {
      const discount = Math.floor(bookingAmount * (coupon.config.discountValue / 100));
      if (coupon.config.maxDiscount && discount > coupon.config.maxDiscount) {
        return coupon.config.maxDiscount;
      }
      return discount;
    }
    return 0;
  }

  /**
   * Check if coupon is expired
   */
  static isExpired(coupon: Coupon): boolean {
    if (!coupon.validTill) return false;
    return new Date(coupon.validTill) < new Date();
  }

  /**
   * Check if coupon is active and usable
   */
  static isUsable(coupon: Coupon): boolean {
    if (coupon.status !== 'ACTIVE') return false;
    if (this.isExpired(coupon)) return false;
    if (coupon.totalUsageLimit > 0 && coupon.usageCount >= coupon.totalUsageLimit) return false;
    return true;
  }

  /**
   * Get coupon status color
   */
  static getStatusColor(status: CouponStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-700';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-700';
      case 'EXPIRED':
        return 'bg-amber-100 text-amber-700';
      case 'DELETED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  /**
   * Get scope color
   */
  static getScopeColor(scope: Coupon['scope']): string {
    switch (scope) {
      case 'PLATFORM':
        return 'bg-purple-100 text-purple-700';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-700';
      case 'SPECIAL':
        return 'bg-orange-100 text-orange-700';
      case 'PREMIUM':
        return 'bg-amber-100 text-amber-700';
      case 'INFLUENCER':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format datetime for display
   */
  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}
