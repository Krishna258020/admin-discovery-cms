const pool = require('../src/config/db');

/**
 * Migration: Create vendor coupon assignment tables
 * This enables vendors to assign coupons to specific TBRs (Trek Booking References)
 */
const createVendorCouponAssignmentTables = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Creating vendor coupon assignment tables...");

    // Table 1: Vendor Coupon Assignments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendor_coupon_assignments (
        id VARCHAR(50) PRIMARY KEY,
        vendor_id INT NOT NULL,
        coupon_id VARCHAR(50) NOT NULL,
        tbr VARCHAR(100) NOT NULL,
        trek_id VARCHAR(50),
        trek_name VARCHAR(255),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        
        assignment_type ENUM('PARTNER', 'SPECIAL_DEALS', 'PREMIUM_ELITE', 'INFLUENCER') NOT NULL,
        
        status ENUM('ASSIGNED', 'ACTIVE', 'USED', 'CANCELLED', 'EXPIRED', 'REASSIGNED') DEFAULT 'ASSIGNED',
        
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_by VARCHAR(100),
        
        activated_at DATETIME,
        used_at DATETIME,
        cancelled_at DATETIME,
        
        cancellation_reason TEXT,
        
        notes TEXT,
        metadata JSON,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_tbr_coupon (tbr, coupon_id),
        INDEX idx_vendor_id (vendor_id),
        INDEX idx_coupon_id (coupon_id),
        INDEX idx_tbr (tbr),
        INDEX idx_status (status),
        INDEX idx_assignment_type (assignment_type)
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'vendor_coupon_assignments' created.");

    // Table 2: Assignment History (for tracking reassignments)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendor_coupon_assignment_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id VARCHAR(50) NOT NULL,
        action ENUM('ASSIGNED', 'ACTIVATED', 'USED', 'CANCELLED', 'REASSIGNED') NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        previous_tbr VARCHAR(100),
        new_tbr VARCHAR(100),
        
        performed_by VARCHAR(100),
        performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        reason TEXT,
        details JSON,
        
        FOREIGN KEY (assignment_id) REFERENCES vendor_coupon_assignments(id) ON DELETE CASCADE,
        INDEX idx_assignment_id (assignment_id),
        INDEX idx_action (action)
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'vendor_coupon_assignment_history' created.");

    // Table 3: Vendor Coupon Pool (available coupons per vendor)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendor_coupon_pool (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT NOT NULL,
        coupon_id VARCHAR(50) NOT NULL,
        assignment_type ENUM('PARTNER', 'SPECIAL_DEALS', 'PREMIUM_ELITE', 'INFLUENCER') NOT NULL,
        
        total_allocated INT DEFAULT 0,
        total_assigned INT DEFAULT 0,
        total_used INT DEFAULT 0,
        available_count INT DEFAULT 0,
        
        valid_from DATETIME,
        valid_until DATETIME,
        
        is_active BOOLEAN DEFAULT TRUE,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_vendor_coupon_type (vendor_id, coupon_id, assignment_type),
        INDEX idx_vendor_id (vendor_id),
        INDEX idx_coupon_id (coupon_id)
      ) ENGINE=InnoDB;
    `);
    console.log("✅ Table 'vendor_coupon_pool' created.");

    console.log("✅ All vendor coupon assignment tables created successfully!");
    
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    connection.release();
  }
};

// Run migration
createVendorCouponAssignmentTables()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
