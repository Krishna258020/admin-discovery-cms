/**
 * Discovery Manager Page - Standalone Component
 * Ready to integrate into Trek Admin Coupon Module
 * 
 * Usage:
 * 1. Copy this file to your pages/ directory
 * 2. Add route: <Route path="/discovery-manager" element={<DiscoveryManagerPage />} />
 * 3. Add sidebar item with link to /discovery-manager
 */

import {
    Bell,
    Compass,
    Layout,
    TrendingUp
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ContentManager } from '../components/discovery/ContentManager';
import { ForecastManager } from '../components/discovery/ForecastManager';
import { ThemeManager } from '../components/discovery/ThemeManager';
import { MOCK_CONTENT, MOCK_THEMES } from '../constants/discovery.constants';
import { Status } from '../types/discovery.types';

type TabView = 'THEMES' | 'WHATS_NEW' | 'TOP_TREKS' | 'SHORTS' | 'FORECAST';

const DiscoveryManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('WHATS_NEW');

  // Stats Calculations
  const activeThemesCount = useMemo(() => 
    MOCK_THEMES.filter(t => t.status === Status.ACTIVE || t.status === Status.SCHEDULED).length, []
  );
  
  const totalTreks = useMemo(() => 
    MOCK_CONTENT.filter(c => c.category === 'TopTreks').length + 124, []
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'THEMES': return <ThemeManager />;
      case 'WHATS_NEW': return <ContentManager category="WhatsNew" title="What's New" />;
      case 'TOP_TREKS': return <ContentManager category="TopTreks" title="Top Treks" />;
      case 'SHORTS': return <ContentManager category="TrekShorts" title="Trek Shorts" />;
      case 'FORECAST': return <ForecastManager />;
      default: return <ThemeManager />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      
      {/* Page Header */}
      <header className="h-20 bg-[#F3F4F6] sticky top-0 z-10 px-8 flex items-center justify-between border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">
            Discovery Manager &nbsp; › &nbsp; <span className="text-slate-900">Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Discovery & Theme Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <div className="px-8 pb-12 overflow-y-auto flex-1">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 mt-6">
          <StatCard 
            label="Active Themes" 
            value={activeThemesCount} 
            subtext="<span class='text-green-600'>+1</span> since last week" 
            icon={<Layout size={22} className="text-blue-600" />}
            colorClass="bg-blue-50"
          />
          <StatCard 
            label="Total Treks" 
            value={totalTreks} 
            subtext="Published Content" 
            icon={<Compass size={22} className="text-purple-600" />}
            colorClass="bg-purple-50"
          />
          <StatCard 
            label="Forecast Integrity" 
            value="98%" 
            subtext="System verified. No outages." 
            icon={<CheckCircle2 size={22} className="text-green-600" />}
            colorClass="bg-green-50"
          />
          <StatCard 
            label="Engagement" 
            value="12.5k" 
            subtext="<span class='text-green-600'>+12%</span> vs previous month" 
            icon={<TrendingUp size={22} className="text-orange-600" />}
            colorClass="bg-orange-50"
          />
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
          
          {/* Tabs Navigation */}
          <div className="px-6 pt-6 border-b border-slate-100">
            <div className="flex gap-8 overflow-x-auto">
              <TabButton 
                label="What's New" 
                active={activeTab === 'WHATS_NEW'} 
                onClick={() => setActiveTab('WHATS_NEW')} 
              />
              <TabButton 
                label="Top Treks" 
                active={activeTab === 'TOP_TREKS'} 
                onClick={() => setActiveTab('TOP_TREKS')} 
              />
              <TabButton 
                label="Trek Shorts" 
                active={activeTab === 'SHORTS'} 
                onClick={() => setActiveTab('SHORTS')} 
              />
              <TabButton 
                label="Trek Forecast" 
                active={activeTab === 'FORECAST'} 
                onClick={() => setActiveTab('FORECAST')} 
              />
              <TabButton 
                label="Home Themes & Campaigns" 
                active={activeTab === 'THEMES'} 
                onClick={() => setActiveTab('THEMES')}
                badge="Active" 
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, subtext, icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
      <p className="text-xs font-medium text-slate-500" dangerouslySetInnerHTML={{ __html: subtext }}></p>
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const TabButton = ({ label, active, onClick, badge }: any) => (
  <button 
    onClick={onClick}
    className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap
      ${active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}
    `}
  >
    <div className="flex items-center gap-2">
      {label}
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
          ${active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'}
        `}>{badge}</span>
      )}
    </div>
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></div>
    )}
  </button>
);

const CheckCircle2 = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default DiscoveryManagerPage;
