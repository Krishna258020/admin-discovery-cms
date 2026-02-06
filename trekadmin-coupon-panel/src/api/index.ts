// api/index.ts
// Barrel export file - makes imports cleaner

// Export all API modules
export { couponApi } from './couponApi';
export { badgeApi } from './badgeApi';
export { redemptionApi } from './redemptionApi';
export { vendorApi } from './vendorApi';
export { withdrawalApi, commissionApi, payoutApi } from './withdrawalApi';
export { auditApi, settingsApi } from './auditApi';
export { dashboardApi } from './dashboardApi';

// Export everything from PayoutAPI
export * from './PayoutAPI';

// Export everything from usePayoutAPI
export * from './usePayoutAPI';