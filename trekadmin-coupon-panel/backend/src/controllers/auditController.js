const pool = require('../config/db');

// GET All Audit Logs
const getAllAuditLogs = async (req, res) => {
    try {
        const { action, targetType, module, performerId, dateFrom, dateTo } = req.query;
        
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];
        
        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }
        // Accept both targetType and module parameters
        if (targetType || module) {
            query += ' AND module = ?';
            params.push(targetType || module);
        }
        if (performerId) {
            query += ' AND performer_id = ?';
            params.push(performerId);
        }
        if (dateFrom) {
            query += ' AND timestamp >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            query += ' AND timestamp <= ?';
            params.push(dateTo);
        }
        
        query += ' ORDER BY timestamp DESC LIMIT 1000';
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllAuditLogs
};
