import React, { useMemo, useState } from 'react';
import {
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Redemption, TimeFilter } from '../types';

interface RedemptionHistoryViewProps {
  redemptions: Redemption[];
  timeFilter: TimeFilter;
  onTimeFilterChange: (f: TimeFilter) => void;
  onBack: () => void;
}

const RedemptionHistoryView: React.FC<RedemptionHistoryViewProps> = ({
  redemptions,
  timeFilter,
  onTimeFilterChange,
  onBack
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100;

  // Local-only filters
  const [searchCode, setSearchCode] = useState('');
  const [searchTrekId, setSearchTrekId] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  /* ---------------- Filter Logic (SYNCED WITH DASHBOARD) ---------------- */

  const filteredData = useMemo(() => {
    const now = new Date();

    return redemptions.filter(item => {
      const itemDate = new Date(item.date);

      if (
        searchCode &&
        !item.couponCode.toLowerCase().includes(searchCode.toLowerCase())
      ) return false;

      if (
        searchTrekId &&
        !item.trekId.toLowerCase().includes(searchTrekId.toLowerCase())
      ) return false;

      if (timeFilter === 'THIS MONTH') {
        if (
          itemDate.getMonth() !== now.getMonth() ||
          itemDate.getFullYear() !== now.getFullYear()
        ) return false;
      }

      if (timeFilter === 'LAST MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (
          itemDate.getMonth() !== lastMonth.getMonth() ||
          itemDate.getFullYear() !== lastMonth.getFullYear()
        ) return false;
      }

      if (timeFilter === 'THIS YEAR') {
        if (itemDate.getFullYear() !== now.getFullYear()) return false;
      }

      if (timeFilter === 'LAST YEAR') {
        if (itemDate.getFullYear() !== now.getFullYear() - 1) return false;
      }

      if (dateRange.from && itemDate < new Date(dateRange.from)) return false;

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59);
        if (itemDate > toDate) return false;
      }

      return true;
    });
  }, [redemptions, timeFilter, searchCode, searchTrekId, dateRange]);

  /* ---------------- Pagination ---------------- */

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">All Redemptions History</h2>
          <p className="text-sm text-gray-500">
            {filteredData.length} records found
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border flex flex-col flex-1 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Timeframe
            </label>
            <div className="flex border rounded-lg p-1">
              {[
                'ALL',
                'THIS MONTH',
                'LAST MONTH',
                'THIS YEAR',
                'LAST YEAR'
              ].map(tf => (
                <button
                  key={tf}
                  onClick={() => onTimeFilterChange(tf as TimeFilter)}
                  className={`flex-1 py-1 text-xs font-bold rounded-md ${
                    timeFilter === tf
                      ? 'bg-gray-100 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Coupon Code"
              className="pl-9 pr-4 py-2 border rounded-xl text-sm w-full"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
            />
          </div>

          <div className="relative">
            <Tag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Trek ID"
              className="pl-9 pr-4 py-2 border rounded-xl text-sm w-full"
              value={searchTrekId}
              onChange={e => setSearchTrekId(e.target.value)}
            />
          </div>

          <input
            type="date"
            className="border rounded-xl px-3 py-2 text-sm"
            value={dateRange.from}
            onChange={e =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
          />

          <input
            type="date"
            className="border rounded-xl px-3 py-2 text-sm"
            value={dateRange.to}
            onChange={e =>
              setDateRange({ ...dateRange, to: e.target.value })
            }
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold">Txn ID</th>
                <th className="px-6 py-4 text-xs font-bold">User</th>
                <th className="px-6 py-4 text-xs font-bold">Coupon</th>
                <th className="px-6 py-4 text-xs font-bold text-right">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-right">Discount</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map(rec => (
                <tr key={rec.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs font-mono">{rec.id}</td>
                  <td className="px-6 py-4 font-bold">{rec.userName}</td>
                  <td className="px-6 py-4 font-mono">{rec.couponCode}</td>
                  <td className="px-6 py-4 text-right text-xs">
                    {new Date(rec.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    -₹{rec.discountAmount}
                  </td>
                </tr>
              ))}
              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Showing {indexOfFirstRecord + 1}–
            {Math.min(indexOfLastRecord, filteredData.length)} of{' '}
            {filteredData.length}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedemptionHistoryView;
