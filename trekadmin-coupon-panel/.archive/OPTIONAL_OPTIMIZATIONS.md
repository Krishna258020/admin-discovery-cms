# Optional Optimizations Guide

This document outlines optional improvements that can be made to the system. **None of these are required for production** - the system is fully functional as-is.

---

## 1. Dashboard API Integration

**Current State:** Dashboard calculates stats locally from redemptions array  
**Optimization:** Use backend API for server-side calculations  
**Effort:** LOW (1-2 hours)  
**Benefit:** Better performance with large datasets

### Implementation Steps

#### Step 1: Update Dashboard Component
```typescript
// src/components/Dashboard.tsx

import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';

const Dashboard: React.FC<DashboardProps> = ({
  activeFilter,
  onFilterChange,
  onViewAllRedemptions
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, trendDataRes, scopeData] = await Promise.all([
          dashboardApi.getStats(activeFilter, customRange.from, customRange.to),
          dashboardApi.getTrendData(activeFilter, customRange.from, customRange.to),
          dashboardApi.getScopeDistribution(activeFilter, customRange.from, customRange.to)
        ]);
        
        setStats(statsData);
        setTrendData(trendDataRes);
        setTrafficData(scopeData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeFilter, customRange]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // Rest of component...
};
```

#### Step 2: Remove Local Calculations
```typescript
// REMOVE these useMemo hooks:
// - filteredRedemptions
// - filteredStats
// - trendStats
// - volumeData
// - scopeDistribution

// USE backend data instead:
// - stats (from API)
// - trendData (from API)
// - trafficData (from API)
```

#### Step 3: Update KPI Cards
```typescript
<KPICard 
  title="Total Revenue" 
  value={`₹${(stats.totalRevenue / 1e5).toFixed(1)}L`} 
  sub={activeFilter === 'ALL' ? 'All Time' : 'vs Previous Period'} 
  icon={DollarSign} 
  trendValue={stats.trends?.revenueTrend || null} 
/>
```

### Benefits
- ✅ Reduced frontend computation
- ✅ Better performance with large datasets
- ✅ Consistent calculations across all clients
- ✅ Easier to add caching layer

---

## 2. Remove Unused MOCK Constants

**Current State:** MOCK data still defined in constants file  
**Optimization:** Clean up unused code  
**Effort:** LOW (5 minutes)  
**Benefit:** Cleaner codebase

### Implementation Steps

#### Step 1: Open Constants File
```bash
# Edit src/constants/index.ts
```

#### Step 2: Remove MOCK Exports
```typescript
// DELETE these exports:
// export const MOCK_BADGES: Badge[] = [...];
// export const MOCK_VENDORS: Vendor[] = [...];
// export const MOCK_LOGS: AuditLog[] = [...];
// export const MOCK_PAYOUTS: PayoutBatch[] = [...];
// export const MOCK_COUPONS: Coupon[] = [...];
// export const MOCK_REQUESTS: VendorRequest[] = [...];
```

#### Step 3: Keep Only Active Constants
```typescript
// KEEP these (they are used):
export const DEFAULT_DISCOUNT_MODES: DiscountModeConfig[] = [...];
export const ANIMATION_PRESETS = {...};
export const TEXT_ANIMATION_PRESETS = {...};
```

### Benefits
- ✅ Smaller bundle size
- ✅ Cleaner code
- ✅ No confusion about what's used

---

## 3. Badge Trek Data from Real Redemptions

**Current State:** Uses `generateSimulatedTreks()` function  
**Optimization:** Use real redemption data  
**Effort:** MEDIUM (4-6 hours)  
**Benefit:** Accurate trek assignment tracking

### Implementation Steps

#### Step 1: Update Database Schema
```sql
-- Add badge_id to redemptions table
ALTER TABLE coupon_redemptions 
ADD COLUMN badge_id VARCHAR(50) NULL,
ADD INDEX idx_badge_id (badge_id);
```

#### Step 2: Update Redemption Creation
```javascript
// backend/src/controllers/redemptionController.js

const createRedemption = async (req, res) => {
  const redemption = req.body;
  
  const query = `
    INSERT INTO coupon_redemptions 
    (id, customer_id, user_name, coupon_code, scope, booking_id, trek_name, trek_id,
     discount_amount, booking_amount, platform, vendor_name, vendor_id, 
     influencer_name, status, commission_base_amount, commission_rate, 
     commission_amount, commission_status, badge_id, redeemed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  await connection.query(query, [
    // ... existing params
    redemption.badgeId || null  // Add badge_id
  ]);
};
```

#### Step 3: Update BadgeDetailView Component
```typescript
// src/components/BadgeDetailView.tsx

// REMOVE generateSimulatedTreks function

// ADD real data fetching
const badgeTreks = useMemo(() => {
  // Filter redemptions that used this badge
  return redemptions
    .filter(r => r.badgeId === badge.id)
    .map(r => ({
      id: r.id,
      trekName: r.trekName,
      trekId: r.trekId,
      vendorName: r.vendorName,
      customerName: r.userName,
      bookingAmount: r.bookingAmount,
      discountAmount: r.discountAmount,
      tier: r.tier || 'GOLD', // Determine from badge config
      assignedAt: r.date,
      status: r.status
    }));
}, [redemptions, badge.id]);
```

#### Step 4: Update Badge API
```typescript
// src/api/badgeApi.ts

export const badgeApi = {
  // ... existing methods
  
  getRedemptions: async (badgeId: string): Promise<Redemption[]> => {
    const response = await apiClient.get(`/badges/${badgeId}/redemptions`);
    return response.data;
  }
};
```

#### Step 5: Create Backend Endpoint
```javascript
// backend/src/controllers/badgeController.js

const getBadgeRedemptions = async (req, res) => {
  try {
    const { badgeId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT * FROM coupon_redemptions 
      WHERE badge_id = ? 
      ORDER BY redeemed_at DESC
    `, [badgeId]);
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  // ... existing exports
  getBadgeRedemptions
};
```

### Benefits
- ✅ Real trek assignment data
- ✅ Accurate usage tracking
- ✅ Better analytics
- ✅ No simulated data

---

## 4. Add React Query for Caching

**Current State:** Direct API calls with useState  
**Optimization:** Add caching layer with React Query  
**Effort:** MEDIUM (4-6 hours)  
**Benefit:** Faster load times, automatic refetching

### Implementation Steps

#### Step 1: Install React Query
```bash
npm install @tanstack/react-query
```

#### Step 2: Setup Query Client
```typescript
// src/main.tsx or index.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

#### Step 3: Create Custom Hooks
```typescript
// src/hooks/useQueryData.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponApi, redemptionApi, vendorApi } from '../api';

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: couponApi.getAll,
  });
};

export const useRedemptions = () => {
  return useQuery({
    queryKey: ['redemptions'],
    queryFn: redemptionApi.getAll,
  });
};

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: vendorApi.getAll,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: couponApi.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};
```

#### Step 4: Update App.tsx
```typescript
// src/App.tsx

import { useCoupons, useRedemptions, useVendors } from './hooks/useQueryData';

const App: React.FC = () => {
  const { data: coupons = [], isLoading: couponsLoading } = useCoupons();
  const { data: redemptions = [], isLoading: redemptionsLoading } = useRedemptions();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();

  if (couponsLoading || redemptionsLoading || vendorsLoading) {
    return <div>Loading...</div>;
  }

  // Rest of component...
};
```

### Benefits
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Better loading states
- ✅ Reduced API calls

---

## 5. Add Real-time Updates with WebSockets

**Current State:** Manual refresh required  
**Optimization:** Live updates via WebSocket  
**Effort:** HIGH (8-12 hours)  
**Benefit:** Real-time dashboard updates

### Implementation Steps

#### Step 1: Install Socket.io
```bash
# Backend
cd backend
npm install socket.io

# Frontend
cd ..
npm install socket.io-client
```

#### Step 2: Setup Backend WebSocket
```javascript
// backend/src/server.js

const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in controllers
module.exports = { app, io };

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Step 3: Emit Events on Data Changes
```javascript
// backend/src/controllers/couponController.js

const { io } = require('../server');

const createCoupon = async (req, res) => {
  // ... existing code
  
  await connection.commit();
  
  // Emit event to all connected clients
  io.emit('coupon:created', { id, code: coupon.code });
  
  res.status(201).json({ message: 'Coupon created successfully', id, code: coupon.code });
};
```

#### Step 4: Setup Frontend WebSocket
```typescript
// src/services/socketService.ts

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('http://localhost:5001');
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
```

#### Step 5: Use in Components
```typescript
// src/App.tsx

import { socketService } from './services/socketService';

const App: React.FC = () => {
  useEffect(() => {
    socketService.connect();
    
    // Listen for coupon events
    socketService.on('coupon:created', (data) => {
      console.log('New coupon created:', data);
      // Refetch coupons or update state
      fetchCoupons();
    });
    
    socketService.on('redemption:created', (data) => {
      console.log('New redemption:', data);
      // Update dashboard
      fetchRedemptions();
    });
    
    return () => {
      socketService.disconnect();
    };
  }, []);
  
  // Rest of component...
};
```

### Benefits
- ✅ Real-time updates
- ✅ No manual refresh needed
- ✅ Better user experience
- ✅ Live dashboard metrics

---

## 6. Add Database Indexes for Performance

**Current State:** No custom indexes  
**Optimization:** Add indexes on frequently queried columns  
**Effort:** LOW (30 minutes)  
**Benefit:** Faster queries

### Implementation Steps

#### Step 1: Create Index Migration Script
```javascript
// backend/database/add_indexes.js

const pool = require('../src/config/db');

async function addIndexes() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding database indexes...');
    
    // Coupons table
    await connection.query('CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_coupons_scope ON coupons(scope)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_coupons_vendor ON coupons(vendor_id)');
    
    // Redemptions table
    await connection.query('CREATE INDEX IF NOT EXISTS idx_redemptions_date ON coupon_redemptions(redeemed_at)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_redemptions_status ON coupon_redemptions(status)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_redemptions_code ON coupon_redemptions(coupon_code)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_redemptions_scope ON coupon_redemptions(scope)');
    
    // Vendor assignments
    await connection.query('CREATE INDEX IF NOT EXISTS idx_assignments_tbr ON vendor_coupon_assignments(tbr)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_assignments_vendor ON vendor_coupon_assignments(vendor_id)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_assignments_status ON vendor_coupon_assignments(status)');
    
    // Audit logs
    await connection.query('CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_id)');
    
    console.log('✅ All indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

addIndexes();
```

#### Step 2: Run Migration
```bash
cd backend
node database/add_indexes.js
```

### Benefits
- ✅ Faster queries (10-100x improvement)
- ✅ Better dashboard performance
- ✅ Reduced database load
- ✅ Scales better with data growth

---

## Priority Recommendations

### High Priority (Do First)
1. ✅ **Add Database Indexes** - Immediate performance boost, minimal effort
2. ✅ **Remove Unused MOCK Constants** - Quick cleanup, no risk

### Medium Priority (Nice to Have)
3. ⚠️ **Dashboard API Integration** - Better performance, moderate effort
4. ⚠️ **React Query Caching** - Better UX, moderate effort

### Low Priority (Future Enhancement)
5. 🔵 **Badge Trek Data** - Accuracy improvement, requires schema change
6. 🔵 **Real-time WebSockets** - Best UX, high effort

---

## Testing After Optimizations

### Performance Testing
```bash
# Before optimization
time curl http://localhost:5001/api/dashboard/stats

# After optimization (should be faster)
time curl http://localhost:5001/api/dashboard/stats
```

### Load Testing
```bash
# Install Apache Bench
# Windows: Download from Apache website
# Mac: brew install httpd

# Test endpoint
ab -n 1000 -c 10 http://localhost:5001/api/coupons
```

### Frontend Performance
```javascript
// Add to Dashboard.tsx
console.time('Dashboard Render');
// ... component code
console.timeEnd('Dashboard Render');
```

---

## Rollback Plan

If any optimization causes issues:

### 1. Dashboard API Integration
```bash
git checkout src/components/Dashboard.tsx
```

### 2. React Query
```bash
npm uninstall @tanstack/react-query
git checkout src/App.tsx src/hooks/
```

### 3. Database Indexes
```sql
-- Remove indexes if causing issues
DROP INDEX idx_coupons_status ON coupons;
DROP INDEX idx_redemptions_date ON coupon_redemptions;
-- etc.
```

### 4. WebSockets
```bash
npm uninstall socket.io socket.io-client
git checkout backend/src/server.js src/services/socketService.ts
```

---

## Conclusion

All optimizations are **optional** and the system works perfectly without them. Implement based on:

- **Current performance issues** (if any)
- **Expected data growth**
- **Available development time**
- **Team expertise**

Start with low-effort, high-impact optimizations (indexes, cleanup) before tackling complex ones (WebSockets).

---

**Last Updated:** February 5, 2026  
**Status:** Optional Enhancements Only
