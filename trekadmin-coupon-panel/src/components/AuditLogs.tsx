
import React, { useState, useMemo } from 'react';
import { Search, Clock, Calendar, Filter, User, Activity, Shield, Layout, FileText, Download } from 'lucide-react';
import { AuditLog, TargetType } from '../types';

interface AuditLogsProps {
    logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<TargetType | 'ALL'>('ALL');
    const [filterPerformer, setFilterPerformer] = useState<string>('');

    // Date Presets
    const [datePreset, setDatePreset] = useState<string>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    const presets = ['All', 'Today', 'This Week', 'This Month', 'This Year', 'Last Week', 'Last Month'];

    // Filtering Logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Global Search (Details, Target, Name, Performer)
            const s = searchTerm.toLowerCase();
            if (searchTerm && !(
                log.details.toLowerCase().includes(s) ||
                log.target.toLowerCase().includes(s) ||
                (log.targetName && log.targetName.toLowerCase().includes(s)) ||
                log.performer.toLowerCase().includes(s)
            )) return false;

            // Type Filter
            if (filterType !== 'ALL' && log.targetType !== filterType) return false;

            // Action Filter
            if (filterAction !== 'ALL' && log.action !== filterAction) return false;

            // Performer Filter
            if (filterPerformer && !log.performer.toLowerCase().includes(filterPerformer.toLowerCase())) return false;

            // Date Logic
            const logDate = new Date(log.timestamp);
            const now = new Date();

            if (dateFrom && logDate < new Date(dateFrom)) return false;
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59);
                if (logDate > endDate) return false;
            }

            if (datePreset !== 'All') {
                const startOfWeek = (d: Date) => {
                    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
                    return new Date(d.setDate(diff));
                };

                if (datePreset === 'Today') {
                    if (logDate.toDateString() !== now.toDateString()) return false;
                } else if (datePreset === 'This Week') {
                    const sw = startOfWeek(new Date()); sw.setHours(0, 0, 0, 0);
                    if (logDate < sw) return false;
                } else if (datePreset === 'Last Week') {
                    const sw = startOfWeek(new Date()); sw.setDate(sw.getDate() - 7); sw.setHours(0, 0, 0, 0);
                    const ew = new Date(sw); ew.setDate(ew.getDate() + 7);
                    if (logDate < sw || logDate >= ew) return false;
                } else if (datePreset === 'This Month') {
                    if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) return false;
                } else if (datePreset === 'Last Month') {
                    const lm = new Date(); lm.setMonth(lm.getMonth() - 1);
                    if (logDate.getMonth() !== lm.getMonth() || logDate.getFullYear() !== lm.getFullYear()) return false;
                } else if (datePreset === 'This Year') {
                    if (logDate.getFullYear() !== now.getFullYear()) return false;
                }
            }

            return true;
        });
    }, [logs, searchTerm, filterAction, filterType, filterPerformer, datePreset, dateFrom, dateTo]);

    // Grouping Logic
    const groupedLogs = useMemo(() => {
        return filteredLogs.reduce((acc: Record<string, AuditLog[]>, log) => {
            const date = new Date(log.timestamp);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let key = date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            if (date.toDateString() === today.toDateString()) {
                key = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = 'Yesterday';
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(log);
            return acc;
        }, {});
    }, [filteredLogs]);

    // Sort keys to ensure Today comes first
    const sortedKeys = useMemo(() => {
        return Object.keys(groupedLogs).sort((a, b) => {
            if (a === 'Today') return -1;
            if (b === 'Today') return 1;
            if (a === 'Yesterday') return -1;
            if (b === 'Yesterday') return 1;
            return new Date(b).getTime() - new Date(a).getTime();
        });
    }, [groupedLogs]);

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'DELETE':
            case 'TERMINATE': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'ACTIVATE': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'DEACTIVATE': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'CONFIG_CHANGE': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'EXPIRE': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-6 animate-slide-in pb-10">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Shield className="text-indigo-600" size={24} /> Immutable System Audit
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Official registry of administrative operations</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest text-[9px]">
                    <Download size={14} /> EXPORT CSV
                </button>
            </div>

            {/* Advanced Filters Block */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Discovery</label>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:ring-2 ring-indigo-500/10">
                            <Search size={14} className="text-slate-400" />
                            <input type="text" placeholder="Target or Keywords..." className="bg-transparent text-[11px] font-bold outline-none w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Action Type</label>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <Activity size={14} className="text-slate-400" />
                            <select
                                className="bg-transparent text-[11px] font-bold outline-none w-full cursor-pointer"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            >
                                <option value="ALL">All Actions</option>
                                <option value="CREATE">Created</option>
                                <option value="UPDATE">Modified</option>
                                <option value="DELETE">Destroyed</option>
                                <option value="ACTIVATE">Activated</option>
                                <option value="DEACTIVATE">Deactivated</option>
                                <option value="EXPIRE">Expired</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Scope</label>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <Layout size={14} className="text-slate-400" />
                            <select
                                className="bg-transparent text-[11px] font-bold outline-none w-full cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            >
                                <option value="ALL">All Categories</option>
                                <option value="COUPON">Coupons Only</option>
                                <option value="BADGE">CTA Modules Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performer</label>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <User size={14} className="text-slate-400" />
                            <input type="text" placeholder="Admin ID..." className="bg-transparent text-[11px] font-bold outline-none w-full" value={filterPerformer} onChange={e => setFilterPerformer(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporal Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDatePreset(p)}
                                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${datePreset === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Range Identification</label>
                        <div className="flex items-center gap-3">
                            <input type="date" className="flex-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-bold" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                            <span className="text-slate-300 font-black">→</span>
                            <input type="date" className="flex-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-bold" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <tr>
                                <th className="px-8 py-4">Protocol Time</th>
                                <th className="px-8 py-4">Scope</th>
                                <th className="px-8 py-4">Action</th>
                                <th className="px-8 py-4">Target Identity</th>
                                <th className="px-8 py-4">Performer Node</th>
                                <th className="px-8 py-4">Operation Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedKeys.map((dateKey) => (
                                <React.Fragment key={dateKey}>
                                    <tr className="bg-slate-50/30">
                                        <td colSpan={6} className="px-8 py-2.5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-slate-50">
                                            {dateKey}
                                        </td>
                                    </tr>
                                    {groupedLogs[dateKey].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono font-black">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${log.targetType === 'BADGE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {log.targetType === 'BADGE' ? 'CTA-MODULE' : 'COUPON'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 font-mono">{log.target}</span>
                                                    {log.targetName && <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-0.5">{log.targetName}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600 border border-slate-200">
                                                            {log.performer.charAt(0)}
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-700">{log.performer}</span>
                                                    </div>
                                                    {log.performerId && <span className="text-[8px] font-black text-slate-300 ml-7 uppercase tracking-widest">ID: {log.performerId}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[11px] font-bold text-slate-500 italic max-w-sm group-hover:text-slate-700 transition-colors">
                                                    {log.details}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {sortedKeys.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-24">
                                        <FileText size={48} className="mx-auto text-slate-100 mb-4" />
                                        <p className="text-xl font-black text-slate-200 uppercase tracking-widest">No Logs Identified</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
