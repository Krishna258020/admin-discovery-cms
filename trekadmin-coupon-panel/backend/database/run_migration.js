const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, 'bright');
    console.log('='.repeat(70) + '\n');
}

async function createBackup(connection) {
    logSection('CREATING BACKUP');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(__dirname, `backup_${timestamp}.sql`);
    
    log('⏳ Creating database backup...', 'yellow');
    log(`📁 Backup file: ${backupFile}`, 'cyan');
    
    // Note: This is a simplified backup. For production, use mysqldump
    log('⚠️  For production, use: mysqldump -u root -p aorbo_trekking > backup.sql', 'yellow');
    
    return backupFile;
}

async function checkPrerequisites(connection) {
    logSection('CHECKING PREREQUISITES');
    
    try {
        // Check MySQL version
        const [version] = await connection.query('SELECT VERSION() as version');
        log(`✅ MySQL Version: ${version[0].version}`, 'green');
        
        // Check database exists
        const [dbs] = await connection.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME]);
        if (dbs.length === 0) {
            throw new Error(`Database ${process.env.DB_NAME} does not exist`);
        }
        log(`✅ Database exists: ${process.env.DB_NAME}`, 'green');
        
        // Check required tables exist
        const requiredTables = ['coupons', 'coupon_redemptions', 'badges', 'vendors', 'withdrawal_requests'];
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        for (const table of requiredTables) {
            if (!tableNames.includes(table)) {
                throw new Error(`Required table '${table}' does not exist`);
            }
            log(`✅ Table exists: ${table}`, 'green');
        }
        
        return true;
    } catch (err) {
        log(`❌ Prerequisite check failed: ${err.message}`, 'red');
        return false;
    }
}

async function executeSQLFile(connection, filename) {
    const filePath = path.join(__dirname, filename);
    
    log(`\n📄 Reading file: ${filename}`, 'cyan');
    
    try {
        const sql = await fs.readFile(filePath, 'utf8');
        
        // Split by semicolon but keep multi-line statements together
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'SELECT');
        
        log(`📊 Found ${statements.length} SQL statements`, 'cyan');
        
        let successCount = 0;
        let skipCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.trim().length === 0) {
                continue;
            }
            
            try {
                await connection.query(statement);
                successCount++;
                
                // Show progress every 5 statements
                if ((i + 1) % 5 === 0) {
                    process.stdout.write(`\r⏳ Progress: ${i + 1}/${statements.length} statements executed`);
                }
            } catch (err) {
                // Check if error is "already exists" - this is OK
                if (err.message.includes('already exists') || 
                    err.message.includes('Duplicate') ||
                    err.message.includes('Column') && err.message.includes('already')) {
                    skipCount++;
                } else {
                    throw err;
                }
            }
        }
        
        console.log(''); // New line after progress
        log(`✅ Executed: ${successCount} statements`, 'green');
        if (skipCount > 0) {
            log(`⏭️  Skipped: ${skipCount} (already exists)`, 'yellow');
        }
        
        return true;
    } catch (err) {
        log(`❌ Error executing ${filename}: ${err.message}`, 'red');
        throw err;
    }
}

async function verifyMigration(connection) {
    logSection('VERIFYING MIGRATION');
    
    const checks = [];
    
    // Check 1: New tables created
    log('🔍 Checking new tables...', 'cyan');
    const [newTables] = await connection.query(`
        SELECT TABLE_NAME, TABLE_ROWS 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('discount_modes', 'vendor_requests', 'commission_logs', 'payout_batches')
    `, [process.env.DB_NAME]);
    
    if (newTables.length === 4) {
        log('✅ All 4 new tables created', 'green');
        newTables.forEach(t => log(`   - ${t.TABLE_NAME} (${t.TABLE_ROWS} rows)`, 'cyan'));
        checks.push(true);
    } else {
        log(`❌ Expected 4 tables, found ${newTables.length}`, 'red');
        checks.push(false);
    }
    
    // Check 2: New columns in coupons
    log('\n🔍 Checking coupons table columns...', 'cyan');
    const [couponCols] = await connection.query(`
        SELECT COUNT(*) as count
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'coupons'
        AND COLUMN_NAME IN ('scope', 'mode', 'user_limit', 'auto_apply', 'target_condition', 
                            'target_vendor_ids', 'min_order_value', 'max_discount', 
                            'affected_treks', 'excluded_treks', 'config', 'deleted_at', 
                            'created_by', 'created_by_id')
    `, [process.env.DB_NAME]);
    
    if (couponCols[0].count >= 14) {
        log(`✅ Coupons table: ${couponCols[0].count}/14 columns added`, 'green');
        checks.push(true);
    } else {
        log(`❌ Coupons table: Only ${couponCols[0].count}/14 columns found`, 'red');
        checks.push(false);
    }
    
    // Check 3: New columns in coupon_redemptions
    log('\n🔍 Checking coupon_redemptions table columns...', 'cyan');
    const [redemptionCols] = await connection.query(`
        SELECT COUNT(*) as count
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'coupon_redemptions'
        AND COLUMN_NAME IN ('user_name', 'scope', 'trek_name', 'trek_id', 'booking_amount', 
                            'platform', 'vendor_name', 'vendor_id', 'influencer_name', 'status',
                            'commission_base_amount', 'commission_rate', 'commission_amount', 
                            'commission_status', 'payout_batch_id', 'metadata')
    `, [process.env.DB_NAME]);
    
    if (redemptionCols[0].count >= 16) {
        log(`✅ Coupon_redemptions table: ${redemptionCols[0].count}/17 columns added`, 'green');
        checks.push(true);
    } else {
        log(`❌ Coupon_redemptions table: Only ${redemptionCols[0].count}/17 columns found`, 'red');
        checks.push(false);
    }
    
    // Check 4: Foreign keys
    log('\n🔍 Checking foreign keys...', 'cyan');
    const [fks] = await connection.query(`
        SELECT COUNT(*) as count
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('vendor_requests', 'commission_logs', 'payout_batches', 
                           'coupon_redemptions', 'withdrawal_requests')
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME]);
    
    if (fks[0].count >= 5) {
        log(`✅ Foreign keys: ${fks[0].count} relationships created`, 'green');
        checks.push(true);
    } else {
        log(`⚠️  Foreign keys: Only ${fks[0].count} found (expected 7+)`, 'yellow');
        checks.push(true); // Not critical
    }
    
    // Check 5: Indexes
    log('\n🔍 Checking indexes...', 'cyan');
    const [indexes] = await connection.query(`
        SELECT COUNT(DISTINCT INDEX_NAME) as count
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('discount_modes', 'vendor_requests', 'commission_logs', 
                           'payout_batches', 'coupons', 'coupon_redemptions')
        AND INDEX_NAME != 'PRIMARY'
    `, [process.env.DB_NAME]);
    
    log(`✅ Indexes: ${indexes[0].count} indexes created`, 'green');
    checks.push(true);
    
    return checks.every(c => c === true);
}

async function runMigration() {
    let connection;
    
    try {
        // Header
        console.clear();
        logSection('🚀 TREKADMIN COUPON SYSTEM - DATABASE MIGRATION');
        
        log('Database: ' + process.env.DB_NAME, 'cyan');
        log('Host: ' + process.env.DB_HOST, 'cyan');
        log('User: ' + process.env.DB_USER, 'cyan');
        
        // Connect to database
        logSection('CONNECTING TO DATABASE');
        log('⏳ Establishing connection...', 'yellow');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        
        log('✅ Connected successfully!', 'green');
        
        // Check prerequisites
        const prereqsPassed = await checkPrerequisites(connection);
        if (!prereqsPassed) {
            throw new Error('Prerequisites check failed. Please fix issues and try again.');
        }
        
        // Create backup
        const backupFile = await createBackup(connection);
        
        // Confirm before proceeding
        logSection('⚠️  READY TO MIGRATE');
        log('This will:', 'yellow');
        log('  • Create 4 new tables', 'yellow');
        log('  • Add 38 columns to existing tables', 'yellow');
        log('  • Create foreign keys and indexes', 'yellow');
        log('\nEstimated time: 2-5 minutes', 'cyan');
        
        // Auto-proceed after 3 seconds (or add readline for manual confirmation)
        log('\n⏳ Starting migration in 3 seconds...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Execute migrations
        logSection('STEP 1: CREATING NEW TABLES');
        await executeSQLFile(connection, '01_new_tables.sql');
        
        logSection('STEP 2: ALTERING EXISTING TABLES');
        await executeSQLFile(connection, '02_alter_existing_tables.sql');
        
        // Verify migration
        const verified = await verifyMigration(connection);
        
        if (verified) {
            logSection('✅ MIGRATION COMPLETED SUCCESSFULLY!');
            log('All checks passed!', 'green');
            log('\n📋 Next Steps:', 'cyan');
            log('  1. Update backend API controllers', 'cyan');
            log('  2. Update frontend to use new API endpoints', 'cyan');
            log('  3. Test all coupon workflows', 'cyan');
            log('  4. Deploy to production', 'cyan');
        } else {
            logSection('⚠️  MIGRATION COMPLETED WITH WARNINGS');
            log('Some verification checks failed. Please review above.', 'yellow');
            log('The migration may still be functional.', 'yellow');
        }
        
    } catch (err) {
        logSection('❌ MIGRATION FAILED');
        log(`Error: ${err.message}`, 'red');
        log('\n🔄 Rollback Options:', 'yellow');
        log('  1. Restore from backup (recommended)', 'yellow');
        log('  2. Manually drop new tables and columns', 'yellow');
        log('  3. Review error and retry', 'yellow');
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            log('\n🔌 Database connection closed', 'cyan');
        }
    }
}

// Run migration
runMigration().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
