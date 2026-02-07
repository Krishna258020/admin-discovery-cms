-- ============================================
-- Complete Database Schema for Aorbo Trekking
-- Generated: February 7, 2026
-- ============================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cta_badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tier ENUM('GOLD', 'PLATINUM', 'BOTH') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'DELETED') DEFAULT 'ACTIVE',
    styling JSON,
    gold_limits JSON,
    platinum_limits JSON,
    expiry_date DATE,
    usage_count_gold INT DEFAULT 0,
    usage_count_platinum INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_id VARCHAR(50),
    created_by_name VARCHAR(100),
    deleted_at DATETIME,
    last_action_at DATETIME,
    last_action_by VARCHAR(100),
    history JSON,
    INDEX idx_status (status),
    INDEX idx_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 2. COUPONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cta_coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'DRAFT', 'INACTIVE', 'EXPIRED', 'DELETED') DEFAULT 'DRAFT',
    scope ENUM('PLATFORM', 'NORMAL', 'SPECIAL', 'PREMIUM', 'INFLUENCER') NOT NULL DEFAULT 'PLATFORM',
    mode VARCHAR(50) DEFAULT 'PERCENTAGE',
    discount_value DECIMAL(10, 2) NOT NULL,
    
    usage_count INT DEFAULT 0,
    total_usage_limit INT DEFAULT 100,
    user_limit INT DEFAULT 1,
    period_usage INT DEFAULT 0,
    
    auto_apply BOOLEAN DEFAULT FALSE,
    target_condition ENUM('NEW_USER', 'FIRST_BOOKING', 'MIN_ORDER', 'NONE') DEFAULT 'NONE',
    target_vendor_ids JSON,
    
    valid_from DATETIME,
    valid_until DATETIME,
    
    min_order_value DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    affected_treks JSON,
    excluded_treks JSON,
    
    config JSON,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    created_by_id VARCHAR(50),
    deleted_at DATETIME,
    last_updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_scope (scope),
    INDEX idx_valid_dates (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 3. COUPON REDEMPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cta_coupon_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_code VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    user_name VARCHAR(255),
    booking_ref VARCHAR(50),
    scope VARCHAR(50),
    
    trek_id VARCHAR(50),
    trek_name VARCHAR(255),
    
    discount_amount DECIMAL(10, 2),
    booking_amount DECIMAL(10, 2),
    
    platform VARCHAR(50) DEFAULT 'Web',
    
    vendor_id INT(11),
    vendor_name VARCHAR(255),
    
    influencer_name VARCHAR(255),
    
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('CONFIRMED', 'CANCELLED', 'PENDING') DEFAULT 'PENDING',
    
    commission_base_amount DECIMAL(10, 2),
    commission_rate VARCHAR(50),
    commission_amount DECIMAL(10, 2),
    commission_status ENUM('PENDING', 'PAYABLE', 'PAID', 'REVERSED'),
    
    payout_batch_id VARCHAR(50),
    metadata JSON,
    
    FOREIGN KEY (coupon_code) REFERENCES cta_coupons(code) ON DELETE CASCADE,
    INDEX idx_coupon_code (coupon_code),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_commission_status (commission_status),
    INDEX idx_redeemed_at (redeemed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 4. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cta_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    performer_id VARCHAR(50),
    performer_name VARCHAR(100),
    action VARCHAR(50),
    entity_id VARCHAR(50),
    entity_name VARCHAR(255),
    details TEXT,
    module ENUM('BADGE', 'COUPON') NOT NULL,
    
    INDEX idx_timestamp (timestamp),
    INDEX idx_module (module),
    INDEX idx_entity_id (entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 5. VENDORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    business_entity VARCHAR(100),
    tier ENUM('STANDARD', 'GOLD', 'PLATINUM') DEFAULT 'STANDARD',
    region VARCHAR(100),
    credibility_score INT DEFAULT 0,
    
    account_holder_name VARCHAR(255),
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    account_number VARCHAR(50),
    
    pan_card_path VARCHAR(500),
    id_proof_path VARCHAR(500),
    
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_business_name (business_name),
    INDEX idx_tier (tier),
    INDEX idx_status (status),
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 6. VENDOR REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_requests (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id INT(11) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_tier ENUM('STANDARD', 'GOLD', 'PLATINUM'),
    requested_code VARCHAR(50) NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FLAT') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    trek_id INT(11),
    trek_name VARCHAR(255),
    reason TEXT,
    conditions TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    request_date DATE NOT NULL,
    processed_at DATETIME,
    processed_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status),
    INDEX idx_request_date (request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 7. WITHDRAWAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    coupon_code VARCHAR(50),
    influencer_name VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    pending_at_request DECIMAL(10, 2),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    processed_by VARCHAR(100),
    rejection_reason TEXT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_coupon_code (coupon_code),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 8. COMMISSION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS commission_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action ENUM('WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'COMMISSION_EARNED', 'COMMISSION_REVERSED') NOT NULL,
    coupon_code VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2),
    performer VARCHAR(100),
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_coupon_code (coupon_code),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- ============================================
-- 9. PAYOUT BATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payout_batches (
    id VARCHAR(50) PRIMARY KEY,
    coupon_code VARCHAR(50) NOT NULL,
    date DATETIME NOT NULL,
    period VARCHAR(100),
    bookings_count INT DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    mode VARCHAR(50),
    status ENUM('PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PROCESSING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_coupon_code (coupon_code),
    INDEX idx_status (status),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- ============================================
-- 10. DISCOUNT MODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discount_modes (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 11. VENDOR COUPON ASSIGNMENTS TABLE
-- ============================================
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
    
    FOREIGN KEY (coupon_id) REFERENCES cta_coupons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tbr_coupon (tbr, coupon_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_tbr (tbr),
    INDEX idx_status (status),
    INDEX idx_assignment_type (assignment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 12. VENDOR COUPON ASSIGNMENT HISTORY TABLE
-- ============================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 13. VENDOR COUPON POOL TABLE
-- ============================================
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
    
    FOREIGN KEY (coupon_id) REFERENCES cta_coupons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_coupon_type (vendor_id, coupon_id, assignment_type),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_coupon_id (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- SAMPLE DATA INSERTS (Optional)
-- ============================================

-- Insert sample discount modes
INSERT INTO discount_modes (id, label, description, is_active, is_system) VALUES
('PERCENTAGE', 'Percentage Discount', 'Discount as a percentage of order value', TRUE, TRUE),
('FLAT', 'Flat Discount', 'Fixed amount discount', TRUE, TRUE)
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- ============================================
-- END OF SCHEMA
-- ============================================
