// Equipment repository with advanced search and filtering capabilities
import { BaseRepository } from './base.repository';
import { 
  Equipment, 
  EquipmentWithDetails, 
  CreateEquipmentRequest, 
  EquipmentSearchQuery,
  QueryOptions, 
  PaginatedResult,
  SearchResult 
} from '../models';
import { db } from '../connection';

export class EquipmentRepository extends BaseRepository<Equipment> {
  constructor() {
    super('equipment', `
      id, owner_id, category_id, name, description, brand, model, year,
      condition, daily_rate, security_deposit, status, location, 
      pickup_options, images, specifications, accessories, 
      availability_calendar, min_rental_days, max_rental_days, 
      insurance_required, rating, total_bookings, total_revenue, 
      views_count, created_at, updated_at
    `);
    this.defaultCacheTTL = 600; // 10 minutes cache for equipment
  }

  // Create equipment with validation
  async createEquipment(ownerId: string, equipmentData: CreateEquipmentRequest): Promise<Equipment> {
    this.validateRequiredFields(equipmentData, [
      'name', 'category_id', 'condition', 'daily_rate', 'location'
    ]);

    const sanitizedData = this.sanitizeInput({
      ...equipmentData,
      owner_id: ownerId,
      status: 'active',
      rating: 0.0,
      total_bookings: 0,
      total_revenue: 0,
      views_count: 0
    });

    return await this.create(sanitizedData as Omit<Equipment, keyof import('../models').BaseEntity>);
  }

  // Get equipment with owner and category details
  async findWithDetails(equipmentId: string, userId?: string): Promise<EquipmentWithDetails | null> {
    const query = `
      SELECT 
        e.*,
        u.name as owner_name,
        u.rating as owner_rating,
        u.avatar_url as owner_avatar,
        c.name as category_name,
        c.icon as category_icon,
        (SELECT COUNT(*) FROM reviews WHERE equipment_id = e.id AND review_type = 'equipment') as review_count,
        ${userId ? `(SELECT COUNT(*) > 0 FROM user_favorites WHERE user_id = $2 AND equipment_id = e.id) as is_favorited,` : 'false as is_favorited,'}
        CASE 
          WHEN e.status != 'active' THEN 'unavailable'
          WHEN EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.equipment_id = e.id 
            AND b.status IN ('confirmed', 'active')
            AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
          ) THEN 'unavailable'
          ELSE 'available'
        END as availability_status
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = $1
    `;

    const params = userId ? [equipmentId, userId] : [equipmentId];
    const result = await db.query<EquipmentWithDetails>(
      query, 
      params,
      {
        cache: true,
        cacheKey: `equipment:details:${equipmentId}:${userId || 'anonymous'}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return result.rows[0] || null;
  }

  // Advanced equipment search with filters and sorting
  async searchEquipment(searchParams: EquipmentSearchQuery): Promise<SearchResult<EquipmentWithDetails>> {
    const {
      query = '',
      category_id,
      location,
      price_min,
      price_max,
      start_date,
      end_date,
      rating_min,
      condition,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = searchParams;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // Base conditions
    whereConditions.push('e.status = $' + paramIndex++);
    params.push('active');

    whereConditions.push('u.status = $' + paramIndex++);
    params.push('active');

    // Text search
    if (query.trim()) {
      whereConditions.push(`(
        e.name ILIKE $${paramIndex} OR 
        e.description ILIKE $${paramIndex} OR 
        e.brand ILIKE $${paramIndex} OR 
        e.model ILIKE $${paramIndex} OR
        c.name ILIKE $${paramIndex}
      )`);
      params.push(`%${query}%`);
      paramIndex++;
    }

    // Category filter
    if (category_id) {
      whereConditions.push('e.category_id = $' + paramIndex++);
      params.push(category_id);
    }

    // Price range filter
    if (price_min !== undefined) {
      whereConditions.push('e.daily_rate >= $' + paramIndex++);
      params.push(price_min);
    }
    if (price_max !== undefined) {
      whereConditions.push('e.daily_rate <= $' + paramIndex++);
      params.push(price_max);
    }

    // Location filter (city/state/country)
    if (location) {
      whereConditions.push(`(
        e.location->>'city' ILIKE $${paramIndex} OR
        e.location->>'state' ILIKE $${paramIndex} OR
        e.location->>'country' ILIKE $${paramIndex}
      )`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Rating filter
    if (rating_min !== undefined) {
      whereConditions.push('e.rating >= $' + paramIndex++);
      params.push(rating_min);
    }

    // Condition filter
    if (condition && condition.length > 0) {
      const conditionPlaceholders = condition.map(() => '$' + paramIndex++).join(', ');
      whereConditions.push(`e.condition IN (${conditionPlaceholders})`);
      params.push(...condition);
    }

    // Availability filter for date range
    if (start_date && end_date) {
      whereConditions.push(`NOT EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.equipment_id = e.id 
        AND b.status IN ('confirmed', 'active')
        AND NOT (b.end_date < $${paramIndex} OR b.start_date > $${paramIndex + 1})
      )`);
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Build sort clause
    let orderClause = '';
    switch (sort_by) {
      case 'price':
        orderClause = `ORDER BY e.daily_rate ${sort_order}`;
        break;
      case 'rating':
        orderClause = `ORDER BY e.rating ${sort_order}, e.total_bookings DESC`;
        break;
      case 'popularity':
        orderClause = `ORDER BY e.total_bookings ${sort_order}, e.rating DESC`;
        break;
      case 'newest':
        orderClause = `ORDER BY e.created_at ${sort_order}`;
        break;
      case 'distance':
        // This would require user's location coordinates
        orderClause = `ORDER BY e.created_at DESC`;
        break;
      default:
        orderClause = `ORDER BY e.${sort_by} ${sort_order}`;
    }

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT e.id) as total
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      ${whereClause}
    `;

    const countResult = await db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main search query
    const limit = 20;
    const offset = 0;
    
    const searchQuery = `
      SELECT 
        e.*,
        u.name as owner_name,
        u.rating as owner_rating,
        u.avatar_url as owner_avatar,
        c.name as category_name,
        c.icon as category_icon,
        (SELECT COUNT(*) FROM reviews WHERE equipment_id = e.id AND review_type = 'equipment') as review_count,
        false as is_favorited,
        CASE 
          WHEN e.status != 'active' THEN 'unavailable'
          WHEN EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.equipment_id = e.id 
            AND b.status IN ('confirmed', 'active')
            AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
          ) THEN 'unavailable'
          ELSE 'available'
        END as availability_status
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const searchParams_final = [...params, limit, offset];
    const searchResult = await db.query<EquipmentWithDetails>(
      searchQuery, 
      searchParams_final,
      {
        cache: true,
        cacheKey: `equipment:search:${JSON.stringify(searchParams)}:${limit}:${offset}`,
        cacheTTL: 300 // 5 minutes cache for search results
      }
    );

    // Get facets for filtering
    const facets = await this.getSearchFacets(whereConditions, params);

    return {
      data: searchResult.rows,
      pagination: {
        page: 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: limit < total,
        hasPrev: false
      },
      facets,
      searchTime: Date.now()
    };
  }

  // Get search facets for filtering UI
  private async getSearchFacets(whereConditions: string[], params: any[]): Promise<Record<string, { value: string; count: number }[]>> {
    const baseWhere = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Category facets
    const categoryQuery = `
      SELECT c.name as value, COUNT(e.id) as count
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      ${baseWhere}
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 10
    `;

    // Condition facets
    const conditionQuery = `
      SELECT e.condition as value, COUNT(*) as count
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      ${baseWhere}
      GROUP BY e.condition
      ORDER BY count DESC
    `;

    // Brand facets
    const brandQuery = `
      SELECT e.brand as value, COUNT(*) as count
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      ${baseWhere}
      AND e.brand IS NOT NULL AND e.brand != ''
      GROUP BY e.brand
      ORDER BY count DESC
      LIMIT 10
    `;

    const [categoryFacets, conditionFacets, brandFacets] = await Promise.all([
      this.executeQuery(categoryQuery, params),
      this.executeQuery(conditionQuery, params),
      this.executeQuery(brandQuery, params)
    ]);

    return {
      categories: categoryFacets,
      conditions: conditionFacets,
      brands: brandFacets
    };
  }

  // Get equipment by owner
  async findByOwner(ownerId: string, options: QueryOptions = {}): Promise<PaginatedResult<Equipment>> {
    return await this.findMany({
      ...options,
      filters: { ...options.filters, owner_id: ownerId }
    });
  }

  // Get popular equipment
  async getPopularEquipment(limit: number = 10): Promise<EquipmentWithDetails[]> {
    const query = `
      SELECT 
        e.*,
        u.name as owner_name,
        u.rating as owner_rating,
        c.name as category_name,
        (SELECT COUNT(*) FROM reviews WHERE equipment_id = e.id AND review_type = 'equipment') as review_count,
        false as is_favorited,
        'available' as availability_status
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.status = 'active' AND u.status = 'active'
      ORDER BY (e.total_bookings * 0.7 + e.rating * 0.3) DESC, e.views_count DESC
      LIMIT $1
    `;

    return await this.executeQuery(
      query, 
      [limit],
      {
        cache: true,
        cacheKey: `equipment:popular:${limit}`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Get recently added equipment
  async getRecentEquipment(limit: number = 10): Promise<EquipmentWithDetails[]> {
    const query = `
      SELECT 
        e.*,
        u.name as owner_name,
        u.rating as owner_rating,
        c.name as category_name,
        (SELECT COUNT(*) FROM reviews WHERE equipment_id = e.id AND review_type = 'equipment') as review_count,
        false as is_favorited,
        'available' as availability_status
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.status = 'active' AND u.status = 'active'
      ORDER BY e.created_at DESC
      LIMIT $1
    `;

    return await this.executeQuery(
      query, 
      [limit],
      {
        cache: true,
        cacheKey: `equipment:recent:${limit}`,
        cacheTTL: 600 // 10 minutes cache
      }
    );
  }

  // Update equipment status
  async updateStatus(equipmentId: string, status: Equipment['status']): Promise<Equipment> {
    return await this.update(equipmentId, { status });
  }

  // Increment view count
  async incrementViewCount(equipmentId: string): Promise<void> {
    const query = `
      UPDATE equipment 
      SET views_count = views_count + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    
    await db.query(query, [equipmentId], { cache: false });
    await this.invalidateEntityCache(equipmentId);
  }

  // Check equipment availability for date range
  async checkAvailability(equipmentId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as conflicts
      FROM bookings 
      WHERE equipment_id = $1 
      AND status IN ('confirmed', 'active')
      AND NOT (end_date < $2 OR start_date > $3)
    `;

    const result = await db.query<{ conflicts: string }>(
      query, 
      [equipmentId, startDate, endDate],
      {
        cache: true,
        cacheKey: `equipment:availability:${equipmentId}:${startDate.toISOString()}:${endDate.toISOString()}`,
        cacheTTL: 300 // 5 minutes cache
      }
    );

    return parseInt(result.rows[0].conflicts) === 0;
  }

  // Get equipment analytics
  async getEquipmentAnalytics(equipmentId: string): Promise<any> {
    const query = `
      SELECT 
        e.id,
        e.name,
        e.daily_rate,
        e.rating,
        e.total_bookings,
        e.total_revenue,
        e.views_count,
        
        -- Recent performance (last 30 days)
        COUNT(b.id) FILTER (WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as recent_revenue,
        
        -- Average booking value
        COALESCE(AVG(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as avg_booking_value,
        
        -- Booking conversion rate (views to bookings)
        CASE WHEN e.views_count > 0 THEN 
          ROUND((e.total_bookings::decimal / e.views_count) * 100, 2)
        ELSE 0 END as conversion_rate
        
      FROM equipment e
      LEFT JOIN bookings b ON e.id = b.equipment_id
      WHERE e.id = $1
      GROUP BY e.id
    `;

    const result = await this.executeQuery(
      query, 
      [equipmentId],
      {
        cache: true,
        cacheKey: `equipment:analytics:${equipmentId}`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );

    return result[0] || {};
  }

  // Get similar equipment based on category and price range
  async getSimilarEquipment(equipmentId: string, limit: number = 5): Promise<EquipmentWithDetails[]> {
    const query = `
      WITH current_equipment AS (
        SELECT category_id, daily_rate FROM equipment WHERE id = $1
      )
      SELECT 
        e.*,
        u.name as owner_name,
        u.rating as owner_rating,
        c.name as category_name,
        (SELECT COUNT(*) FROM reviews WHERE equipment_id = e.id AND review_type = 'equipment') as review_count,
        false as is_favorited,
        'available' as availability_status
      FROM equipment e
      JOIN users u ON e.owner_id = u.id
      JOIN categories c ON e.category_id = c.id
      JOIN current_equipment ce ON e.category_id = ce.category_id
      WHERE e.id != $1 
      AND e.status = 'active' 
      AND u.status = 'active'
      AND e.daily_rate BETWEEN (ce.daily_rate * 0.7) AND (ce.daily_rate * 1.3)
      ORDER BY ABS(e.daily_rate - ce.daily_rate), e.rating DESC
      LIMIT $2
    `;

    return await this.executeQuery(
      query, 
      [equipmentId, limit],
      {
        cache: true,
        cacheKey: `equipment:similar:${equipmentId}:${limit}`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Bulk update equipment ratings (called by trigger)
  async updateRatingFromReviews(equipmentId: string): Promise<void> {
    const query = `
      UPDATE equipment 
      SET rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
        FROM reviews 
        WHERE equipment_id = $1 AND review_type = 'equipment'
      )
      WHERE id = $1
    `;

    await db.query(query, [equipmentId], { cache: false });
    await this.invalidateEntityCache(equipmentId);
  }
}

export const equipmentRepository = new EquipmentRepository();
