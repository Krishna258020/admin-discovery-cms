# Discovery Manager Integration Checklist

Use this checklist to ensure complete integration into Trek Admin Coupon Module.

## Pre-Integration

- [ ] Backup Trek Admin Coupon Module repository
- [ ] Create a new branch: `git checkout -b feature/discovery-manager`
- [ ] Ensure Node.js and npm are up to date
- [ ] Review current Trek Admin structure

## File Copy Phase

### Components
- [ ] Copy `components/ContentManager.tsx` → `src/components/discovery/ContentManager.tsx`
- [ ] Copy `components/ForecastManager.tsx` → `src/components/discovery/ForecastManager.tsx`
- [ ] Copy `components/ThemeManager.tsx` → `src/components/discovery/ThemeManager.tsx`

### UI Components (Merge with existing)
- [ ] Copy `components/ui/Button.tsx` → `src/components/ui/Button.tsx`
- [ ] Copy `components/ui/Badge.tsx` → `src/components/ui/Badge.tsx`
- [ ] Copy `components/ui/Card.tsx` → `src/components/ui/Card.tsx`
- [ ] Copy `components/ui/Input.tsx` → `src/components/ui/Input.tsx`
- [ ] Copy `components/ui/Modal.tsx` → `src/components/ui/Modal.tsx`
- [ ] Copy `components/ui/Spinner.tsx` → `src/components/ui/Spinner.tsx`
- [ ] Copy `components/ui/index.ts` → `src/components/ui/index.ts`

### Hooks
- [ ] Copy `hooks/useDebounce.ts` → `src/hooks/useDebounce.ts`
- [ ] Copy `hooks/useLocalStorage.ts` → `src/hooks/useLocalStorage.ts`
- [ ] Copy `hooks/useMediaQuery.ts` → `src/hooks/useMediaQuery.ts`

### Utils
- [ ] Copy `utils/api.ts` → `src/utils/discovery-api.ts`
- [ ] Copy `utils/helpers.ts` → `src/utils/helpers.ts` (merge if exists)

### Types & Constants
- [ ] Copy `types.ts` → `src/types/discovery.types.ts`
- [ ] Copy `constants.ts` → `src/constants/discovery.constants.ts`

### Styles
- [ ] Copy `index.css` → `src/styles/discovery.css`

### Page Component
- [ ] Copy `export-package/DiscoveryManagerPage.tsx` → `src/pages/DiscoveryManager.tsx`

## Code Update Phase

### Update Import Paths in Discovery Components
- [ ] Update imports in `ContentManager.tsx`
- [ ] Update imports in `ForecastManager.tsx`
- [ ] Update imports in `ThemeManager.tsx`
- [ ] Update imports in `DiscoveryManagerPage.tsx`

Example changes:
```tsx
// Before
import { HomeTheme } from '../types';
import { MOCK_THEMES } from '../constants';

// After
import { HomeTheme } from '../types/discovery.types';
import { MOCK_THEMES } from '../constants/discovery.constants';
```

### Update API Configuration
- [ ] Open `src/utils/discovery-api.ts`
- [ ] Update `API_BASE_URL` to match your backend
- [ ] Update endpoint paths if needed
- [ ] Add authentication headers if required

### Add Route
- [ ] Open routing configuration file (e.g., `App.tsx`, `routes.tsx`)
- [ ] Import DiscoveryManagerPage
- [ ] Add route: `<Route path="/discovery-manager" element={<DiscoveryManagerPage />} />`

### Update Sidebar
- [ ] Open Sidebar component
- [ ] Import `LayoutGrid` icon from lucide-react
- [ ] Add Discovery Manager navigation item
- [ ] Test active state highlighting

### Import Styles
- [ ] Open main App.tsx or layout component
- [ ] Add: `import './styles/discovery.css';`
- [ ] Check for CSS conflicts

## Dependency Phase

- [ ] Check if `lucide-react` is installed
- [ ] If not: `npm install lucide-react`
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Check for peer dependency warnings

## Testing Phase

### Basic Navigation
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to Discovery Manager from sidebar
- [ ] Verify page loads without errors
- [ ] Check browser console for errors

### Tab Functionality
- [ ] Click "What's New" tab
- [ ] Click "Top Treks" tab
- [ ] Click "Trek Shorts" tab
- [ ] Click "Trek Forecast" tab
- [ ] Click "Home Themes & Campaigns" tab
- [ ] Verify content changes for each tab

### Theme Manager
- [ ] Click "Create New Theme" button
- [ ] Fill in theme form
- [ ] Save theme
- [ ] Edit existing theme
- [ ] Test search functionality
- [ ] Test filter dropdowns

### Content Manager
- [ ] Click "Add Content" button
- [ ] Fill in content form
- [ ] Save content
- [ ] Edit existing content
- [ ] Delete content
- [ ] Test search functionality

### Forecast Manager
- [ ] Click "New Forecast" button
- [ ] Fill in forecast form
- [ ] Save forecast
- [ ] Edit existing forecast
- [ ] Test search functionality
- [ ] Test season filter

### Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Check sidebar behavior on mobile
- [ ] Check table/grid responsiveness

### Performance
- [ ] Check page load time
- [ ] Test with large datasets
- [ ] Check for memory leaks
- [ ] Verify smooth animations

## API Integration Phase (if backend ready)

- [ ] Update API endpoints in `discovery-api.ts`
- [ ] Add authentication tokens
- [ ] Test GET requests
- [ ] Test POST requests
- [ ] Test PUT requests
- [ ] Test DELETE requests
- [ ] Handle error responses
- [ ] Add loading states

## Customization Phase

### Branding
- [ ] Update brand colors in `discovery.css`
- [ ] Match Trek Admin Coupon Module theme
- [ ] Update logo/icons if needed

### Layout
- [ ] Remove standalone header if Trek Admin has global header
- [ ] Adjust spacing/padding
- [ ] Match existing page layouts

### Features
- [ ] Enable/disable features as needed
- [ ] Add custom fields if required
- [ ] Integrate with existing systems

## Documentation Phase

- [ ] Document new route in project README
- [ ] Add API endpoint documentation
- [ ] Document environment variables
- [ ] Create user guide if needed

## Code Review Phase

- [ ] Run TypeScript type check: `npm run type-check`
- [ ] Fix any type errors
- [ ] Run linter if available
- [ ] Fix linting errors
- [ ] Review code for best practices

## Git Phase

- [ ] Stage all changes: `git add .`
- [ ] Commit: `git commit -m "feat: integrate Discovery Manager module"`
- [ ] Push: `git push origin feature/discovery-manager`
- [ ] Create pull request
- [ ] Request code review

## Deployment Phase

- [ ] Merge to development branch
- [ ] Test on staging environment
- [ ] Fix any staging issues
- [ ] Merge to main/production
- [ ] Deploy to production
- [ ] Monitor for errors

## Post-Integration

- [ ] Train team on new features
- [ ] Update user documentation
- [ ] Monitor analytics
- [ ] Gather user feedback
- [ ] Plan improvements

## Rollback Plan (if needed)

- [ ] Revert commit: `git revert <commit-hash>`
- [ ] Remove route from routing config
- [ ] Remove sidebar item
- [ ] Delete copied files
- [ ] Redeploy previous version

## Notes

Use this space to track issues or special considerations:

```
Date: ___________
Issues encountered:
- 
- 
- 

Solutions applied:
- 
- 
- 

Team members involved:
- 
- 
```

## Sign-off

- [ ] Developer: _________________ Date: _______
- [ ] Code Reviewer: _____________ Date: _______
- [ ] QA Tester: ________________ Date: _______
- [ ] Product Owner: _____________ Date: _______
