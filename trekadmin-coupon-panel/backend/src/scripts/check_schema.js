const pool = require('../config/db');

async function checkSchema() {
    try {
        console.log("Checking schema for 'badges' and 'coupons'...");

        try {
            const [badges] = await pool.query("DESCRIBE badges");
            console.log("BADGES COLUMNS:", badges.map(c => c.Field));
        } catch (e) { console.log("Error describing badges:", e.message); }

        try {
            const [coupons] = await pool.query("DESCRIBE coupons");
            console.log("COUPONS COLUMNS:", coupons.map(c => c.Field));
        } catch (e) { console.log("Error describing coupons:", e.message); }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
