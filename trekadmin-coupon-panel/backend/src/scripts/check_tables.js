const pool = require('../config/db');

async function checkTables() {
    try {
        const [rows] = await pool.query("SHOW TABLES");
        const tables = rows.map(r => Object.values(r)[0]);

        const interesting = ['badges', 'coupons', 'cta_badges', 'cta_coupons', 'audit_logs', 'cta_audit_logs', 'coupon_redemptions', 'cta_coupon_redemptions'];
        const found = tables.filter(t => interesting.includes(t));

        console.log(JSON.stringify({ found }));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTables();
