import {
    Award,
    FileText,
    LayoutDashboard,
    LayoutGrid,
    LogOut,
    Settings,
    Ticket,
    Users,
    Zap
} from 'lucide-react';
import React from 'react';
import { NavItem } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ item, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 border-r-4 ${
        isActive 
          ? 'bg-orange-50 text-orange-600 border-orange-500' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent'
      }`}
    >
      <item.icon size={20} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
      {item.label}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const managementItems: NavItem[] = [
    { id: 'platform', label: 'Platform Coupons', icon: Ticket, view: 'MANAGE_PLATFORM' },
    { id: 'normal', label: 'Partner Coupons', icon: Users, view: 'MANAGE_NORMAL' },
    { id: 'special', label: 'Special Deals', icon: Zap, view: 'MANAGE_SPECIAL' },
    { id: 'premium', label: 'Premium Elite', icon: Award, view: 'MANAGE_PREMIUM' },
    { id: 'influencer', label: 'Influencers', icon: Users, view: 'MANAGE_INFLUENCER' },
    { id: 'discovery', label: 'Discovery Manager', icon: LayoutGrid, view: 'DISCOVERY_MANAGER' },
  ];

  const systemItems: NavItem[] = [
    { id: 'audit', label: 'Audit Logs', icon: FileText, view: 'SYSTEM_AUDIT' },
    { id: 'settings', label: 'Global Settings', icon: Settings, view: 'SYSTEM_SETTINGS' },
  ];

  return (
    <div className="w-64 h-screen bg-white text-gray-800 flex flex-col fixed left-0 top-0 shadow-xl z-20 border-r border-gray-100">
      {/* Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
          <Ticket size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none tracking-tight text-gray-900">COUPON<br/><span className="text-orange-500">MASTER</span></h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-8 no-scrollbar">
        
        {/* Overview Section */}
        <div>
          <h3 className="px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Overview</h3>
          <NavButton 
            item={{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard, view: 'OVERVIEW' }}
            isActive={currentView === 'OVERVIEW'}
            onClick={() => onNavigate('OVERVIEW')}
          />
        </div>

        {/* Management Section */}
        <div>
          <h3 className="px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Management</h3>
          <div className="space-y-1">
            {managementItems.map((item) => (
              <NavButton 
                key={item.id} 
                item={item} 
                isActive={currentView === item.view}
                onClick={() => onNavigate(item.view)}
              />
            ))}
          </div>
        </div>

        {/* System Section */}
        <div>
          <h3 className="px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">System</h3>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <NavButton 
                key={item.id} 
                item={item} 
                isActive={currentView === item.view}
                onClick={() => onNavigate(item.view)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 w-full transition-colors text-sm font-medium rounded-xl hover:bg-red-50">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;