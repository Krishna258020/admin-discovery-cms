/**
 * Date Utilities - Helper functions for date operations
 */
export class DateUtils {
  /**
   * Check if today is Wednesday
   */
  static isWednesday(): boolean {
    return new Date().getDay() === 3;
  }

  /**
   * Calculate hours between two dates
   */
  static hoursBetween(date1: string, date2: string): number {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    return Math.abs(d1 - d2) / 36e5; // 36e5 = 3600000 ms = 1 hour
  }

  /**
   * Format date to readable string
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format datetime to readable string
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
   * Check if date is in the past
   */
  static isPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  /**
   * Get date N days from now
   */
  static addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * Get ISO string for date
   */
  static toISOString(date: Date = new Date()): string {
    return date.toISOString();
  }

  /**
   * Check if date is within range
   */
  static isInRange(date: string, from: string, to: string): boolean {
    const d = new Date(date);
    const f = new Date(from);
    const t = new Date(to);
    return d >= f && d <= t;
  }
}
