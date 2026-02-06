const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runManualMigration() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('✅ Connected.');

        // 1. Create discount_modes
        console.log('\nCreating discount_modes...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS discount_modes (
                id VARCHAR(50) PRIMARY KEY,
                label VARCHAR(255) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                is_system BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_is_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('✅ discount_modes created/exists');

        // 2. Create vendor_requests
        console.log('\nCreating vendor_requests...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS vendor_requests (
                id VARCHAR(50) PRIMARY KEY,
                vendor_id INT(11) NOT NULL,
                vendor_name VARCHAR(255) NOT NULL,
                vendor_tier ENUM('STANDARD', 'GOLD', 'PLATINUM'),
                requested_code VARCHAR(50) NOT NULL,
                discount_type ENUM('PERCENTAGE', 'FLAT') NOT NULL,
                discount_value DECIMAL(10,2) NOT NULL,
                trek_id INT(11),
                trek_name VARCHAR(255),
                reason TEXT,
                conditions TEXT,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                request_date DATE NOT NULL,
                processed_at DATETIME,
                processed_by VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_request_date (request_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('✅ vendor_requests created/exists');

        // 3. Create commission_logs
        console.log('\nCreating commission_logs...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS commission_logs (
                id VARCHAR(50) PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                action ENUM('WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'COMMISSION_EARNED', 'COMMISSION_REVERSED') NOT NULL,
                coupon_code VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2),
                performer VARCHAR(100),
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_coupon_code (coupon_code),
                INDEX idx_timestamp (timestamp),
                INDEX idx_action (action)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
        `);
        console.log('✅ commission_logs created/exists');

        // 4. Create payout_batches
        console.log('\nCreating payout_batches...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS payout_batches (
                id VARCHAR(50) PRIMARY KEY,
                coupon_code VARCHAR(50) NOT NULL,
                date DATETIME NOT NULL,
                period VARCHAR(100),
                bookings_count INT DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL,
                mode VARCHAR(50),
                status ENUM('PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PROCESSING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_coupon_code (coupon_code),
                INDEX idx_status (status),
                INDEX idx_date (date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
        `);
        console.log('✅ payout_batches created/exists');

        // Helper to add column safely
        async function addColumn(table, colDef) {
            try {
                await connection.query(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
                console.log(`   + Added to ${table}: ${colDef.split(' ')[0]}`);
            } catch (err) {
                if (err.message.includes('Duplicate column')) {
                    console.log(`   = Exists in ${table}: ${colDef.split(' ')[0]}`);
                } else {
                    console.log(`   ! Failed ${table}: ${colDef.split(' ')[0]} - ${err.message}`);
                }
            }
        }

        // 5. Update coupons
        console.log('\nUpdating coupons...');
        await addColumn('coupons', "scope ENUM('PLATFORM', 'NORMAL', 'SPECIAL', 'PREMIUM', 'INFLUENCER') NOT NULL DEFAULT 'PLATFORM'");
        await addColumn('coupons', "mode VARCHAR(50) DEFAULT 'PERCENTAGE'");
        await addColumn('coupons', "user_limit INT DEFAULT 1");
        await addColumn('coupons', "auto_apply BOOLEAN DEFAULT FALSE");
        await addColumn('coupons', "target_condition ENUM('NEW_USER', 'FIRST_BOOKING', 'MIN_ORDER', 'NONE') DEFAULT 'NONE'");
        await addColumn('coupons', "target_vendor_ids JSON");
        await addColumn('coupons', "min_order_value DECIMAL(10,2)");
        await addColumn('coupons', "max_discount DECIMAL(10,2)");
        await addColumn('coupons', "affected_treks JSON");
        await addColumn('coupons', "excluded_treks JSON");
        await addColumn('coupons', "config JSON");
        await addColumn('coupons', "deleted_at DATETIME");
        await addColumn('coupons', "created_by VARCHAR(100)");
        await addColumn('coupons', "created_by_id VARCHAR(50)");

        // 6. Update coupon_redemptions
        console.log('\nUpdating coupon_redemptions...');
        await addColumn('coupon_redemptions', "user_name VARCHAR(255)");
        await addColumn('coupon_redemptions', "scope VARCHAR(50)");
        await addColumn('coupon_redemptions', "trek_name VARCHAR(255)");
        await addColumn('coupon_redemptions', "trek_id VARCHAR(50)");
        await addColumn('coupon_redemptions', "booking_amount DECIMAL(10,2)");
        await addColumn('coupon_redemptions', "platform VARCHAR(50) DEFAULT 'Web'");
        await addColumn('coupon_redemptions', "vendor_name VARCHAR(255)");
        await addColumn('coupon_redemptions', "vendor_id INT(11)");
        await addColumn('coupon_redemptions', "influencer_name VARCHAR(255)");
        await addColumn('coupon_redemptions', "status ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'CONFIRMED'"); // might fail if exists
        await addColumn('coupon_redemptions', "commission_base_amount DECIMAL(10,2)");
        await addColumn('coupon_redemptions', "commission_rate VARCHAR(50)");
        await addColumn('coupon_redemptions', "commission_amount DECIMAL(10,2)");
        await addColumn('coupon_redemptions', "commission_status ENUM('PENDING', 'PAYABLE', 'PAID', 'REVERSED')");
        await addColumn('coupon_redemptions', "payout_batch_id VARCHAR(50)");
        await addColumn('coupon_redemptions', "metadata JSON");

        // 7. Update badges
        console.log('\nUpdating badges...');
        await addColumn('badges', "usage_count_gold INT DEFAULT 0");
        await addColumn('badges', "usage_count_platinum INT DEFAULT 0");

        // 8. Update withdrawal_requests
        console.log('\nUpdating withdrawal_requests...');
        await addColumn('withdrawal_requests', "coupon_code VARCHAR(50)");
        await addColumn('withdrawal_requests', "influencer_name VARCHAR(255)");
        await addColumn('withdrawal_requests', "pending_at_request DECIMAL(10,2)");
        await addColumn('withdrawal_requests', "processed_by VARCHAR(100)");
        await addColumn('withdrawal_requests', "rejection_reason TEXT");

        // 9. Add Indexes (safely)
        async function addIndex(table, idxName, cols) {
            try {
                // Check if index exists
                const [rows] = await connection.query(`SHOW INDEX FROM ${table} WHERE Key_name = '${idxName}'`);
                if (rows.length === 0) {
                    await connection.query(`CREATE INDEX ${idxName} ON ${table}(${cols})`);
                    console.log(`   + Index ${idxName} created on ${table}`);
                } else {
                    console.log(`   = Index ${idxName} exists on ${table}`);
                }
            } catch (err) {
                console.log(`   ! Failed Index ${idxName} on ${table}: ${err.message}`);
            }
        }

        console.log('\nAdding indexes...');
        await addIndex('coupons', 'idx_coupons_scope', 'scope');
        await addIndex('coupons', 'idx_coupons_status', 'status');

        await addIndex('coupon_redemptions', 'idx_redemptions_coupon_code', 'coupon_code');
        await addIndex('coupon_redemptions', 'idx_redemptions_user_id', 'user_id');
        await addIndex('coupon_redemptions', 'idx_redemptions_status', 'status');
        await addIndex('coupon_redemptions', 'idx_redemptions_commission_status', 'commission_status');

        console.log('\n✅ Manual Migration Completed!');

    } catch (err) {
        console.error('❌ Migration Failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

runManualMigration();
