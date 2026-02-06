const pool = require('../config/db');

const initSchema = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Starting Schema Initialization...");

    // 1. Badges Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cta_badges (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        tier ENUM('GOLD', 'PLATINUM', 'BOTH') NOT NULL,
        status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'DELETED') DEFAULT 'ACTIVE',
        styling JSON, -- Stores BadgeStyling object
        gold_limits JSON, -- Stores { maxLifetime, maxPerMonth }
        platinum_limits JSON, -- Stores { maxLifetime, maxPerMonth }
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_id VARCHAR(50),
        created_by_name VARCHAR(100),
        deleted_at DATETIME,
        last_action_at DATETIME,
        last_action_by VARCHAR(100),
        history JSON -- Array of history items
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'cta_badges' ready.");

    // 2. Coupons Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cta_coupons (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        status ENUM('ACTIVE', 'DRAFT', 'INACTIVE', 'EXPIRED', 'DELETED') DEFAULT 'DRAFT',
        scope ENUM('PLATFORM', 'NORMAL', 'SPECIAL', 'PREMIUM', 'INFLUENCER') NOT NULL,
        mode ENUM('PERCENTAGE', 'FLAT') NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        
        usage_count INT DEFAULT 0,
        total_usage_limit INT DEFAULT 100,
        period_usage INT DEFAULT 0,
        
        valid_from DATETIME,
        valid_until DATETIME,
        
        min_order_value DECIMAL(10, 2),
        max_discount DECIMAL(10, 2),
        affected_treks JSON, -- Array of Trek IDs
        excluded_treks JSON,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        last_updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'cta_coupons' ready.");

    // 3. Coupon Redemptions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cta_coupon_redemptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupon_code VARCHAR(50),
        user_id VARCHAR(50),
        booking_ref VARCHAR(50),
        discount_amount DECIMAL(10, 2),
        redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('CONFIRMED', 'CANCELLED', 'PENDING') DEFAULT 'PENDING',
        FOREIGN KEY (coupon_code) REFERENCES cta_coupons(code) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'cta_coupon_redemptions' ready.");

    // 4. Audit Logs (Unified)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cta_audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        performer_id VARCHAR(50),
        performer_name VARCHAR(100),
        action VARCHAR(50), -- CREATED, EDITED, DELETED, ACTIVATED
        entity_id VARCHAR(50), -- Badge ID or Coupon ID
        entity_name VARCHAR(255),
        details TEXT,
        module ENUM('BADGE', 'COUPON') NOT NULL
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'cta_audit_logs' ready.");

  } catch (err) {
    console.error("❌ Schema Init Failed:", err);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
};

initSchema();
