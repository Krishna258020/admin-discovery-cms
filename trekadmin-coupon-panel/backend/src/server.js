const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

const badgeRoutes = require('./routes/badgeRoutes');
const couponRoutes = require('./routes/couponRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const vendorRequestRoutes = require('./routes/vendorRequestRoutes');
const vendorCouponRoutes = require('./routes/vendorCouponRoutes');
const redemptionRoutes = require('./routes/redemptionRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/badges', badgeRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendor-requests', vendorRequestRoutes);
app.use('/api/vendor-coupons', vendorCouponRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/commission-logs', commissionRoutes);
app.use('/api/payout-batches', payoutRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/discount-modes', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'OK', db: 'Connected' });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', db: 'Disconnected', error: err.message });
    }
});

// Start Server
try {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (err) {
    console.error("Failed to start server:", err);
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
