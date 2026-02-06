const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixVendorIdColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aorbo_trekking'
    });

    try {
        console.log('Starting vendor_id column fix...');

        // Step 1: Find the foreign key constraint name
        const [constraints] = await connection.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'aorbo_trekking' 
            AND TABLE_NAME = 'coupons' 
            AND COLUMN_NAME = 'vendor_id' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        if (constraints.length > 0) {
            const fkName = constraints[0].CONSTRAINT_NAME;
            console.log(`Found foreign key constraint: ${fkName}`);

            // Step 2: Drop the foreign key constraint
            await connection.query(`ALTER TABLE coupons DROP FOREIGN KEY ${fkName}`);
            console.log('Dropped foreign key constraint');
        }

        // Step 3: Modify the column to allow NULL
        await connection.query(`ALTER TABLE coupons MODIFY COLUMN vendor_id VARCHAR(50) NULL`);
        console.log('Modified vendor_id column to allow NULL');

        console.log('✅ Successfully fixed vendor_id column! (Foreign key constraint removed)');
        console.log('Note: Platform-wide coupons can now have NULL vendor_id');
    } catch (error) {
        console.error('Error fixing vendor_id column:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

fixVendorIdColumn();
