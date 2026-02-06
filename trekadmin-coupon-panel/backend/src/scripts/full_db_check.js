const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function checkFullDatabase() {
    console.log('\n=== DATABASE CONNECTION INFO ===');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('================================\n');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Database connection successful!\n');

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        console.log('=== EXISTING TABLES ===');
        console.log(`Found ${tableNames.length} tables:\n`);
        tableNames.forEach((name, i) => console.log(`${i + 1}. ${name}`));
        console.log('\n');

        // Check each table structure
        for (const tableName of tableNames) {
            console.log(`\n=== TABLE: ${tableName} ===`);
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            
            console.log('Columns:');
            columns.forEach(col => {
                console.log(`  - ${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
            });

            // Get row count
            const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`\nRow Count: ${countResult[0].count}`);
        }

        console.log('\n\n=== SUMMARY ===');
        console.log(`Total Tables: ${tableNames.length}`);
        
        // Check for expected tables
        const expectedTables = [
            'cta_badges',
            'cta_coupons', 
            'cta_coupon_redemptions',
            'cta_audit_logs',
            'vendors',
            'vendor_requests',
            'withdrawal_requests',
            'commission_logs',
            'payout_batches',
            'discount_modes'
        ];

        console.log('\n=== MISSING TABLES CHECK ===');
        const missingTables = expectedTables.filter(t => !tableNames.includes(t));
        if (missingTables.length > 0) {
            console.log('❌ Missing tables:');
            missingTables.forEach(t => console.log(`  - ${t}`));
        } else {
            console.log('✅ All expected tables exist!');
        }

        console.log('\n=== EXTRA TABLES ===');
        const extraTables = tableNames.filter(t => !expectedTables.includes(t));
        if (extraTables.length > 0) {
            console.log('Additional tables found:');
            extraTables.forEach(t => console.log(`  - ${t}`));
        } else {
            console.log('No extra tables.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\nFull error:', err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

checkFullDatabase();
