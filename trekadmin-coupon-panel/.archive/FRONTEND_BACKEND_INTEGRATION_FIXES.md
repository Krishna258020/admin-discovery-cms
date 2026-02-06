# Frontend-Backend Integration Issues & Fixes

## Issues Found

### 1. **App.tsx - Major Issues**
- ❌ Uses `MOCK_COUPONS`, `MOCK_VENDORS`, `MOCK_BADGES`, `MOCK_LOGS`, `MOCK_REQUESTS`
- ❌ Has `generateInitialRedemptions()` function creating fake data
- ❌ Has `INITIAL_TREND_DATA` hardcoded
- ❌ Has `setInterval` simulating fake traffic every 3 seconds
- ❌ Has another `setInterval` simulating commission status changes

### 2. **Dashboard.tsx**
- ✅ Fixed - Now calculates trends from real data
- ⚠️ Still calculates stats locally instead of using backend API

### 3. **CouponModal.tsx**
- ❌ Uses `MOCK_VENDORS` for vendor selection

### 4. **CouponDetailView.tsx**
- ❌ Uses `MOCK_VENDORS` as fallback for unknown vendors
- ✅ Uses real redemptions data

### 5. **CouponDetailModal.tsx**
- ❌ Has `generateMockRedemptions()` function
- ❌ Uses `MOCK_VENDORS`

### 6. **BadgeDetailView.tsx**
- ❌ Uses `MOCK_VENDORS` for vendor list
- ❌ Has `generateSimulatedTreks()` function creating fake trek data

### 7. **VendorSelectionModal.tsx**
- ⚠️ Likely uses `MOCK_VENDORS`

## Required Backend APIs

### Already Exist ✅
- `/api/coupons` - GET, POST, PUT, DELETE
- `/api/badges` - GET, POST, PUT, DELETE
- `/api/redemptions` - GET, POST
- `/api/vendors` - GET
- `/api/vendor-requests` - GET, POST, PUT
- `/api/audit-logs` - GET
- `/api/withdrawals` - GET, POST, PUT
- `/api/commission-logs` - GET
- `/api/payout-batches` - GET, POST
- `/api/dashboard/stats` - GET (just created)
- `/api/dashboard/trend` - GET (just created)
- `/api/dashboard/scope-distribution` - GET (just created)

### Need to Create 🔨
- None - All required APIs exist!

## Fix Strategy

### Phase 1: Remove Demo/Simulation Code from App.tsx
1. Remove `generateInitialRedemptions()` function
2. Remove `INITIAL_TREND_DATA` constant
3. Remove both `setInterval` blocks (traffic simulation & commission updates)
4. Remove MOCK imports
5. Fetch vendors from backend API

### Phase 2: Update Components to Use Real Vendors
1. Update `CouponModal.tsx` to fetch vendors from API
2. Update `CouponDetailView.tsx` to use real vendor data
3. Update `BadgeDetailView.tsx` to use real vendor data
4. Remove `CouponDetailModal.tsx` (appears to be unused/duplicate)

### Phase 3: Update Dashboard to Use Backend Stats API
1. Update `Dashboard.tsx` to call `dashboardApi.getStats()`
2. Update trend data to call `dashboardApi.getTrendData()`
3. Update scope distribution to call `dashboardApi.getScopeDistribution()`

### Phase 4: Badge Trek Data
1. Create backend API for badge trek assignments
2. Update `BadgeDetailView.tsx` to fetch real trek data

## Implementation Priority

1. **HIGH**: Remove simulation code from App.tsx (breaks data integrity)
2. **HIGH**: Update Dashboard to use backend stats API
3. **MEDIUM**: Update components to use real vendors
4. **LOW**: Badge trek data (can use existing redemption data)
