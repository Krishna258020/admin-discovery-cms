/**
 * Validation Service - Centralized validation logic
 */
export class ValidationService {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Indian format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Validate IFSC code
   */
  static isValidIFSC(ifsc: string): boolean {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  }

  /**
   * Validate UPI ID
   */
  static isValidUPI(upi: string): boolean {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upi);
  }

  /**
   * Validate coupon code format
   */
  static isValidCouponCode(code: string): boolean {
    // Alphanumeric, 4-20 characters, uppercase
    const codeRegex = /^[A-Z0-9]{4,20}$/;
    return codeRegex.test(code);
  }

  /**
   * Validate date range
   */
  static isValidDateRange(from: string, to?: string): boolean {
    const fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) return false;

    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) return false;
      return fromDate < toDate;
    }

    return true;
  }

  /**
   * Validate positive number
   */
  static isPositiveNumber(value: number): boolean {
    return typeof value === 'number' && value > 0 && !isNaN(value);
  }

  /**
   * Validate percentage (0-100)
   */
  static isValidPercentage(value: number): boolean {
    return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value);
  }
}
