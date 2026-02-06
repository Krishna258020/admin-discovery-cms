const pool = require('../config/db');

// GET Payout Batches
const getPayoutBatches = async (req, res) => {
    try {
        const { couponCode } = req.query;
        
        let query = 'SELECT * FROM payout_batches WHERE 1=1';
        const params = [];
        
        if (couponCode) {
            query += ' AND coupon_code = ?';
            params.push(couponCode);
        }
        
        query += ' ORDER BY date DESC';
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST Create Payout Batch
const createPayoutBatch = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const batch = req.body;
        const id = `PB-${Date.now()}`;
        
        await connection.beginTransaction();
        
        const query = `
            INSERT INTO payout_batches 
            (id, coupon_code, date, period, bookings_count, 
             total_amount, mode, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(query, [
            id,
            batch.couponCode,
            batch.date,
            batch.period,
            batch.bookingsCount,
            batch.totalAmount,
            batch.mode,
            batch.status || 'PROCESSING'
        ]);
        
        await connection.commit();
        res.status(201).json({ message: 'Payout batch created', id });
        
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

module.exports = {
    getPayoutBatches,
    createPayoutBatch
};
