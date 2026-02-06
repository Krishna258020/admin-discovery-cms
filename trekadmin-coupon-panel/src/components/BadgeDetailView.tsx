
import React, { useState, useMemo } from 'react';
import {
    Search, Eye, ChevronLeft, User, MapPin, ArrowRight, Target,
    FileText, ArrowUpDown, BarChart4, ChevronRight, Calendar, Clock
} from 'lucide-react';
import { Badge, VendorUsage, TrekUsage, Tier, Vendor } from '../types';
import BadgePreview from './BadgePreview';

interface BadgeDetailViewProps {
    badge: Badge;
    onBack: () => void;
    vendors: Vendor[];
}

// Helper to generate simulated treks based on usage count
const generateSimulatedTreks = (count: number, badgeName: string): TrekUsage[] => {
    return Array.from({ length: count }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
            id: `TR-${1000 + i}`,
            name: `${badgeName} Expedition ${i + 1}`,
            assignedAt: date.toISOString(),
            departure: new Date(date.getTime() + 86400000 * 7).toISOString().split('T')[0],
            arrival: new Date(date.getTime() + 86400000 * 14).toISOString().split('T')[0],
            bookings: Math.floor(Math.random() * 20),
            totalCapacity: 20
        };
    });
};

const BadgeDetailView: React.FC<BadgeDetailViewProps> = ({ badge, onBack, vendors }) => {
    const [viewingVendor, setViewingVendor] = useState<VendorUsage | null>(null);
    const [showFullVendors, setShowFullVendors] = useState(false);

    // Vendor List Filters
    const [vendorSearch, setVendorSearch] = useState('');
    const [vendorTierFilter, setVendorTierFilter] = useState<Tier | 'ALL'>('ALL');
    const [vendorSort, setVendorSort] = useState<'TOP' | 'LOW'>('TOP');

    // Trek List Filters (for Vendor View)
    const [trekSearch, setTrekSearch] = useState('');
    const [trekFromDate, setTrekFromDate] = useState('');
    const [trekToDate, setTrekToDate] = useState('');
    const [trekSortOrder, setTrekSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

    const sortedVendors = useMemo(() => {
        let list = [...vendors];
        if (vendorTierFilter !== 'ALL') list = list.filter(v => v.tier === vendorTierFilter);
        if (vendorSearch) list = list.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.id.toLowerCase().includes(vendorSearch.toLowerCase()));
        return list.sort((a, b) => vendorSort === 'TOP' ? b.usageCount - a.usageCount : a.usageCount - b.usageCount);
    }, [vendorTierFilter, vendorSearch, vendorSort, vendors]);

    // Derived Trek Data to match total usage
    const badgeTreks = useMemo(() => {
        const totalUsage = badge.usageCount.gold + badge.usageCount.platinum;
        return generateSimulatedTreks(totalUsage, badge.name);
    }, [badge]);

    const sortedTreks = useMemo(() => {
        let list = [...badgeTreks];
        if (trekSearch) {
            list = list.filter(t => t.name.toLowerCase().includes(trekSearch.toLowerCase()) || t.id.toLowerCase().includes(trekSearch.toLowerCase()));
        }
        if (trekFromDate) {
            list = list.filter(t => new Date(t.assignedAt) >= new Date(trekFromDate));
        }
        if (trekToDate) {
            list = list.filter(t => new Date(t.assignedAt) <= new Date(trekToDate));
        }
        return list.sort((a, b) => {
            const timeA = new Date(a.assignedAt).getTime();
            const timeB = new Date(b.assignedAt).getTime();
            return trekSortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
        });
    }, [badgeTreks, trekSearch, trekFromDate, trekToDate, trekSortOrder]);


    // --- VENDOR DEEP DIVE VIEW ---
    if (viewingVendor) {
        return (
            <div className="space-y-6 animate-slide-in pb-10">
                <button onClick={() => setViewingVendor(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold transition-all">
                    <ChevronLeft size={20} /> Back to Module Adoption
                </button>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${viewingVendor.tier === 'GOLD' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                            {viewingVendor.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{viewingVendor.name}</h2>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${viewingVendor.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {viewingVendor.tier} MATRIX
                                </span>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                <Target size={12} className="text-indigo-400" /> ID: {viewingVendor.id} • CREDIBILITY: {viewingVendor.credibilityScore}%
                            </p>
                        </div>
                    </div>
                    <div className="text-right bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                        <p className="text-2xl font-black text-slate-900 leading-none">{viewingVendor.usageCount}</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">ASSIGNED TREKS</p>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/20">
                        <h3 className="font-black text-base uppercase tracking-widest flex items-center gap-3 text-slate-800"><MapPin size={18} className="text-indigo-600" /> TREK ASSIGNMENT HISTORY</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="relative">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input type="text" placeholder="TREK ID / NAME..." className="pl-8 pr-3 py-1.5 border rounded-lg text-[8px] font-black uppercase outline-none focus:border-indigo-400" value={trekSearch} onChange={e => setTrekSearch(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <input type="date" className="px-2 py-1.5 border rounded-lg text-[8px] font-black uppercase outline-none" value={trekFromDate} onChange={e => setTrekFromDate(e.target.value)} />
                                <span className="text-slate-300">→</span>
                                <input type="date" className="px-2 py-1.5 border rounded-lg text-[8px] font-black uppercase outline-none" value={trekToDate} onChange={e => setTrekToDate(e.target.value)} />
                            </div>
                            <button onClick={() => setTrekSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')} className="p-1.5 border rounded-lg hover:bg-white transition-all text-slate-400 hover:text-indigo-600">
                                <ArrowUpDown size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[8px]">
                                <tr>
                                    <th className="px-8 py-3">ASSIGNMENT TIME</th>
                                    <th className="px-8 py-3">TREK CONTEXT</th>
                                    <th className="px-8 py-3">DURATION</th>
                                    <th className="px-8 py-3">BOOKINGS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sortedTreks.map(trek => (
                                    <tr key={trek.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-4 font-black text-slate-400 text-[10px] font-mono">{new Date(trek.assignedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                        <td className="px-8 py-4">
                                            <div className="font-black text-slate-800 text-xs group-hover:text-indigo-600 transition-colors">{trek.name}</div>
                                            <div className="text-[8px] font-black text-slate-300 uppercase">ID: {trek.id}</div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="text-[10px] font-black text-slate-600 flex items-center gap-2">
                                                {trek.departure} <ArrowRight size={10} className="text-slate-300" /> {trek.arrival}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(trek.bookings / trek.totalCapacity) * 100}%` }}></div>
                                                </div>
                                                <span className="font-black text-slate-900 text-[10px] whitespace-nowrap">{trek.bookings} / {trek.totalCapacity}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- FULL VENDOR LIST VIEW ---
    if (showFullVendors) {
        return (
            <div className="space-y-6 animate-slide-in pb-10">
                <button onClick={() => setShowFullVendors(false)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black transition-all">
                    <ChevronLeft size={18} /> Back to Intel Summary
                </button>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                        <div>
                            <h3 className="font-black text-xl tracking-tight uppercase tracking-widest">Full Adoption Registry</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Traced usage across all vendor nodes for {badge.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input type="text" placeholder="VENDOR ID/NAME..." className="pl-9 pr-4 py-2.5 border rounded-xl text-[9px] font-black uppercase outline-none focus:border-indigo-400" value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} />
                            </div>
                            <button onClick={() => setVendorSort(prev => prev === 'TOP' ? 'LOW' : 'TOP')} className="px-4 py-2.5 border rounded-xl text-[9px] font-black uppercase outline-none flex items-center gap-2 hover:bg-white transition-all">
                                <ArrowUpDown size={14} />
                                {vendorSort === 'TOP' ? 'HIGHEST' : 'LOWEST'}
                            </button>
                            <select className="px-4 py-2.5 border rounded-xl text-[9px] font-black uppercase outline-none" value={vendorTierFilter} onChange={e => setVendorTierFilter(e.target.value as any)}>
                                <option value="ALL">ALL TIERS</option>
                                <option value="GOLD">GOLD</option>
                                <option value="PLATINUM">PLATINUM</option>
                            </select>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b">
                            <tr>
                                <th className="px-10 py-5">VENDOR NODE</th>
                                <th className="px-10 py-5 text-center">RELIABILITY</th>
                                <th className="px-10 py-5 text-center">USAGE COUNT</th>
                                <th className="px-10 py-5 text-right">PROTOCOL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedVendors.map(v => (
                                <tr key={v.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2.5 h-2.5 rounded-full ${v.tier === 'GOLD' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                                            <div>
                                                <p className="font-black text-slate-900 text-base leading-none tracking-tighter">{v.name}</p>
                                                <p className="text-[8px] font-black text-slate-300 uppercase mt-1">ID: {v.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center font-black text-slate-500 text-[11px]">{v.credibilityScore}%</td>
                                    <td className="px-10 py-6 text-center font-black text-indigo-600 text-xl">{v.usageCount}</td>
                                    <td className="px-10 py-6 text-right">
                                        <button onClick={() => setViewingVendor(v)} className="p-3.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border transition-all"><ArrowRight size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // --- MAIN BADGE DETAILS VIEW ---
    return (
        <div className="space-y-6 animate-slide-in pb-10">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black transition-all">
                <ChevronLeft size={18} /> Back to Usage Matrix
            </button>

            <div className="space-y-8">
                {/* COMPACT HORIZONTAL BADGE INFO SECTION */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-wrap lg:flex-nowrap items-center gap-6 relative">
                    {/* Identity Cluster */}
                    <div className="flex-[1.5] min-w-[280px]">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">{badge.name}</h2>
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest whitespace-nowrap">{badge.tier} TIER</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[8px] font-black uppercase tracking-widest mb-3">
                            <span className="flex items-center gap-1.5"><User size={10} /> {badge.creatorName} <span className="opacity-50">#{badge.createdById}</span></span>
                            <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(badge.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-start gap-2 text-[10px] font-medium text-slate-400 italic bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <FileText size={12} className="mt-0.5 shrink-0" />
                            <span>{badge.description || 'Peak season trek high conversion module.'}</span>
                        </div>
                    </div>

                    {/* Governance Grid */}
                    <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(badge.tier === 'GOLD' || badge.tier === 'BOTH') && (
                            <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50">
                                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-4 border-b border-amber-100/30 pb-2">GOLD GOVERNANCE</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-[7px] font-black text-slate-300 uppercase">TOTAL CAP</p><p className="text-2xl font-black text-amber-700">{badge.goldLimits.maxLifetime}</p></div>
                                    <div><p className="text-[7px] font-black text-slate-300 uppercase">MONTHLY PEAK</p><p className="text-2xl font-black text-amber-700">{badge.goldLimits.maxPerMonth}</p></div>
                                </div>
                            </div>
                        )}
                        {(badge.tier === 'PLATINUM' || badge.tier === 'BOTH') && (
                            <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                                <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-100/30 pb-2">PLATINUM GOVERNANCE</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-[7px] font-black text-slate-300 uppercase">TOTAL CAP</p><p className="text-2xl font-black text-indigo-700">{badge.platinumLimits.maxLifetime}</p></div>
                                    <div><p className="text-[7px] font-black text-slate-300 uppercase">MONTHLY PEAK</p><p className="text-2xl font-black text-indigo-700">{badge.platinumLimits.maxPerMonth}</p></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Column */}
                    <div className="flex-1 min-w-[200px] flex flex-col gap-4 border-l border-slate-50 pl-6">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">LAST REVISION PROTOCOL</p>
                            <p className="text-[9px] font-bold text-slate-500 italic">
                                {badge.lastActionAt ? `${badge.lastActionBy} on ${new Date(badge.lastActionAt).toLocaleDateString()}` : 'Initial Deployment'}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${badge.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200'}`}>{badge.status}</span>
                                <p className="text-[9px] font-black text-rose-500 uppercase">EXPIRES: {badge.expiryDate}</p>
                            </div>
                            <div className="scale-75 origin-right">
                                <BadgePreview name={badge.name} styling={badge.styling} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Adoption Ranking */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/20">
                        <div>
                            <h3 className="font-black text-lg flex items-center gap-3 uppercase tracking-widest"><BarChart4 size={20} className="text-indigo-600" /> Adoption Ranking</h3>
                            <p className="text-[9px] font-black text-slate-400 mt-1">Leading vendors utilizing this configuration matrix</p>
                        </div>
                        {sortedVendors.length > 5 && (
                            <button onClick={() => setShowFullVendors(true)} className="px-6 py-2.5 bg-white hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all shadow-sm">VIEW FULL REGISTRY</button>
                        )}
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b">
                            <tr>
                                <th className="px-8 py-4">VENDOR PROFILE</th>
                                <th className="px-8 py-4 text-center">CREDIBILITY</th>
                                <th className="px-8 py-4 text-center">USAGE COUNT</th>
                                <th className="px-8 py-4 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedVendors.slice(0, 5).map(v => (
                                <tr key={v.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${v.tier === 'GOLD' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                                            <div>
                                                <p className="font-black text-slate-900 text-base tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{v.name}</p>
                                                <p className="text-[8px] font-black text-slate-300 uppercase mt-0.5">ID: {v.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center font-black text-slate-600 text-[11px]">{v.credibilityScore}%</td>
                                    <td className="px-8 py-5 text-center font-black text-indigo-600 text-xl">{v.usageCount}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => setViewingVendor(v)} className="p-3 bg-white hover:bg-slate-900 hover:text-white rounded-xl shadow-sm border transition-all active:scale-95"><ArrowRight size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BadgeDetailView;
