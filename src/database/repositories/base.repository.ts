// Base repository class with common database operations
import { db } from '../connection';
import { QueryOptions, PaginatedResult, BaseEntity, Repository } from '../models';

export abstract class BaseRepository<T extends BaseEntity> implements Repository<T> {
  protected tableName: string;
  protected selectFields: string;
  protected defaultCacheTTL: number = 300; // 5 minutes

  constructor(tableName: string, selectFields?: string) {
    this.tableName = tableName;
    this.selectFields = selectFields || '*';
  }

  // Create a new entity
  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    const fields = Object.keys(data).join(', ');
    const values = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const params = Object.values(data);

    const query = `
      INSERT INTO ${this.tableName} (${fields})
      VALUES (${values})
      RETURNING *
    `;

    const result = await db.query<T>(query, params, { cache: false });
    
    // Invalidate related caches
    await this.invalidateCache();
    
    return result.rows[0];
  }

  // Find entity by ID
  async findById(id: string, options?: { cache?: boolean }): Promise<T | null> {
    const query = `SELECT ${this.selectFields} FROM ${this.tableName} WHERE id = $1`;
    const cacheKey = `${this.tableName}:id:${id}`;
    
    const result = await db.query<T>(
      query, 
      [id], 
      { 
        cache: options?.cache !== false,
        cacheKey,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return result.rows[0] || null;
  }

  // Find multiple entities with pagination and filtering
  async findMany(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      filters = {},
      cache = true
    } = options;

    let whereClause = '';
    let params: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause from filters
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // IN clause for arrays
            const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
            conditions.push(`${key} IN (${placeholders})`);
            params.push(...value);
          } else if (typeof value === 'object' && value.operator) {
            // Support for custom operators like { operator: '>', value: 100 }
            conditions.push(`${key} ${value.operator} $${paramIndex++}`);
            params.push(value.value);
          } else if (typeof value === 'string' && value.includes('%')) {
            // LIKE operator for pattern matching
            conditions.push(`${key} ILIKE $${paramIndex++}`);
            params.push(value);
          } else {
            // Exact match
            conditions.push(`${key} = $${paramIndex++}`);
            params.push(value);
          }
        }
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM ${this.tableName} 
      ${whereClause}
    `;
    
    const countResult = await db.query<{ total: string }>(
      countQuery, 
      params,
      { 
        cache,
        cacheKey: `${this.tableName}:count:${JSON.stringify(filters)}`,
        cacheTTL: this.defaultCacheTTL
      }
    );
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    // Data query
    const dataQuery = `
      SELECT ${this.selectFields}
      FROM ${this.tableName}
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query<T>(
      dataQuery, 
      dataParams,
      {
        cache,
        cacheKey: `${this.tableName}:list:${JSON.stringify({ filters, limit, offset, sortBy, sortOrder })}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return {
      data: dataResult.rows,
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };
  }

  // Update entity by ID
  async update(id: string, data: Partial<T>): Promise<T> {
    const updateFields = Object.keys(data)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');
    
    const params = [id, ...Object.values(data)];

    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query<T>(query, params, { cache: false });
    
    if (result.rows.length === 0) {
      throw new Error(`Entity with id ${id} not found`);
    }

    // Invalidate caches
    await this.invalidateCache();
    await this.invalidateEntityCache(id);

    return result.rows[0];
  }

  // Delete entity by ID
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query(query, [id], { cache: false });

    // Invalidate caches
    await this.invalidateCache();
    await this.invalidateEntityCache(id);

    return result.rowCount > 0;
  }

  // Count entities with optional filters
  async count(filters: Record<string, any> = {}): Promise<number> {
    let whereClause = '';
    let params: any[] = [];
    let paramIndex = 1;

    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }

    const query = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const result = await db.query<{ total: string }>(
      query, 
      params,
      {
        cache: true,
        cacheKey: `${this.tableName}:count:${JSON.stringify(filters)}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return parseInt(result.rows[0].total);
  }

  // Bulk operations
  async bulkCreate(entities: Omit<T, keyof BaseEntity>[]): Promise<T[]> {
    if (entities.length === 0) return [];

    const fields = Object.keys(entities[0]);
    const values = entities.map((entity, i) => 
      `(${fields.map((_, j) => `$${i * fields.length + j + 1}`).join(', ')})`
    ).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')})
      VALUES ${values}
      RETURNING *
    `;

    const params = entities.flatMap(entity => Object.values(entity));
    const result = await db.query<T>(query, params, { cache: false });

    await this.invalidateCache();
    return result.rows;
  }

  async bulkUpdate(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    if (updates.length === 0) return [];

    const results: T[] = [];
    
    // Use transaction for consistency
    await db.transaction(async (client) => {
      for (const { id, data } of updates) {
        const updateFields = Object.keys(data)
          .map((key, i) => `${key} = $${i + 2}`)
          .join(', ');
        
        const params = [id, ...Object.values(data)];
        const query = `
          UPDATE ${this.tableName}
          SET ${updateFields}
          WHERE id = $1
          RETURNING *
        `;

        const result = await client.query<T>(query, params);
        if (result.rows[0]) {
          results.push(result.rows[0]);
        }
      }
    });

    await this.invalidateCache();
    return results;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const query = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`;
    
    const result = await db.query(query, ids, { cache: false });
    
    await this.invalidateCache();
    return result.rowCount;
  }

  // Search with full-text search support
  async search(
    searchQuery: string, 
    searchFields: string[],
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      limit = 20,
      offset = 0,
      filters = {},
      cache = true
    } = options;

    // Build search condition using full-text search
    const searchCondition = searchFields
      .map(field => `${field} ILIKE $1`)
      .join(' OR ');

    let whereClause = `WHERE (${searchCondition})`;
    let params: any[] = [`%${searchQuery}%`];
    let paramIndex = 2;

    // Add filters
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
      
      if (conditions.length > 0) {
        whereClause += ' AND ' + conditions.join(' AND ');
      }
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const countResult = await db.query<{ total: string }>(countQuery, params, { cache });
    const total = parseInt(countResult.rows[0].total);

    // Data query with ranking
    const dataQuery = `
      SELECT ${this.selectFields}
      FROM ${this.tableName}
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN ${searchFields[0]} ILIKE $1 THEN 1
          ELSE 2
        END,
        created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query<T>(dataQuery, dataParams, { cache });

    return {
      data: dataResult.rows,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: offset > 0
      }
    };
  }

  // Custom query execution
  async executeQuery<R = any>(
    query: string, 
    params: any[] = [],
    options: { cache?: boolean; cacheTTL?: number; cacheKey?: string } = {}
  ): Promise<R[]> {
    const result = await db.query<R>(query, params, options);
    return result.rows;
  }

  // Cache management methods
  protected async invalidateCache(): Promise<void> {
    await db.invalidateCache(`${this.tableName}:*`);
  }

  protected async invalidateEntityCache(id: string): Promise<void> {
    await db.invalidateCache(`${this.tableName}:id:${id}`);
  }

  // Utility methods
  protected buildSelectQuery(
    joins: string[] = [],
    whereConditions: string[] = [],
    params: any[] = []
  ): { query: string; params: any[] } {
    let query = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    
    if (joins.length > 0) {
      query += ' ' + joins.join(' ');
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    return { query, params };
  }

  // Validation helpers
  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  protected sanitizeInput(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
