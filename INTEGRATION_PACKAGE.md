# Discovery Manager - Integration Package

## Quick Integration Steps

### Step 1: Copy Files to Trek Admin Coupon Module

Navigate to your Trek Admin Coupon Module repository and copy these folders:

```bash
# From admin-discovery-cms repository
cp -r components/ContentManager.tsx [trek-admin-coupon]/src/components/discovery/
cp -r components/ForecastManager.tsx [trek-admin-coupon]/src/components/discovery/
cp -r components/ThemeManager.tsx [trek-admin-coupon]/src/components/discovery/
cp -r components/ui/* [trek-admin-coupon]/src/components/ui/
cp -r hooks/* [trek-admin-coupon]/src/hooks/
cp -r utils/api.ts [trek-admin-coupon]/src/utils/discovery-api.ts
cp -r utils/helpers.ts [trek-admin-coupon]/src/utils/helpers.ts
cp types.ts [trek-admin-coupon]/src/types/discovery.types.ts
cp constants.ts [trek-admin-coupon]/src/constants/discovery.constants.ts
cp index.css [trek-admin-coupon]/src/styles/discovery.css
```

### Step 2: Update Sidebar in Trek Admin Coupon Module

Add this item to your existing sidebar navigation:

```tsx
<SidebarItem 
  icon={<LayoutGrid size={20} />} 
  label="Discovery Manager" 
  active={activeRoute === '/discovery-manager'}
  onClick={() => navigate('/discovery-manager')}
/>
```

### Step 3: Create Discovery Manager Route

Add to your routes file:

```tsx
import DiscoveryManagerPage from './pages/DiscoveryManager';

// Add this route
{
  path: '/discovery-manager',
  element: <DiscoveryManagerPage />
}
```

### Step 4: Import Styles

In your main App.tsx or layout:

```tsx
import './styles/discovery.css';
```

## Complete Page Component Code

Save this as `pages/DiscoveryManager.tsx` in Trek Admin Coupon Module:

```tsx
// See INTEGRATION_GUIDE.md for the complete component code
```

## Dependencies Required

Ensure these are installed in Trek Admin Coupon Module:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.563.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

Install if missing:
```bash
npm install lucide-react
```

## Import Path Updates

After copying files, update import paths in the copied components:

**Before (in admin-discovery-cms):**
```tsx
import { HomeTheme } from '../types';
import { MOCK_THEMES } from '../constants';
```

**After (in trek-admin-coupon):**
```tsx
import { HomeTheme } from '../types/discovery.types';
import { MOCK_THEMES } from '../constants/discovery.constants';
```

## API Integration

Update `utils/discovery-api.ts` with your backend URL:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## Testing

After integration, test:
1. Navigate to `/discovery-manager`
2. Switch between all tabs
3. Try creating/editing themes
4. Try creating/editing content
5. Check responsive design

## Rollback Plan

If issues occur, simply:
1. Remove the `/discovery-manager` route
2. Remove the sidebar item
3. Delete copied files

The main Trek Admin Coupon Module will remain unaffected.
