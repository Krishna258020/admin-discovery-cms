
const BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
    console.log('🚀 Starting API Verification Check...\n');

    // --- Helper Request Function ---
    const request = async (method, endpoint, body = null) => {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(`${BASE_URL}${endpoint}`, options);
            const data = await res.json();
            return { status: res.status, data };
        } catch (err) {
            console.error(`❌ Request Failed: ${method} ${endpoint}`, err.message);
            return null;
        }
    };

    // --- BADGE TESTS ---
    console.log('🔹 Testing Badges API...');

    // 1. Create Badge
    const newBadge = {
        name: 'Auto Test Badge',
        description: 'Created via script',
        tier: 'GOLD',
        styling: { bgType: 'solid', bgColor1: '#000000' },
        goldLimits: { maxLifetime: 10, maxPerMonth: 1 },
        platinumLimits: { maxLifetime: 0, maxPerMonth: 0 },
        expiryDate: '2025-12-31',
        createdById: 'TEST_SCRIPT',
        creatorName: 'AutoTester'
    };

    const createBadgeRes = await request('POST', '/badges', newBadge);
    if (createBadgeRes.status === 201) {
        console.log(`✅ Badge Created: ID ${createBadgeRes.data.id}`);
        const badgeId = createBadgeRes.data.id;

        // 2. Refresh List
        const listBadgesRes = await request('GET', '/badges');
        const badgeFound = listBadgesRes.data.find(b => b.id === badgeId);
        if (badgeFound) console.log('✅ Badge Found in List');
        else console.error('❌ Badge NOT Found in List');

        // 3. Update Badge
        const updateRes = await request('PUT', `/badges/${badgeId}`, {
            name: 'Updated Test Badge',
            description: 'Updated desc',
            tier: 'PLATINUM',
            styling: {}, goldLimits: {}, platinumLimits: {},
            lastActionBy: 'Tester'
        });
        if (updateRes.status === 200) console.log('✅ Badge Updated');
        else console.error(`❌ Badge Update Failed: ${updateRes.status}`);

        // 4. Toggle Status
        const statusRes = await request('PATCH', `/badges/${badgeId}/status`, { status: 'INACTIVE' });
        if (statusRes.status === 200) console.log('✅ Badge Status Toggled');

        // 5. Delete Badge
        const deleteRes = await request('DELETE', `/badges/${badgeId}`);
        if (deleteRes.status === 200) console.log('✅ Badge Deleted');

    } else {
        console.error('❌ Badge Creation Failed', createBadgeRes.data);
    }

    console.log('\n🔹 Testing Coupons API...');

    // --- COUPON TESTS ---
    // 1. Create Coupon
    const newCoupon = {
        code: `TEST${Math.floor(Math.random() * 1000)}`,
        description: 'Auto Test Coupon',
        scope: 'PLATFORM',
        mode: 'FLAT',
        discountValue: 50,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        createdBy: 'AutoTester'
    };

    const createCouponRes = await request('POST', '/coupons', newCoupon);
    if (createCouponRes.status === 201) {
        console.log(`✅ Coupon Created: Code ${createCouponRes.data.code} (ID: ${createCouponRes.data.id})`);
        const couponId = createCouponRes.data.id;

        // 2. List Coupons
        const listCouponsRes = await request('GET', '/coupons');
        const couponFound = listCouponsRes.data.find(c => c.id === couponId);
        if (couponFound) console.log('✅ Coupon Found in List');
        else console.error('❌ Coupon NOT Found in List');

        // 3. Update Coupon
        const updateCpnRes = await request('PUT', `/coupons/${couponId}`, {
            description: 'Updated Coupon Desc',
            status: 'ACTIVE',
            scope: 'PLATFORM', mode: 'FLAT', discountValue: 60,
            validFrom: '2025-01-01', validUntil: '2025-12-31'
        });
        if (updateCpnRes.status === 200) console.log('✅ Coupon Updated');

        // 4. Delete Coupon
        const deleteCpnRes = await request('DELETE', `/coupons/${couponId}`);
        if (deleteCpnRes.status === 200) console.log('✅ Coupon Deleted');

    } else {
        console.error('❌ Coupon Creation Failed', createCouponRes.data);
    }
}

testAPI();
