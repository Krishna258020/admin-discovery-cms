const mysql = require('mysql2/promise');
require('dotenv').config();

async function addVendorColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aorbo_trekking'
    });

    try {
        console.log('Adding tier, region, and credibility_score columns to vendors table...');

        // Add tier column
        try {
            await connection.query(`
                ALTER TABLE vendors 
                ADD COLUMN tier ENUM('STANDARD', 'GOLD', 'PLATINUM') DEFAULT 'STANDARD' 
                AFTER business_entity
            `);
            console.log('✓ Added tier column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ tier column already exists');
            } else {
                throw err;
            }
        }

        // Add region column
        try {
            await connection.query(`
                ALTER TABLE vendors 
                ADD COLUMN region VARCHAR(100) DEFAULT NULL 
                AFTER tier
            `);
            console.log('✓ Added region column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ region column already exists');
            } else {
                throw err;
            }
        }

        // Add credibility_score column
        try {
            await connection.query(`
                ALTER TABLE vendors 
                ADD COLUMN credibility_score INT DEFAULT 50 
                AFTER region
            `);
            console.log('✓ Added credibility_score column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ credibility_score column already exists');
            } else {
                throw err;
            }
        }

        console.log('\n✅ Successfully added all vendor columns!');

    } catch (error) {
        console.error('Error adding columns:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

addVendorColumns();
