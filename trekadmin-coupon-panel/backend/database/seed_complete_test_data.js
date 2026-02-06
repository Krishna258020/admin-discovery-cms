const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aorbo_trekking'
};

async function seedCompleteTestData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Clear existing test data
    console.log('\n🗑️  Clearing existing test data...');
    await connection.query('DELETE FROM vendor_coupon_assignment_history');
    await connection.query('DELETE FROM vendor_coupon_assignments');
    await connection.query('DELETE FROM vendor_coupon_pool');
    await connection.query('DELETE FROM coupon_redemptions');
    await connection.query('DELETE FROM commission_logs');
    await connection.query('DELETE FROM withdrawal_requests');
    await connection.query('DELETE FROM payout_batches');
    await connection.query('DELETE FROM audit_logs');
    await connection.query('DELETE FROM vendor_requests');
    await connection.query('DELETE FROM badges');
    await connection.query('DELETE FROM coupons');
    console.log('✅ Cleared existing data');

    // 1. SEED COUPONS
    console.log('\n📋 Seeding Coupons...');
    const coupons = [
      // PLATFORM COUPONS
      { id: 'CPN-1001', code: 'WELCOME25', description: 'Welcome discount for new users', scope: 'PLATFORM', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 25, status: 'ACTIVE', total_usage_limit: 1000, user_limit: 1, min_order_value: 5000, max_discount: 2000, valid_from: '2025-01-01', valid_until: '2025-12-31' },
      { id: 'CPN-1002', code: 'SUMMER500', description: 'Summer special flat discount', scope: 'PLATFORM', mode: 'FIXED', discount_type: 'fixed', discount_value: 500, status: 'ACTIVE', total_usage_limit: 500, user_limit: 1, min_order_value: 3000, max_discount: 500, valid_from: '2025-06-01', valid_until: '2025-08-31' },
      
      // PARTNER COUPONS
      { id: 'CPN-2001', code: 'HIMALAYA20', description: 'Himalayan Explorers exclusive', scope: 'NORMAL', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 20, status: 'ACTIVE', total_usage_limit: 200, user_limit: 2, min_order_value: 10000, max_discount: 3000, valid_from: '2025-01-01', valid_until: '2025-12-31', vendor_id: 'v1' },
      { id: 'CPN-2002', code: 'ALPINE15', description: 'Alpine Treks partner deal', scope: 'NORMAL', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 15, status: 'ACTIVE', total_usage_limit: 150, user_limit: 1, min_order_value: 8000, max_discount: 2000, valid_from: '2025-01-01', valid_until: '2025-12-31', vendor_id: 'v2' },
      
      // SPECIAL DEALS
      { id: 'CPN-3001', code: 'FLASH1000', description: 'Flash sale - Limited time', scope: 'SPECIAL', mode: 'FIXED', discount_type: 'fixed', discount_value: 1000, status: 'ACTIVE', total_usage_limit: 100, user_limit: 1, min_order_value: 15000, max_discount: 1000, valid_from: '2025-02-01', valid_until: '2025-02-28' },
      { id: 'CPN-3002', code: 'WEEKEND30', description: 'Weekend special offer', scope: 'SPECIAL', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 30, status: 'ACTIVE', total_usage_limit: 200, user_limit: 1, min_order_value: 12000, max_discount: 4000, valid_from: '2025-01-01', valid_until: '2025-12-31' },
      
      // PREMIUM ELITE
      { id: 'CPN-4001', code: 'ELITE40', description: 'Premium Elite members only', scope: 'PREMIUM', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 40, status: 'ACTIVE', total_usage_limit: 50, user_limit: 3, min_order_value: 20000, max_discount: 8000, valid_from: '2025-01-01', valid_until: '2025-12-31' },
      { id: 'CPN-4002', code: 'VIP2000', description: 'VIP flat discount', scope: 'PREMIUM', mode: 'FIXED', discount_type: 'fixed', discount_value: 2000, status: 'ACTIVE', total_usage_limit: 30, user_limit: 2, min_order_value: 25000, max_discount: 2000, valid_from: '2025-01-01', valid_until: '2025-12-31' },
      
      // INFLUENCER
      { id: 'CPN-5001', code: 'TREK50', description: 'Influencer referral code', scope: 'INFLUENCER', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 50, status: 'ACTIVE', total_usage_limit: 500, user_limit: 1, min_order_value: 5000, max_discount: 5000, valid_from: '2025-01-01', valid_until: '2025-12-31' },
      { id: 'CPN-5002', code: 'ADVENTURE35', description: 'Adventure influencer code', scope: 'INFLUENCER', mode: 'PERCENTAGE', discount_type: 'percentage', discount_value: 35, status: 'ACTIVE', total_usage_limit: 300, user_limit: 1, min_order_value: 8000, max_discount: 4000, valid_from: '2025-01-01', valid_until: '2025-12-31' }
    ];

    for (const coupon of coupons) {
      await connection.query(`
        INSERT INTO coupons (id, code, description, scope, mode, discount_type, discount_value, status, 
          usage_count, total_usage_limit, user_limit, auto_apply, target_condition, target_vendor_ids,
          valid_from, valid_until, min_order_value, max_discount, affected_treks, excluded_treks, 
          config, created_by, vendor_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, FALSE, 'NONE', '[]', ?, ?, ?, ?, '[]', '[]', '{}', 'System', ?, NOW())
      `, [
        coupon.id, coupon.code, coupon.description, coupon.scope, coupon.mode, 
        coupon.discount_type, coupon.discount_value, coupon.status, coupon.total_usage_limit,
        coupon.user_limit, coupon.valid_from, coupon.valid_until, coupon.min_order_value,
        coupon.max_discount, coupon.vendor_id || null
      ]);
    }
    console.log(`✅ Seeded ${coupons.length} coupons`);

    // 2. SEED REDEMPTIONS (with varied dates for trend analysis)
    console.log('\n💰 Seeding Redemptions...');
    const redemptions = [];
    const now = new Date();
    
    // Helper to generate dates
    const getDate = (daysAgo) => {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // THIS MONTH - 50 redemptions
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const coupon = coupons[Math.floor(Math.random() * coupons.length)];
      const bookingAmount = 10000 + Math.floor(Math.random() * 40000);
      const discountAmount = coupon.discount_type === 'percentage' 
        ? Math.min(bookingAmount * (coupon.discount_value / 100), coupon.max_discount)
        : coupon.discount_value;
      
      redemptions.push({
        id: `TXN-${Date.now()}-${i}`,
        customer_id: `CUST-${1000 + i}`,
        user_name: `Customer ${i + 1}`,
        coupon_code: coupon.code,
        scope: coupon.scope,
        booking_id: `BKG-${2000 + i}`,
        trek_name: ['Everest Base Camp', 'Annapurna Circuit', 'Manaslu Trek', 'Langtang Valley'][Math.floor(Math.random() * 4)],
        trek_id: `TREK-${100 + Math.floor(Math.random() * 20)}`,
        discount_amount: Math.round(discountAmount),
        booking_amount: bookingAmount,
        platform: ['Web', 'Mobile App', 'iOS App'][Math.floor(Math.random() * 3)],
        vendor_name: coupon.vendor_id ? (coupon.vendor_id === 'v1' ? 'Himalayan Explorers' : 'Alpine Treks') : null,
        vendor_id: coupon.vendor_id || null,
        status: 'CONFIRMED',
        commission_base_amount: bookingAmount,
        commission_rate: '5%',
        commission_amount: Math.round(bookingAmount * 0.05),
        commission_status: ['PENDING', 'APPROVED', 'PAID'][Math.floor(Math.random() * 3)],
        redeemed_at: getDate(daysAgo)
      });
    }

    // LAST MONTH - 40 redemptions
    for (let i = 50; i < 90; i++) {
      const daysAgo = 30 + Math.floor(Math.random() * 30);
      const coupon = coupons[Math.floor(Math.random() * coupons.length)];
      const bookingAmount = 10000 + Math.floor(Math.random() * 40000);
      const discountAmount = coupon.discount_type === 'percentage' 
        ? Math.min(bookingAmount * (coupon.discount_value / 100), coupon.max_discount)
        : coupon.discount_value;
      
      redemptions.push({
        id: `TXN-${Date.now()}-${i}`,
        customer_id: `CUST-${1000 + i}`,
        user_name: `Customer ${i + 1}`,
        coupon_code: coupon.code,
        scope: coupon.scope,
        booking_id: `BKG-${2000 + i}`,
        trek_name: ['Everest Base Camp', 'Annapurna Circuit', 'Manaslu Trek', 'Langtang Valley'][Math.floor(Math.random() * 4)],
        trek_id: `TREK-${100 + Math.floor(Math.random() * 20)}`,
        discount_amount: Math.round(discountAmount),
        booking_amount: bookingAmount,
        platform: ['Web', 'Mobile App', 'iOS App'][Math.floor(Math.random() * 3)],
        vendor_name: coupon.vendor_id ? (coupon.vendor_id === 'v1' ? 'Himalayan Explorers' : 'Alpine Treks') : null,
        vendor_id: coupon.vendor_id || null,
        status: 'CONFIRMED',
        commission_base_amount: bookingAmount,
        commission_rate: '5%',
        commission_amount: Math.round(bookingAmount * 0.05),
        commission_status: ['PENDING', 'APPROVED', 'PAID'][Math.floor(Math.random() * 3)],
        redeemed_at: getDate(daysAgo)
      });
    }

    // OLDER DATA - 30 redemptions
    for (let i = 90; i < 120; i++) {
      const daysAgo = 60 + Math.floor(Math.random() * 60);
      const coupon = coupons[Math.floor(Math.random() * coupons.length)];
      const bookingAmount = 10000 + Math.floor(Math.random() * 40000);
      const discountAmount = coupon.discount_type === 'percentage' 
        ? Math.min(bookingAmount * (coupon.discount_value / 100), coupon.max_discount)
        : coupon.discount_value;
      
      redemptions.push({
        id: `TXN-${Date.now()}-${i}`,
        customer_id: `CUST-${1000 + i}`,
        user_name: `Customer ${i + 1}`,
        coupon_code: coupon.code,
        scope: coupon.scope,
        booking_id: `BKG-${2000 + i}`,
        trek_name: ['Everest Base Camp', 'Annapurna Circuit', 'Manaslu Trek', 'Langtang Valley'][Math.floor(Math.random() * 4)],
        trek_id: `TREK-${100 + Math.floor(Math.random() * 20)}`,
        discount_amount: Math.round(discountAmount),
        booking_amount: bookingAmount,
        platform: ['Web', 'Mobile App', 'iOS App'][Math.floor(Math.random() * 3)],
        vendor_name: coupon.vendor_id ? (coupon.vendor_id === 'v1' ? 'Himalayan Explorers' : 'Alpine Treks') : null,
        vendor_id: coupon.vendor_id || null,
        status: 'CONFIRMED',
        commission_base_amount: bookingAmount,
        commission_rate: '5%',
        commission_amount: Math.round(bookingAmount * 0.05),
        commission_status: ['PENDING', 'APPROVED', 'PAID'][Math.floor(Math.random() * 3)],
        redeemed_at: getDate(daysAgo)
      });
    }

    for (const redemption of redemptions) {
      await connection.query(`
        INSERT INTO coupon_redemptions (id, customer_id, user_name, coupon_code, scope, booking_id, 
          trek_name, trek_id, discount_amount, booking_amount, platform, vendor_name, vendor_id, 
          influencer_name, status, commission_base_amount, commission_rate, commission_amount, 
          commission_status, redeemed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?)
      `, [
        redemption.id, redemption.customer_id, redemption.user_name, redemption.coupon_code,
        redemption.scope, redemption.booking_id, redemption.trek_name, redemption.trek_id,
        redemption.discount_amount, redemption.booking_amount, redemption.platform,
        redemption.vendor_name, redemption.vendor_id, redemption.status,
        redemption.commission_base_amount, redemption.commission_rate, redemption.commission_amount,
        redemption.commission_status, redemption.redeemed_at
      ]);
    }
    console.log(`✅ Seeded ${redemptions.length} redemptions`);

    // Update coupon usage counts
    await connection.query(`
      UPDATE coupons c
      SET usage_count = (
        SELECT COUNT(*) FROM coupon_redemptions r 
        WHERE r.coupon_code = c.code AND r.status = 'CONFIRMED'
      )
    `);
    console.log('✅ Updated coupon usage counts');

    // 3. SEED BADGES
    console.log('\n🏆 Seeding Badges...');
    const badges = [
      {
        id: 'BADGE-001',
        name: 'Premium Trek Offer',
        status: 'ACTIVE',
        gold_tier_config: JSON.stringify({ discount: 15, benefits: ['Priority Booking', 'Free Gear'] }),
        platinum_tier_config: JSON.stringify({ discount: 25, benefits: ['Priority Booking', 'Free Gear', 'Personal Guide'] }),
        container_animation: 'float',
        text_animation: 'glow',
        created_by_id: 'ADM-991',
        creator_name: 'Super Admin'
      },
      {
        id: 'BADGE-002',
        name: 'Winter Special',
        status: 'ACTIVE',
        gold_tier_config: JSON.stringify({ discount: 20, benefits: ['Winter Gear Included'] }),
        platinum_tier_config: JSON.stringify({ discount: 30, benefits: ['Winter Gear Included', 'Hot Meals'] }),
        container_animation: 'bounce-subtle',
        text_animation: 'pulse-slow',
        created_by_id: 'ADM-991',
        creator_name: 'Super Admin'
      }
    ];

    for (const badge of badges) {
      await connection.query(`
        INSERT INTO badges (id, name, status, gold_tier_config, platinum_tier_config, 
          container_animation, text_animation, created_by_id, creator_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        badge.id, badge.name, badge.status, badge.gold_tier_config, badge.platinum_tier_config,
        badge.container_animation, badge.text_animation, badge.created_by_id, badge.creator_name
      ]);
    }
    console.log(`✅ Seeded ${badges.length} badges`);

    // 4. SEED VENDOR REQUESTS
    console.log('\n📝 Seeding Vendor Requests...');
    const requests = [
      {
        id: 'REQ-001',
        vendor_id: 'v1',
        vendor_name: 'Himalayan Explorers',
        requested_code: 'HIMALAYA30',
        discount_type: 'PERCENTAGE',
        discount_value: 30,
        trek_name: 'Everest Base Camp Premium',
        reason: 'Special promotion for peak season',
        status: 'PENDING'
      },
      {
        id: 'REQ-002',
        vendor_id: 'v2',
        vendor_name: 'Alpine Treks',
        requested_code: 'ALPINE1500',
        discount_type: 'FIXED',
        discount_value: 1500,
        trek_name: 'Mont Blanc Circuit',
        reason: 'Early bird discount for summer bookings',
        status: 'PENDING'
      }
    ];

    for (const req of requests) {
      await connection.query(`
        INSERT INTO vendor_requests (id, vendor_id, vendor_name, requested_code, discount_type, 
          discount_value, trek_name, reason, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        req.id, req.vendor_id, req.vendor_name, req.requested_code, req.discount_type,
        req.discount_value, req.trek_name, req.reason, req.status
      ]);
    }
    console.log(`✅ Seeded ${requests.length} vendor requests`);

    // 5. SEED VENDOR COUPON POOL
    console.log('\n🎫 Seeding Vendor Coupon Pool...');
    const poolEntries = [
      { vendor_id: 'v1', coupon_id: 'CPN-4001', assignment_type: 'PREMIUM_ELITE', total_allocated: 20, available_count: 15, total_assigned: 5 },
      { vendor_id: 'v1', coupon_id: 'CPN-4002', assignment_type: 'PREMIUM_ELITE', total_allocated: 15, available_count: 12, total_assigned: 3 },
      { vendor_id: 'v2', coupon_id: 'CPN-4001', assignment_type: 'PREMIUM_ELITE', total_allocated: 10, available_count: 8, total_assigned: 2 },
      { vendor_id: 'v1', coupon_id: 'CPN-3001', assignment_type: 'SPECIAL_DEALS', total_allocated: 25, available_count: 20, total_assigned: 5 }
    ];

    for (const entry of poolEntries) {
      await connection.query(`
        INSERT INTO vendor_coupon_pool (vendor_id, coupon_id, assignment_type, total_allocated, 
          available_count, total_assigned, is_active, valid_from, valid_until, created_at)
        VALUES (?, ?, ?, ?, ?, ?, TRUE, '2025-01-01', '2025-12-31', NOW())
      `, [
        entry.vendor_id, entry.coupon_id, entry.assignment_type, entry.total_allocated,
        entry.available_count, entry.total_assigned
      ]);
    }
    console.log(`✅ Seeded ${poolEntries.length} vendor pool entries`);

    // 6. SEED VENDOR COUPON ASSIGNMENTS
    console.log('\n📌 Seeding Vendor Coupon Assignments...');
    const assignments = [
      { vendor_id: 'v1', coupon_id: 'CPN-4001', tbr: 'TBR-2025-001', trek_name: 'Everest Base Camp', customer_name: 'John Doe', assignment_type: 'PREMIUM_ELITE', status: 'ASSIGNED' },
      { vendor_id: 'v1', coupon_id: 'CPN-4001', tbr: 'TBR-2025-002', trek_name: 'Annapurna Circuit', customer_name: 'Jane Smith', assignment_type: 'PREMIUM_ELITE', status: 'ASSIGNED' },
      { vendor_id: 'v1', coupon_id: 'CPN-4002', tbr: 'TBR-2025-003', trek_name: 'Manaslu Trek', customer_name: 'Bob Wilson', assignment_type: 'PREMIUM_ELITE', status: 'USED' },
      { vendor_id: 'v2', coupon_id: 'CPN-4001', tbr: 'TBR-2025-004', trek_name: 'Langtang Valley', customer_name: 'Alice Brown', assignment_type: 'PREMIUM_ELITE', status: 'ASSIGNED' }
    ];

    for (const assignment of assignments) {
      const assignmentId = `VCA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await connection.query(`
        INSERT INTO vendor_coupon_assignments (id, vendor_id, coupon_id, tbr, trek_name, 
          customer_name, assignment_type, status, assigned_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Admin', NOW())
      `, [
        assignmentId, assignment.vendor_id, assignment.coupon_id, assignment.tbr,
        assignment.trek_name, assignment.customer_name, assignment.assignment_type, assignment.status
      ]);
    }
    console.log(`✅ Seeded ${assignments.length} vendor coupon assignments`);

    // 7. SEED AUDIT LOGS
    console.log('\n📜 Seeding Audit Logs...');
    const auditLogs = [
      { action: 'CREATE', entity_id: 'CPN-1001', entity_name: 'WELCOME25', details: 'Created platform coupon', module: 'COUPON' },
      { action: 'ACTIVATE', entity_id: 'CPN-1001', entity_name: 'WELCOME25', details: 'Activated coupon', module: 'COUPON' },
      { action: 'CREATE', entity_id: 'BADGE-001', entity_name: 'Premium Trek Offer', details: 'Created CTA badge', module: 'BADGE' },
      { action: 'ASSIGNED', entity_id: 'VCA-001', entity_name: 'TBR-2025-001', details: 'Assigned coupon to TBR', module: 'VENDOR_COUPON' }
    ];

    for (const log of auditLogs) {
      await connection.query(`
        INSERT INTO audit_logs (id, timestamp, performer_id, performer_name, action, entity_id, 
          entity_name, details, module)
        VALUES (?, NOW(), 'ADM-991', 'Super Admin', ?, ?, ?, ?, ?)
      `, [
        `LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        log.action, log.entity_id, log.entity_name, log.details, log.module
      ]);
    }
    console.log(`✅ Seeded ${auditLogs.length} audit logs`);

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED COMPLETE - Test Data Summary');
    console.log('='.repeat(60));
    
    const [couponCount] = await connection.query('SELECT COUNT(*) as count FROM coupons');
    const [redemptionCount] = await connection.query('SELECT COUNT(*) as count FROM coupon_redemptions');
    const [totalRevenue] = await connection.query('SELECT SUM(booking_amount) as total FROM coupon_redemptions WHERE status = "CONFIRMED"');
    const [totalSavings] = await connection.query('SELECT SUM(discount_amount) as total FROM coupon_redemptions WHERE status = "CONFIRMED"');
    const [badgeCount] = await connection.query('SELECT COUNT(*) as count FROM badges');
    const [requestCount] = await connection.query('SELECT COUNT(*) as count FROM vendor_requests');
    const [poolCount] = await connection.query('SELECT COUNT(*) as count FROM vendor_coupon_pool');
    const [assignmentCount] = await connection.query('SELECT COUNT(*) as count FROM vendor_coupon_assignments');
    
    console.log(`📋 Coupons: ${couponCount[0].count}`);
    console.log(`💰 Redemptions: ${redemptionCount[0].count}`);
    console.log(`💵 Total Revenue: ₹${(totalRevenue[0].total / 100000).toFixed(2)}L`);
    console.log(`🎁 Total Savings: ₹${(totalSavings[0].total / 100000).toFixed(2)}L`);
    console.log(`🏆 Badges: ${badgeCount[0].count}`);
    console.log(`📝 Vendor Requests: ${requestCount[0].count}`);
    console.log(`🎫 Vendor Pool Entries: ${poolCount[0].count}`);
    console.log(`📌 Vendor Assignments: ${assignmentCount[0].count}`);
    console.log('='.repeat(60));
    console.log('\n🎉 Ready to test dashboard calculations!');
    console.log('🚀 Start backend: cd backend && npm start');
    console.log('🌐 Start frontend: npm run dev');

  } catch (error) {
    console.error('❌ Seed Error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the seed
seedCompleteTestData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
