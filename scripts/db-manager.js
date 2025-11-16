#!/usr/bin/env node

/**
 * Rencam Database Management CLI
 * 
 * Usage:
 *   node scripts/db-manager.js setup          - Initialize database schema
 *   node scripts/db-manager.js seed           - Insert sample data
 *   node scripts/db-manager.js backup         - Create database backup
 *   node scripts/db-manager.js restore <file> - Restore from backup
 *   node scripts/db-manager.js analytics      - Generate analytics report
 *   node scripts/db-manager.js health         - Check database health
 *   node scripts/db-manager.js cleanup        - Clean up old data
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database configuration from environment
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'rencam_db',
  user: process.env.DB_USER || 'rencam_user',
  password: process.env.DB_PASSWORD || 'rencam_password'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, env = {}) {
  return new Promise((resolve, reject) => {
    exec(command, {
      env: { ...process.env, ...env }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// Check if database exists and is accessible
async function checkDatabaseConnection() {
  const command = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -c "SELECT 1;"`;
  
  try {
    await execCommand(command, { PGPASSWORD: DB_CONFIG.password });
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize database schema
async function setupDatabase() {
  colorLog('blue', '🔧 Setting up Rencam database schema...');
  
  const schemaPath = path.join(__dirname, '../src/database/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    colorLog('red', '❌ Schema file not found: ' + schemaPath);
    process.exit(1);
  }

  const command = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -f "${schemaPath}"`;
  
  try {
    const { stdout, stderr } = await execCommand(command, { PGPASSWORD: DB_CONFIG.password });
    
    if (stderr && !stderr.includes('NOTICE')) {
      colorLog('yellow', '⚠️  Warnings during setup:');
      console.log(stderr);
    }
    
    colorLog('green', '✅ Database schema setup completed successfully!');
  } catch (error) {
    colorLog('red', '❌ Database setup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Insert sample data
async function seedDatabase() {
  colorLog('blue', '🌱 Seeding database with sample data...');
  
  const seedPath = path.join(__dirname, '../src/database/seedData.sql');
  
  if (!fs.existsSync(seedPath)) {
    colorLog('red', '❌ Seed file not found: ' + seedPath);
    process.exit(1);
  }

  const command = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -f "${seedPath}"`;
  
  try {
    const { stdout, stderr } = await execCommand(command, { PGPASSWORD: DB_CONFIG.password });
    
    if (stderr && !stderr.includes('NOTICE')) {
      colorLog('yellow', '⚠️  Warnings during seeding:');
      console.log(stderr);
    }
    
    colorLog('green', '✅ Database seeding completed successfully!');
    colorLog('cyan', '📊 Sample data includes:');
    console.log('   • Admin and sample users');
    console.log('   • Equipment categories');
    console.log('   • Sample cameras and gear');
    console.log('   • Demo bookings and reviews');
  } catch (error) {
    colorLog('red', '❌ Database seeding failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Create database backup
async function backupDatabase() {
  colorLog('blue', '💾 Creating database backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  const backupFile = path.join(backupDir, `rencam_backup_${timestamp}.backup`);
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const command = `pg_dump -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} --format=custom --compress=9 --file="${backupFile}"`;
  
  try {
    await execCommand(command, { PGPASSWORD: DB_CONFIG.password });
    
    const stats = fs.statSync(backupFile);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    colorLog('green', `✅ Backup created successfully!`);
    colorLog('cyan', `📁 File: ${backupFile}`);
    colorLog('cyan', `📏 Size: ${sizeInMB} MB`);
  } catch (error) {
    colorLog('red', '❌ Backup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Restore database from backup
async function restoreDatabase(backupFile) {
  if (!backupFile) {
    colorLog('red', '❌ Please provide backup file path');
    colorLog('yellow', 'Usage: node scripts/db-manager.js restore <backup-file>');
    process.exit(1);
  }

  if (!fs.existsSync(backupFile)) {
    colorLog('red', `❌ Backup file not found: ${backupFile}`);
    process.exit(1);
  }

  colorLog('blue', '🔄 Restoring database from backup...');
  colorLog('yellow', `📁 Source: ${backupFile}`);

  const command = `pg_restore -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} --clean --if-exists --verbose "${backupFile}"`;
  
  try {
    const { stdout, stderr } = await execCommand(command, { PGPASSWORD: DB_CONFIG.password });
    
    if (stderr && !stderr.includes('NOTICE')) {
      colorLog('yellow', '⚠️  Warnings during restore:');
      console.log(stderr);
    }
    
    colorLog('green', '✅ Database restored successfully!');
  } catch (error) {
    colorLog('red', '❌ Restore failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Generate analytics report
async function generateAnalytics() {
  colorLog('blue', '📊 Generating analytics report...');
  
  const queries = {
    summary: `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM equipment WHERE status != 'deleted') as total_equipment,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed') as total_revenue
    `,
    recentActivity: `
      SELECT 
        COUNT(*) as recent_bookings,
        COALESCE(SUM(total_amount), 0) as recent_revenue
      FROM bookings 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `,
    topCategories: `
      SELECT 
        c.name,
        COUNT(b.id) as bookings
      FROM categories c
      LEFT JOIN equipment e ON c.id = e.category_id
      LEFT JOIN bookings b ON e.id = b.equipment_id
      GROUP BY c.id, c.name
      ORDER BY bookings DESC
      LIMIT 5
    `
  };

  try {
    const summaryCommand = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -c "${queries.summary}"`;
    const activityCommand = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -c "${queries.recentActivity}"`;
    const categoriesCommand = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -c "${queries.topCategories}"`;

    const [summaryResult, activityResult, categoriesResult] = await Promise.all([
      execCommand(summaryCommand, { PGPASSWORD: DB_CONFIG.password }),
      execCommand(activityCommand, { PGPASSWORD: DB_CONFIG.password }),
      execCommand(categoriesCommand, { PGPASSWORD: DB_CONFIG.password })
    ]);

    colorLog('green', '✅ Analytics Report Generated');
    colorLog('bright', '\n📈 RENCAM PLATFORM ANALYTICS');
    console.log('================================');
    
    // Parse and display summary
    const summary = summaryResult.stdout.trim().split('|').map(s => s.trim());
    console.log(`👥 Total Users: ${summary[0]}`);
    console.log(`📷 Total Equipment: ${summary[1]}`);
    console.log(`📅 Total Bookings: ${summary[2]}`);
    console.log(`💰 Total Revenue: ₹${parseFloat(summary[3]).toLocaleString()}`);

    // Parse and display recent activity
    const activity = activityResult.stdout.trim().split('|').map(s => s.trim());
    console.log('\n📊 Last 7 Days:');
    console.log(`   Bookings: ${activity[0]}`);
    console.log(`   Revenue: ₹${parseFloat(activity[1]).toLocaleString()}`);

    // Display top categories
    const categories = categoriesResult.stdout.trim().split('\n').filter(line => line.trim());
    console.log('\n🏆 Top Equipment Categories:');
    categories.forEach((line, index) => {
      const [name, bookings] = line.split('|').map(s => s.trim());
      console.log(`   ${index + 1}. ${name}: ${bookings} bookings`);
    });

  } catch (error) {
    colorLog('red', '❌ Analytics generation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Check database health
async function checkHealth() {
  colorLog('blue', '🔍 Checking database health...');
  
  const queries = {
    connection: 'SELECT 1;',
    size: 'SELECT pg_size_pretty(pg_database_size(current_database())) as size;',
    connections: 'SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = \'active\';',
    tables: `SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';`
  };

  try {
    // Test basic connection
    const connected = await checkDatabaseConnection();
    
    if (!connected) {
      colorLog('red', '❌ Cannot connect to database');
      colorLog('yellow', 'Check your database configuration and ensure PostgreSQL is running');
      process.exit(1);
    }

    colorLog('green', '✅ Database connection successful');

    // Get detailed health info
    const sizeCommand = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -c "${queries.size}"`;
    const connectionsCommand = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -c "${queries.connections}"`;
    const tablesCommand = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -c "${queries.tables}"`;

    const [sizeResult, connectionsResult, tablesResult] = await Promise.all([
      execCommand(sizeCommand, { PGPASSWORD: DB_CONFIG.password }),
      execCommand(connectionsCommand, { PGPASSWORD: DB_CONFIG.password }),
      execCommand(tablesCommand, { PGPASSWORD: DB_CONFIG.password })
    ]);

    console.log('\n💾 Database Health Status:');
    console.log(`   Database Size: ${sizeResult.stdout.trim()}`);
    console.log(`   Active Connections: ${connectionsResult.stdout.trim()}`);
    console.log(`   Tables: ${tablesResult.stdout.trim()}`);
    console.log(`   Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    
    colorLog('green', '\n✅ Database is healthy and operational!');

  } catch (error) {
    colorLog('red', '❌ Health check failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Clean up old data
async function cleanupOldData() {
  colorLog('blue', '🧹 Cleaning up old data...');
  
  const queries = [
    "DELETE FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '90 days' AND is_read = true;",
    "DELETE FROM search_analytics WHERE created_at < CURRENT_DATE - INTERVAL '180 days';",
    "UPDATE equipment SET views_count = 0 WHERE updated_at < CURRENT_DATE - INTERVAL '365 days';"
  ];

  try {
    for (const query of queries) {
      const command = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -c "${query}"`;
      await execCommand(command, { PGPASSWORD: DB_CONFIG.password });
    }
    
    colorLog('green', '✅ Database cleanup completed');
    console.log('   • Removed old read notifications (90+ days)');
    console.log('   • Cleaned up old search analytics (180+ days)');
    console.log('   • Reset view counts for inactive equipment');
    
  } catch (error) {
    colorLog('red', '❌ Cleanup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Main CLI handler
async function main() {
  const command = process.argv[2];
  const argument = process.argv[3];

  console.log(`${colors.cyan}${colors.bright}🎬 Rencam Database Manager${colors.reset}\n`);

  switch (command) {
    case 'setup':
      await setupDatabase();
      break;
      
    case 'seed':
      await seedDatabase();
      break;
      
    case 'backup':
      await backupDatabase();
      break;
      
    case 'restore':
      await restoreDatabase(argument);
      break;
      
    case 'analytics':
      await generateAnalytics();
      break;
      
    case 'health':
      await checkHealth();
      break;
      
    case 'cleanup':
      await cleanupOldData();
      break;
      
    default:
      colorLog('yellow', 'Usage: node scripts/db-manager.js <command>');
      console.log('\nAvailable commands:');
      console.log('  setup          - Initialize database schema');
      console.log('  seed           - Insert sample data');
      console.log('  backup         - Create database backup');
      console.log('  restore <file> - Restore from backup');
      console.log('  analytics      - Generate analytics report');
      console.log('  health         - Check database health');
      console.log('  cleanup        - Clean up old data');
      break;
  }
}

// Run the CLI
main().catch(error => {
  colorLog('red', '❌ Unexpected error:');
  console.error(error);
  process.exit(1);
});
