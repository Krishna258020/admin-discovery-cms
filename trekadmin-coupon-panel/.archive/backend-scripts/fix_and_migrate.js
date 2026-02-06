const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function executeSQLFile(connection, filename) {
    const filePath = path.join(__dirname, filename);
    console.log(`\n📄 Reading file: ${filename}`);

    try {
        const sql = await fs.readFile(filePath, 'utf8');
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'SELECT');

        console.log(`📊 Found ${statements.length} SQL statements`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                await connection.query(statement);
            } catch (err) {
                if (err.message.includes('already exists') ||
                    err.message.includes('Duplicate') ||
                    (err.message.includes('Column') && err.message.includes('already'))) {
                    // ignore
                } else {
                    throw err;
                }
            }
        }
        return true;
    } catch (err) {
        console.log(`❌ Error executing ${filename}: ${err.message}`);
        throw err;
    }
}

async function fixAndMigrate() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('✅ Connected.');

        // 1. Fix Coupons Table
        console.log('\n🔧 Fixing coupons table...');

        // Change code to VARCHAR(50)
        try {
            await connection.query("ALTER TABLE coupons MODIFY COLUMN code VARCHAR(50) NOT NULL");
            console.log("✅ Modified coupons.code to VARCHAR(50)");
        } catch (e) {
            console.log("⚠️  Could not modify coupons.code:", e.message);
        }

        // Add Unique Index
        try {
            const [indexes] = await connection.query("SHOW INDEX FROM coupons WHERE Key_name = 'idx_code_unique'");
            if (indexes.length === 0) {
                // Check if 'code' is already unique key via other index?
                // Just try to add it.
                try {
                    await connection.query("CREATE UNIQUE INDEX idx_code_unique ON coupons(code)");
                    console.log("✅ Added UNIQUE INDEX on coupons(code)");
                } catch (e) {
                    // Maybe it is already Primary key or Unique?
                    console.log("⚠️  Could not add unique index:", e.message);
                }
            } else {
                console.log("ℹ️  Unique index already exists");
            }
        } catch (e) {
            console.log("⚠️  Error checking indexes:", e.message);
        }

        // 2. Run Migration
        console.log('\n🚀 Running Migration...');
        await executeSQLFile(connection, '01_new_tables.sql');
        console.log("✅ 01_new_tables.sql executed");

        await executeSQLFile(connection, '02_alter_existing_tables.sql');
        console.log("✅ 02_alter_existing_tables.sql executed");

        console.log("\n✅ FIX AND MIGRATION COMPLETE");

    } catch (err) {
        console.error('❌ Fatal Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

fixAndMigrate();
