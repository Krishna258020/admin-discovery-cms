const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedVendors() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aorbo_trekking'
    });

    try {
        console.log('Starting vendor seeding...');

        const vendors = [
            {
                id: 'VND-001',
                business_name: 'Peak Performance Adventures',
                business_type: 'Individual Guide',
                business_entity: 'Sole Proprietorship',
                tier: 'PLATINUM',
                region: 'Rockies',
                credibility_score: 95,
                account_holder_name: 'John Smith',
                bank_name: 'HDFC Bank',
                ifsc_code: 'HDFC0001234',
                account_number: '1234567890',
                pan_card_path: '/uploads/pan/vnd001.pdf',
                id_proof_path: '/uploads/id/vnd001.pdf',
                status: 'approved'
            },
            {
                id: 'VND-002',
                business_name: 'Sherpa Guide Co',
                business_type: 'Private Limited Company',
                business_entity: 'Partnership',
                tier: 'GOLD',
                region: 'Sikkim',
                credibility_score: 88,
                account_holder_name: 'Sherpa Guide Co',
                bank_name: 'SBI',
                ifsc_code: 'SBIN0005678',
                account_number: '9876543210',
                pan_card_path: '/uploads/pan/vnd002.pdf',
                id_proof_path: '/uploads/id/vnd002.pdf',
                status: 'approved'
            },
            {
                id: 'VND-003',
                business_name: 'Alpine Treks',
                business_type: 'Individual Guide',
                business_entity: 'Sole Proprietorship',
                tier: 'GOLD',
                region: 'Alps',
                credibility_score: 85,
                account_holder_name: 'Maria Rodriguez',
                bank_name: 'ICICI Bank',
                ifsc_code: 'ICIC0009012',
                account_number: '5555666677',
                pan_card_path: '/uploads/pan/vnd003.pdf',
                id_proof_path: '/uploads/id/vnd003.pdf',
                status: 'approved'
            },
            {
                id: 'VND-004',
                business_name: 'Sahyadri Rangers',
                business_type: 'Private Limited Company',
                business_entity: 'Company',
                tier: 'STANDARD',
                region: 'Maharashtra',
                credibility_score: 72,
                account_holder_name: 'Sahyadri Rangers Pvt Ltd',
                bank_name: 'Axis Bank',
                ifsc_code: 'UTIB0003456',
                account_number: '1111222233',
                pan_card_path: '/uploads/pan/vnd004.pdf',
                id_proof_path: '/uploads/id/vnd004.pdf',
                status: 'approved'
            },
            {
                id: 'VND-005',
                business_name: 'Desert Nomads',
                business_type: 'Individual Guide',
                business_entity: 'Sole Proprietorship',
                tier: 'STANDARD',
                region: 'Sahara',
                credibility_score: 70,
                account_holder_name: 'Ahmed Hassan',
                bank_name: 'PNB',
                ifsc_code: 'PUNB0007890',
                account_number: '4444555566',
                pan_card_path: '/uploads/pan/vnd005.pdf',
                id_proof_path: '/uploads/id/vnd005.pdf',
                status: 'approved'
            },
            {
                id: 'VND-006',
                business_name: 'Jungle Walks',
                business_type: 'Private Limited Company',
                business_entity: 'Partnership',
                tier: 'STANDARD',
                region: 'Amazon',
                credibility_score: 65,
                account_holder_name: 'Jungle Walks LLP',
                bank_name: 'Kotak Mahindra',
                ifsc_code: 'KKBK0001122',
                account_number: '7777888899',
                pan_card_path: '/uploads/pan/vnd006.pdf',
                id_proof_path: '/uploads/id/vnd006.pdf',
                status: 'approved'
            },
            {
                id: 'VND-007',
                business_name: 'Mountain Masters',
                business_type: 'Individual Guide',
                business_entity: 'Sole Proprietorship',
                tier: 'PLATINUM',
                region: 'Himalayas',
                credibility_score: 92,
                account_holder_name: 'Tenzing Norgay',
                bank_name: 'HDFC Bank',
                ifsc_code: 'HDFC0002345',
                account_number: '2222333344',
                pan_card_path: '/uploads/pan/vnd007.pdf',
                id_proof_path: '/uploads/id/vnd007.pdf',
                status: 'approved'
            },
            {
                id: 'VND-008',
                business_name: 'Coastal Expeditions',
                business_type: 'Private Limited Company',
                business_entity: 'Company',
                tier: 'GOLD',
                region: 'Goa',
                credibility_score: 80,
                account_holder_name: 'Coastal Expeditions Pvt Ltd',
                bank_name: 'SBI',
                ifsc_code: 'SBIN0006789',
                account_number: '6666777788',
                pan_card_path: '/uploads/pan/vnd008.pdf',
                id_proof_path: '/uploads/id/vnd008.pdf',
                status: 'approved'
            }
        ];

        for (const vendor of vendors) {
            try {
                await connection.query(`
                    INSERT INTO vendors (
                        id, business_name, business_type, business_entity, tier, region,
                        credibility_score, account_holder_name, bank_name, ifsc_code,
                        account_number, pan_card_path, id_proof_path, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                        business_name = VALUES(business_name),
                        tier = VALUES(tier),
                        region = VALUES(region),
                        credibility_score = VALUES(credibility_score),
                        status = VALUES(status),
                        updated_at = NOW()
                `, [
                    vendor.id,
                    vendor.business_name,
                    vendor.business_type,
                    vendor.business_entity,
                    vendor.tier,
                    vendor.region,
                    vendor.credibility_score,
                    vendor.account_holder_name,
                    vendor.bank_name,
                    vendor.ifsc_code,
                    vendor.account_number,
                    vendor.pan_card_path,
                    vendor.id_proof_path,
                    vendor.status
                ]);
                console.log(`✓ Seeded vendor: ${vendor.business_name} (${vendor.tier}, ${vendor.region})`);
            } catch (err) {
                console.error(`✗ Failed to seed ${vendor.business_name}:`, err.message);
            }
        }

        console.log('\n✅ Vendor seeding completed!');
        console.log(`Total vendors seeded: ${vendors.length}`);

        // Show summary
        const [summary] = await connection.query(`
            SELECT tier, COUNT(*) as count 
            FROM vendors 
            WHERE tier IS NOT NULL 
            GROUP BY tier
        `);
        console.log('\n📊 Vendor Summary by Tier:');
        summary.forEach(row => {
            console.log(`   ${row.tier}: ${row.count}`);
        });

    } catch (error) {
        console.error('Error seeding vendors:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

seedVendors();
