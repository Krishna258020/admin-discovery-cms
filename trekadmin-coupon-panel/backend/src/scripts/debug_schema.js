const pool = require('../config/db');

async function debugSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE badges');
        console.log('Badges Table Schema:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Error describing badges:', err);
        process.exit(1);
    }
}

debugSchema();
