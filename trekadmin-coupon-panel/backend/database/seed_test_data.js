const pool = require('../src/config/db');

async function seedTestData() {
    const connection = await pool.getConnection();

    try {
        console.log('🌱 Starting database seeding...');

        await connection.beginTransaction();

        // Disable foreign key checks temporarily
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Clear existing test data
        console.log('Clearing existing test data...');
        await connection.query('DELETE FROM commission_logs');
        await connection.query('DELETE FROM payout_batches');
        await connection.query('DELETE FROM withdrawal_requests');
        await connection.query('DELETE FROM coupon_redemptions');
        await connection.query('DELETE FROM vendor_requests');
        await connection.query('DELETE FROM coupons WHERE id > 1');

        // 2. Insert Test Coupons
        console.log('Inserting test coupons...');
        await connection.query(`
            INSERT INTO coupons (code, description, scope, status, mode, valid_from, valid_until,
                total_usage_limit, usage_count, user_limit, config, created_by, discount_type, discount_value)
            VALUES 
            ('PLATFORM50', 'Platform-wide 50% discount', 'PLATFORM', 'ACTIVE', 'PERCENTAGE', '2024-01-01', '2024-12-31',
                1000, 45, 3, '{"discountValue": 50, "maxDiscount": 5000, "minOrderValue": 10000}', 'Admin', 'percentage', 50),
            ('INFLUENCER20', 'Influencer commission coupon', 'INFLUENCER', 'ACTIVE', 'PERCENTAGE', '2024-01-01', '2024-12-31',
                500, 23, 5, '{"discountValue": 20, "influencerName": "John Doe", "influencerEmail": "john@example.com", "influencerMobile": "+91 9876543210", "commissionBasis": "BOOKING_AFTER_DISCOUNT", "commissionType": "PERCENTAGE", "commissionValue": 10, "upiId": "john@paytm"}', 'Admin', 'percentage', 20),
            ('SPECIAL100', 'Special vendor deal', 'SPECIAL', 'ACTIVE', 'FLAT', '2024-01-01', '2024-12-31',
                200, 12, 1, '{"discountValue": 1000}', 'Admin', 'flat', 1000)
        `);

        // 3. Insert Test Redemptions
        console.log('Inserting test redemptions...');
        await connection.query(`
            INSERT INTO coupon_redemptions (
                id, user_id, user_name, coupon_code, scope, booking_ref, trek_name, trek_id,
                discount_amount, booking_amount, platform, vendor_name, vendor_id,
                status, redeemed_at
            ) VALUES 
            ('TXN001', 'USR001', 'Alice Johnson', 'PLATFORM50', 'PLATFORM', 'BK001', 'Kedarkantha Trek', 'TRK001',
                5000, 15000, 'Web', 'Mountain Adventures', NULL, 'CONFIRMED', NOW()),
            ('TXN002', 'USR002', 'Bob Smith', 'INFLUENCER20', 'INFLUENCER', 'BK002', 'Hampta Pass', 'TRK002',
                3000, 18000, 'App', 'Trek Masters', NULL, 'CONFIRMED', NOW()),
            ('TXN003', 'USR003', 'Charlie Brown', 'SPECIAL100', 'SPECIAL', 'BK003', 'Kashmir Great Lakes', 'TRK003',
                1000, 25000, 'Web', 'Mountain Adventures', NULL, 'CONFIRMED', NOW())
        `);

        // Update the INFLUENCER20 redemption with commission data
        await connection.query(`
            UPDATE coupon_redemptions 
            SET influencer_name = 'John Doe',
                commission_base_amount = 15000,
                commission_rate = '10%',
                commission_amount = 1500,
                commission_status = 'PAYABLE'
            WHERE id = 'TXN002'
        `);

        // 4. Insert Test Withdrawal Requests
        console.log('Inserting test withdrawal requests...');
        await connection.query(`
            INSERT INTO withdrawal_requests (
                id, coupon_code, influencer_name, amount, pending_at_request, status, requested_at
            ) VALUES 
            ('WDR001', 'INFLUENCER20', 'John Doe', 1500, 1500, 'PENDING', NOW())
        `);

        // 5. Insert Test Vendor Requests
        console.log('Inserting test vendor requests...');
        await connection.query(`
            INSERT INTO vendor_requests (
                id, vendor_id, vendor_name, vendor_tier, requested_code, discount_type,
                discount_value, trek_id, trek_name, reason, conditions, status, request_date
            ) VALUES 
            ('VREQ001', 3, 'Adventure Seekers', 'GOLD', 'VENDOR30', 'PERCENTAGE',
                30, NULL, 'Brahmatal Trek', 'Seasonal promotion for winter treks', 
                'Valid for bookings above ₹20,000', 'PENDING', NOW())
        `);

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        console.log('✅ Database seeding completed successfully!');

        // Verify counts
        const [couponCount] = await connection.query('SELECT COUNT(*) as count FROM coupons');
        const [redemptionCount] = await connection.query('SELECT COUNT(*) as count FROM coupon_redemptions');
        const [withdrawalCount] = await connection.query('SELECT COUNT(*) as count FROM withdrawal_requests');
        const [vendorReqCount] = await connection.query('SELECT COUNT(*) as count FROM vendor_requests');

        console.log('\n📊 Database Summary:');
        console.log(`   Coupons: ${couponCount[0].count}`);
        console.log(`   Redemptions: ${redemptionCount[0].count}`);
        console.log(`   Withdrawals: ${withdrawalCount[0].count}`);
        console.log(`   Vendor Requests: ${vendorReqCount[0].count}`);

    } catch (error) {
        await connection.rollback();
        console.error('❌ Seeding failed:', error.message);
        console.error('Full error:', error);
        throw error;
    } finally {
        connection.release();
        await pool.end();
    }
}

// Run the seeding
seedTestData()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n💥 Fatal error:', err);
        process.exit(1);
    });
