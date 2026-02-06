
import { Coupon, Vendor, VendorRequest, AuditLog, DiscountModeConfig, PayoutBatch, Badge, VendorUsage, TrekUsage, BadgeStyling } from './types';

export const DEFAULT_DISCOUNT_MODES: DiscountModeConfig[] = [
  { id: 'PERCENTAGE', label: 'Percentage Off', description: 'Standard % discount', isActive: true, isSystem: true },
  { id: 'FLAT', label: 'Flat Amount Off', description: 'Fixed amount discount', isActive: true, isSystem: true },
  { id: 'GROUP_BOOKING', label: 'Group Discount', description: 'For 3+ trekkers', isActive: true, isSystem: false },
  { id: 'EARLY_BIRD', label: 'Early Bird', description: 'Booking 60+ days ahead', isActive: true, isSystem: false },
  { id: 'SEASONAL', label: 'Seasonal Special', description: 'Monsoon/Winter specific', isActive: true, isSystem: false },
];
export const FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald',
  'Source Sans Pro', 'Raleway', 'PT Sans', 'Merriweather',
  'Nunito', 'Playfair Display', 'Poppins', 'Ubuntu'
];

export const CONTAINER_ANIMATIONS = [
  'none', 'animate-float', 'animate-wiggle', 'animate-bounce-subtle',
  'animate-glow', 'animate-pulse-slow', 'animate-shake', 'animate-tada'
];

export const TEXT_ANIMATIONS = [
  'none', 'uppercase', 'italic', 'underline',
  'font-black', 'tracking-widest', 'animate-pulse'
];

export const FONT_WEIGHTS = [
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'SemiBold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'ExtraBold', value: '800' },
  { label: 'Black', value: '900' }
];

export const LETTER_SPACINGS = [
  { label: 'Tightest', value: 'tracking-tighter' },
  { label: 'Tight', value: 'tracking-tight' },
  { label: 'Normal', value: 'tracking-normal' },
  { label: 'Wide', value: 'tracking-wide' },
  { label: 'Wider', value: 'tracking-wider' },
  { label: 'Widest', value: 'tracking-widest' },
  { label: 'Ultra', value: 'tracking-[0.3em]' }
];

export const PATTERNS = [
  { id: 'none', label: 'No Pattern' },
  { id: 'dots', label: 'Tech Dots' },
  { id: 'stripes', label: 'Speed Stripes' },
  { id: 'glass', label: 'Frosted Glass' }
];

const createStyling = (
  color1: string,
  color2: string,
  anim: string
): BadgeStyling => ({
  bgType: 'gradient',
  bgColor1: color1,
  bgColor1Opacity: 1,
  bgColor2: color2,
  bgColor2Opacity: 0.8,
  gradientDirection: 'to bottom right',
  bgOpacity: 0.9,
  textColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: 14,
  fontWeight: '700',
  letterSpacing: 'tracking-normal',
  bgPattern: 'none',
  patternOpacity: 0.2,
  containerAnimation: anim,
  textAnimation: 'none'
});
/* =======================
   BADGE MASTER MOCK DATA
======================= */

export const MOCK_BADGES: Badge[] = [
  // ACTIVE
  {
    id: 'CTA-882',
    name: 'Summit Pro Explorer',
    description: 'Peak season trek high conversion module.',
    tier: 'BOTH',
    status: 'ACTIVE',
    styling: createStyling('#3b82f6', '#1d4ed8', 'animate-float'),
    goldLimits: { maxLifetime: 50, maxPerMonth: 5 },
    platinumLimits: { maxLifetime: 100, maxPerMonth: 10 },
    expiryDate: '2025-12-31',
    createdAt: '2024-05-15T10:00:00Z',
    createdById: 'ADM-991',
    creatorName: 'John Admin',
    usageCount: { gold: 125, platinum: 88 }
  },
  {
    id: 'CTA-101',
    name: 'Winter Trailblazer',
    description: 'Seasonal Q4 winter expeditions.',
    tier: 'PLATINUM',
    status: 'ACTIVE',
    styling: createStyling('#06b6d4', '#0891b2', 'animate-pulse-slow'),
    goldLimits: { maxLifetime: 0, maxPerMonth: 0 },
    platinumLimits: { maxLifetime: 200, maxPerMonth: 20 },
    expiryDate: '2025-03-20',
    createdAt: '2024-11-01T09:00:00Z',
    createdById: 'ADM-991',
    creatorName: 'John Admin',
    usageCount: { gold: 0, platinum: 412 }
  },

  // INACTIVE
  {
    id: 'CTA-202',
    name: 'Flash Sale Promo',
    description: 'High-intensity limited promo.',
    tier: 'GOLD',
    status: 'INACTIVE',
    styling: createStyling('#f59e0b', '#d97706', 'animate-bounce-subtle'),
    goldLimits: { maxLifetime: 100, maxPerMonth: 50 },
    platinumLimits: { maxLifetime: 0, maxPerMonth: 0 },
    expiryDate: '2024-10-15',
    createdAt: '2024-09-10T14:00:00Z',
    createdById: 'ED-202',
    creatorName: 'Jane Editor',
    usageCount: { gold: 88, platinum: 0 }
  },

  // EXPIRED
  {
    id: 'CTA-303',
    name: 'Legacy Trek Pass',
    description: 'Archived route historical pass.',
    tier: 'BOTH',
    status: 'EXPIRED',
    styling: createStyling('#64748b', '#475569', 'none'),
    goldLimits: { maxLifetime: 10, maxPerMonth: 1 },
    platinumLimits: { maxLifetime: 50, maxPerMonth: 5 },
    expiryDate: '2024-01-01',
    createdAt: '2023-05-20T10:00:00Z',
    createdById: 'ADM-991',
    creatorName: 'John Admin',
    usageCount: { gold: 12, platinum: 48 }
  },

  // DELETED
  {
    id: 'CTA-404',
    name: 'Testing Module X',
    description: 'Experimental design prototype.',
    tier: 'BOTH',
    status: 'DELETED',
    deletedAt: '2024-12-01T16:00:00Z',
    styling: createStyling('#ec4899', '#db2777', 'animate-shake'),
    goldLimits: { maxLifetime: 5, maxPerMonth: 1 },
    platinumLimits: { maxLifetime: 10, maxPerMonth: 2 },
    expiryDate: '2025-01-01',
    createdAt: '2024-11-20T11:00:00Z',
    createdById: 'ED-202',
    creatorName: 'Jane Editor',
    usageCount: { gold: 2, platinum: 1 }
  }
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Himalayan Explorers', tier: 'PLATINUM', region: 'Nepal', credibilityScore: 98, performanceRating: 4.9, usageCount: 45 },
  { id: 'v2', name: 'Alpine Treks', tier: 'GOLD', region: 'Alps', credibilityScore: 85, performanceRating: 4.5, usageCount: 32 },
  { id: 'v3', name: 'Desert Nomads', tier: 'STANDARD', region: 'Sahara', credibilityScore: 70, performanceRating: 4.0, usageCount: 18 },
  { id: 'v4', name: 'Jungle Walks', tier: 'STANDARD', region: 'Amazon', credibilityScore: 65, performanceRating: 3.8, usageCount: 12 },
  { id: 'v5', name: 'Peak Performance', tier: 'PLATINUM', region: 'Rockies', credibilityScore: 95, performanceRating: 4.8, usageCount: 56 },
  { id: 'v6', name: 'Sherpa Guide Co', tier: 'GOLD', region: 'Sikkim', credibilityScore: 88, performanceRating: 4.6, usageCount: 29 },
  { id: 'v7', name: 'Sahyadri Rangers', tier: 'STANDARD', region: 'Maharashtra', credibilityScore: 72, performanceRating: 4.1, usageCount: 15 },
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l1', timestamp: new Date().toISOString(), action: 'CREATE', target: 'SUMMER2025', targetType: 'COUPON', performer: 'System', details: 'Initial system boot' }
];

export const MOCK_PAYOUTS: PayoutBatch[] = [
  { id: 'PB_001', date: '2025-04-01', period: '01-31 Mar 2025', bookingsCount: 45, totalAmount: 12500, mode: 'Bank Transfer', status: 'COMPLETED' },
  { id: 'PB_002', date: '2025-05-01', period: '01-30 Apr 2025', bookingsCount: 32, totalAmount: 9800, mode: 'UPI', status: 'PROCESSING' }
];

export const MOCK_COUPONS: Coupon[] = [
  // --- PLATFORM COUPONS ---
  {
    id: 'c1',
    code: 'WELCOME2025',
    description: '20% off first booking',
    scope: 'PLATFORM',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-01-01T00:00',
    totalUsageLimit: 5000,
    usageCount: 142,
    userLimit: 1,
    targetCondition: 'NEW_USER',
    config: { discountValue: 20, maxDiscount: 1000 },
    createdAt: '2024-12-20',
    createdBy: 'Rahul Sharma',
  },
  {
    id: 'c2',
    code: 'APP_DEAL_500',
    description: 'Flat 500 off on App',
    scope: 'PLATFORM',
    status: 'ACTIVE',
    mode: 'FLAT',
    validFrom: '2025-01-01T00:00',
    totalUsageLimit: 2000,
    usageCount: 89,
    userLimit: 1,
    config: { discountValue: 500 },
    createdAt: '2025-01-01',
    createdBy: 'System',
  },
  {
    id: 'c7',
    code: 'SUMMER_BLAST',
    description: 'Hot summer deals',
    scope: 'PLATFORM',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-04-01T00:00',
    totalUsageLimit: 300,
    usageCount: 45,
    userLimit: 1,
    config: { discountValue: 12 },
    createdAt: '2025-03-15',
    createdBy: 'Admin',
  },
  {
    id: 'c8',
    code: 'FLASH_SALE_24',
    description: '24 Hour Flash Sale',
    scope: 'PLATFORM',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-05-01T00:00',
    totalUsageLimit: 1000,
    usageCount: 312,
    userLimit: 1,
    config: { discountValue: 25, maxDiscount: 2000 },
    createdAt: '2025-05-01',
    createdBy: 'System',
  },

  // --- PARTNER (NORMAL) COUPONS ---
  {
    id: 'c3',
    code: 'VENDOR_MTH_5',
    description: 'Partner monthly allowance',
    scope: 'NORMAL',
    status: 'ACTIVE',
    mode: 'FLAT',
    validFrom: '2025-01-01T00:00',
    totalUsageLimit: 10000,
    usageCount: 125,
    userLimit: 5,
    config: { discountValue: 500, vendorFrequency: 'MONTHLY' },
    createdAt: '2024-12-25',
    createdBy: 'System',
  },
  {
    id: 'c9',
    code: 'PARTNER_WEEKEND',
    description: 'Weekend Trek Discount',
    scope: 'NORMAL',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-02-01T00:00',
    totalUsageLimit: 500,
    usageCount: 67,
    userLimit: 1,
    config: { discountValue: 10 },
    createdAt: '2025-01-30',
    createdBy: 'Admin',
  },
  {
    id: 'c10',
    code: 'TREK_FEST',
    description: 'Annual Trekking Festival',
    scope: 'NORMAL',
    status: 'ACTIVE',
    mode: 'FLAT',
    validFrom: '2025-03-01T00:00',
    totalUsageLimit: 2000,
    usageCount: 450,
    userLimit: 2,
    config: { discountValue: 1000 },
    createdAt: '2025-02-28',
    createdBy: 'Sarah Jenkins',
  },
  {
    id: 'c11',
    code: 'HIMALAYA_GENERIC',
    description: 'General Himalaya Promo',
    scope: 'NORMAL',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-01-01T00:00',
    totalUsageLimit: 5000,
    usageCount: 890,
    userLimit: 1,
    config: { discountValue: 5 },
    createdAt: '2024-12-15',
    createdBy: 'System',
  },

  // --- SPECIAL COUPONS ---
  {
    id: 'c4',
    code: 'HIMALAYA_VIP',
    description: 'Special deal for V1',
    scope: 'SPECIAL',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-02-01T00:00',
    totalUsageLimit: 100,
    usageCount: 23,
    userLimit: 1,
    targetVendorIds: ['v1'],
    config: { discountValue: 15 },
    createdAt: '2025-01-20',
    createdBy: 'Rahul Sharma',
  },
  {
    id: 'c12',
    code: 'DESERT_STORM',
    description: 'Sahara Exclusive',
    scope: 'SPECIAL',
    status: 'ACTIVE',
    mode: 'FLAT',
    validFrom: '2025-04-01T00:00',
    totalUsageLimit: 50,
    usageCount: 12,
    userLimit: 1,
    targetVendorIds: ['v3'],
    config: { discountValue: 2000 },
    createdAt: '2025-03-25',
    createdBy: 'Admin',
  },
  {
    id: 'c13',
    code: 'JUNGLE_SAFARI',
    description: 'Amazon Rainforest Promo',
    scope: 'SPECIAL',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-05-01T00:00',
    totalUsageLimit: 200,
    usageCount: 45,
    userLimit: 1,
    targetVendorIds: ['v4'],
    config: { discountValue: 18 },
    createdAt: '2025-04-15',
    createdBy: 'Admin',
  },

  // --- PREMIUM COUPONS ---
  {
    id: 'c5',
    code: 'PLATINUM_PERK',
    description: 'Exclusive Platinum Discount',
    scope: 'PREMIUM',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-01-01T00:00',
    totalUsageLimit: 500,
    usageCount: 50,
    userLimit: 1,
    config: { discountValue: 25, tierTarget: 'PLATINUM' },
    createdAt: '2025-01-01',
    createdBy: 'Admin',
  },
  {
    id: 'c14',
    code: 'GOLD_RUSH',
    description: 'Gold Tier Bonanza',
    scope: 'PREMIUM',
    status: 'ACTIVE',
    mode: 'FLAT',
    validFrom: '2025-02-15T00:00',
    totalUsageLimit: 300,
    usageCount: 120,
    userLimit: 1,
    config: { discountValue: 1500, tierTarget: 'GOLD' },
    createdAt: '2025-02-10',
    createdBy: 'System',
  },
  {
    id: 'c15',
    code: 'ELITE_CLUB',
    description: 'High Value Members',
    scope: 'PREMIUM',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-01-01T00:00',
    totalUsageLimit: 100,
    usageCount: 15,
    userLimit: 1,
    config: { discountValue: 30, tierTarget: 'BOTH' },
    createdAt: '2025-01-01',
    createdBy: 'Rahul Sharma',
  },

  // --- INFLUENCER COUPONS ---
  {
    id: 'c6',
    code: 'TRAVELLER_TOM',
    description: 'Influencer Code',
    scope: 'INFLUENCER',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-03-01T00:00',
    totalUsageLimit: 1000,
    usageCount: 89,
    userLimit: 1,
    config: {
      discountValue: 10,
      influencerName: 'Tom Traveller',
      influencerMobile: '+91 9876543210',
      influencerEmail: 'tom@travel.com',
      influencerSocials: [{ platform: 'INSTAGRAM', handle: '@tomtravels', url: 'https://instagram.com/tomtravels' }],

      // Commission Config
      commissionBasis: 'BOOKING_BEFORE_DISCOUNT',
      commissionType: 'PERCENTAGE',
      commissionValue: 5,
      payoutRules: { releaseOnCompletion: true, reverseOnCancel: true, lockInDays: 7 },

      bankName: 'HDFC Bank',
      bankAccountHolder: 'Tom Thomas',
      bankAccountNumber: '1234567890',
      bankIfsc: 'HDFC0001234'
    },
    createdAt: '2025-02-28',
    createdBy: 'Priya Patel',
  },
  {
    id: 'c16',
    code: 'HIKING_SAM',
    description: 'Sam Adventures',
    scope: 'INFLUENCER',
    status: 'ACTIVE',
    mode: 'PERCENTAGE',
    validFrom: '2025-04-01T00:00',
    totalUsageLimit: 2000,
    usageCount: 412,
    userLimit: 1,
    config: {
      discountValue: 12,
      influencerName: 'Sam Hikes',
      influencerSocials: [{ platform: 'YOUTUBE', handle: '@samhikes', url: 'https://youtube.com/@samhikes' }],

      // Commission Config
      commissionBasis: 'BOOKING_AFTER_DISCOUNT',
      commissionType: 'FLAT',
      commissionValue: 200,
      payoutRules: { releaseOnCompletion: true, reverseOnCancel: true, lockInDays: 15 },

      upiId: 'samhikes@okicici'
    },
    createdAt: '2025-03-15',
    createdBy: 'Priya Patel',
  },
  {
    id: 'c17',
    code: 'MOUNTAIN_MAMA',
    description: 'Moms who trek',
    scope: 'INFLUENCER',
    status: 'ACTIVE',
    mode: 'FLAT',
    validFrom: '2025-03-01T00:00',
    totalUsageLimit: 500,
    usageCount: 67,
    userLimit: 1,
    config: {
      discountValue: 600,
      influencerName: 'Mountain Mama',
      influencerSocials: [{ platform: 'INSTAGRAM', handle: '@mountainmama', url: 'https://instagram.com/mountainmama' }],

      // Commission Config
      commissionBasis: 'DISCOUNT_AMOUNT',
      commissionType: 'PERCENTAGE',
      commissionValue: 50, // 50% of discount given
      payoutRules: { releaseOnCompletion: false, reverseOnCancel: true, lockInDays: 0 },

      bankName: 'SBI',
      bankAccountHolder: 'Mama Treks',
      bankAccountNumber: '987654321',
      bankIfsc: 'SBIN0004567'
    },
    createdAt: '2025-02-20',
    createdBy: 'Admin',
  },
];

export const MOCK_REQUESTS: VendorRequest[] = [
  {
    id: 'r1',
    vendorName: 'Alpine Treks',
    vendorId: 'v2',
    vendorTier: 'GOLD',
    requestedCode: 'ALPINE_SUMMER',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    reason: 'Launch promo',
    conditions: '30 days advance',
    status: 'PENDING',
    requestDate: '2025-05-20',
    trekName: 'Roopkund Trek',
    trekId: 't_roopkund'
  }
];
