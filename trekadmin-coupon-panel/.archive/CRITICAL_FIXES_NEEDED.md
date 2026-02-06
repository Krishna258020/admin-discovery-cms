# Critical Fixes Required - Remove All Demo/Mock Data

## Summary
The frontend is currently using MOCK data and simulating traffic. ALL data must come from backend.

## Files That Need Immediate Fixes

### 1. `src/App.tsx` - CRITICAL
**Remove these:**
```typescript
// ❌ REMOVE THESE IMPORTS
import { MOCK_COUPONS, MOCK_LOGS, MOCK_REQUESTS, MOCK_VENDORS, MOCK_BADGES } from './constants';

// ❌ REMOVE THESE FUNCTIONS
const generateTrekId = () => ...
const generateInitialRedemptions = (): Redemption[] => ...
const INITIAL_TREND_DATA: TrendDataPoint[] = [...]

// ❌ REMOVE THESE STATE INITIALIZATIONS
const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_LOGS);
const [requests, setRequests] = useState<VendorRequest[]>(MOCK_REQUESTS);
const [trendData, setTrendData] = useState<TrendDataPoint[]>(INITIAL_TREND_DATA);

// ❌ REMOVE BOTH setInterval BLOCKS (lines ~279 and ~364)
// These simulate fake traffic and commission updates
```

**Replace with:**
```typescript
// ✅ Initialize with empty arrays
const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
const [requests, setRequests] = useState<VendorRequest[]>([]);
const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
const [vendors, setVendors] = useState<Vendor[]>([]);

// ✅ Fetch from backend in useEffect
useEffect(() => {
  const fetchData = async () => {
    const [allVendors] = await Promise.all([
      vendorApi.getAll()
    ]);
    setVendors(allVendors);
  };
  fetchData();
}, []);
```

### 2. `src/components/Dashboard.tsx` - HIGH PRIORITY
**Current:** Calculates stats locally from redemptions
**Fix:** Use backend dashboard API

```typescript
// ❌ REMOVE local calculations
const filteredStats = useMemo(() => 
  filteredRedemptions.reduce(...), [filteredRedemptions]
);

// ✅ ADD backend API call
const [stats, setStats] = useState<DashboardStats | null>(null);
const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

useEffect(() => {
  const fetchDashboardData = async () => {
    const [statsData, trendData, scopeData] = await Promise.all([
      dashboardApi.getStats(activeFilter, customRange.from, customRange.to),
      dashboardApi.getTrendData(activeFilter, customRange.from, customRange.to),
      dashboardApi.getScopeDistribution(activeFilter, customRange.from, customRange.to)
    ]);
    setStats(statsData);
    setTrendData(trendData);
    setTrafficData(scopeData);
  };
  fetchDashboardData();
}, [activeFilter, customRange]);
```

### 3. `src/components/CouponModal.tsx` - MEDIUM
**Line 5:** `import { MOCK_VENDORS } from '../constants';`
**Line 130:** `const vendors = MOCK_VENDORS.filter(...)`

**Fix:**
```typescript
// ✅ Pass vendors as prop from App.tsx
interface CouponModalProps {
  vendors: Vendor[]; // Add this
  // ... other props
}

// ✅ Use prop instead of MOCK_VENDORS
const vendors = props.vendors.filter(v => couponToEdit.targetVendorIds?.includes(v.id));
```

### 4. `src/components/CouponDetailView.tsx` - MEDIUM
**Line 14:** `import { MOCK_VENDORS } from '../constants';`
**Line 358:** `const vendorObj = MOCK_VENDORS.find(...) || {...}`

**Fix:**
```typescript
// ✅ Pass vendors as prop
interface CouponDetailViewProps {
  vendors: Vendor[]; // Add this
  // ... other props
}

// ✅ Use prop
const vendorObj = props.vendors.find(v => v.id === vId) || {...};
```

### 5. `src/components/BadgeDetailView.tsx` - MEDIUM
**Line 9:** `import { MOCK_VENDORS } from '../constants';`
**Line 17:** `const generateSimulatedTreks = (...) => {...}`
**Line 49:** `let list = [...MOCK_VENDORS];`

**Fix:**
```typescript
// ✅ Remove generateSimulatedTreks function
// ✅ Pass vendors as prop
// ✅ Fetch real trek assignments from backend or use redemptions data

interface BadgeDetailViewProps {
  vendors: Vendor[]; // Add this
  redemptions: Redemption[]; // Add this to derive trek data
  // ... other props
}

// ✅ Derive trek data from redemptions
const badgeTreks = useMemo(() => {
  // Filter redemptions that used this badge
  // Group by trek to get trek assignments
  return redemptions
    .filter(r => r.badgeId === badge.id) // Assuming badge tracking
    .map(r => ({
      id: r.trekId,
      name: r.trekName,
      assignedAt: r.date,
      // ... other fields from redemption
    }));
}, [redemptions, badge.id]);
```

### 6. DELETE `src/components/CouponDetailModal.tsx`
This file appears to be unused and contains mock data generation.

## Implementation Steps

1. **Backup current App.tsx**
2. **Remove all MOCK imports from App.tsx**
3. **Remove simulation code (setInterval blocks)**
4. **Add vendors state and fetch from API**
5. **Update Dashboard to use backend API**
6. **Pass vendors prop to all components that need it**
7. **Test each page to ensure data loads from backend**

## Testing Checklist

- [ ] Dashboard shows real stats from backend
- [ ] Dashboard trends calculate correctly
- [ ] Coupon list shows real coupons from database
- [ ] Coupon detail shows real redemptions
- [ ] Badge list shows real badges
- [ ] Badge detail shows real vendor usage
- [ ] Vendor selection shows real vendors
- [ ] No console errors about MOCK_VENDORS
- [ ] No fake traffic being generated
- [ ] All KPIs update based on real database data
