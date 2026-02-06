const pool = require('../config/db');

// GET All Vendors
const getAllVendors = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vendors ORDER BY business_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Vendor by ID
const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllVendors,
    getVendorById
};
