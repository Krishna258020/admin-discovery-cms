import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Tag,
  DollarSign,
  ChevronRight,
  Calendar,
  Filter
} from 'lucide-react';
import {
  DashboardStats,
  Redemption,
  TrendDataPoint,
  TimeFilter
} from '../types';

/* ---------------- KPI Card ---------------- */

const KPICard = ({ title, value, sub, icon: Icon, trend, trendValue }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
        <Icon size={22} />
      </div>
      {trendValue !== null && trendValue !== undefined && (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trendValue >= 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {trendValue >= 0 ? '+' : ''}{trendValue.toFixed(1)}%
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);

/* ---------------- Dashboard ---------------- */

interface DashboardProps {
  stats: DashboardStats;
  redemptions: Redemption[];
  trendData: TrendDataPoint[];
  activeFilter: TimeFilter;
  onFilterChange: (f: TimeFilter) => void;
  onViewAllRedemptions: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  stats,
  redemptions,
  activeFilter,
  onFilterChange,
  onViewAllRedemptions
}) => {
  /* ---------------- Custom Date Range ---------------- */

  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  /* ---------------- Filtering Logic ---------------- */

  const filteredRedemptions = useMemo(() => {
    const now = new Date();

    return redemptions.filter(r => {
      const d = new Date(r.date);

      if (activeFilter === 'ALL') return true;

      if (activeFilter === 'THIS MONTH')
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

      if (activeFilter === 'LAST MONTH') {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
      }

      if (activeFilter === 'THIS YEAR')
        return d.getFullYear() === now.getFullYear();

      if (activeFilter === 'LAST YEAR')
        return d.getFullYear() === now.getFullYear() - 1;

      if (activeFilter === 'CUSTOM' && customRange.from && customRange.to) {
        const from = new Date(customRange.from);
        const to = new Date(customRange.to);
        to.setHours(23, 59, 59);
        return d >= from && d <= to;
      }

      return true;
    });
  }, [redemptions, activeFilter, customRange]);

  /* ---------------- KPI Stats with Trends ---------------- */

  const filteredStats = useMemo(
    () =>
      filteredRedemptions.reduce(
        (acc, r) => {
          acc.totalRevenue += r.bookingAmount;
          acc.totalRedemptions += 1;
          acc.totalSavings += r.discountAmount;
          return acc;
        },
        { totalRevenue: 0, totalRedemptions: 0, totalSavings: 0 }
      ),
    [filteredRedemptions]
  );

  // Calculate previous period stats for trend comparison
  const trendStats = useMemo(() => {
    const now = new Date();
    let previousPeriodRedemptions: Redemption[] = [];

    if (activeFilter === 'THIS MONTH') {
      // Compare with last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousPeriodRedemptions = redemptions.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
    } else if (activeFilter === 'LAST MONTH') {
      // Compare with 2 months ago
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      previousPeriodRedemptions = redemptions.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === twoMonthsAgo.getMonth() && d.getFullYear() === twoMonthsAgo.getFullYear();
      });
    } else if (activeFilter === 'THIS YEAR') {
      // Compare with last year
      previousPeriodRedemptions = redemptions.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === now.getFullYear() - 1;
      });
    } else if (activeFilter === 'LAST YEAR') {
      // Compare with 2 years ago
      previousPeriodRedemptions = redemptions.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === now.getFullYear() - 2;
      });
    } else if (activeFilter === 'CUSTOM' && customRange.from && customRange.to) {
      // Compare with same duration before the custom range
      const from = new Date(customRange.from);
      const to = new Date(customRange.to);
      const duration = to.getTime() - from.getTime();
      const prevFrom = new Date(from.getTime() - duration);
      const prevTo = new Date(from.getTime());
      
      previousPeriodRedemptions = redemptions.filter(r => {
        const d = new Date(r.date);
        return d >= prevFrom && d < prevTo;
      });
    }

    const prevStats = previousPeriodRedemptions.reduce(
      (acc, r) => {
        acc.totalRevenue += r.bookingAmount;
        acc.totalRedemptions += 1;
        acc.totalSavings += r.discountAmount;
        return acc;
      },
      { totalRevenue: 0, totalRedemptions: 0, totalSavings: 0 }
    );

    // Calculate percentage changes
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      revenueTrend: calculateTrend(filteredStats.totalRevenue, prevStats.totalRevenue),
      redemptionsTrend: calculateTrend(filteredStats.totalRedemptions, prevStats.totalRedemptions),
      savingsTrend: calculateTrend(filteredStats.totalSavings, prevStats.totalSavings),
    };
  }, [filteredRedemptions, redemptions, activeFilter, customRange, filteredStats]);

  /* ---------------- Redemption Volume (Chart) ---------------- */

  const volumeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRedemptions.forEach(r => {
      const day = new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' });
      map[day] = (map[day] || 0) + 1;
    });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
      name: d,
      redemptions: map[d] || 0
    }));
  }, [filteredRedemptions]);

  /* ---------------- Traffic Source ---------------- */

  const scopeDistribution = useMemo(() => {
    return filteredRedemptions.reduce((acc, r) => {
      acc[r.scope] = (acc[r.scope] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredRedemptions]);

  const trafficData = [
    { name: 'Platform', value: scopeDistribution.PLATFORM || 0, color: '#3b82f6' },
    { name: 'Partner', value: scopeDistribution.NORMAL || 0, color: '#10b981' },
    { name: 'Special', value: scopeDistribution.SPECIAL || 0, color: '#f59e0b' },
    { name: 'Premium', value: scopeDistribution.PREMIUM || 0, color: '#8b5cf6' },
    { name: 'Influencer', value: scopeDistribution.INFLUENCER || 0, color: '#ec4899' }
  ].filter(d => d.value > 0);

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
        <span className="text-sm text-green-600 font-medium">Live Updates Active</span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'THIS MONTH', 'LAST MONTH', 'THIS YEAR', 'LAST YEAR'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f as TimeFilter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                activeFilter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border">
          <Calendar size={14} className="text-gray-400" />
          <input
            type="date"
            className="bg-transparent text-xs focus:outline-none"
            value={customRange.from}
            onChange={e => {
              setCustomRange({ ...customRange, from: e.target.value });
              onFilterChange('CUSTOM');
            }}
          />
          —
          <input
            type="date"
            className="bg-transparent text-xs focus:outline-none"
            value={customRange.to}
            onChange={e => {
              setCustomRange({ ...customRange, to: e.target.value });
              onFilterChange('CUSTOM');
            }}
          />
          <Filter size={12} className="text-gray-500" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`₹${(filteredStats.totalRevenue / 1e5).toFixed(1)}L`} 
          sub={activeFilter === 'ALL' ? 'All Time' : 'vs Previous Period'} 
          icon={DollarSign} 
          trendValue={activeFilter === 'ALL' ? null : trendStats.revenueTrend} 
        />
        <KPICard 
          title="Redemptions" 
          value={filteredStats.totalRedemptions} 
          sub={activeFilter === 'ALL' ? 'All Time' : 'vs Previous Period'} 
          icon={Users} 
          trendValue={activeFilter === 'ALL' ? null : trendStats.redemptionsTrend} 
        />
        <KPICard 
          title="Total Savings" 
          value={`₹${(filteredStats.totalSavings / 1e5).toFixed(1)}L`} 
          sub={activeFilter === 'ALL' ? 'All Time' : 'vs Previous Period'} 
          icon={TrendingUp} 
          trendValue={activeFilter === 'ALL' ? null : trendStats.savingsTrend} 
        />
        <KPICard 
          title="Active Coupons" 
          value={stats.activeCoupons} 
          sub="System State" 
          icon={Tag} 
          trendValue={null} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Redemption Volume */}
        <div className="bg-white p-6 rounded-xl border lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Redemption Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="redemptions"
                  stroke="#f59e0b"
                  fill="#fde68a"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Source */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-bold mb-4">Traffic Source</h3>
          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={trafficData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {trafficData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Redemptions */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 flex justify-between border-b">
          <h3 className="text-lg font-bold">Recent Redemptions</h3>
          <button
            onClick={onViewAllRedemptions}
            className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            View All History <ChevronRight size={14} />
          </button>
        </div>

        {filteredRedemptions.slice(0, 6).map(r => (
          <div key={r.id} className="flex justify-between p-4 border-b last:border-0">
            <div>
              <p className="font-medium">{r.userName}</p>
              <p className="text-xs text-gray-500">{r.couponCode}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">-₹{r.discountAmount}</p>
              <p className="text-[10px] text-gray-400">
                {new Date(r.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
