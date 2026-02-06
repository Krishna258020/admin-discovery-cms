
import React, { useState, useMemo } from 'react';
import { Plus, Search, User, Edit2, Eye, Trash2, ToggleLeft, ToggleRight, Clock, Calendar, FileText, ChevronDown } from 'lucide-react';
import { Badge, BadgeStatus } from '../types';
import BadgePreview from './BadgePreview';

interface BadgeMasterProps {
  badges: Badge[];
  onCreateClick: () => void;
  onViewClick: (badge: Badge) => void;
  onEditClick: (badge: Badge) => void;
  onStatusToggle: (badgeId: string) => void;
  onDelete: (badgeId: string) => void;
}

const BadgeMaster: React.FC<BadgeMasterProps> = ({ badges, onCreateClick, onViewClick, onEditClick, onStatusToggle, onDelete }) => {
  const [activeTab, setActiveTab] = useState<BadgeStatus>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [performerTerm, setPerformerTerm] = useState('');
  const [expirySearch, setExpirySearch] = useState('');
  const [datePreset, setDatePreset] = useState<string>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const tabs: { label: string; value: BadgeStatus }[] = [
    { label: 'ACTIVE NODES', value: 'ACTIVE' },
    { label: 'INACTIVE NODES', value: 'INACTIVE' },
    { label: 'EXPIRED NODES', value: 'EXPIRED' },
    { label: 'TERMINATED NODES', value: 'DELETED' },
  ];

  const presets = ['All', 'This Week', 'This Month', 'This Year', 'Last Week', 'Last Month', 'Last Year'];

  const filteredBadges = useMemo(() => {
    return badges.filter(b => {
      if (b.status !== activeTab) return false;

      // Add null checks for all fields
      const matchesSearch = (b.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (b.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesPerformer = (b.creatorName?.toLowerCase() || '').includes(performerTerm.toLowerCase()) ||
        (b.createdById?.toLowerCase() || '').includes(performerTerm.toLowerCase()) ||
        (b.lastActionBy?.toLowerCase() || '').includes(performerTerm.toLowerCase()) ||
        (b.lastActionById?.toLowerCase() || '').includes(performerTerm.toLowerCase());

      const matchesExpirySearch = (b.expiryDate || '').includes(expirySearch);

      if (!matchesSearch || !matchesPerformer || !matchesExpirySearch) return false;

      let comparisonDateStr = b.createdAt;
      if (activeTab === 'EXPIRED') comparisonDateStr = b.expiryDate;
      if (activeTab === 'DELETED' && b.deletedAt) comparisonDateStr = b.deletedAt;

      const compDate = new Date(comparisonDateStr);
      const now = new Date();

      if (fromDate && compDate < new Date(fromDate)) return false;
      if (toDate && compDate > new Date(toDate)) return false;

      if (datePreset !== 'All') {
        const startOfWeek = (d: Date) => {
          const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
          return new Date(d.setDate(diff));
        };

        if (datePreset === 'This Week') {
          const sw = startOfWeek(new Date()); sw.setHours(0, 0, 0, 0);
          if (compDate < sw) return false;
        } else if (datePreset === 'Last Week') {
          const sw = startOfWeek(new Date()); sw.setDate(sw.getDate() - 7); sw.setHours(0, 0, 0, 0);
          const ew = new Date(sw); ew.setDate(ew.getDate() + 7);
          if (compDate < sw || compDate >= ew) return false;
        } else if (datePreset === 'This Month') {
          if (compDate.getMonth() !== now.getMonth() || compDate.getFullYear() !== now.getFullYear()) return false;
        } else if (datePreset === 'Last Month') {
          const lm = new Date(); lm.setMonth(lm.getMonth() - 1);
          if (compDate.getMonth() !== lm.getMonth() || compDate.getFullYear() !== lm.getFullYear()) return false;
        } else if (datePreset === 'This Year') {
          if (compDate.getFullYear() !== now.getFullYear()) return false;
        } else if (datePreset === 'Last Year') {
          if (compDate.getFullYear() !== now.getFullYear() - 1) return false;
        }
      }
      return true;
    });
  }, [badges, activeTab, searchTerm, performerTerm, expirySearch, datePreset, fromDate, toDate]);

  const handleToggleConfirm = (badge: Badge) => {
    const action = badge.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE';
    if (window.confirm(`CONFIRM: Do you want to ${action} the module "${badge.name}"?`)) {
      onStatusToggle(badge.id);
    }
  };

  const handleDeleteConfirm = (badge: Badge) => {
    if (window.confirm(`WARNING: Permanent termination of module "${badge.name}" requested. This action moves the record to terminal archives. Proceed?`)) {
      onDelete(badge.id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 focus-within:ring-2 ring-indigo-500/10 transition-all">
          <Search size={20} className="text-slate-400" />
          <input type="text" placeholder="Search Registry by Badge Name or ID..." className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={onCreateClick} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-black transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest text-[10px]">
          <Plus size={18} /> CREATE NEW BADGE
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performers Search</label>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <User size={14} className="text-slate-400" />
              <input type="text" placeholder="ID or Name..." className="bg-transparent text-xs font-bold outline-none w-full" value={performerTerm} onChange={e => setPerformerTerm(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Lookup</label>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Calendar size={14} className="text-slate-400" />
              <input type="text" placeholder="YYYY-MM-DD..." className="bg-transparent text-xs font-bold outline-none w-full" value={expirySearch} onChange={e => setExpirySearch(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Date Interval</label>
            <div className="flex items-center gap-2">
              <input type="date" className="flex-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-bold" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              <span className="text-slate-300 font-black">→</span>
              <input type="date" className="flex-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-bold" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          {presets.map(p => (
            <button key={p} onClick={() => setDatePreset(p)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${datePreset === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-8 border-b border-slate-100 px-4">
        {tabs.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab.value ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 pb-20">
        {filteredBadges.map((badge) => (
          <div key={badge.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all hover:shadow-2xl hover:border-indigo-100">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{badge.name}</h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><User size={12} className="text-indigo-500" /> {badge.creatorName} <span className="opacity-50">#{badge.createdById}</span></span>
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500" /> {new Date(badge.createdAt).toLocaleString()}</span>
                    </div>
                    {badge.description && (
                      <div className="flex items-start gap-1.5 mt-2 max-w-sm"><FileText size={12} className="text-slate-300 mt-0.5 shrink-0" /><p className="text-[11px] font-medium text-slate-500 line-clamp-2 italic">{badge.description}</p></div>
                    )}
                  </div>
                </div>
                <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${badge.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' : badge.tier === 'PLATINUM' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{badge.tier} Tier</div>
              </div>

              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {(badge.tier === 'GOLD' || badge.tier === 'BOTH') && badge.goldLimits && (
                      <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100">
                        <div className="flex items-center justify-between mb-3 border-b border-amber-100/50 pb-2"><p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Gold Governance</p></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-[9px] font-black text-amber-600 uppercase opacity-50">Total Cap</p><p className="font-black text-amber-700 text-xl">{badge.goldLimits?.maxLifetime || 0}</p></div>
                          <div><p className="text-[9px] font-black text-amber-600 uppercase opacity-50">Monthly Peak</p><p className="font-black text-amber-700 text-xl">{badge.goldLimits?.maxPerMonth || 0}</p></div>
                        </div>
                      </div>
                    )}
                    {(badge.tier === 'PLATINUM' || badge.tier === 'BOTH') && badge.platinumLimits && (
                      <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                        <div className="flex items-center justify-between mb-3 border-b border-indigo-100/50 pb-2"><p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Platinum Governance</p></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-[9px] font-black text-indigo-600 uppercase opacity-50">Total Cap</p><p className="font-black text-indigo-700 text-xl">{badge.platinumLimits?.maxLifetime || 0}</p></div>
                          <div><p className="text-[9px] font-black text-indigo-600 uppercase opacity-50">Monthly Peak</p><p className="font-black text-indigo-700 text-xl">{badge.platinumLimits?.maxPerMonth || 0}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/3 flex flex-col items-center justify-center border-l border-slate-50 pl-8">
                  <div className="relative group/preview mb-8"><div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150 opacity-0 group-hover/preview:opacity-100 transition-opacity"></div><BadgePreview name={badge.name} styling={badge.styling} className="scale-100 relative" /></div>
                  <div className="text-[10px] text-center text-slate-400 space-y-3 w-full">
                    <div className="bg-slate-50 p-4 rounded-[24px] text-left border border-slate-100"><p className="text-[8px] font-black uppercase tracking-widest mb-2 text-slate-400">Last Revision Protocol</p>{badge.lastActionAt ? (<div className="space-y-1"><p className="font-black text-slate-700 leading-tight flex items-center gap-1"><User size={10} /> {badge.lastActionBy}</p><p className="text-[8px] font-bold text-slate-400">{new Date(badge.lastActionAt).toLocaleString()}</p></div>) : <p className="text-slate-300 italic">Initial Deployment</p>}</div>
                    <p className="font-black uppercase tracking-[0.2em] text-rose-500 py-1 border-t border-slate-50 mt-2">EXPIRES: {badge.expiryDate || 'PERPETUAL'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 px-8 py-5 flex justify-between items-center border-t border-slate-100">
              <div className="flex gap-4">
                <button onClick={() => onViewClick(badge)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl transition-all shadow-sm"><Eye size={20} /></button>
                <button onClick={() => onEditClick(badge)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 rounded-2xl transition-all shadow-sm"><Edit2 size={20} /></button>
              </div>
              <div className="flex items-center gap-4">
                {activeTab !== 'DELETED' && (
                  <button onClick={() => handleToggleConfirm(badge)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl border transition-all ${badge.status === 'ACTIVE' ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 shadow-sm' : 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'}`}>
                    {badge.status === 'ACTIVE' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {badge.status === 'ACTIVE' ? 'To Inactive' : 'To Active'}
                  </button>
                )}
                {activeTab !== 'DELETED' && (<button onClick={() => handleDeleteConfirm(badge)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-2xl transition-all shadow-sm"><Trash2 size={20} /></button>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeMaster;
