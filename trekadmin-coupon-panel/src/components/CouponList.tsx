import React, { useState, useMemo, useEffect } from 'react';
import {
  Edit2, Eye, Trash2, Play, Pause, Search, Plus,
  Loader2, IndianRupee, ChevronRight, X, ShieldAlert, Zap, Users, Check, Calendar, Clock,
  Copy, AlertCircle, RefreshCcw, ExternalLink, Ticket, MapPin, Star, ArrowRight, Percent, Briefcase,
  AlertTriangle, ShieldX, Info, BarChart3, TrendingUp, CalendarDays, XCircle, Ban
} from 'lucide-react';
import { Coupon, CouponStatus, Redemption } from '../types';

interface CouponListProps {
  coupons: Coupon[];
  redemptions?: Redemption[];
  scope: string;
  onEdit: (coupon: Coupon) => void;
  onView: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: CouponStatus) => void;
  onCreate: () => void;
}

type HistoryPeriod = 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'LAST_YEAR' | 'CUSTOM';

// Alert Type Definitions based on the scenario document
type AlertSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

interface SystemAlert {
  id: string;
  code: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  rootCause: string;
  affectedEntity: string; // coupon code, user ID, booking ref, etc.
  timestamp: Date;
  metadata?: Record<string, any>;
  redemptionRef?: Redemption;
}

const CouponList: React.FC<CouponListProps> = ({ coupons, redemptions = [], scope, onEdit, onView, onDelete, onToggleStatus, onCreate }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [search, setSearch] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [txnPeriod, setTxnPeriod] = useState<HistoryPeriod>('THIS_WEEK');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAlertSeverity, setSelectedAlertSeverity] = useState<AlertSeverity | 'ALL'>('ALL');

  // Custom Date States
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // --- PUBLIC PAGE INTERCEPTOR ---
  const [publicViewCoupon, setPublicViewCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const influencerCode = params.get('previewInfluencer');
    if (influencerCode) {
      const found = coupons.find(c => c.code.toLowerCase() === influencerCode.toLowerCase());
      if (found) setPublicViewCoupon(found);
    }
  }, [coupons]);

  // --- COMPREHENSIVE ALERT DETECTION ENGINE ---
  const systemAlerts = useMemo((): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    const now = new Date();

    // Process each redemption for alerts
    redemptions.forEach(r => {
      const redemptionDate = new Date(r.date);
      const coupon = coupons.find(c => c.code === r.couponCode);

      // CANCEL_001-007: Cancellation-based alerts
      if (r.status === 'CANCELLED') {
        alerts.push({
          id: `CANCEL_${r.bookingRef}_${Date.now()}`,
          code: 'ERR_BOOKING_CANCELLED',
          severity: 'WARNING',
          title: 'Booking Cancelled',
          message: `Booking ${r.bookingRef} was cancelled by user`,
          rootCause: 'User-initiated cancellation within refund window. Coupon remains consumed.',
          affectedEntity: r.couponCode,
          timestamp: redemptionDate,
          metadata: { bookingRef: r.bookingRef, userId: r.userId, discountAmount: r.discountAmount },
          redemptionRef: r
        });
      }

      // COMM_001: Self-redemption detection (Influencer scope)
      if (scope === 'INFLUENCER' && r.commissionStatus === 'REVERSED' && r.status === 'CONFIRMED') {
        alerts.push({
          id: `COMM_001_${r.bookingRef}`,
          code: 'ERR_SELF_REDEMPTION',
          severity: 'CRITICAL',
          title: 'Self-Redemption Detected',
          message: `Influencer ${r.influencerName} attempted self-redemption`,
          rootCause: 'Influencer user ID matches booking user ID. Commission automatically reversed per policy.',
          affectedEntity: r.couponCode,
          timestamp: redemptionDate,
          metadata: { influencerName: r.influencerName, bookingRef: r.bookingRef },
          redemptionRef: r
        });
      }

      // CANCEL_006: Commission reversal after cancellation
      if (scope === 'INFLUENCER' && r.commissionStatus === 'REVERSED' && r.status === 'CANCELLED') {
        alerts.push({
          id: `CANCEL_006_${r.bookingRef}`,
          code: 'INFO_COMMISSION_REVERSED',
          severity: 'INFO',
          title: 'Commission Reversed',
          message: `Commission of ₹${r.commissionAmount} reversed due to booking cancellation`,
          rootCause: 'Booking cancelled before payout cycle end. Commission removed from pending payout.',
          affectedEntity: r.couponCode,
          timestamp: redemptionDate,
          metadata: { commissionAmount: r.commissionAmount, influencerName: r.influencerName },
          redemptionRef: r
        });
      }

      // PAY_001: Payment failure alerts
      if (r.status === 'PENDING' && r.metadata?.paymentStatus === 'FAILED') {
        alerts.push({
          id: `PAY_001_${r.bookingRef}`,
          code: 'WARN_PAYMENT_FAILED_COUPON_LOCKED',
          severity: 'WARNING',
          title: 'Payment Failed - Coupon Reserved',
          message: `Payment failed for ${r.bookingRef}. Coupon locked for retry.`,
          rootCause: 'Payment gateway timeout/failure. Coupon reserved for 15 minutes to prevent abuse.',
          affectedEntity: r.couponCode,
          timestamp: redemptionDate,
          metadata: { bookingRef: r.bookingRef, lockExpiry: new Date(redemptionDate.getTime() + 15 * 60000) },
          redemptionRef: r
        });
      }

      // LIMIT_001-004: Usage limit alerts
      if (coupon && coupon.usageCount >= coupon.totalUsageLimit) {
        const existingAlert = alerts.find(a => a.code === 'ERR_USAGE_LIMIT_EXCEEDED' && a.affectedEntity === coupon.code);
        if (!existingAlert) {
          alerts.push({
            id: `LIMIT_001_${coupon.code}`,
            code: 'ERR_USAGE_LIMIT_EXCEEDED',
            severity: 'ERROR',
            title: 'Usage Limit Reached',
            message: `Coupon ${coupon.code} has reached maximum redemptions (${coupon.totalUsageLimit})`,
            rootCause: 'Total usage limit reached. Further redemption attempts will be blocked.',
            affectedEntity: coupon.code,
            timestamp: now,
            metadata: { totalLimit: coupon.totalUsageLimit, currentUsage: coupon.usageCount }
          });
        }
      }

      // High-value transaction manual verification
      if (r.status === 'PENDING' && r.discountAmount > 5000) {
        alerts.push({
          id: `MANUAL_VERIFY_${r.bookingRef}`,
          code: 'WARN_HIGH_VALUE_PENDING',
          severity: 'WARNING',
          title: 'High-Value Transaction Pending',
          message: `Booking ${r.bookingRef} with discount ₹${r.discountAmount} requires manual verification`,
          rootCause: 'Transaction value exceeds auto-approval threshold. Manual review required.',
          affectedEntity: r.couponCode,
          timestamp: redemptionDate,
          metadata: { amount: r.discountAmount, bookingRef: r.bookingRef },
          redemptionRef: r
        });
      }

      // ATTACK_005: Brute force detection (simulated - would need more context)
      if (r.metadata?.invalidAttempts && r.metadata.invalidAttempts > 10) {
        alerts.push({
          id: `ATTACK_005_${r.userId}`,
          code: 'ERR_RATE_LIMIT_EXCEEDED',
          severity: 'CRITICAL',
          title: 'Brute Force Attack Detected',
          message: `User ${r.userName} exceeded coupon attempt limit`,
          rootCause: 'Multiple invalid coupon attempts detected. Potential brute force attack.',
          affectedEntity: 'SECURITY_SYSTEM',
          timestamp: redemptionDate,
          metadata: { userId: r.userId, attempts: r.metadata.invalidAttempts },
          redemptionRef: r
        });
      }

      // CANCEL_007: Fraudulent booking-cancellation loop
      if (r.metadata?.fraudFlag) {
        alerts.push({
          id: `CANCEL_007_${r.userId}`,
          code: 'ERR_CANCEL_REBOOK_FRAUD',
          severity: 'CRITICAL',
          title: 'Fraudulent Activity Detected',
          message: `Multi-account fraud pattern detected for user ${r.userName}`,
          rootCause: 'User repeatedly booking with first-time coupons from different accounts on same device.',
          affectedEntity: r.couponCode,
          timestamp: redemptionDate,
          metadata: { userId: r.userId, deviceId: r.metadata.deviceId },
          redemptionRef: r
        });
      }

      // VENDOR_005: Vendor account suspended
      if (r.metadata?.vendorSuspended) {
        alerts.push({
          id: `VENDOR_005_${r.vendorName}`,
          code: 'ERR_VENDOR_ACCOUNT_SUSPENDED',
          severity: 'CRITICAL',
          title: 'Vendor Account Suspended',
          message: `Vendor ${r.vendorName} account suspended. Coupons auto-deactivated.`,
          rootCause: 'Vendor violated platform policies. All vendor coupons automatically deactivated.',
          affectedEntity: r.couponCode,
          timestamp: now,
          metadata: { vendorName: r.vendorName, suspensionReason: r.metadata.suspensionReason }
        });
      }
    });

    // Coupon-level alerts
    coupons.forEach(coupon => {
      // Skip if coupon doesn't have valid dates
      if (!coupon.validFrom || !coupon.validUntil) return;

      const validFrom = new Date(coupon.validFrom);
      const validUntil = new Date(coupon.validUntil);

      // DATE_002: Expired coupons still in active state
      if (coupon.status === 'ACTIVE' && now > validUntil) {
        alerts.push({
          id: `DATE_002_${coupon.code}`,
          code: 'ERR_COUPON_EXPIRED',
          severity: 'WARNING',
          title: 'Active Coupon Expired',
          message: `Coupon ${coupon.code} expired but still marked as ACTIVE`,
          rootCause: `Validity ended on ${validUntil.toLocaleDateString()}. Status should be updated to EXPIRED.`,
          affectedEntity: coupon.code,
          timestamp: validUntil,
          metadata: { expiryDate: validUntil }
        });
      }

      // LIMIT_003: Race condition over-redemption
      if (coupon.usageCount > coupon.totalUsageLimit) {
        alerts.push({
          id: `LIMIT_003_${coupon.code}`,
          code: 'CRITICAL_RACE_CONDITION_OVER_REDEMPTION',
          severity: 'CRITICAL',
          title: 'Over-Redemption Detected',
          message: `Coupon ${coupon.code} exceeded limit: ${coupon.usageCount}/${coupon.totalUsageLimit}`,
          rootCause: 'Race condition in concurrent redemptions. Database locking failure. Manual audit required.',
          affectedEntity: coupon.code,
          timestamp: now,
          metadata: { expected: coupon.totalUsageLimit, actual: coupon.usageCount, excess: coupon.usageCount - coupon.totalUsageLimit }
        });
      }

      // Usage approaching limit warning (80%+)
      const usagePercent = (coupon.usageCount / coupon.totalUsageLimit) * 100;
      if (coupon.status === 'ACTIVE' && usagePercent >= 80 && usagePercent < 100) {
        alerts.push({
          id: `WARN_LIMIT_${coupon.code}`,
          code: 'WARN_USAGE_APPROACHING_LIMIT',
          severity: 'WARNING',
          title: 'Usage Limit Approaching',
          message: `Coupon ${coupon.code} at ${Math.round(usagePercent)}% capacity`,
          rootCause: `${coupon.usageCount} of ${coupon.totalUsageLimit} redemptions used. Consider increasing limit or preparing replacement campaign.`,
          affectedEntity: coupon.code,
          timestamp: now,
          metadata: { usagePercent, remaining: coupon.totalUsageLimit - coupon.usageCount }
        });
      }

      // DUP_006: Seasonal duplicate warning
      const seasonalPattern = coupon.code.match(/(DIWALI|HOLI|CHRISTMAS|NEWYEAR|SUMMER|WINTER|MONSOON)(\d{4})/i);
      if (seasonalPattern && coupon.status === 'ACTIVE') {
        const [_, season, year] = seasonalPattern;
        const otherSeasonalCoupons = coupons.filter(c =>
          c.code !== coupon.code &&
          c.code.includes(season.toUpperCase()) &&
          c.status === 'ACTIVE'
        );
        if (otherSeasonalCoupons.length > 0) {
          alerts.push({
            id: `DUP_006_${coupon.code}`,
            code: 'WARN_SEASONAL_DUPLICATE',
            severity: 'WARNING',
            title: 'Multiple Seasonal Campaigns Active',
            message: `${season} campaigns running simultaneously: ${coupon.code}, ${otherSeasonalCoupons.map(c => c.code).join(', ')}`,
            rootCause: 'Multiple seasonal variants active. May confuse users or split redemptions.',
            affectedEntity: coupon.code,
            timestamp: now,
            metadata: { season, duplicates: otherSeasonalCoupons.map(c => c.code) }
          });
        }
      }

      // VENDOR_006: Emergency deactivation tracking
      if (coupon.metadata?.emergencyDeactivation) {
        alerts.push({
          id: `VENDOR_006_${coupon.code}`,
          code: 'INFO_COUPON_EMERGENCY_DEACTIVATION',
          severity: 'INFO',
          title: 'Emergency Deactivation',
          message: `Coupon ${coupon.code} emergency-deactivated by vendor request`,
          rootCause: 'Viral spread exceeded vendor capacity. Existing carts honored for 2-hour grace period.',
          affectedEntity: coupon.code,
          timestamp: new Date(coupon.metadata.deactivationTime),
          metadata: { reason: coupon.metadata.deactivationReason, gracePeriodEnd: coupon.metadata.gracePeriodEnd }
        });
      }
    });

    return alerts;
  }, [redemptions, coupons, scope]);

  // --- 1. PERIOD BOUNDARY LOGIC ---
  const periodBoundaries = useMemo(() => {
    const start = new Date();
    const end = new Date();
    const now = new Date();

    switch (txnPeriod) {
      case 'THIS_WEEK': {
        const day = now.getDay();
        const diffToWed = day >= 3 ? day - 3 : day + 4;
        start.setDate(now.getDate() - diffToWed);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'LAST_WEEK':
        const ld = now.getDay();
        start.setDate(now.getDate() - ld - 7);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - ld - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'THIS_MONTH':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setTime(now.getTime());
        break;
      case 'LAST_MONTH':
        start.setMonth(now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'THIS_YEAR':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setTime(now.getTime());
        break;
      case 'LAST_YEAR':
        start.setFullYear(now.getFullYear() - 1, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(now.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case 'CUSTOM':
        if (customStart) {
          const s = new Date(customStart);
          s.setHours(0, 0, 0, 0);
          start.setTime(s.getTime());
        }
        if (customEnd) {
          const e = new Date(customEnd);
          e.setHours(23, 59, 59, 999);
          end.setTime(e.getTime());
        }
        break;
    }
    return { start, end };
  }, [txnPeriod, customStart, customEnd]);

  // --- 2. FILTERED COUPONS ---
  const filteredCoupons = useMemo(() => {
    const { end } = periodBoundaries;

    return coupons
      .filter(c => {
        if (c.scope !== scope) return false;
        if (c.status !== filterStatus) return false;

        const creationDate = new Date(c.createdAt);
        if (creationDate > end) return false;

        const searchLower = search.toLowerCase();
        if (search && !c.code.includes(search.toUpperCase()) && !c.description.toLowerCase().includes(searchLower)) return false;

        return true;
      })
      .map(c => {
        const periodUsage = redemptions.filter(r =>
          r.couponCode === c.code &&
          new Date(r.date) >= periodBoundaries.start &&
          new Date(r.date) <= periodBoundaries.end
        ).length;
        return { ...c, periodUsage };
      });
  }, [coupons, filterStatus, search, scope, periodBoundaries, redemptions]);

  // --- 3. HISTORICAL ANALYTICS ---
  const historicalStats = useMemo(() => {
    const { start, end } = periodBoundaries;

    const visibleCodes = new Set(filteredCoupons.map(c => c.code));
    const periodData = redemptions.filter(r => {
      const d = new Date(r.date);
      return visibleCodes.has(r.couponCode) && d >= start && d <= end;
    });

    const breakdownMap: Record<string, { amount: number, bookings: number }> = {};
    periodData.forEach(r => {
      const key = scope === 'INFLUENCER' ? (r.influencerName || 'Unknown Partner') : r.couponCode;
      if (!breakdownMap[key]) breakdownMap[key] = { amount: 0, bookings: 0 };

      const val = scope === 'INFLUENCER' ? (r.commissionAmount || 0) : r.discountAmount;
      breakdownMap[key].amount += val;
      breakdownMap[key].bookings += 1;
    });

    return {
      totalAmt: periodData.reduce((acc, r) => acc + (scope === 'INFLUENCER' ? (r.commissionAmount || 0) : r.discountAmount), 0),
      breakdown: Object.entries(breakdownMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.amount - a.amount)
    };
  }, [redemptions, scope, filteredCoupons, periodBoundaries]);

  // --- 4. ENHANCED SCOPE KPIS WITH ALERT AGGREGATION ---
  const scopeKpis = useMemo(() => {
    const visibleCodes = new Set(filteredCoupons.map(c => c.code));
    const currentScopeRedemptions = redemptions.filter(r => visibleCodes.has(r.couponCode));

    let reachCount = 0;
    let reachLabel = "Onboarded Entities";

    if (scope === 'INFLUENCER') {
      reachCount = new Set(filteredCoupons.map(c => c.config.influencerName).filter(Boolean)).size;
      reachLabel = "Active Creators";
    } else if (scope === 'PLATFORM') {
      reachCount = new Set(currentScopeRedemptions.map(r => r.userId).filter(Boolean)).size;
      reachLabel = "Unique Trekkers";
    } else {
      const vendorIds = new Set<string>();
      filteredCoupons.forEach(c => {
        if (c.targetVendorIds) c.targetVendorIds.forEach(id => vendorIds.add(id));
        if (c.config.requestedByVendorId) vendorIds.add(c.config.requestedByVendorId);
      });
      reachCount = vendorIds.size;
      reachLabel = "Partner Vendors";
    }

    const totalUnsettledValue = currentScopeRedemptions
      .filter(r =>
        scope === 'INFLUENCER'
          ? (r.commissionStatus === 'PENDING' || r.commissionStatus === 'PAYABLE')
          : r.status === 'PENDING'
      )
      .reduce((acc, r) => acc + (scope === 'INFLUENCER' ? (r.commissionAmount || 0) : r.discountAmount), 0);

    const totalProcessedValue = currentScopeRedemptions
      .filter(r => scope === 'INFLUENCER' ? r.commissionStatus === 'PAID' : r.status === 'CONFIRMED')
      .reduce((acc, r) => acc + (scope === 'INFLUENCER' ? (r.commissionAmount || 0) : r.discountAmount), 0);

    // Filter alerts for current scope
    const scopeAlerts = systemAlerts.filter(alert => {
      if (scope === 'INFLUENCER') {
        return alert.code.includes('COMM_') || alert.code.includes('CANCEL_006') || visibleCodes.has(alert.affectedEntity);
      }
      return visibleCodes.has(alert.affectedEntity) || alert.affectedEntity === 'SECURITY_SYSTEM';
    });

    // Categorize alerts by severity
    const alertsBySeverity = {
      CRITICAL: scopeAlerts.filter(a => a.severity === 'CRITICAL').length,
      ERROR: scopeAlerts.filter(a => a.severity === 'ERROR').length,
      WARNING: scopeAlerts.filter(a => a.severity === 'WARNING').length,
      INFO: scopeAlerts.filter(a => a.severity === 'INFO').length
    };

    return {
      reachCount,
      reachLabel,
      totalPending: totalUnsettledValue,
      totalProcessed: totalProcessedValue,
      alerts: scopeAlerts.length,
      alertsBySeverity,
      flaggedItems: scopeAlerts
    };
  }, [filteredCoupons, redemptions, scope, systemAlerts]);

  const cycleInfo = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToWed = (day >= 3) ? (day - 3) : (day + 4);
    const cycleStart = new Date(now);
    cycleStart.setDate(now.getDate() - diffToWed);
    cycleStart.setHours(0, 0, 0, 0);

    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleStart.getDate() + 6);
    cycleEnd.setHours(23, 59, 59, 999);

    const payoutDate = new Date(cycleEnd);
    payoutDate.setDate(cycleEnd.getDate() + 1);
    payoutDate.setHours(10, 0, 0, 0);

    const formatDate = (d: Date) => {
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr}, ${timeStr}`;
    };

    return {
      startStr: formatDate(cycleStart),
      endStr: formatDate(cycleEnd),
      payoutStr: formatDate(payoutDate)
    };
  }, []);

  const handleTriggerGateway = () => {
    setIsProcessingPayout(true);
    setTimeout(() => setIsProcessingPayout(false), 1000);
  };

  const handleCopyLink = (id: string, code: string) => {
    const link = `${window.location.origin}/r/${code.toUpperCase()}`;
    navigator.clipboard.writeText(link);

    setCopiedId(id);

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce z-50 flex items-center gap-2';
    toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Public Influencer link copied!`;
    document.body.appendChild(toast);

    setTimeout(() => {
      setCopiedId(null);
      toast.remove();
    }, 2000);
  };

  const getStatusColor = (status: CouponStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DRAFT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'INACTIVE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'EXPIRED': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'DELETED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'ERROR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'INFO': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldX size={14} />;
      case 'ERROR': return <XCircle size={14} />;
      case 'WARNING': return <AlertTriangle size={14} />;
      case 'INFO': return <Info size={14} />;
    }
  };

  // Filter alerts for modal display
  const filteredAlerts = useMemo(() => {
    if (selectedAlertSeverity === 'ALL') return scopeKpis.flaggedItems;
    return scopeKpis.flaggedItems.filter(a => a.severity === selectedAlertSeverity);
  }, [scopeKpis.flaggedItems, selectedAlertSeverity]);

  if (publicViewCoupon) {
    const isPercentage = publicViewCoupon.mode === 'PERCENTAGE';
    const discountVal = publicViewCoupon.config.discountValue;

    return (
      <div className="fixed inset-0 bg-gray-50 z-[100] overflow-y-auto font-sans flex flex-col animate-fade-in">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <Ticket className="text-orange-500" size={24} />
            <span className="font-black text-xl tracking-tight text-gray-900 uppercase italic">TrekAdmin</span>
          </div>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('previewInfluencer');
              window.history.pushState({}, '', url);
              setPublicViewCoupon(null);
            }}
            className="text-sm font-bold text-gray-400 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-gradient-to-b from-white to-orange-50/30">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-orange-100 overflow-hidden border border-gray-100 text-center relative">
              <div className="h-32 bg-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              </div>

              <div className="px-8 pb-12 -mt-16 relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white mx-auto shadow-xl flex items-center justify-center overflow-hidden mb-6">
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                    {publicViewCoupon.config.influencerName?.charAt(0)}
                  </div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  Exclusive Trek Discount from {publicViewCoupon.config.influencerName}!
                </h1>

                <div className="inline-flex items-center gap-2 mb-8 text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-full text-sm">
                  <Star size={16} className="fill-current" /> Trusted Partner
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-10 px-4">
                  {publicViewCoupon.description} Use the special code below at checkout to unlock your savings on your next Himalayan adventure.
                </p>

                <div className="bg-gray-50 rounded-3xl p-8 border-4 border-dashed border-gray-200 relative group transition-all hover:border-orange-200">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                    Coupon Code
                  </div>

                  <div className="text-5xl font-mono font-black text-gray-900 tracking-widest uppercase mb-6">
                    {publicViewCoupon.code}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publicViewCoupon.code);
                        alert('Coupon code copied to clipboard!');
                      }}
                      className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Copy size={24} /> Copy Code
                    </button>
                    <span className="text-sm font-bold text-gray-400">
                      {isPercentage ? `Saves you ${discountVal}% on your booking` : `Instant ₹${discountVal} discount applied`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin size={24} />
                </div>
                <h4 className="font-bold text-gray-900">500+ Treks</h4>
                <p className="text-xs text-gray-500 mt-1">Nepal, India & Beyond</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users size={24} />
                </div>
                <h4 className="font-bold text-gray-900">Expert Guides</h4>
                <p className="text-xs text-gray-500 mt-1">Verified local partners</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Ticket size={24} />
                </div>
                <h4 className="font-bold text-gray-900">Safe Booking</h4>
                <p className="text-xs text-gray-500 mt-1">Hassle-free cancellation</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in">

      {/* --- ENHANCED KPI SECTION WITH ALERT BREAKDOWN --- */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${scope === 'INFLUENCER' ? '4' : '3'} gap-4`}>
        {/* Cycle Window: ONLY for Influencer scope */}
        {scope === 'INFLUENCER' && (
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div className="space-y-3 w-full">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> Cycle Window
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col border-l-2 border-gray-100 pl-3">
                    <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">Cycle Start Date</span>
                    <span className="text-[11px] font-black text-gray-800 uppercase mt-1">{cycleInfo.startStr}</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-gray-100 pl-3">
                    <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">Cycle End Date</span>
                    <span className="text-[11px] font-black text-gray-800 uppercase mt-1">{cycleInfo.endStr}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleTriggerGateway} disabled={isProcessingPayout} className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex-shrink-0 active:scale-95">
                {isProcessingPayout ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              </button>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 bg-gray-50/30 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
              <span className="text-[8px] font-bold text-gray-400 uppercase">Payout Date</span>
              <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wide">{cycleInfo.payoutStr}</span>
            </div>
          </div>
        )}

        {/* Network Reach: Universal */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Network Reach</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">{scopeKpis.reachCount}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{scopeKpis.reachLabel}</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <Users size={20} className="text-indigo-500" />
            </div>
          </div>
          <div className="mt-6 space-y-3 pt-6 border-t border-slate-50">
            <div className="flex justify-between items-center group/item hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">
                {scope === 'INFLUENCER' ? 'Unsettled Comm.' : 'Period Savings'}
              </span>
              <span className="text-[14px] font-black text-rose-600">
                ₹{scopeKpis.totalPending.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center group/item hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">
                {scope === 'INFLUENCER' ? 'Life Paid Comm.' : 'Life Discounted'}
              </span>
              <span className="text-[14px] font-black text-emerald-600">
                ₹{scopeKpis.totalProcessed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Historical Data: Universal */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Historical Analytics</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomDateModal(true)}
                className={`p-2 rounded-xl border transition-all ${txnPeriod === 'CUSTOM' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600'}`}
              >
                <CalendarDays size={16} />
              </button>
              <select
                value={txnPeriod}
                onChange={(e) => setTxnPeriod(e.target.value as HistoryPeriod)}
                className="text-[10px] font-black border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="THIS_WEEK">This Week</option>
                <option value="LAST_WEEK">Last Week</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="THIS_YEAR">This Year</option>
                <option value="LAST_YEAR">Last Year</option>
                {txnPeriod === 'CUSTOM' && <option value="CUSTOM">Custom Range</option>}
              </select>
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <p className="text-4xl font-black text-slate-800 tracking-tighter">₹{historicalStats?.totalAmt.toLocaleString()}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase mt-2 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
              {txnPeriod === 'CUSTOM'
                ? `${new Date(periodBoundaries.start).toLocaleDateString()} - ${new Date(periodBoundaries.end).toLocaleDateString()}`
                : scope === 'INFLUENCER' ? 'Settled Commissions' : 'Window Yield'
              }
            </p>
          </div>
          <button onClick={() => setShowHistoryModal(true)} className="mt-6 text-[11px] font-black text-indigo-600 uppercase text-left flex items-center gap-2 group/btn hover:text-indigo-800 relative z-10">
            Launch Breakdown <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ENHANCED Integrity Alerts: Universal */}
        <div className={`p-6 rounded-[32px] border shadow-sm flex flex-col justify-between transition-all hover:shadow-md group ${scopeKpis.alerts > 0 ? 'bg-rose-50 border-rose-100 hover:border-rose-200' : 'bg-white border-slate-100'
          }`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${scopeKpis.alerts > 0 ? 'text-rose-700' : 'text-slate-400 group-hover:text-indigo-600'}`}>
              Integrity Matrix
            </h3>
            <div className={`p-3 rounded-2xl border ${scopeKpis.alerts > 0 ? 'bg-rose-100 border-rose-200 shadow-sm shadow-rose-200/50' : 'bg-emerald-50 border-emerald-100'}`}>
              {scopeKpis.alerts > 0 ? <ShieldAlert size={20} className="text-rose-600 animate-pulse" /> : <Check size={20} className="text-emerald-600" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <p className={`text-4xl font-black tracking-tighter ${scopeKpis.alerts > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {scopeKpis.alerts}
              </p>
              <span className="text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">{scopeKpis.alerts === 1 ? 'FLAG DETECTED' : 'FLAGS DETECTED'}</span>
            </div>

            {scopeKpis.alerts > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/60 p-2 rounded-xl border border-rose-100 flex items-center gap-2 group/sub hover:bg-white transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  <span className="text-[9px] font-black text-rose-700 uppercase">{scopeKpis.alertsBySeverity.CRITICAL} CRIT</span>
                </div>
                <div className="bg-white/60 p-2 rounded-xl border border-rose-100 flex items-center gap-2 group/sub hover:bg-white transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                  <span className="text-[9px] font-black text-orange-700 uppercase">{scopeKpis.alertsBySeverity.ERROR} ERR</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100/30">
            <p className="text-[9px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
              {scopeKpis.alerts > 0
                ? 'Policy violations & fraud patterns active.'
                : 'System integrity verified. No breaches.'}
            </p>
            {scopeKpis.alerts > 0 && (
              <button
                onClick={() => setShowIntegrityModal(true)}
                className="mt-4 text-[11px] font-black text-rose-600 uppercase text-left flex items-center gap-2 group/link hover:text-rose-800 transition-colors"
              >
                Open Security Vault <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- CAMPAIGN DATA TABLE --- */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row justify-between items-center p-4 gap-4 transition-all hover:shadow-md">
        <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-full sm:w-auto">
          {['ACTIVE', 'DRAFT', 'EXPIRED', 'INACTIVE', 'DELETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100 border border-indigo-50'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="SEARCH CAMPAIGN REGISTRY..."
              className="pl-12 pr-6 py-3 border border-slate-100 rounded-[20px] text-[10px] font-black tracking-widest w-full bg-slate-50/50 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all placeholder:text-slate-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filterStatus !== 'DELETED' && (
            <button onClick={onCreate} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black shadow-xl shadow-slate-200 active:scale-95 transition-all">
              <Plus size={16} /> Deploy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20 px-6">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon: any) => {
            const couponAlerts = systemAlerts.filter(a => a.affectedEntity === coupon.code);
            const hasCriticalAlerts = couponAlerts.some(a => a.severity === 'CRITICAL');
            const isPercentage = coupon.mode === 'PERCENTAGE';
            const usagePercent = Math.round((coupon.usageCount / Math.max(1, coupon.totalUsageLimit)) * 100);

            return (
              <div key={coupon.id} className={`bg-white rounded-[32px] shadow-sm border overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] hover:-translate-y-1 ${hasCriticalAlerts ? 'border-red-200' : 'border-slate-100 hover:border-indigo-200/50'
                }`}>
                <div className="p-5 flex-1">
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">
                          {coupon.code}
                        </h3>
                        {couponAlerts.length > 0 && (
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${hasCriticalAlerts ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                            {hasCriticalAlerts && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                            {couponAlerts.length} Alert{couponAlerts.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Users size={12} className="text-indigo-500" /> {coupon.createdBy}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-indigo-500" /> {new Date(coupon.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-1 italic bg-indigo-50/30 px-3 py-1.5 rounded-lg border border-indigo-100/20 max-w-md">
                            "{coupon.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border ${coupon.scope === 'PREMIUM' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                        coupon.scope === 'SPECIAL' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          coupon.scope === 'INFLUENCER' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                            'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                        {coupon.scope} Matrix
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${coupon.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        coupon.status === 'DRAFT' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                          'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${coupon.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                          coupon.status === 'DRAFT' ? 'bg-blue-400' : 'bg-slate-400'
                          }`} />
                        {coupon.status}
                      </div>
                    </div>
                  </div>

                  {/* Main Matrix Content */}
                  <div className="flex gap-6">
                    {/* Performance Matrix */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="relative overflow-hidden bg-white p-4 rounded-[20px] border border-slate-100 border-l-4 border-l-indigo-400/80 hover:border-indigo-200 transition-colors shadow-sm">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 -mr-8 -mt-8 rounded-full opacity-30"></div>
                          <div className="flex items-center justify-between mb-3 border-b border-indigo-50 pb-2 relative z-10">
                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                              Usage Governance
                            </p>
                          </div>
                          <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Lifetime Redemptions</p>
                                <p className="font-black text-slate-800 text-lg tracking-tighter">{coupon.usageCount} <span className="text-[10px] text-slate-400 font-bold uppercase">/ {coupon.totalUsageLimit}</span></p>
                              </div>
                              <div className="text-right">
                                <span className="text-[12px] font-black text-indigo-600">{usagePercent}%</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-700 ${usagePercent > 80 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="relative overflow-hidden bg-slate-50/50 p-4 rounded-[20px] border border-slate-100 border-l-4 border-l-slate-300 hover:border-slate-200 transition-colors shadow-sm">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-200/30 pb-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Window Performance</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Period Uses</p>
                              <p className="font-black text-slate-700 text-lg tracking-tighter">{coupon.periodUsage || 0}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Yield (Est.)</p>
                              <p className="font-black text-emerald-600 text-lg tracking-tighter">₹{(coupon.periodUsage || 0) * (coupon.config.discountValue || 0)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coupon Artifact Preview */}
                    <div className="w-[140px] shrink-0 flex flex-col items-center">
                      <div className="relative group/preview mb-6 h-16 flex items-center justify-center">
                        <div className={`absolute inset-0 blur-3xl rounded-full scale-150 opacity-0 group-hover/preview:opacity-100 transition-opacity ${isPercentage ? 'bg-emerald-500/5' : 'bg-orange-500/5'
                          }`}></div>
                        {/* Stylized Ticket/Coupon Preview */}
                        <div className={`relative px-4 py-2.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transform group-hover/preview:scale-105 transition-transform duration-500 ${isPercentage ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
                          }`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isPercentage ? 'text-emerald-700' : 'text-orange-700'}`}>
                            {isPercentage ? 'PERCENT' : 'FLAT'}
                          </span>
                          <span className={`text-xl font-black ${isPercentage ? 'text-emerald-800' : 'text-orange-800'}`}>
                            {isPercentage ? `${coupon.config.discountValue}%` : `₹${coupon.config.discountValue}`}
                          </span>
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-slate-100 -ml-1"></div>
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-slate-100 -mr-1"></div>
                        </div>
                      </div>

                      <div className="w-full space-y-4">
                        <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
                          <p className="text-[8px] font-black uppercase tracking-widest mb-1.5 text-slate-400">Campaign Mode</p>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isPercentage ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                            <p className="font-black text-slate-700 text-[9px] uppercase tracking-tighter truncate">
                              {isPercentage ? 'Dynamic Yield' : 'Fixed Protocol'}
                            </p>
                          </div>
                        </div>

                        <div className="text-center pt-2 border-t border-slate-100">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 animate-pulse">
                            {coupon.config.expiryDate || 'Unlimited Lifecycle'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(coupon)}
                      title="Inspect Analytics"
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md rounded-lg transition-all"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(coupon)}
                      title="Edit Parameters"
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:shadow-md rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {filterStatus !== 'DELETED' ? (
                      <>
                        <button
                          onClick={() => onToggleStatus(coupon.id, coupon.status)}
                          className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-lg border transition-all ${coupon.status === 'ACTIVE'
                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                            : 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                            }`}
                        >
                          {coupon.status === 'ACTIVE' ? <Pause size={14} /> : <Play size={14} />}
                          {coupon.status === 'ACTIVE' ? 'Pause Protocol' : 'Deploy Module'}
                        </button>
                        <button
                          onClick={() => onDelete(coupon.id)}
                          title="Terminate Module"
                          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-md rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onToggleStatus(coupon.id, 'DELETED')}
                        className="px-4 py-2 flex items-center gap-2 bg-indigo-600 text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                      >
                        <RefreshCcw size={14} /> Restore Architecture
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="xl:col-span-2 py-20 bg-white rounded-[32px] border border-dashed border-slate-200 text-center">
            <Ticket size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Active Deployments Found</p>
            <p className="text-slate-300 text-xs mt-1">Initiate a new campaign to begin tracking performance.</p>
          </div>
        )}
      </div>


      {/* --- HISTORY MODAL --- */}
      {
        showHistoryModal && historicalStats && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-pop-in">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Performance Analysis</h3>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><X size={20} /></button>
              </div>
              <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-amber-600 uppercase">{scope === 'INFLUENCER' ? 'Total Period Earnings' : 'Total Savings Generated'} ({txnPeriod.replace(/_/g, ' ')})</p>
                    <p className="text-4xl font-black text-gray-900">₹{historicalStats.totalAmt.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white rounded-full shadow-lg shadow-amber-900/5">
                    <IndianRupee size={28} className="text-amber-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  {historicalStats.breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">{item.bookings} Transactions Found</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-gray-900">₹{item.amount.toLocaleString()}</p>
                        <p className="text-[8px] text-emerald-600 font-black uppercase">{scope === 'INFLUENCER' ? 'Settled' : 'Saved'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setShowHistoryModal(false)} className="px-10 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200">Close Analysis</button>
              </div>
            </div>
          </div>
        )
      }

      {/* --- ENHANCED INTEGRITY ALERTS MODAL (COMPACT & FIXED) --- */}
      {
        showIntegrityModal && scopeKpis && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-pop-in">
              {/* Fixed Header with Close Button */}
              <div className="flex-shrink-0 p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <ShieldX size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter">Integrity Alerts</h3>
                    <p className="text-[9px] text-gray-500 font-medium mt-0.5">Real-time monitoring & fraud detection</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntegrityModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors flex-shrink-0"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Fixed Summary Stats */}
              <div className="flex-shrink-0 px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-[9px] font-black text-red-600 uppercase mb-1 flex items-center gap-1">
                      <ShieldX size={10} /> Critical
                    </p>
                    <p className="text-2xl font-black text-red-700">{scopeKpis.alertsBySeverity.CRITICAL}</p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <p className="text-[9px] font-black text-orange-600 uppercase mb-1 flex items-center gap-1">
                      <XCircle size={10} /> Errors
                    </p>
                    <p className="text-2xl font-black text-orange-700">{scopeKpis.alertsBySeverity.ERROR}</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-[9px] font-black text-amber-600 uppercase mb-1 flex items-center gap-1">
                      <AlertTriangle size={10} /> Warnings
                    </p>
                    <p className="text-2xl font-black text-amber-700">{scopeKpis.alertsBySeverity.WARNING}</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-[9px] font-black text-blue-600 uppercase mb-1 flex items-center gap-1">
                      <Info size={10} /> Info
                    </p>
                    <p className="text-2xl font-black text-blue-700">{scopeKpis.alertsBySeverity.INFO}</p>
                  </div>
                </div>
              </div>

              {/* Fixed Filter Bar */}
              <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase">Filter:</span>
                    <div className="flex gap-1.5">
                      {['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'].map(sev => (
                        <button
                          key={sev}
                          onClick={() => setSelectedAlertSeverity(sev as any)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${selectedAlertSeverity === sev
                            ? sev === 'ALL' ? 'bg-gray-900 text-white shadow-sm' : `${getSeverityColor(sev as AlertSeverity).split(' ')[0]} text-white shadow-sm`
                            : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {sev === 'ALL' ? 'All' : sev.charAt(0) + sev.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} • Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Scrollable Alert Feed */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-3">
                  {filteredAlerts.length > 0 ? filteredAlerts.map((alert, idx) => (
                    <div key={idx} className={`flex flex-col p-3 rounded-xl border transition-all group ${alert.severity === 'CRITICAL' ? 'bg-red-50/50 border-red-200 hover:border-red-300' :
                      alert.severity === 'ERROR' ? 'bg-orange-50/50 border-orange-200 hover:border-orange-300' :
                        alert.severity === 'WARNING' ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' :
                          'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2.5 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-sm font-black text-gray-900">{alert.title}</p>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 font-medium leading-tight">{alert.message}</p>
                            <p className="text-[9px] text-gray-400 font-medium mt-1 break-all">
                              <span className="font-mono font-bold">{alert.code}</span> • {alert.affectedEntity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                            {new Date(alert.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          <br />
                          <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Collapsible Details */}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-[9px] font-black text-gray-500 uppercase hover:text-gray-700 flex items-center gap-1">
                          <ChevronRight size={12} className="transition-transform" />
                          View Details
                        </summary>
                        <div className="mt-2 space-y-2 pl-2">
                          <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${alert.severity === 'CRITICAL' ? 'bg-red-100/50 border-red-200' :
                            alert.severity === 'ERROR' ? 'bg-orange-100/50 border-orange-200' :
                              alert.severity === 'WARNING' ? 'bg-amber-100/50 border-amber-200' :
                                'bg-blue-100/50 border-blue-200'
                            }`}>
                            <AlertCircle size={12} className={`${alert.severity === 'CRITICAL' ? 'text-red-600' :
                              alert.severity === 'ERROR' ? 'text-orange-600' :
                                alert.severity === 'WARNING' ? 'text-amber-600' :
                                  'text-blue-600'
                              } mt-0.5 shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black text-gray-700 uppercase leading-none">Root Cause</p>
                              <p className="text-[10px] text-gray-700 font-medium mt-1 leading-snug">{alert.rootCause}</p>
                            </div>
                          </div>

                          {alert.redemptionRef && (
                            <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-gray-500">
                              <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                                <Ticket size={9} />
                                <span className="truncate">{alert.redemptionRef.bookingRef}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                                <Users size={9} />
                                <span className="truncate">{alert.redemptionRef.userName}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                                <Briefcase size={9} />
                                <span className="truncate">{alert.redemptionRef.vendorName}</span>
                              </div>
                            </div>
                          )}

                          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                            <details className="text-[9px] text-gray-500">
                              <summary className="cursor-pointer font-bold uppercase hover:text-gray-700 flex items-center gap-1">
                                <ChevronRight size={10} /> Technical Data
                              </summary>
                              <pre className="mt-1.5 p-2 bg-gray-800 text-green-400 rounded text-[8px] overflow-x-auto font-mono max-h-32 overflow-y-auto">
                                {JSON.stringify(alert.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </details>
                    </div>
                  )) : (
                    <div className="text-center py-16">
                      <Check size={40} className="mx-auto text-green-500 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No alerts found</p>
                      <p className="text-[10px] text-gray-400 mt-1">All checks passed for this severity level</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-4">
                <p className="text-[9px] text-gray-400 italic font-medium flex-1">
                  Auto-generated from cancellations, fraud patterns, usage limits & security violations
                </p>
                <button
                  onClick={() => {
                    setShowIntegrityModal(false);
                    setSelectedAlertSeverity('ALL');
                  }}
                  className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg flex-shrink-0"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* --- CUSTOM DATE MODAL --- */}
      {
        showCustomDateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-pop-in">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <CalendarDays size={20} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Set Custom Range</h3>
                </div>
                <button onClick={() => setShowCustomDateModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">End Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 italic">Select a custom window to analyze performance and redemption traffic for the specified dates.</p>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setTxnPeriod('THIS_WEEK');
                    setShowCustomDateModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-100 transition-all"
                >
                  Reset to Presets
                </button>
                <button
                  onClick={() => {
                    if (customStart && customEnd) {
                      setTxnPeriod('CUSTOM');
                      setShowCustomDateModal(false);
                    } else {
                      alert("Please select both start and end dates.");
                    }
                  }}
                  className="flex-[1.5] px-4 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default CouponList;