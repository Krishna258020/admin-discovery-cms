# Trek Admin Coupon Panel

Enterprise-grade coupon management system for trek booking platforms.

## Features

- **Multi-Scope Coupons**: Platform, Partner, Special Deals, Premium Elite, Influencer
- **Vendor Management**: Coupon assignment to Trek Booking References (TBR)
- **Real-time Dashboard**: KPIs, trends, and analytics
- **Badge/CTA System**: Dynamic call-to-action modules
- **Audit Trail**: Complete action history
- **Commission Tracking**: Automated payout management

## Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+

### Installation

```bash
# Install dependencies
npm install
cd backend && npm install

# Configure database
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Run migrations
cd backend/database
node run_migration.js
node create_vendor_coupon_assignment.js
node seed_vendors.js
```

### Development

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

Backend: http://localhost:5001  
Frontend: http://localhost:5173

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   └── server.js     # Express server
│   └── database/         # Migrations & seeds
├── src/
│   ├── api/              # API clients
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── services/         # Business logic
│   └── types/            # TypeScript types
└── .archive/             # Development docs & scripts
```

## API Endpoints

### Core APIs
- `GET /api/coupons` - List all coupons
- `POST /api/coupons` - Create coupon
- `GET /api/dashboard/stats` - Dashboard metrics
- `GET /api/vendors` - List vendors
- `GET /api/redemptions` - Redemption history

### Vendor Coupon APIs
- `POST /api/vendor-coupons/assign` - Assign to TBR
- `PATCH /api/vendor-coupons/assignments/:id/cancel` - Cancel assignment
- `GET /api/vendor-coupons/pool/:vendorId` - Vendor pool

See full API documentation in `.archive/` folder.

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, Recharts  
**Backend**: Node.js, Express, MySQL  
**Tools**: React Router, Lucide Icons

## Production Build

```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

## License

Proprietary - Aoerbo Trek

## Support

For issues and questions, contact the development team.
