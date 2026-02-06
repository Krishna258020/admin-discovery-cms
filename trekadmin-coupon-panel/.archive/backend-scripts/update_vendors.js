const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateExistingVendors() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aorbo_trekking'
    });

    try {
        console.log('Fetching existing vendors...');

        // Get all existing vendors
        const [vendors] = await connection.query('SELECT id, business_name FROM vendors');

        if (vendors.length === 0) {
            console.log('❌ No vendors found in database. Please create vendors first.');
            return;
        }

        console.log(`Found ${vendors.length} vendors. Updating with tier, region, and credibility data...\n`);

        // Sample data to assign to vendors
        const tiers = ['PLATINUM', 'GOLD', 'STANDARD'];
        const regions = ['Himalayas', 'Rockies', 'Alps', 'Maharashtra', 'Sikkim', 'Goa', 'Amazon', 'Sahara', 'Kashmir', 'Uttarakhand'];

        let updated = 0;
        for (let i = 0; i < vendors.length; i++) {
            const vendor = vendors[i];

            // Assign tier based on position (distribute evenly)
            const tier = tiers[i % tiers.length];

            // Assign region
            const region = regions[i % regions.length];

            // Calculate credibility score (60-95 range)
            let credibilityScore;
            if (tier === 'PLATINUM') {
                credibilityScore = 85 + Math.floor(Math.random() * 11); // 85-95
            } else if (tier === 'GOLD') {
                credibilityScore = 75 + Math.floor(Math.random() * 11); // 75-85
            } else {
                credibilityScore = 60 + Math.floor(Math.random() * 16); // 60-75
            }

            try {
                await connection.query(`
                    UPDATE vendors 
                    SET tier = ?, region = ?, credibility_score = ?
                    WHERE id = ?
                `, [tier, region, credibilityScore, vendor.id]);

                console.log(`✓ Updated: ${vendor.business_name || vendor.id} → ${tier}, ${region}, Score: ${credibilityScore}`);
                updated++;
            } catch (err) {
                console.error(`✗ Failed to update ${vendor.id}:`, err.message);
            }
        }

        console.log(`\n✅ Updated ${updated} vendors successfully!`);

        // Show summary
        const [summary] = await connection.query(`
            SELECT tier, COUNT(*) as count 
            FROM vendors 
            WHERE tier IS NOT NULL 
            GROUP BY tier
            ORDER BY FIELD(tier, 'PLATINUM', 'GOLD', 'STANDARD')
        `);

        console.log('\n📊 Vendor Summary by Tier:');
        summary.forEach(row => {
            console.log(`   ${row.tier}: ${row.count} vendors`);
        });

        // Show some sample vendors
        const [samples] = await connection.query(`
            SELECT business_name, tier, region, credibility_score 
            FROM vendors 
            WHERE tier IS NOT NULL 
            LIMIT 5
        `);

        console.log('\n📋 Sample Vendors:');
        samples.forEach(v => {
            console.log(`   ${v.business_name} - ${v.tier} (${v.region}) - Score: ${v.credibility_score}`);
        });

    } catch (error) {
        console.error('Error updating vendors:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

updateExistingVendors();
