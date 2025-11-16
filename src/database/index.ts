// Main database module exports
export * from './config';
export * from './connection';
export * from './models';
export * from './repositories';
export * from './services/database.service';

// Quick access imports
export { db } from './connection';
export { databaseService } from './services/database.service';
export { repositories } from './repositories';

// Database initialization and setup
import { db } from './connection';
import { databaseService } from './services/database.service';

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔌 Initializing database connection...');
    
    // Test connection
    const health = await db.healthCheck();
    if (!health.database) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connected successfully');
    console.log(`📊 Cache: ${health.cache ? 'Connected' : 'Disabled'}`);
    
    if (health.metrics) {
      console.log(`📈 Metrics: ${JSON.stringify(health.metrics)}`);
    }

    // Refresh materialized views on startup
    await databaseService.refreshMaterializedViews();
    
    console.log('🚀 Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function shutdownDatabase(): Promise<void> {
  try {
    console.log('🔄 Shutting down database connections...');
    await databaseService.shutdown();
    console.log('✅ Database shutdown complete');
  } catch (error) {
    console.error('❌ Database shutdown failed:', error);
    throw error;
  }
}

// Auto-initialization for development
if (process.env.NODE_ENV === 'development') {
  // Initialize database connection when module is loaded
  initializeDatabase().catch(error => {
    console.error('Auto-initialization failed:', error);
  });
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n📡 Received SIGINT, shutting down gracefully...');
  await shutdownDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n📡 Received SIGTERM, shutting down gracefully...');
  await shutdownDatabase();
  process.exit(0);
});

// Export database utilities
export const dbUtils = {
  initialize: initializeDatabase,
  shutdown: shutdownDatabase,
  healthCheck: () => db.healthCheck(),
  clearCache: (pattern?: string) => databaseService.clearCache(pattern),
  refreshViews: () => databaseService.refreshMaterializedViews(),
  cleanupOldData: () => databaseService.cleanupOldData(),
  optimize: () => databaseService.optimizeDatabase(),
  getMetrics: () => databaseService.getSystemMetrics()
};
