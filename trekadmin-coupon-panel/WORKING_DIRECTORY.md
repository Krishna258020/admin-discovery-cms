# Trek Admin Coupon Panel - Main Repository

## ✅ This is the MAIN working directory

All development work should be done in this directory (`trekadmin-coupon-panel/`).

## Repository Information

- **Repository**: https://github.com/Krishna258020/admin-discovery-cms.git
- **Branch**: main
- **Owner**: Krishna258020
- **Email**: krishnarajgopal97@gmail.com

## Project Structure

```
trekadmin-coupon-panel/
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── routes/            # API routes
│   │   ├── config/            # Database config
│   │   └── server.js          # Express server
│   └── database/              # Database scripts
├── src/                       # React frontend
│   ├── components/            # React components
│   │   ├── discovery/         # Discovery Manager components
│   │   │   ├── ContentManagerEnhanced.tsx
│   │   │   ├── ThemeManager.tsx
│   │   │   └── ForecastManager.tsx
│   │   ├── CouponList.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Sidebar.tsx
│   │   └── DiscoveryManager.tsx
│   ├── api/                   # API client functions
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   │   ├── index.ts
│   │   └── discovery.types.ts
│   ├── constants/             # Constants
│   │   ├── index.ts
│   │   └── discovery.constants.ts
│   └── App.tsx                # Main app component
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

### 1. Coupon Management
- Platform Coupons
- Partner Coupons
- Special Deals
- Premium Elite
- Influencer Coupons

### 2. Discovery Manager (NEW)
- **What's New**: Manage discovery content with mobile preview
- **Top Treks**: Trek listings with card customization
- **Trek Shorts**: Short-form content management
- **Trek Forecast**: Weather forecasts by region
- **Home Themes**: Seasonal themes and campaigns

### 3. System Features
- Audit Logs
- Global Settings
- Dashboard with analytics
- Vendor Management
- Badge System

## Development

### Start Development Server
```bash
cd trekadmin-coupon-panel
npm run dev
```

### Start Backend Server
```bash
cd trekadmin-coupon-panel/backend
npm start
```

### Build for Production
```bash
npm run build
```

## Discovery Manager Features

### Mobile App Content Management
- Pixel-perfect image dimension controls
- Real-time mobile preview (375x667px)
- Card styling customization (colors, border radius)
- Featured content flags
- Publishing schedules
- Priority ordering

### Content Types
1. **What's New**: Announcements and updates
2. **Top Treks**: Featured trek destinations
3. **Trek Shorts**: Short video/image content
4. **Seasonal Forecast**: Weather alerts

### API Integration
All content created in Discovery Manager is consumed by the mobile app via REST APIs.

## Git Workflow

```bash
# Make changes
git add .
git commit -m "feat: your feature description"
git push origin main
```

## Important Notes

- ✅ Work ONLY in `trekadmin-coupon-panel/` directory
- ✅ All git operations should be done from this directory
- ✅ Discovery Manager is integrated into the coupon panel
- ✅ Mobile app consumes content via APIs

## Contact

- **Developer**: Krishna258020
- **Email**: krishnarajgopal97@gmail.com
- **GitHub**: https://github.com/Krishna258020
