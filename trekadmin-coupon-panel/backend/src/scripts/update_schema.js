const pool = require('../config/db');

const updateSchema = async () => {
    const connection = await pool.getConnection();
    try {
        console.log("Starting Comprehensive Schema Update...");

        const addColumn = async (table, columnDef) => {
            try {
                await connection.query(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
                console.log(`✅ Added to ${table}: ${columnDef.split(' ')[0]}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Exists in ${table}: ${columnDef.split(' ')[0]}`);
                } else {
                    console.error(`❌ Error adding to ${table}:`, e.message);
                }
            }
        };

        // --- BADGES ---
        await addColumn('badges', "styling JSON");
        await addColumn('badges', "gold_limits JSON");
        await addColumn('badges', "platinum_limits JSON");
        await addColumn('badges', "expiry_date DATE");
        await addColumn('badges', "deleted_at DATETIME");
        await addColumn('badges', "history JSON");

        // --- COUPONS ---
        // Core fields
        await addColumn('coupons', "code VARCHAR(50) UNIQUE");
        await addColumn('coupons', "scope ENUM('PLATFORM', 'NORMAL', 'SPECIAL', 'PREMIUM', 'INFLUENCER') NOT NULL DEFAULT 'NORMAL'");
        await addColumn('coupons', "mode VARCHAR(50) DEFAULT 'PERCENTAGE'"); // Changed to VARCHAR to match 'DiscountMode' string type

        // Usage limits
        await addColumn('coupons', "usage_count INT DEFAULT 0");
        await addColumn('coupons', "total_usage_limit INT DEFAULT 100");
        await addColumn('coupons', "user_limit INT DEFAULT 1");

        // Auto-apply logic
        await addColumn('coupons', "auto_apply BOOLEAN DEFAULT FALSE");
        await addColumn('coupons', "target_condition VARCHAR(100)");
        await addColumn('coupons', "target_vendor_ids JSON");

        // Validity
        await addColumn('coupons', "valid_from DATETIME");
        await addColumn('coupons', "valid_until DATETIME");

        // COMPLEX CONFIG (Matches CouponConfig interface)
        // We'll store all the nested influencer, commission, and payout rules here
        await addColumn('coupons', "config JSON");

        // Metadata
        await addColumn('coupons', "created_by VARCHAR(100)");
        await addColumn('coupons', "deleted_at DATETIME");

        // --- AUDITS & REDEMPTIONS ---
        // Ensure these exist
        await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        performer_id VARCHAR(50),
        performer_name VARCHAR(100),
        action VARCHAR(50),
        entity_id VARCHAR(50),
        entity_name VARCHAR(255),
        details TEXT,
        module ENUM('BADGE', 'COUPON') NOT NULL
      ) ENGINE=InnoDB;
    `);

        // Redemptions with extended fields matching frontend 'Redemption' type
        await connection.query(`
      CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupon_code VARCHAR(50),
        user_id VARCHAR(50),
        user_name VARCHAR(100),
        trek_id VARCHAR(50),
        trek_name VARCHAR(100),
        discount_amount DECIMAL(10, 2),
        booking_amount DECIMAL(10, 2),
        commission_amount DECIMAL(10, 2),
        redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('CONFIRMED', 'CANCELLED', 'PENDING') DEFAULT 'PENDING',
        FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    } catch (err) {
        console.error("❌ Schema Update Failed:", err);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
};

updateSchema();
