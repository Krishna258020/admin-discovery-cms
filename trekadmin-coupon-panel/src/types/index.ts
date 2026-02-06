import React from 'react';

/* =======================
   SHARED / ENUMS
======================= */

export type Tier = 'GOLD' | 'PLATINUM' | 'BOTH';

export type BadgeStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DELETED';

export type TimeFilter =
  | 'ALL'
  | 'THIS MONTH'
  | 'LAST MONTH'
  | 'THIS YEAR'
  | 'LAST YEAR'
  | 'CUSTOM';

export type CouponScope =
  | 'PLATFORM'
  | 'NORMAL'
  | 'SPECIAL'
  | 'PREMIUM'
  | 'INFLUENCER';

export type CouponStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'INACTIVE'
  | 'EXPIRED'
  | 'DELETED';

export type DiscountMode = string;

/* =======================
   BADGE SYSTEM
======================= */

export type GradientDirection =
  | 'to right' | 'to left' | 'to top' | 'to bottom'
  | 'to top right' | 'to bottom right' | 'to bottom left' | 'to top left'
  | '45deg' | '90deg' | '135deg' | '180deg' | '225deg' | '270deg' | '315deg';

export interface BadgeStyling {
  bgType: 'solid' | 'gradient';
  bgColor1: string;
  bgColor1Opacity: number;

  bgColor2?: string;
  bgColor2Opacity?: number;
  gradientDirection?: GradientDirection;

  bgOpacity: number;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  letterSpacing?: string;
  bgPattern?: 'none' | 'dots' | 'stripes' | 'glass';
  patternOpacity?: number;

  containerAnimation: string;
  textAnimation: string;
}

export interface UsageLimit {
  maxLifetime: number;
  maxPerMonth: number;
}

export interface BadgeHistoryItem {
  timestamp: string;
  performerName: string;
  performerId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;

  tier: Tier;
  status: BadgeStatus;
  styling: BadgeStyling;

  goldLimits: UsageLimit;
  platinumLimits: UsageLimit;

  expiryDate: string;

  createdAt: string;
  createdById: string;
  creatorName: string;

  deletedAt?: string;
  lastActionAt?: string;
  lastActionBy?: string;
  lastActionById?: string;

  usageCount: {
    gold: number;
    platinum: number;
  };

  history?: BadgeHistoryItem[];
}

/* =======================
   DISCOUNT MODES
======================= */

export interface DiscountModeConfig {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
}

/* =======================
   VENDOR & SOCIAL
======================= */

export interface Vendor {
  id: string;
  name: string;
  tier: 'STANDARD' | 'GOLD' | 'PLATINUM';
  region: string;
  credibilityScore: number;
  performanceRating: number;
  usageCount: number; // For analytics
}

export interface VendorUsage {
  id: string;
  name: string;
  tier: Tier;
  credibilityScore: number;
  usageCount: number;
}

export interface TrekUsage {
  id: string;
  name: string;
  assignedAt: string;
  departure: string;
  arrival: string;
  bookings: number;
  totalCapacity: number;
}

export type SocialPlatform =
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'FACEBOOK'
  | 'TWITTER';

export interface SocialProfile {
  platform: SocialPlatform;
  handle: string;
  url: string;
}

/* =======================
   COMMISSION & PAYOUT
======================= */

export type CommissionBasis =
  | 'BOOKING_BEFORE_DISCOUNT'
  | 'BOOKING_AFTER_DISCOUNT'
  | 'DISCOUNT_AMOUNT';

export type CommissionType =
  | 'PERCENTAGE'
  | 'FLAT'
  | 'TIERED';

export type CommissionStatus =
  | 'PENDING'
  | 'PAYABLE'
  | 'PAID'
  | 'REVERSED';

export interface CommissionSlab {
  from: number;
  to: number | null;
  value: number;
}

export interface PayoutRule {
  releaseOnCompletion: boolean;
  reverseOnCancel: boolean;
  lockInDays: number;
}

/* =======================
   COUPON CONFIG
======================= */

export interface CouponConfig {
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;

  vendorFrequency?: 'MONTHLY' | 'LIFETIME';
  vendorLimit?: number;
  tierTarget?: Tier;
  stackPriority?: number;

  requestedByVendorId?: string;
  requestedByVendorName?: string;

  influencerName?: string;
  influencerMobile?: string;
  influencerEmail?: string;
  influencerAddress?: string;
  influencerSocials?: SocialProfile[];

  commissionBasis?: CommissionBasis;
  commissionType?: CommissionType;
  commissionValue?: number;
  commissionSlabs?: CommissionSlab[];
  payoutRules?: PayoutRule;

  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  upiId?: string;
}

/* =======================
   COUPON
======================= */

export interface Coupon {
  id: string;
  code: string;
  description: string;

  scope: CouponScope;
  status: CouponStatus;
  mode: DiscountMode;

  validFrom: string;
  validTill?: string;

  totalUsageLimit: number;
  usageCount: number;
  userLimit: number;

  autoApply?: boolean;
  targetCondition?: 'NEW_USER' | 'FIRST_BOOKING' | 'MIN_ORDER' | 'NONE';
  targetVendorIds?: string[];

  config: CouponConfig;

  createdAt: string;
  createdBy: string;
}

/* =======================
   VENDOR REQUEST
======================= */

export interface VendorRequest {
  id: string;
  vendorName: string;
  vendorId?: string;
  vendorTier: 'STANDARD' | 'GOLD' | 'PLATINUM';

  requestDate: string;

  requestedCode: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;

  trekId?: string;
  trekName?: string;

  reason: string;
  conditions?: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/* =======================
   AUDIT & CONFIRMATION
======================= */

export type TargetType = 'COUPON' | 'BADGE';

export interface AuditLog {
  id: string;
  timestamp: string;
  action:
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'CONFIG_CHANGE'
  | 'EXPIRE'
  | 'TERMINATE';
  target: string; // Coupon Code or Badge ID
  targetName?: string; // Optional Badge Name
  targetType: TargetType;
  performer: string;
  performerId?: string;
  details: string;
}

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'DANGER' | 'WARNING' | 'INFO' | 'SUCCESS';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

/* =======================
   REDEMPTION & PAYOUT
======================= */

export interface Redemption {
  id: string;
  userId?: string;
  userName: string;

  couponCode: string;
  scope: CouponScope;

  trekName: string;
  trekId: string;

  date: string;
  platform: string;

  discountAmount: number;
  bookingAmount: number;

  vendorName?: string;
  vendorId?: string;
  influencerName?: string;

  status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  bookingRef?: string;

  commissionBaseAmount?: number;
  commissionRate?: string;
  commissionAmount?: number;
  commissionStatus?: CommissionStatus;
  payoutBatchId?: string;
}

export interface PayoutBatch {
  id: string;
  couponCode: string;
  date: string;
  period: string;
  bookingsCount: number;
  totalAmount: number;
  mode: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

/* =======================
   WITHDRAWAL
======================= */

export interface WithdrawalRequest {
  id: string;
  userId?: string;
  couponCode: string;
  influencerName?: string;

  requestedAt: string;
  amount: number;
  pendingAtRequest: number;

  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface CommissionLog {
  id: string;
  timestamp: string;
  action: 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' | 'WITHDRAWAL_REQUESTED';
  amount: number;
  performer: string;
  details: string;
}

/* =======================
   DASHBOARD
======================= */

export interface DashboardStats {
  totalRevenue: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalSavings: number;
}

export interface TrendDataPoint {
  name: string;
  savings: number;
  redemptions: number;
}

/* =======================
   NAVIGATION
======================= */

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  view: string;
}
