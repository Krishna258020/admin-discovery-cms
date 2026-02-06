# Discovery Manager Integration Guide

This guide explains how to integrate the Discovery Manager module into the Trek Admin Coupon Module.

## Overview

The Discovery Manager will be added as a sidebar component/page within the main Trek Admin Coupon Module, maintaining all its functionalities while sharing the parent application's layout and navigation.

## Integration Steps

### 1. Copy Required Files

Copy the following files/folders to the Trek Admin Coupon Module:

```
Source (admin-discovery-cms) → Destination (trek-admin-coupon)

components/
├── ContentManager.tsx       → components/discovery/ContentManager.tsx
├── ForecastManager.tsx      → components/discovery/ForecastManager.tsx
├── ThemeManager.tsx         → components/discovery/ThemeManager.tsx
└── ui/                      → components/ui/ (merge with existing)
    ├── Button.tsx
    ├── Badge.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Spinner.tsx
    └── index.ts

hooks/
├── useDebounce.ts           → hooks/useDebounce.ts
├── useLocalStorage.ts       → hooks/useLocalStorage.ts
└── useMediaQuery.ts         → hooks/useMediaQuery.ts

utils/
├── api.ts                   → utils/discovery-api.ts
└── helpers.ts               → utils/helpers.ts (merge with existing)

types.ts                     → types/discovery.types.ts
constants.ts                 → constants/discovery.constants.ts
index.css                    → styles/discovery.css (or merge into global CSS)
```

### 2. Create Discovery Manager Page Component

Create a new page component in the Trek Admin Coupon Module:

**File: `pages/DiscoveryManager.tsx`**

```tsx
import React, { useState } from 'react';
import { 
  Layout, Compass, TrendingUp, 
  Users, Ticket, Award, Zap, Bell, LayoutGrid
} from 'lucide-react';
import { TabView } from '../types/discovery.types';
import { ThemeManager } from '../components/discovery/ThemeManager';
import { ContentManager } from '../components/discovery/ContentManager';
import { ForecastManager } from '../components/discovery/ForecastManager';
import { MOCK_THEMES, MOCK_CONTENT } from '../constants/discovery.constants';

const DiscoveryManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('WHATS_NEW');

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
            value={MOCK_THEMES.filter(t => t.status === 'Active').length} 
            subtext="<span class='text-green-600'>+1</span> since last week" 
            icon={<Layout size={22} className="text-blue-600" />}
            colorClass="bg-blue-50"
          />
          <StatCard 
            label="Total Treks" 
            value={MOCK_CONTENT.filter(c => c.category === 'TopTreks').length + 124} 
            subtext="Published Content" 
            icon={<Compass size={22} className="text-purple-600" />}
            colorClass="bg-purple-50"
          />
          <StatCard 
            label="Forecast Integrity" 
            value="98%" 
            subtext="System verified" 
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
```

### 3. Add Route to Trek Admin Coupon Module

Add the Discovery Manager route to your routing configuration:

**React Router Example:**
```tsx
import DiscoveryManagerPage from './pages/DiscoveryManager';

// In your routes configuration
<Route path="/discovery-manager" element={<DiscoveryManagerPage />} />
```

**Next.js Example:**
```tsx
// pages/discovery-manager.tsx or app/discovery-manager/page.tsx
import DiscoveryManagerPage from '../components/pages/DiscoveryManager';
export default DiscoveryManagerPage;
```

### 4. Add Sidebar Navigation Item

Update your sidebar navigation to include Discovery Manager:

```tsx
// In your Sidebar component
<SidebarItem 
  icon={<LayoutGrid size={20} />} 
  label="Discovery Manager" 
  active={currentPath === '/discovery-manager'}
  onClick={() => navigate('/discovery-manager')}
/>
```

### 5. Merge CSS Styles

Option A: Import the discovery CSS file
```tsx
// In your main App.tsx or layout component
import './styles/discovery.css';
```

Option B: Merge into your global CSS
- Copy the design system variables from `index.css`
- Merge utility classes and component styles
- Ensure no conflicts with existing styles

### 6. Update API Configuration

Update the API endpoints in `utils/discovery-api.ts` to point to your backend:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Update all endpoints to match your backend structure
// Example: '/themes' → '/api/discovery/themes'
```

### 7. Environment Variables

Add to your `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_DISCOVERY=true
```

## File Structure After Integration

```
trek-admin-coupon/
├── components/
│   ├── discovery/              # NEW
│   │   ├── ContentManager.tsx
│   │   ├── ForecastManager.tsx
│   │   └── ThemeManager.tsx
│   ├── ui/                     # MERGED
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   └── Sidebar.tsx             # UPDATED
├── pages/
│   ├── DiscoveryManager.tsx    # NEW
│   └── ...
├── hooks/                      # MERGED
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
├── utils/
│   ├── discovery-api.ts        # NEW
│   └── helpers.ts              # MERGED
├── types/
│   └── discovery.types.ts      # NEW
├── constants/
│   └── discovery.constants.ts  # NEW
└── styles/
    └── discovery.css           # NEW
```

## Testing Checklist

After integration, test the following:

- [ ] Discovery Manager page loads correctly
- [ ] Sidebar navigation works
- [ ] All tabs switch properly (What's New, Top Treks, Shorts, Forecast, Themes)
- [ ] Theme Manager CRUD operations
- [ ] Content Manager CRUD operations
- [ ] Forecast Manager CRUD operations
- [ ] Search and filter functionality
- [ ] Modal dialogs open/close
- [ ] Responsive design on mobile/tablet
- [ ] API calls work (if backend is ready)
- [ ] No CSS conflicts with existing styles
- [ ] No console errors

## Customization Options

### 1. Remove Standalone Header
If Trek Admin Coupon Module has its own header, remove the header section from DiscoveryManagerPage.

### 2. Adjust Colors
Update brand colors in CSS to match Trek Admin Coupon Module theme:
```css
:root {
  --brand-500: #your-color;
  --brand-600: #your-darker-color;
}
```

### 3. Integrate with Existing Auth
Update API calls to use existing authentication tokens:
```typescript
headers: {
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
}
```

## Troubleshooting

### Issue: CSS Conflicts
**Solution:** Prefix all discovery-related classes with `discovery-` or use CSS modules.

### Issue: Route Not Found
**Solution:** Ensure the route is properly registered in your routing configuration.

### Issue: API Calls Failing
**Solution:** Check CORS settings and API endpoint URLs.

### Issue: Icons Not Showing
**Solution:** Ensure `lucide-react` is installed: `npm install lucide-react`

## Support

For issues or questions during integration:
- Check the main README.md for component documentation
- Review CONTRIBUTING.md for code style guidelines
- Contact: krishnarajgopal97@gmail.com

## Next Steps

1. Copy all required files to Trek Admin Coupon Module
2. Create the DiscoveryManagerPage component
3. Add route and sidebar navigation
4. Test all functionality
5. Connect to backend API
6. Deploy and monitor
