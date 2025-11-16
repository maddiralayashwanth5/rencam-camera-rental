// Database connection management with pooling and caching
// Uses mock implementation in browser environment for development

import { dbConfig, cacheConfig, performanceConfig } from './config';
import { mockDb } from './mock';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Connection pool for PostgreSQL (or mock)
class DatabaseConnection {
  private pool: any = null;
  private redis: any = null;
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private metricsCollector: { slowQueries: any[]; totalQueries: number; avgResponseTime: number } = {
    slowQueries: [],
    totalQueries: 0,
    avgResponseTime: 0
  };

  constructor() {
    this.pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
      max: dbConfig.maxConnections,
      idleTimeoutMillis: dbConfig.idleTimeout,
      connectionTimeoutMillis: dbConfig.connectionTimeout,
      // Connection pool optimization
      min: 2, // Minimum connections to keep open
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    });

    // Initialize Redis for caching if available
    this.initializeCache();
    
    // Set up connection monitoring
    this.setupMonitoring();
  }

  private async initializeCache() {
    try {
      this.redis = new Redis({
        host: cacheConfig.host,
        port: cacheConfig.port,
        password: cacheConfig.password,
        db: cacheConfig.db,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: true,
        family: 4, // IPv4
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      await this.redis.ping();
      console.log('✅ Redis cache connected successfully');
    } catch (error) {
      console.warn('⚠️  Redis cache unavailable, falling back to memory cache:', error);
      this.redis = null;
    }
  }

  private setupMonitoring() {
    this.pool.on('connect', (client) => {
      console.log('📊 New database connection established');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });

    this.pool.on('remove', () => {
      console.log('📊 Database connection removed from pool');
    });

    // Clean up old cache entries periodically
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Every 5 minutes
  }

  // Execute query with caching and performance monitoring
  async query<T = any>(
    text: string, 
    params?: any[], 
    options: { 
      cache?: boolean; 
      cacheTTL?: number; 
      cacheKey?: string;
      timeout?: number;
    } = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const cacheKey = options.cacheKey || this.generateCacheKey(text, params);
    
    // Try cache first for SELECT queries
    if (options.cache !== false && text.trim().toLowerCase().startsWith('select')) {
      const cachedResult = await this.getFromCache<QueryResult<T>>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    let client: PoolClient | undefined;
    
    try {
      // Get connection from pool with timeout
      client = await this.pool.connect();
      
      // Set query timeout if specified
      if (options.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`);
      }

      const result = await client.query<T>(text, params);
      const executionTime = Date.now() - startTime;

      // Cache SELECT query results
      if (options.cache !== false && text.trim().toLowerCase().startsWith('select')) {
        await this.setCache(cacheKey, result, options.cacheTTL || cacheConfig.ttl);
      }

      // Collect metrics
      this.collectMetrics(text, executionTime, params);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Query execution failed:', {
        query: text,
        params,
        error: error.message,
        executionTime
      });
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Transaction wrapper
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Prepared statement for better performance on repeated queries
  async preparedQuery<T = any>(
    name: string,
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    
    try {
      // Prepare statement if not exists
      await client.query({
        name,
        text
      });
      
      // Execute prepared statement
      return await client.query({
        name,
        values: params
      });
    } finally {
      client.release();
    }
  }

  // Bulk insert with better performance
  async bulkInsert(
    tableName: string,
    columns: string[],
    data: any[][],
    onConflict?: string
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Use COPY for large datasets (>1000 rows)
      if (data.length > 1000) {
        const copyText = `COPY ${tableName} (${columns.join(', ')}) FROM STDIN WITH CSV`;
        const stream = client.query(require('pg-copy-streams').from(copyText));
        
        for (const row of data) {
          stream.write(row.join(',') + '\n');
        }
        stream.end();
      } else {
        // Use batch INSERT for smaller datasets
        const placeholders = data.map((_, i) => 
          `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
        ).join(', ');
        
        const query = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES ${placeholders}
          ${onConflict ? `ON CONFLICT ${onConflict}` : ''}
        `;
        
        const flatValues = data.flat();
        await client.query(query, flatValues);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cache management methods
  private generateCacheKey(query: string, params?: any[]): string {
    const normalized = query.replace(/\s+/g, ' ').trim();
    const paramsStr = params ? JSON.stringify(params) : '';
    return `query:${Buffer.from(normalized + paramsStr).toString('base64')}`;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      } else {
        const cached = this.queryCache.get(key);
        if (cached && Date.now() - cached.timestamp < cacheConfig.ttl * 1000) {
          return cached.data;
        }
        return null;
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  private async setCache<T>(key: string, data: T, ttl: number = cacheConfig.ttl): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
      } else {
        // Memory cache with size limit
        if (this.queryCache.size >= performanceConfig.cacheSize) {
          const oldestKey = this.queryCache.keys().next().value;
          this.queryCache.delete(oldestKey);
        }
        this.queryCache.set(key, { data, timestamp: Date.now() });
      }
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  // Cache invalidation patterns
  async invalidateCache(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // For memory cache, remove matching keys
        for (const key of this.queryCache.keys()) {
          if (key.includes(pattern)) {
            this.queryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }

  private cleanupCache(): void {
    if (!this.redis) {
      const now = Date.now();
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp > cacheConfig.ttl * 1000) {
          this.queryCache.delete(key);
        }
      }
    }
  }

  // Performance monitoring
  private collectMetrics(query: string, executionTime: number, params?: any[]): void {
    if (!performanceConfig.enableMetrics) return;

    this.metricsCollector.totalQueries++;
    
    // Update average response time
    this.metricsCollector.avgResponseTime = 
      (this.metricsCollector.avgResponseTime * (this.metricsCollector.totalQueries - 1) + executionTime) / 
      this.metricsCollector.totalQueries;

    // Log slow queries
    if (executionTime > performanceConfig.slowQueryThreshold) {
      const slowQuery = {
        query: query.substring(0, 200), // Truncate long queries
        executionTime,
        params: params ? JSON.stringify(params).substring(0, 100) : undefined,
        timestamp: new Date().toISOString()
      };
      
      this.metricsCollector.slowQueries.push(slowQuery);
      
      // Keep only last 100 slow queries
      if (this.metricsCollector.slowQueries.length > 100) {
        this.metricsCollector.slowQueries.shift();
      }

      if (performanceConfig.enableQueryLogging) {
        console.warn('🐌 Slow query detected:', slowQuery);
      }
    }
  }

  // Health check
  async healthCheck(): Promise<{ database: boolean; cache: boolean; metrics: any }> {
    try {
      // Check database connection
      const dbResult = await this.query('SELECT 1 as healthy');
      const databaseHealthy = dbResult.rows[0]?.healthy === 1;

      // Check cache connection
      let cacheHealthy = false;
      if (this.redis) {
        try {
          await this.redis.ping();
          cacheHealthy = true;
        } catch {
          cacheHealthy = false;
        }
      }

      return {
        database: databaseHealthy,
        cache: cacheHealthy,
        metrics: performanceConfig.enableMetrics ? {
          totalQueries: this.metricsCollector.totalQueries,
          avgResponseTime: Math.round(this.metricsCollector.avgResponseTime),
          slowQueriesCount: this.metricsCollector.slowQueries.length,
          cacheSize: this.redis ? await this.redis.dbsize() : this.queryCache.size
        } : null
      };
    } catch (error) {
      return {
        database: false,
        cache: false,
        metrics: null
      };
    }
  }

  // Graceful shutdown
  async close(): Promise<void> {
    try {
      await this.pool.end();
      if (this.redis) {
        await this.redis.quit();
      }
      console.log('✅ Database connections closed gracefully');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }

  // Get connection pool stats
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

// Singleton instance
export const db = new DatabaseConnection();

// Export types for TypeScript
export type { QueryResult, PoolClient };
export { DatabaseConnection };
