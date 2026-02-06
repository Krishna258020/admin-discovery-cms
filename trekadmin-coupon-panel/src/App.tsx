import React, { useState, useEffect } from 'react';
import BadgeMaster from './components/BadgeMaster';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CouponList from './components/CouponList';
import CouponModal from './components/CouponModal';
import CouponDetailView from './components/CouponDetailView';
import RedemptionHistoryView from './components/RedemptionHistoryView';
import VendorRequests from './components/VendorRequests';
import AuditLogs from './components/AuditLogs';
import Settings from './components/Settings';
import ConfirmationModal from './components/ConfirmationModal';
import BadgeModel from './components/BadgeModel';
import BadgeDetailView from './components/BadgeDetailView';
import {
  DEFAULT_DISCOUNT_MODES
} from './constants';
import {
  Badge, Coupon, WithdrawalRequest, CommissionLog, CouponScope, CouponStatus, AuditLog, VendorRequest,
  DiscountModeConfig, ConfirmationState, Redemption,
  DashboardStats, TrendDataPoint, CommissionStatus,
  TimeFilter, TargetType, PayoutBatch
} from './types';
import {
  couponApi, redemptionApi, withdrawalApi, commissionApi, vendorApi, badgeApi, auditApi, dashboardApi
} from './api';
import { Ticket, FileText } from 'lucide-react';

const isWednesday = () => new Date().getDay() === 3;

const hoursBetween = (a: string, b: string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 36e5;

const loadWithdrawalRequests = (): WithdrawalRequest[] => {
  try {
    return JSON.parse(
      localStorage.getItem('ADMIN_WITHDRAWAL_REQUESTS') || '[]'
    );
  } catch {
    return [];
  }
};

const loadPublicWithdrawalRequests = (): WithdrawalRequest[] => {
  try {
    return JSON.parse(
      localStorage.getItem('PUBLIC_WITHDRAWAL_REQUESTS') || '[]'
    );
  } catch {
    return [];
  }
};

import { Routes, Route } from 'react-router-dom';
import CouponRedirect from './CouponRedirect';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('OVERVIEW');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  // Local storage sync removed for API source of truth


  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>('ALL');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [discountModes, setDiscountModes] = useState<DiscountModeConfig[]>(DEFAULT_DISCOUNT_MODES);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Calculate stats dynamically based on coupons and redemptions
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [commissionLogs, setCommissionLogs] = useState<CommissionLog[]>([]);

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from API...');
        const [
          allCoupons,
          allRedemptions,
          allWithdrawals,
          allLogs,
          allBadges,
          allRequests,
          allAuditLogs,
          allVendors
        ] = await Promise.all([
          couponApi.getAll(),
          redemptionApi.getAll(),
          withdrawalApi.getAll(),
          commissionApi.getLogs(),
          badgeApi.getAll(),
          vendorApi.requests.getAll(),
          auditApi.getAll(),
          vendorApi.getAll()
        ]);

        setCoupons(allCoupons);
        setRedemptions(allRedemptions);
        setWithdrawalRequests(allWithdrawals);
        setCommissionLogs(allLogs);
        setBadges(allBadges);
        setRequests(allRequests);
        setAuditLogs(allAuditLogs);
        setVendors(allVendors);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        alert('Failed to fetch data from backend. Please ensure backend is running on port 5001.');
      }
    };
    fetchData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);

  // CHANGED: Store ID instead of object to support live updates
  const [viewingCouponId, setViewingCouponId] = useState<string | null>(null);
  const viewingCoupon = coupons.find(c => c.id === viewingCouponId) || null;

  const [confirmConfig, setConfirmConfig] = useState<ConfirmationState>({
    isOpen: false, title: '', message: '', type: 'INFO', onConfirm: () => { },
  });

  const [requestApprovalData, setRequestApprovalData] = useState<any>(undefined);
  const [isRequestApproval, setIsRequestApproval] = useState(false);
  const [premiumTab, setPremiumTab] =
    useState<'COUPONS' | 'REQUESTS' | 'CTA'>('COUPONS');
  const [badges, setBadges] = useState<Badge[]>([]);

  // Local storage sync removed for API source of truth


  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | undefined>(undefined);
  const [viewingBadge, setViewingBadge] = useState<Badge | null>(null);


  // Dynamic Stats Calculation
  const stats: DashboardStats = {
    totalRevenue: redemptions
      .filter(r => r.status === 'CONFIRMED')
      .reduce((acc, r) => acc + r.bookingAmount, 0),

    activeCoupons: coupons.filter(c => c.status === 'ACTIVE').length,

    totalRedemptions: redemptions.filter(r => r.status === 'CONFIRMED').length,

    totalSavings: redemptions
      .filter(r => r.status === 'CONFIRMED')
      .reduce((sum, r) => sum + r.discountAmount, 0)
  };


  const addAuditLog = (action: AuditLog['action'], target: string, details: string, targetType: TargetType = 'COUPON', targetName?: string) => {
    setAuditLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      target,
      targetName,
      targetType,
      performer: 'Super Admin',
      performerId: 'ADM-991',
      details
    }, ...prev]);
  };

  const getCurrentScope = (): CouponScope => {
    switch (currentView) {
      case 'MANAGE_PLATFORM': return 'PLATFORM';
      case 'MANAGE_NORMAL': return 'NORMAL';
      case 'MANAGE_SPECIAL': return 'SPECIAL';
      case 'MANAGE_PREMIUM': return 'PREMIUM';
      case 'MANAGE_INFLUENCER': return 'INFLUENCER';
      default: return 'PLATFORM';
    }
  };

  const handleSaveCoupon = async (data: any) => {
    try {
      if (editingCoupon?.id) {
        await couponApi.update(editingCoupon.id, data);
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...data } : c));
        // Note: Audit log is handled by backend usually, but for UI feedback we keep local log or refetch logs
        addAuditLog('UPDATE', data.code, 'Updated coupon details');
      } else {
        const response = await couponApi.create(data);
        const newCoupon = {
          ...data,
          id: response.id,
          code: response.code || data.code, // Ensure code is present
          status: 'DRAFT',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          createdBy: 'Admin'
        };
        setCoupons(prev => [...prev, newCoupon]);
        addAuditLog('CREATE', data.code, 'Created new coupon');

        if (isRequestApproval && requestApprovalData?.id) {
          // If created from request, approve the request via API
          await vendorApi.requests.approve(requestApprovalData.id, 'Admin');
          setRequests(prev => prev.map(r => r.id === requestApprovalData.id ? { ...r, status: 'APPROVED' } : r));
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save coupon", error);
      // Show error notification?
    }
  };

  const handleBadgeSave = async (data: any) => {
    try {
      if (editingBadge?.id) {
        await badgeApi.update(editingBadge.id, data);
        setBadges(prev => prev.map(b => b.id === editingBadge.id ? { ...b, ...data, lastActionAt: new Date().toISOString(), lastActionBy: 'Super Admin' } : b));
        addAuditLog('UPDATE', data.id, 'Updated badge matrix', 'BADGE', data.name);
      } else {
        const response = await badgeApi.create(data);
        const newBadge = {
          ...data,
          id: response.id,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          creatorName: 'Super Admin',
          createdById: 'ADM-991',
          usageCount: { gold: 0, platinum: 0 }
        };
        setBadges(prev => [...prev, newBadge]);
        addAuditLog('CREATE', newBadge.id, 'Created new CTA module', 'BADGE', data.name);
      }
      setIsBadgeModalOpen(false);
    } catch (error) {
      console.error("Badge save failed", error);
    }
  };

  const handleBadgeStatusToggle = async (id: string) => {
    try {
      const b = badges.find(b => b.id === id);
      if (!b) return;
      const nextStatus = b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await badgeApi.toggleStatus(id, nextStatus, 'ADM-991', 'Super Admin');

      setBadges(prev => prev.map(badge => {
        if (badge.id === id) {
          addAuditLog(nextStatus === 'ACTIVE' ? 'ACTIVATE' : 'DEACTIVATE', badge.id, `Badge status changed to ${nextStatus}`, 'BADGE', badge.name);
          return { ...badge, status: nextStatus, lastActionAt: new Date().toISOString(), lastActionBy: 'Super Admin' };
        }
        return badge;
      }));
    } catch (error) {
      console.error("Badge toggle failed", error);
    }
  };

  const handleBadgeDelete = async (id: string) => {
    const badge = badges.find(b => b.id === id);
    if (!badge) return;
    try {
      await badgeApi.delete(id, 'ADM-991', 'Super Admin');
      setBadges(prev => prev.map(b => b.id === id ? { ...b, status: 'DELETED', deletedAt: new Date().toISOString() } : b));
      addAuditLog('DELETE', badge.id, 'Terminated CTA module', 'BADGE', badge.name);
    } catch (error) {
      console.error("Badge delete failed", error);
    }
  };

  // --- ACTIONS WITH CONFIRMATION ---

  const handleDelete = (id: string) => {
    const c = coupons.find(x => x.id === id);
    if (!c) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Coupon',
      message: `Are you sure you want to move the coupon "${c.code}" to the trash? This action can be undone from the deleted filter.`,
      type: 'DANGER',
      confirmText: 'Delete Coupon',
      onConfirm: async () => {
        try {
          await couponApi.delete(id);
          setCoupons(prev => prev.map(x => x.id === id ? { ...x, status: 'DELETED' } : x));
          addAuditLog('DELETE', c.code, 'Moved to trash');
        } catch (err) {
          console.error("Delete failed", err);
        }
        setConfirmConfig(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleToggleStatus = (id: string, current: CouponStatus) => {
    if (current === 'DELETED') return;

    const c = coupons.find(x => x.id === id);
    if (!c) return;

    const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionTitle = next === 'ACTIVE' ? 'Activate Coupon' : 'Deactivate Coupon';
    const actionVerb = next === 'ACTIVE' ? 'activate' : 'deactivate';

    setConfirmConfig({
      isOpen: true,
      title: actionTitle,
      message: `Are you sure you want to ${actionVerb} the coupon "${c.code}"? ${next === 'ACTIVE' ? 'It will become usable by customers immediately.' : 'Customers will no longer be able to use this coupon.'}`,
      type: next === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
      confirmText: next === 'ACTIVE' ? 'Activate Now' : 'Deactivate Now',
      onConfirm: async () => {
        try {
          await couponApi.toggleStatus(id, next, undefined, 'Admin');
          setCoupons(prev => prev.map(coupon => coupon.id === id ? { ...coupon, status: next } : coupon));
          addAuditLog(next === 'ACTIVE' ? 'ACTIVATE' : 'DEACTIVATE', c.code, `Status changed to ${next}`);
        } catch (err) {
          console.error("Toggle status failed", err);
        }
        setConfirmConfig(p => ({ ...p, isOpen: false }));
      }
    });
  };

  // Request Handling
  const handleApproveRequest = (req: VendorRequest) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Approve Request & Create Coupon',
      message: `This will open the coupon creator pre-filled with ${req.vendorName}'s request details. You can review before final creation.`,
      type: 'INFO',
      confirmText: 'Proceed to Create',
      onConfirm: () => {
        setConfirmConfig(p => ({ ...p, isOpen: false }));
        setIsRequestApproval(true);
        setRequestApprovalData({ id: req.id, vendorId: req.vendorId, vendorName: req.vendorName, trekName: req.trekName });
        setEditingCoupon({
          code: req.requestedCode,
          description: req.reason,
          scope: 'PREMIUM',
          mode: req.discountType,
          config: {
            discountValue: req.discountValue,
            requestedByVendorId: req.vendorId,
            requestedByVendorName: req.vendorName
          },
          validFrom: '',
          validTill: ''
        } as any);
        setIsModalOpen(true);
      }
    });
  };

  const handleRejectRequest = (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Reject Vendor Request',
      message: `Are you sure you want to reject the request from ${req.vendorName} for code ${req.requestedCode}? This cannot be undone easily.`,
      type: 'DANGER',
      confirmText: 'Confirm Rejection',
      onConfirm: async () => {
        try {
          // 1. Mark Request Rejected via API
          await vendorApi.requests.reject(reqId, 'Admin User', 'Manually Rejected by Admin');
          setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));

          addAuditLog('DELETE', req.requestedCode, `Rejected request from ${req.vendorName}`);
        } catch (err) {
          console.error("Reject request failed", err);
        }
        setConfirmConfig(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleCreate = () => {
    setEditingCoupon(undefined);
    setIsModalOpen(true);
    setIsRequestApproval(false);
    setRequestApprovalData(undefined);
  };

  const renderContent = () => {
    if (currentView === 'OVERVIEW')
      return (
        <Dashboard
          stats={stats}
          redemptions={redemptions}
          trendData={trendData}
          activeFilter={activeTimeFilter}
          onFilterChange={setActiveTimeFilter}
          onViewAllRedemptions={() => setCurrentView('HISTORY')}
        />
      );

    if (currentView === 'HISTORY')
      return (
        <RedemptionHistoryView
          redemptions={redemptions}
          timeFilter={activeTimeFilter}
          onTimeFilterChange={setActiveTimeFilter}
          onBack={() => setCurrentView('OVERVIEW')}
        />
      );
    if (currentView === 'SYSTEM_AUDIT') return <AuditLogs logs={auditLogs} />;
    if (currentView === 'SYSTEM_SETTINGS') return <Settings discountModes={discountModes} onUpdateModes={setDiscountModes} />;

    // CHANGED: Use viewingCoupon from derived state (found by ID) to ensure live data
    if (viewingCoupon)
      return (
        <CouponDetailView
          coupon={viewingCoupon}
          allRedemptions={redemptions}
          vendors={vendors}

          /* ✅ PAYOUT & COMMISSION STATE (GLOBAL) */
          withdrawalRequests={withdrawalRequests}
          setWithdrawalRequests={setWithdrawalRequests}

          commissionLogs={commissionLogs}
          setCommissionLogs={setCommissionLogs}

          setRedemptions={setRedemptions}

          onBack={() => setViewingCouponId(null)}
        />
      );

    if (currentView === 'MANAGE_PREMIUM') {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Premium Management</h2>
            <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
              <button
                onClick={() => setPremiumTab('COUPONS')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${premiumTab === 'COUPONS'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Coupons
              </button>

              <button
                onClick={() => setPremiumTab('REQUESTS')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${premiumTab === 'REQUESTS'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Requests
              </button>

              <button
                onClick={() => setPremiumTab('CTA')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${premiumTab === 'CTA'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                CTA
              </button>
            </div>

          </div>
          {premiumTab === 'COUPONS' && (
            <CouponList
              coupons={coupons}
              scope="PREMIUM"
              onCreate={handleCreate}
              onEdit={(c) => { setEditingCoupon(c); setIsModalOpen(true); }}
              onView={(c) => setViewingCouponId(c.id)}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {premiumTab === 'REQUESTS' && (
            <VendorRequests
              requests={requests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          )}

          {premiumTab === 'CTA' && !viewingBadge && (
            <BadgeMaster
              badges={badges}
              onCreateClick={() => {
                setEditingBadge(undefined);
                setIsBadgeModalOpen(true);
              }}
              onEditClick={(badge) => {
                setEditingBadge(badge);
                setIsBadgeModalOpen(true);
              }}
              onStatusToggle={handleBadgeStatusToggle}
              onDelete={handleBadgeDelete}
              onViewClick={(badge) => setViewingBadge(badge)}
            />
          )}

          {premiumTab === 'CTA' && viewingBadge && (
            <BadgeDetailView badge={viewingBadge} onBack={() => setViewingBadge(null)} vendors={vendors} />
          )}

        </div>
      );
    }

    if (currentView.startsWith('MANAGE_')) {
      const scope = getCurrentScope();
      return (
        <div className="flex flex-col h-full space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">{scope === 'NORMAL' ? 'Partner' : scope.toLowerCase()} Management</h2>
          <CouponList
            coupons={coupons}
            redemptions={redemptions}   // ✅ REQUIRED
            scope={scope}
            onCreate={handleCreate}
            onEdit={(c) => { setEditingCoupon(c); setIsModalOpen(true); }}
            onView={(c) => setViewingCouponId(c.id)}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

        </div>
      );
    }
    return null;
  };

  return (
    <Routes>
      {/* 🔥 Influencer Redirect Route */}
      <Route
        path="/r/:code"
        element={
          <CouponRedirect
            coupons={coupons}
            redemptions={redemptions}
          />
        }
      />


      {/* 🔥 Admin App (Fallback) */}
      <Route
        path="/*"
        element={
          <div className="flex h-screen bg-gray-50/50 font-sans">
            <Sidebar
              currentView={currentView}
              onNavigate={(v) => {
                setCurrentView(v);
                setViewingCouponId(null);
              }}
            />

            <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
              {renderContent()}
            </main>

            <CouponModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveCoupon}
              couponToEdit={editingCoupon}
              scope={getCurrentScope()}
              availableModes={discountModes}
              isFromRequest={isRequestApproval}
              requestDetails={requestApprovalData}
              vendors={vendors}
            />

            {isBadgeModalOpen && (
              <BadgeModel
                initialData={editingBadge}
                onSave={handleBadgeSave}
                onClose={() => setIsBadgeModalOpen(false)}
              />
            )}

            <ConfirmationModal
              isOpen={confirmConfig.isOpen}
              title={confirmConfig.title}
              message={confirmConfig.message}
              type={confirmConfig.type}
              confirmText={confirmConfig.confirmText}
              cancelText={confirmConfig.cancelText}
              onConfirm={confirmConfig.onConfirm}
              onCancel={() =>
                setConfirmConfig({ ...confirmConfig, isOpen: false })
              }
            />
          </div>
        }
      />
    </Routes>
  );
};
export default App;
