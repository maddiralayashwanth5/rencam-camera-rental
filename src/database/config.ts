// Database configuration for Rencam Platform
// Supports multiple database providers with connection pooling

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
}

// Environment-based configuration
export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rencam_db',
  username: process.env.DB_USER || 'rencam_user',
  password: process.env.DB_PASSWORD || 'rencam_password',
  ssl: process.env.NODE_ENV === 'production',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
};

// Redis configuration for caching
export const cacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour default
};

// Performance optimization settings
export const performanceConfig = {
  enableQueryCache: process.env.ENABLE_QUERY_CACHE !== 'false',
  cacheSize: parseInt(process.env.CACHE_SIZE || '100'), // Number of queries to cache
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'), // ms
  enableQueryLogging: process.env.NODE_ENV === 'development',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
};
