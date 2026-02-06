
import React, { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft, Calendar, Users, TrendingUp, ShieldCheck,
  MapPin, Tag, Filter, Map as MapIcon, Clock, ArrowRight, Search, ChevronRight,
  Download, ChevronDown, ChevronUp, Briefcase, FileText, CheckCircle,
  ExternalLink, Mail, Phone, Home, DollarSign,
  Instagram, Youtube, Facebook, Twitter, Landmark, CreditCard, BarChart, Percent,
  Activity, ArrowUpRight, Check, X, XCircle, History
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { Coupon, Vendor, Redemption, PayoutBatch, WithdrawalRequest, CommissionLog } from '../types';
import { withdrawalApi, payoutApi } from '../api';

interface CouponDetailViewProps {
  coupon: Coupon;
  allRedemptions: Redemption[];
  onBack: () => void;
  publicView?: boolean;
  vendors: Vendor[];

  withdrawalRequests?: WithdrawalRequest[];
  setWithdrawalRequests?: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;

  commissionLogs?: CommissionLog[];
  setCommissionLogs?: React.Dispatch<React.SetStateAction<CommissionLog[]>>;

  setRedemptions?: React.Dispatch<React.SetStateAction<Redemption[]>>;
}




type ViewMode = 'DASHBOARD' | 'FULL_USER_LIST' | 'FULL_VENDOR_LIST' | 'VENDOR_DRILLDOWN' | 'COMMISSION_REPORT';

interface VendorStat {
  vendor: Vendor;
  count: number;
  revenue: number;
}

interface PayoutGroup {
  id: string;
  date: string;
  bookings: Redemption[];
  totalAmount: number;
}

interface TrekStat {
  trekId: string;
  trekName: string;
  count: number;
  revenue: number;
  discount: number;
  dates: Set<string>;
  lastActive: Date;
}


const CouponDetailView: React.FC<CouponDetailViewProps> = ({
  coupon,
  allRedemptions,
  onBack,
  publicView = false,
  vendors,
  withdrawalRequests,
  setWithdrawalRequests,
  commissionLogs,
  setCommissionLogs,
  setRedemptions
}) => {
  const safeWithdrawalRequests = withdrawalRequests ?? [];
  const safeCommissionLogs = commissionLogs ?? [];
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [payoutBatches, setPayoutBatches] = useState<PayoutBatch[]>([]);

  // Effect: Fetch Payout Batches
  React.useEffect(() => {
    if (coupon.scope === 'INFLUENCER') {
      payoutApi.getAll(coupon.code)
        .then(setPayoutBatches)
        .catch(console.error);
    }
  }, [coupon.code, coupon.scope]);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditActive, setAuditActive] = useState(false);
  const [showPayoutRequest, setShowPayoutRequest] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [payoutError, setPayoutError] = useState('');

  const [adminAlert, setAdminAlert] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: ''
  });

  const [approveConfirm, setApproveConfirm] = useState<{ isOpen: boolean, request: WithdrawalRequest | null }>({ isOpen: false, request: null });
  const [rejectDialog, setRejectDialog] = useState({ isOpen: false, requestId: '', reason: '' });
  const [showTerms, setShowTerms] = useState(true);


  // Data: Filter global redemptions for this coupon
  const redemptions = useMemo(() => {
    return allRedemptions.filter(r => r.couponCode === coupon.code);
  }, [allRedemptions, coupon.code]);

  const couponWithdrawalRequests = useMemo(() => {
    return (withdrawalRequests || []).filter(
      w => w.couponCode === coupon.code
    );
  }, [withdrawalRequests, coupon.code]);

  // Derived: Commission Stats (For Influencer Coupons)
  const commissionStats = useMemo(() => {
    const eligible = redemptions.filter(
      r => r.commissionAmount !== undefined
    );

    const totalEarned = eligible.reduce(
      (sum, r) => sum + (r.commissionAmount || 0),
      0
    );

    // ✅ ONLY approved withdrawals affect balances
    const approvedPaid = (withdrawalRequests || [])
      .filter(w => w.status === 'APPROVED' && w.couponCode === coupon.code)
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingPayout = Math.max(totalEarned - approvedPaid, 0);

    return {
      totalBookings: eligible.length,
      totalEarned,
      pendingPayout,
      paidOut: approvedPaid
    };
  }, [redemptions, withdrawalRequests, coupon.code]);


  // Derived: Payout History (from API)
  const dynamicPayouts = useMemo(() => {
    return payoutBatches.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [payoutBatches]);

  // ACTION HANDLERS
  // ACTION HANDLERS
  const handleApprove = async () => {
    const req = approveConfirm.request;
    if (!req) return;

    const batchId = `PB-${Date.now()}`;

    try {
      // 1. Approve via API
      await withdrawalApi.approve(req.id, 'Admin');

      // 2. Create Payout Batch via API
      const payoutBatch: PayoutBatch = {
        id: batchId,
        couponCode: coupon.code,
        date: new Date().toISOString(),
        period: 'Manual Approval',
        bookingsCount: commissionStats.totalBookings,
        totalAmount: req.amount,
        mode: coupon.config.upiId ? 'UPI' : 'Bank Transfer',
        status: 'COMPLETED'
      };
      await payoutApi.create(payoutBatch);

      // 3. Update Payout Batches State
      setPayoutBatches(prev => [payoutBatch, ...prev]);

      // 4. Optimistic UI Updates
      if (setWithdrawalRequests) {
        setWithdrawalRequests(prev =>
          prev.map(r =>
            r.id === req.id
              ? {
                ...r,
                status: 'APPROVED',
                processedAt: new Date().toISOString(),
                processedBy: 'Admin'
              }
              : r
          )
        );
      }

      if (setCommissionLogs) {
        setCommissionLogs(prev => [
          {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'WITHDRAWAL_APPROVED',
            amount: req.amount,
            performer: 'Admin',
            details: `Payout batch ${batchId} approved`
          },
          ...prev
        ]);
      }

      setApproveConfirm({ isOpen: false, request: null });

    } catch (error) {
      console.error("Approval failed", error);
      // You might want to show an error toast here
    }
  };


  const handleReject = async () => {
    const { requestId, reason } = rejectDialog;

    try {
      await withdrawalApi.reject(requestId, 'Admin User', reason);

      if (setWithdrawalRequests) {
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? {
          ...r,
          status: 'REJECTED',
          rejectionReason: reason,
          processedAt: new Date().toISOString(),
          processedBy: 'Admin User'
        } : r));
      }

      if (setCommissionLogs) {
        setCommissionLogs(prev => [{
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'WITHDRAWAL_REJECTED',
          amount: 0,
          performer: 'Admin User',
          details: `Rejected withdrawal ${requestId}. Reason: ${reason}`
        }, ...prev]);
      }

      setRejectDialog({ isOpen: false, requestId: '', reason: '' });
    } catch (error) {
      console.error("Rejection failed", error);
    }
  };

  // Derived: Commission Trend Data
  const commissionTrendData = useMemo(() => {
    const data = [];
    const days = 14;

    const grouped = redemptions.reduce((acc, curr) => {
      const d = new Date(curr.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      acc[d] = (acc[d] || 0) + (curr.commissionAmount || 0);
      return acc;
    }, {} as Record<string, number>);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      data.push({
        name: key,
        commission: grouped[key] || 0
      });
    }
    return data;
  }, [redemptions]);

  const sanitizedPlatformTerms = useMemo(() => {
    if (coupon.scope !== 'PLATFORM' || !coupon.config?.termsAndConditions) {
      return '';
    }

    return DOMPurify.sanitize(
      coupon.config.termsAndConditions,
      { USE_PROFILES: { html: true } }
    );
  }, [coupon]);
  const pointWiseTerms = useMemo(() => {
    if (
      coupon.scope === 'PLATFORM' ||
      !Array.isArray(coupon.config?.termsAndConditions) ||
      coupon.config.termsAndConditions.length === 0
    ) {
      return null;
    }

    return coupon.config.termsAndConditions;
  }, [coupon]);
  const renderPointWiseTerms = () => {
    if (!pointWiseTerms) return null;

    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 uppercase">
              Terms & Conditions
            </h3>
          </div>

          <button
            onClick={() => setShowTerms(prev => !prev)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            {showTerms ? 'Hide' : 'View'}
          </button>
        </div>

        {showTerms && (
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 max-h-64 overflow-y-auto">
            {pointWiseTerms.map((term: string, idx: number) => (
              <li key={idx}>{term}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Derived: Dynamic Chart Data
  const chartData = useMemo(() => {
    const data = [];
    const days = 14;

    const grouped = redemptions.reduce((acc, curr) => {
      const d = new Date(curr.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      data.push({
        name: key,
        value: grouped[key] || 0
      });
    }
    return data;
  }, [redemptions]);

  // Derived Stats
  const vendorStats = useMemo(() => {
    const stats = new Map<string, VendorStat>();

    redemptions.forEach(r => {
      const vId = r.vendorId || 'unknown';

      if (!stats.has(vId)) {
        const vendorObj = vendors.find(v => v.id === vId) || { 
          id: vId, 
          name: r.vendorName || 'Unknown', 
          tier: 'STANDARD', 
          region: 'Unknown', 
          credibilityScore: 0, 
          performanceRating: 0 
        } as Vendor;
        stats.set(vId, { vendor: vendorObj, count: 0, revenue: 0 });
      }
      const curr = stats.get(vId)!;
      curr.count += 1;
      curr.revenue += r.bookingAmount;
    });

    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  }, [redemptions]);

  // Is Single Vendor Context?
  const isSingleVendor = !!coupon.config.requestedByVendorId || (coupon.scope === 'SPECIAL' && coupon.targetVendorIds?.length === 1);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM': return <Instagram size={14} className="text-pink-600" />;
      case 'YOUTUBE': return <Youtube size={14} className="text-red-600" />;
      case 'FACEBOOK': return <Facebook size={14} className="text-blue-600" />;
      case 'TWITTER': return <Twitter size={14} className="text-sky-500" />;
      default: return <ExternalLink size={14} className="text-gray-500" />;
    }
  };

  // --- VIEW RENDERERS ---

  const renderAudit = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <History size={18} className="text-indigo-500" /> Financial Audit Tab
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-400 font-bold uppercase border-b">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action Type</th>
              <th className="px-6 py-4 text-right">Value Impact</th>
              <th className="px-6 py-4">Performer</th>
              <th className="px-6 py-4">Detailed Audit Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {commissionLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-500 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-700 uppercase">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-blue-600">
                  {log.amount > 0 ? `₹${log.amount.toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 border border-gray-200 uppercase">
                      {log.performer.charAt(0)}
                    </div>
                    <span className="text-gray-600">{log.performer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 italic max-w-xs truncate">
                  {log.details}
                </td>
              </tr>
            ))}
            {commissionLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                  No financial audit logs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWithdrawals = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <CreditCard size={18} className="text-blue-500" /> Withdrawal Requests
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-400 font-bold uppercase border-b">
            <tr>
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">Request Date & Time</th>
              <th className="px-6 py-4 text-right">Pending at Time</th>
              <th className="px-6 py-4 text-right">Amount Requested</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {couponWithdrawalRequests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-blue-600">{req.id}</td>
                <td className="px-6 py-4 font-medium text-gray-600">
                  {new Date(req.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 text-right font-mono text-gray-400">₹{req.pendingAtRequest.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">₹{req.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    req.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {req.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setApproveConfirm({ isOpen: true, request: req })}
                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setRejectDialog({ ...rejectDialog, isOpen: true, requestId: req.id })}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 italic">
                      {req.status === 'REJECTED' ? `Rejected: ${req.rejectionReason}` : `By ${req.processedBy}`}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {couponWithdrawalRequests.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 italic">No withdrawal requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RenderCommissionReport = () => {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');

    const filteredPayouts = dynamicPayouts.filter(p => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
      if (filterDate && !p.date.includes(filterDate)) return false;
      return true;
    });

    return (
      <div className="space-y-6 animate-fade-in relative pb-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-indigo-600" />
              Commission & Payout Report
            </h2>
            <p className="text-sm text-gray-500">Earnings analysis and transaction history for {coupon.config.influencerName}.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditActive(!auditActive)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${auditActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              <History size={16} /> {auditActive ? 'View Report' : 'Audit'}
            </button>
            <button
              onClick={() => { setAuditActive(false); setViewMode('DASHBOARD'); }}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 bg-white border-gray-200"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
        </div>

        {auditActive ? (
          renderAudit()
        ) : (
          <>
            {/* Commission Config Summary */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-wrap gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Commission Type</span>
                <span className="text-lg font-bold text-indigo-900">{coupon.config.commissionType}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Calculation Basis</span>
                <span className="text-sm font-bold text-indigo-900 bg-white px-2 py-1 rounded border border-indigo-200">
                  {coupon.config.commissionBasis?.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Rate / Value</span>
                <span className="text-lg font-bold text-indigo-900">
                  {coupon.config.commissionType === 'TIERED' ? 'Tiered Slabs' :
                    (coupon.config.commissionType === 'FLAT' ? `₹${coupon.config.commissionValue}` : `${coupon.config.commissionValue}%`)}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Lock-in Period</span>
                <div className="flex items-center gap-1 text-indigo-900 font-bold">
                  <Clock size={16} /> {coupon.config.payoutRules?.lockInDays || 0} Days
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Eligible Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{commissionStats.totalBookings}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Life Time Earned</p>
                <p className="text-2xl font-bold text-indigo-600">₹{commissionStats.totalEarned.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Present Pending Amount</p>
                <p className="text-2xl font-bold text-orange-500">₹{commissionStats.pendingPayout.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{commissionStats.paidOut.toLocaleString()}</p>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Commission Trend</h3>
                <span className="text-xs text-gray-400 font-mono">Last 14 Days</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={commissionTrendData}>
                    <defs>
                      <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="commission" stroke="#4f46e5" strokeWidth={2} fill="url(#colorComm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* WITHDRAWAL REQUESTS TABLE */}
            {renderWithdrawals()}

            {/* Payout History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Payout Transaction History</h3>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="FAILED">Failed</option>
                  </select>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Transaction Date & Time</th>
                    <th className="px-6 py-4">Cycle / Period</th>
                    <th className="px-6 py-4 text-center">Bookings Qty</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayouts.length > 0 ? filteredPayouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-gray-700">{pay.id}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(pay.date).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {pay.period}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700 font-bold">{pay.bookingsCount}</td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-700">₹{pay.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${pay.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                          pay.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}>{pay.status}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        No payout transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* 🔥 Request Payout (ADMIN ONLY) */}
              {publicView && commissionStats.pendingPayout > 0 && (
                <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => {
                      setRequestedAmount(commissionStats.pendingPayout.toString());
                      setShowPayoutRequest(true);
                      setPayoutError('');
                    }}
                    className="
        bg-gradient-to-r from-indigo-600 to-indigo-700
        text-white px-6 py-2.5 rounded-xl
        text-sm font-bold
        hover:from-indigo-700 hover:to-indigo-800
        shadow-lg shadow-indigo-200
        transition-all duration-200
        flex items-center gap-2
        hover:scale-105
      "
                  >
                    <CreditCard size={16} />
                    Request Payout
                  </button>
                </div>
              )}

            </div>
          </>
        )}

        {/* MODALS AND OVERLAYS */}

        {/* Approval Confirmation Modal */}
        {approveConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Approve Withdrawal</h3>
              <p className="text-gray-500 mb-6 text-sm">Are you sure you want to approve this withdrawal request for <span className="font-bold text-gray-900">₹{approveConfirm.request?.amount.toLocaleString()}</span>?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setApproveConfirm({ isOpen: false, request: null })} className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500">Cancel</button>
                <button onClick={handleApprove} className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100">Approve</button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Dialog Modal */}
        {rejectDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <XCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Reject Payout Request</h3>
              <textarea
                className="w-full border border-gray-200 rounded-2xl p-4 text-sm mb-6 h-32 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                placeholder="Provide a reason for rejection..."
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setRejectDialog({ ...rejectDialog, isOpen: false, requestId: '', reason: '' })} className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500">Dismiss</button>
                <button
                  onClick={handleReject}
                  disabled={!rejectDialog.reason}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}


      </div>

    );
  };

  const RenderVendorDrillDown = () => {
    if (!selectedVendor) return null;

    const vendorRedemptions = redemptions.filter(r => r.vendorId === selectedVendor.id);

    const vendorTotalRevenue = vendorRedemptions.reduce((sum, r) => sum + r.bookingAmount, 0);
    const vendorAvgOrder = vendorRedemptions.length > 0 ? vendorTotalRevenue / vendorRedemptions.length : 0;

    const trekStats = Object.values(vendorRedemptions.reduce((acc: Record<string, TrekStat>, r: Redemption) => {
      if (!acc[r.trekId]) {
        acc[r.trekId] = {
          trekId: r.trekId,
          trekName: r.trekName,
          count: 0,
          revenue: 0,
          discount: 0,
          dates: new Set<string>(),
          lastActive: new Date(r.date)
        };
      }
      acc[r.trekId].count++;
      acc[r.trekId].revenue += r.bookingAmount;
      acc[r.trekId].discount += r.discountAmount;
      acc[r.trekId].dates.add(new Date(r.date).toLocaleDateString());
      if (new Date(r.date) > acc[r.trekId].lastActive) {
        acc[r.trekId].lastActive = new Date(r.date);
      }
      return acc;
    }, {} as Record<string, TrekStat>));

    trekStats.sort((a, b) => b.count - a.count);
    const maxTrekCount = Math.max(...trekStats.map((t: TrekStat) => t.count), 1);

    return (
      <div className="flex flex-col h-full animate-fade-in space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl font-bold text-gray-800">
                {selectedVendor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wide ${selectedVendor.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    selectedVendor.tier === 'GOLD' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                    {selectedVendor.tier}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12} /> {selectedVendor.region}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Vendor Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{vendorTotalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Avg Order Value</p>
                <p className="text-xl font-bold text-gray-700">₹{Math.round(vendorAvgOrder).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Coupon Usage</p>
                <div className="flex items-center justify-end gap-2">
                  <p className="text-xl font-bold text-blue-600">{vendorRedemptions.length}</p>
                  <span className="text-xs bg-blue-50 text-blue-600 px-1.5 rounded">
                    {Math.round((vendorRedemptions.length / redemptions.length) * 100)}% of total
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gray-50 to-transparent -z-0"></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-orange-500" />
              Trek Performance Analytics
            </h3>
            <span className="text-xs text-gray-500">Breakdown by Trek ID</span>
          </div>

          {trekStats.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Trek Details</th>
                    <th className="px-6 py-4">Volume (Count)</th>
                    <th className="px-6 py-4 text-right">Revenue Generated</th>
                    <th className="px-6 py-4 text-right">Discount Given</th>
                    <th className="px-6 py-4 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trekStats.map((stat: TrekStat) => (
                    <tr key={stat.trekId} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{stat.trekName}</p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5 flex items-center gap-1">
                            <Tag size={10} /> {stat.trekId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 w-6">{stat.count}</span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(stat.count / maxTrekCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-gray-900">₹{stat.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">Total Booking Value</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-emerald-600">-₹{stat.discount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">
                          {Math.round((stat.discount / stat.revenue) * 100)}% Avg Savings
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500">
                        {stat.lastActive.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        <br />
                        <span className="text-[10px] opacity-75">{stat.lastActive.toLocaleTimeString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              No trek usage data available for this vendor.
            </div>
          )}
        </div>
      </div>
    );
  };

  const RenderFullUserList = () => {
    const [localSearch, setLocalSearch] = useState('');

    const filteredRedemptions = redemptions.filter(r =>
      r.userName.toLowerCase().includes(localSearch.toLowerCase()) ||
      (r.userId && r.userId.toLowerCase().includes(localSearch.toLowerCase())) ||
      r.trekName.toLowerCase().includes(localSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-base font-bold text-gray-900">Full User Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">All redemptions for this coupon</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users or treks..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Trek</th>
                <th className="px-6 py-3 text-right">Date & Time</th>
                <th className="px-6 py-3 text-right">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRedemptions.length > 0 ? filteredRedemptions.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {r.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{r.userName}</p>
                        <p className="text-[10px] text-gray-400">{r.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{r.trekName}</span>
                      <span className="text-[10px] text-gray-400">ID: {r.trekId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500 text-right font-mono">
                    {new Date(r.date).toLocaleDateString()} {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-3 text-xs text-emerald-600 text-right font-bold">
                    -₹{r.discountAmount}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400 text-sm">No redemptions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const RenderFullVendorList = () => {
    const [localSearch, setLocalSearch] = useState('');

    const filteredVendors = vendorStats.filter(({ vendor }) =>
      vendor.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      vendor.region.toLowerCase().includes(localSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-base font-bold text-gray-900">Full Vendor List</h3>
            <p className="text-xs text-gray-500 mt-0.5">Vendors participating in this coupon</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search vendors..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-gray-50">
            {filteredVendors.length > 0 ? filteredVendors.map(({ vendor, count, revenue }) => (
              <div
                key={vendor.id}
                onClick={() => { setSelectedVendor(vendor); setViewMode('VENDOR_DRILLDOWN'); }}
                className="p-4 flex items-center justify-between hover:bg-blue-50/30 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm border border-orange-200">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{vendor.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${vendor.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        vendor.tier === 'GOLD' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {vendor.tier}
                      </span>
                      <span className="text-xs text-gray-400">• {vendor.region}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{count} Uses</p>
                  <p className="text-xs text-gray-400">₹{revenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400 text-sm">No vendors found.</div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderPlatformTerms = () => {
    if (
      coupon.scope !== 'PLATFORM' ||
      !sanitizedPlatformTerms
    ) {
      return null;
    }

    return (
      <div className="mt-4 pt-4 border-t border-white/20">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
            Terms & Conditions
          </h4>

          <button
            onClick={() => setShowTerms(prev => !prev)}
            className="text-[10px] font-bold text-emerald-100 hover:text-white transition-colors"
          >
            {showTerms ? 'Hide' : 'View'}
          </button>
        </div>

        {/* Content */}
        {showTerms && (
          <div
            className="
            bg-white/95 text-gray-800
            rounded-xl p-4
            max-h-56 overflow-y-auto
            prose prose-sm max-w-none
          "
            dangerouslySetInnerHTML={{
              __html: sanitizedPlatformTerms
            }}
          />
        )}
      </div>
    );
  };

  const renderRightColumnTerms = () => {
    if (
      coupon.scope !== 'PLATFORM' ||
      !sanitizedPlatformTerms
    ) {
      return null;
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 uppercase">
              Terms & Conditions
            </h3>
          </div>

          <button
            onClick={() => setShowTerms(prev => !prev)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            {showTerms ? 'Hide' : 'View'}
          </button>
        </div>

        {showTerms && (
          <div
            className="prose prose-sm max-w-none text-gray-700 max-h-64 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: sanitizedPlatformTerms }}
          />
        )}
      </div>
    );
  };
  const renderPublicPayoutHistory = () => {
    if (coupon.scope !== 'INFLUENCER') return null;

    const payouts = dynamicPayouts;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">
            Payout Transaction History
          </h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 font-bold text-gray-500 uppercase border-b">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Cycle</th>
              <th className="px-6 py-4 text-center">Bookings</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {payouts.length > 0 ? payouts.map(pay => (
              <tr key={pay.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono">{pay.id}</td>
                <td className="px-6 py-4">
                  {new Date(pay.date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 text-gray-500">{pay.period}</td>
                <td className="px-6 py-4 text-center font-bold">{pay.bookingsCount}</td>
                <td className="px-6 py-4 text-right font-bold text-indigo-700">
                  ₹{pay.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-0.5 rounded border text-[10px] font-bold uppercase bg-green-100 text-green-700 border-green-200">
                    {pay.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No payout transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* ✅ REQUEST PAYOUT BUTTON — COPY LINK PAGE ONLY */}
        {commissionStats.pendingPayout > 0 && (
          <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                setRequestedAmount(commissionStats.pendingPayout.toString());
                setShowPayoutRequest(true);
                setPayoutError('');
              }}
              className="
            bg-gradient-to-r from-indigo-600 to-indigo-700
            text-white px-6 py-2.5 rounded-xl
            text-sm font-bold
            hover:from-indigo-700 hover:to-indigo-800
            shadow-lg shadow-indigo-200
            transition-all duration-200
            flex items-center gap-2
          "
            >
              <CreditCard size={16} />
              Request Payout
            </button>
          </div>
        )}

      </div>
    );
  };
  const RenderDashboard = () => {
    const showVendorModule = coupon.scope === 'SPECIAL' || (['NORMAL', 'PREMIUM'].includes(coupon.scope) && !isSingleVendor);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10">

              {/* Performance Overview */}
              <div className="flex items-center gap-2 mb-3 opacity-90">
                <TrendingUp size={20} className="text-white" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Performance Overview
                </span>
              </div>


              {/* Campaign Analytics */}
              <h2 className="text-2xl font-bold mt-4">Campaign Analytics</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {coupon.status === 'DRAFT'
                  ? 'Coupon is currently inactive. Activate to start tracking data.'
                  : 'Real-time redemption data across all channels.'
                }
              </p>


            </div>

            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
            <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Uses</p>
              <p className="text-3xl font-black text-gray-900">
                {coupon.usageCount} <span className="text-sm font-medium text-gray-400">/ {coupon.totalUsageLimit}</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Savings</p>
              <p className="text-3xl font-black text-gray-900">₹{(coupon.usageCount * (coupon.mode === 'FLAT' ? coupon.config.discountValue : 450)).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Limit Used</p>
              <p className="text-3xl font-black text-gray-900">{Math.min(100, Math.round((coupon.usageCount / coupon.totalUsageLimit) * 100))}%</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${Math.min(100, (coupon.usageCount / coupon.totalUsageLimit) * 100)}%` }}></div>
              </div>
            </div>
          </div>
          {/* 🔐 Public Influencer Commission & Payout Summary (LINK PAGE ONLY) */}
          {publicView && coupon.scope === 'INFLUENCER' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

              <div className="flex items-center gap-2 mb-4">

              </div>

              {/* CONFIG */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Commission Type</p>
                  <p className="text-sm font-bold">{coupon.config.commissionType}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Calculation Basis</p>
                  <p className="text-sm font-bold">
                    {coupon.config.commissionBasis?.replace(/_/g, ' ')}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Rate / Value</p>
                  <p className="text-sm font-bold text-indigo-600">
                    {coupon.config.commissionType === 'FLAT'
                      ? `₹${coupon.config.commissionValue}`
                      : `${coupon.config.commissionValue}%`}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Lock-in Period</p>
                  <p className="text-sm font-bold">
                    {coupon.config.payoutRules?.lockInDays || 0} Days
                  </p>
                </div>
              </div>

              {/* PAYOUT KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 font-bold uppercase">Total Eligible Bookings</p>
                  <p className="text-2xl font-bold">{commissionStats.totalBookings}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 font-bold uppercase">Lifetime Earned</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{commissionStats.totalEarned.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 font-bold uppercase">Present Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-500">
                    ₹{commissionStats.pendingPayout.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border">
                  <p className="text-xs text-gray-400 font-bold uppercase">Total Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{commissionStats.paidOut.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                <h3 className="text-base font-bold text-gray-900">Redemption Trend</h3>
              </div>
              <select className="text-xs border-none bg-gray-50 rounded-lg p-1 text-gray-500 font-medium cursor-pointer focus:ring-0">
                <option>Last 14 Days</option>
              </select>

            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, dy: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 🔓 Public Payout Transaction History (COPY LINK PAGE ONLY) */}
          {publicView && coupon.scope === 'INFLUENCER' && renderPublicPayoutHistory()}

          {showVendorModule ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {coupon.scope === 'SPECIAL' ? 'Targeted Vendors' : 'Participating Vendors'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Top performers for this coupon code</p>
                </div>
                <button
                  onClick={() => setViewMode('FULL_VENDOR_LIST')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  View Full List <ArrowRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {vendorStats.length > 0 ? vendorStats.slice(0, 5).map(({ vendor, count, revenue }) => (
                  <div
                    key={vendor.id}
                    onClick={() => { setSelectedVendor(vendor); setViewMode('VENDOR_DRILLDOWN'); }}
                    className="p-4 flex items-center justify-between hover:bg-blue-50/30 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm border border-orange-200">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{vendor.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${vendor.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            vendor.tier === 'GOLD' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {vendor.tier}
                          </span>
                          <span className="text-xs text-gray-400">• {vendor.region}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{count} Uses</p>
                      <p className="text-xs text-gray-400">₹{revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-400 text-sm">No vendors have used this coupon yet.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {isSingleVendor ? 'Trekker Redemptions' : 'Recent Users'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isSingleVendor ? `Activity for ${coupon.config.requestedByVendorName || 'Vendor'}` : 'Latest redemptions by customers'}
                  </p>
                </div>
                <button
                  onClick={() => setViewMode('FULL_USER_LIST')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  View Full Report <ArrowRight size={14} />
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Trek</th>
                    <th className="px-6 py-3 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {redemptions.length > 0 ? redemptions.slice(0, 8).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            {r.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">{r.userName}</p>
                            <p className="text-[10px] text-gray-400">{r.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{r.trekName}</span>
                          <span className="text-[10px] text-gray-400">ID: {r.trekId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500 text-right font-mono">
                        {new Date(r.date).toLocaleDateString()} {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-400 text-sm">No redemptions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="space-y-6">



          {/* Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">

            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Tag size={18} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 uppercase">Configuration</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Mode</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700 uppercase">{coupon.mode}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Value</span>
                <span className="text-lg font-bold text-emerald-600">
                  {coupon.mode === 'PERCENTAGE' ? `${coupon.config.discountValue}% OFF` : `₹${coupon.config.discountValue}`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Max Cap</span>
                <span className="text-sm font-bold text-gray-900">₹{coupon.config.maxDiscount || 'UNLIMITED'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Min Order</span>
                <span className="text-sm font-bold text-gray-900">{coupon.config.minOrderValue ? `₹${coupon.config.minOrderValue}` : '-'}</span>
              </div>

              {coupon.config.specificTrekName && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-2">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                    <MapPin size={10} /> Limited To
                  </p>
                  <p className="text-sm font-bold text-gray-900">{coupon.config.specificTrekName}</p>
                </div>
              )}

              {coupon.scope === 'INFLUENCER' && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 mt-2">
                  <p className="text-[10px] font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1">
                    <Percent size={10} /> Commission Logic
                  </p>
                  <div className="text-xs space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Basis:</span>
                      <span className="font-bold text-right w-24 truncate" title={coupon.config.commissionBasis}>{coupon.config.commissionBasis?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-bold">{coupon.config.commissionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate:</span>
                      <span className="font-bold text-indigo-700">
                        {coupon.config.commissionType === 'TIERED' ? 'Tiered Slabs' :
                          (coupon.config.commissionType === 'FLAT' ? `₹${coupon.config.commissionValue}` : `${coupon.config.commissionValue}%`)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-indigo-200 mt-1 pt-1">
                      <span className="text-gray-500">Lock-In:</span>
                      <span className="font-bold">{coupon.config.payoutRules?.lockInDays || 0} Days</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Validity</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{new Date(coupon.validFrom).toLocaleDateString()} - {coupon.validTill ? new Date(coupon.validTill).toLocaleDateString() : 'Forever'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  <span>
                    Created{' '}
                    {new Date(coupon.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>

              </div>
              {/* Terms & Conditions */}
              {coupon.scope === 'PLATFORM'
                ? renderRightColumnTerms()
                : renderPointWiseTerms()
              }
              {coupon.scope === 'INFLUENCER' && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-400 uppercase">Influencer Details</h4>
                    {!publicView && (
                      <button
                        onClick={() => { setAuditActive(false); setViewMode('COMMISSION_REPORT'); }}
                        className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1"
                      >
                        <BarChart size={10} /> View Commission Report
                      </button>
                    )}

                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {coupon.config.influencerName?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{coupon.config.influencerName}</p>
                      <a href={`mailto:${coupon.config.influencerEmail}`} className="text-xs text-blue-500 hover:underline truncate block">
                        {coupon.config.influencerEmail || 'No Email'}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <a href={`tel:${coupon.config.influencerMobile}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Phone size={14} className="text-gray-400" />
                      <span>{coupon.config.influencerMobile || 'N/A'}</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coupon.config.influencerAddress || '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Home size={14} className="text-gray-400 mt-0.5" />
                      <span className="text-xs leading-tight">{coupon.config.influencerAddress || 'No address provided'}</span>
                      <ExternalLink size={10} className="opacity-50 mt-0.5" />
                    </a>
                  </div>

                  {coupon.config.influencerSocials && coupon.config.influencerSocials.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Social Accounts</p>
                      <div className="space-y-2">
                        {coupon.config.influencerSocials.map((social, idx) => (
                          <a
                            key={idx}
                            href={social.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between text-xs bg-white border border-gray-200 p-2 rounded-lg hover:border-blue-300 transition-all group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              {getSocialIcon(social.platform)}
                              <span className="font-bold text-gray-700 group-hover:text-blue-600">{social.platform.charAt(0) + social.platform.slice(1).toLowerCase()}</span>
                              <span className="text-gray-400 truncate max-w-[80px] group-hover:text-gray-500">{social.handle}</span>
                            </div>
                            <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
                    <p className="text-purple-800 font-bold text-xs uppercase flex items-center gap-1"><Landmark size={12} /> Payment Info</p>

                    <div className="text-xs space-y-1">
                      {coupon.config.upiId ? (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CreditCard size={12} className="text-gray-400" />
                          <span className="font-mono">{coupon.config.upiId}</span>
                          <span className="text-[10px] text-gray-400 uppercase bg-white border px-1 rounded">UPI</span>
                        </div>
                      ) : null}

                      {coupon.config.bankAccountNumber ? (
                        <div className="mt-2 pt-2 border-t border-purple-100">
                          <p className="font-bold text-gray-800">{coupon.config.bankName}</p>
                          <p className="text-gray-600">Acc: <span className="font-mono">•••• {coupon.config.bankAccountNumber.slice(-4)}</span></p>
                          <p className="text-gray-500 text-[10px]">IFSC: {coupon.config.bankIfsc}</p>
                          <p className="text-gray-500 text-[10px]">Holder: {coupon.config.bankAccountHolder}</p>
                        </div>
                      ) : !coupon.config.upiId && (
                        <p className="text-gray-400 italic">No payment details provided.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleBack = () => {
    if (auditActive) {
      setAuditActive(false);
      return;
    }
    if (viewMode === 'VENDOR_DRILLDOWN') {
      setViewMode('FULL_VENDOR_LIST');
      return;
    }
    if (viewMode === 'COMMISSION_REPORT') {
      setViewMode('DASHBOARD');
      return;
    }
    if (viewMode !== 'DASHBOARD') {
      setViewMode('DASHBOARD');
      return;
    }
    onBack();
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in pb-6">
      {adminAlert.visible && !publicView && (
        <div className="fixed top-6 right-6 z-[200] animate-slide-in">
          <div className="
      bg-indigo-600 text-white
      px-6 py-4 rounded-xl
      shadow-xl shadow-indigo-300
      flex items-start gap-3
      max-w-sm
    ">
            <CheckCircle size={20} className="mt-0.5" />
            <div>
              <p className="font-bold text-sm">Admin Alert</p>
              <p className="text-xs opacity-90 mt-1">
                {adminAlert.message}
              </p>
            </div>
          </div>
        </div>
      )}
      {publicView && showPayoutRequest && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Request Payout</h3>
                    <p className="text-indigo-100 text-sm">Submit withdrawal request</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPayoutRequest(false);
                    setPayoutError('');
                    setRequestedAmount('');
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">

              {/* Influencer Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg border-2 border-indigo-200">
                    {coupon.config.influencerName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{coupon.config.influencerName}</p>
                    <p className="text-xs text-gray-500">{coupon.config.influencerEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={12} className="text-gray-400" />
                    <span>{coupon.config.influencerMobile || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={12} className="text-gray-400" />
                    <span className="truncate">{coupon.config.influencerEmail?.split('@')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-600 uppercase">Pending Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    ₹{commissionStats.pendingPayout.toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-xs font-bold text-green-600 uppercase">Total Paid</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{commissionStats.paidOut.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    value={requestedAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setRequestedAmount(value);

                      // Validation
                      const numValue = parseInt(value) || 0;
                      if (numValue > commissionStats.pendingPayout) {
                        setPayoutError(`Amount cannot exceed pending balance of ₹${commissionStats.pendingPayout.toLocaleString()}`);
                      } else if (numValue < 100 && numValue > 0) {
                        setPayoutError('Minimum withdrawal amount is ₹100');
                      } else {
                        setPayoutError('');
                      }
                    }}
                    className={`
                w-full pl-8 pr-4 py-3
                border-2 rounded-xl
                text-lg font-bold
                focus:ring-4 focus:ring-indigo-100
                outline-none transition-all
                ${payoutError
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-indigo-500'
                      }
              `}
                  />
                </div>



                {/* Error Message */}
                {payoutError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{payoutError}</p>
                  </div>
                )}

                {/* Info Message */}
                {!payoutError && requestedAmount && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Activity size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-600">
                      You are requesting <strong>₹{parseInt(requestedAmount || '0').toLocaleString()}</strong> out of ₹{commissionStats.pendingPayout.toLocaleString()} pending balance.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method Display */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark size={14} className="text-purple-600" />
                  <span className="text-xs font-bold text-purple-700 uppercase">Payment Method</span>
                </div>

                {coupon.config.upiId ? (
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-200">
                    <CreditCard size={14} className="text-purple-500" />
                    <span className="font-mono text-sm text-gray-700">{coupon.config.upiId}</span>
                    <span className="ml-auto text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold">UPI</span>
                  </div>
                ) : coupon.config.bankAccountNumber ? (
                  <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-1 text-xs">
                    <p className="font-bold text-gray-800">{coupon.config.bankName}</p>
                    <p className="text-gray-600">Account: <span className="font-mono">•••• {coupon.config.bankAccountNumber.slice(-4)}</span></p>
                    <p className="text-gray-500">IFSC: {coupon.config.bankIfsc}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No payment method configured</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 rounded-b-3xl border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowPayoutRequest(false);
                    setPayoutError('');
                    setRequestedAmount('');
                  }}
                  className="
              px-4 py-3 
              border-2 border-gray-300 
              rounded-xl 
              font-bold text-gray-700
              hover:bg-gray-100 
              transition-all
            "
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const finalAmount = parseInt(requestedAmount) || 0;

                    if (finalAmount < 100) {
                      setPayoutError('Minimum withdrawal amount is ₹100');
                      return;
                    }

                    if (finalAmount > commissionStats.pendingPayout) {
                      setPayoutError('Amount exceeds pending balance');
                      return;
                    }

                    // Create withdrawal request
                    const newRequest: WithdrawalRequest = {
                      id: `WDR-${Date.now()}`,
                      requestedAt: new Date().toISOString(),
                      amount: finalAmount,
                      pendingAtRequest: commissionStats.pendingPayout,
                      status: 'PENDING',
                      couponCode: coupon.code,
                      influencerName: coupon.config.influencerName
                    };

                    try {
                      // Call API for PUBLIC view as well if needed, or handle differently.
                      // Assuming public view also uses API but maybe different endpoint? 
                      // For now, using same withdrawalApi.create. 
                      // NOTE: In public view, user might not be 'Admin'. 
                      // But this logic is shared.

                      await withdrawalApi.create({
                        userId: coupon.config.influencerEmail, // Or some ID
                        couponCode: coupon.code,
                        influencerName: coupon.config.influencerName,
                        amount: finalAmount,
                        pendingAtRequest: commissionStats.pendingPayout,
                      });

                      // ✅ 1. Always create ONE withdrawal request in state (if admin state exists)
                      if (setWithdrawalRequests) {
                        setWithdrawalRequests(prev => [newRequest, ...prev]);
                      }

                      // ✅ 2. Always create ONE commission log (if admin state exists)
                      if (setCommissionLogs) {
                        setCommissionLogs(prev => [
                          {
                            id: `LOG-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            action: 'WITHDRAWAL_REQUESTED',
                            amount: finalAmount,
                            performer: coupon.config.influencerName || 'Influencer',
                            details: `New withdrawal request for ₹${finalAmount.toLocaleString()}`
                          },
                          ...prev
                        ]);
                      }

                      // ✅ 3. Show admin alert ONLY on admin page
                      if (!publicView) {
                        setAdminAlert({
                          visible: true,
                          message: `New payout request of ₹${finalAmount.toLocaleString()} submitted by ${coupon.config.influencerName}`
                        });

                        setTimeout(() => {
                          setAdminAlert({ visible: false, message: '' });
                        }, 5000);
                      }

                      // ✅ 4. NO LONGER save to localStorage

                      // Close modal and reset
                      setShowPayoutRequest(false);
                      setRequestedAmount('');
                      setPayoutError('');

                      // Optional: Show success notification
                      console.log('Payout request submitted:', newRequest);

                    } catch (err) {
                      console.error("Payout Request Failed", err);
                      setPayoutError("Failed to submit request: " + (err as Error).message);
                    }
                  }}
                  disabled={!requestedAmount || !!payoutError || parseInt(requestedAmount) === 0}
                  className="
              px-4 py-3
              bg-gradient-to-r from-indigo-600 to-indigo-700
              text-white rounded-xl
              font-bold
              hover:from-indigo-700 hover:to-indigo-800
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-indigo-200
              transition-all
              flex items-center justify-center gap-2
            "
                >
                  <Check size={18} />
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!publicView && (
            <button
              onClick={handleBack}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div>
            {viewMode === 'DASHBOARD' ? (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono">{coupon.code}</h1>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${coupon.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                    {coupon.status}
                  </span>
                </div>
                <p className="text-gray-500 mt-1 text-sm">{coupon.description}</p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="text-gray-400">{coupon.code}</span>
                <span className="text-gray-300">/</span>
                <span>
                  {viewMode === 'FULL_USER_LIST' && 'Full User Report'}
                  {viewMode === 'FULL_VENDOR_LIST' && (coupon.scope === 'SPECIAL' ? 'Targeted Vendors' : 'Participating Vendors')}
                  {viewMode === 'VENDOR_DRILLDOWN' && 'Vendor Details'}
                  {viewMode === 'COMMISSION_REPORT' && 'Commission Report'}
                </span>
              </div>
            )}
          </div>
        </div>

        {viewMode === 'DASHBOARD' && !publicView && (
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Created By
            </span>
            <span className="text-sm font-bold text-gray-800">
              {coupon.createdBy}
            </span>
          </div>
        )}

      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {viewMode === 'DASHBOARD' && <RenderDashboard />}
        {viewMode === 'FULL_USER_LIST' && <RenderFullUserList />}
        {viewMode === 'FULL_VENDOR_LIST' && <RenderFullVendorList />}
        {viewMode === 'VENDOR_DRILLDOWN' && <RenderVendorDrillDown />}
        {viewMode === 'COMMISSION_REPORT' && <RenderCommissionReport />}
      </div>
    </div>
  );
};

export default CouponDetailView;
