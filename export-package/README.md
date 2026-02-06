# Discovery Manager - Export Package

This package contains all files needed to integrate Discovery Manager into Trek Admin Coupon Module.

## 📦 Package Contents

```
export-package/
├── README.md                    # This file
├── DiscoveryManagerPage.tsx     # Main page component
└── integration-checklist.md     # Step-by-step checklist
```

## 🚀 Quick Start

### 1. Copy Required Files from Main Repository

From the `admin-discovery-cms` repository root, copy these to Trek Admin Coupon Module:

```bash
# Components
components/ContentManager.tsx → [trek-admin]/src/components/discovery/
components/ForecastManager.tsx → [trek-admin]/src/components/discovery/
components/ThemeManager.tsx → [trek-admin]/src/components/discovery/

# UI Components (merge with existing)
components/ui/* → [trek-admin]/src/components/ui/

# Hooks
hooks/useDebounce.ts → [trek-admin]/src/hooks/
hooks/useLocalStorage.ts → [trek-admin]/src/hooks/
hooks/useMediaQuery.ts → [trek-admin]/src/hooks/

# Utils
utils/api.ts → [trek-admin]/src/utils/discovery-api.ts
utils/helpers.ts → [trek-admin]/src/utils/helpers.ts

# Types & Constants
types.ts → [trek-admin]/src/types/discovery.types.ts
constants.ts → [trek-admin]/src/constants/discovery.constants.ts

# Styles
index.css → [trek-admin]/src/styles/discovery.css
```

### 2. Copy Page Component

```bash
export-package/DiscoveryManagerPage.tsx → [trek-admin]/src/pages/DiscoveryManager.tsx
```

### 3. Update Import Paths

In all copied files, update imports:

**Before:**
```tsx
import { HomeTheme } from '../types';
import { MOCK_THEMES } from '../constants';
```

**After:**
```tsx
import { HomeTheme } from '../types/discovery.types';
import { MOCK_THEMES } from '../constants/discovery.constants';
```

### 4. Add Route

In your routing file (e.g., `App.tsx` or `routes.tsx`):

```tsx
import DiscoveryManagerPage from './pages/DiscoveryManager';

// Add this route
<Route path="/discovery-manager" element={<DiscoveryManagerPage />} />
```

### 5. Update Sidebar

In your Sidebar component, add:

```tsx
import { LayoutGrid } from 'lucide-react';

// Add this item
<SidebarItem 
  icon={<LayoutGrid size={20} />} 
  label="Discovery Manager" 
  active={currentPath === '/discovery-manager'}
  onClick={() => navigate('/discovery-manager')}
/>
```

### 6. Import Styles

In your main layout or App.tsx:

```tsx
import './styles/discovery.css';
```

## 📋 Integration Checklist

- [ ] Copy all component files
- [ ] Copy hooks, utils, types, constants
- [ ] Copy and merge UI components
- [ ] Copy styles (discovery.css)
- [ ] Copy DiscoveryManagerPage.tsx
- [ ] Update all import paths
- [ ] Add route to routing configuration
- [ ] Add sidebar navigation item
- [ ] Import discovery.css in main app
- [ ] Install lucide-react if not present
- [ ] Test navigation to /discovery-manager
- [ ] Test all tabs (What's New, Top Treks, Shorts, Forecast, Themes)
- [ ] Test CRUD operations
- [ ] Test responsive design
- [ ] Update API endpoints if backend is ready

## 🔧 Configuration

### Environment Variables

Add to `.env`:

```env
VITE_API_URL=http://localhost:3001/api
REACT_APP_API_URL=http://localhost:3001/api
```

### API Endpoints

Update `utils/discovery-api.ts` with your backend URLs:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || '/api';

// Update endpoints to match your backend
export const themeAPI = {
  getAll: () => fetchAPI('/discovery/themes'),
  // ... etc
};
```

## 🎨 Customization

### Colors

Update brand colors in `discovery.css`:

```css
:root {
  --brand-500: #your-primary-color;
  --brand-600: #your-darker-color;
}
```

### Remove Header

If Trek Admin Coupon Module has its own header, remove the header section from `DiscoveryManagerPage.tsx`:

```tsx
// Remove or comment out this section
<header className="h-20 bg-[#F3F4F6]...">
  ...
</header>
```

## 📦 Dependencies

Ensure these are installed:

```bash
npm install lucide-react
```

Or add to package.json:

```json
{
  "dependencies": {
    "lucide-react": "^0.563.0"
  }
}
```

## 🧪 Testing

After integration:

1. **Navigation Test**
   - Click Discovery Manager in sidebar
   - Verify page loads without errors

2. **Tab Switching Test**
   - Click each tab (What's New, Top Treks, etc.)
   - Verify content changes

3. **CRUD Operations Test**
   - Create new theme
   - Edit existing theme
   - Delete theme
   - Repeat for content and forecasts

4. **Responsive Test**
   - Test on mobile (< 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (> 1024px)

5. **API Test** (if backend ready)
   - Verify API calls work
   - Check authentication headers
   - Test error handling

## 🐛 Troubleshooting

### Issue: Module not found errors

**Solution:** Check import paths are updated correctly

```tsx
// Wrong
import { HomeTheme } from '../types';

// Correct
import { HomeTheme } from '../types/discovery.types';
```

### Issue: CSS conflicts

**Solution:** Prefix discovery classes or use CSS modules

```css
/* Prefix all classes */
.discovery-card { ... }
.discovery-button { ... }
```

### Issue: Icons not showing

**Solution:** Install lucide-react

```bash
npm install lucide-react
```

### Issue: Route not working

**Solution:** Check route is registered and path matches

```tsx
// Ensure route exists
<Route path="/discovery-manager" element={<DiscoveryManagerPage />} />

// Ensure navigation uses correct path
navigate('/discovery-manager')
```

## 📞 Support

For integration help:
- Email: krishnarajgopal97@gmail.com
- GitHub: https://github.com/Krishna258020/admin-discovery-cms

## 📄 License

Private - All rights reserved
