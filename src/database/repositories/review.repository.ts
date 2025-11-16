// Review repository for managing ratings and feedback
import { BaseRepository } from './base.repository';
import { Review, QueryOptions, PaginatedResult } from '../models';
import { db } from '../connection';

export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super('reviews', `
      id, booking_id, reviewer_id, reviewee_id, equipment_id, 
      rating, title, comment, review_type, is_public, 
      created_at, updated_at
    `);
    this.defaultCacheTTL = 900; // 15 minutes cache for reviews
  }

  // Create review with validation
  async createReview(reviewData: Omit<Review, keyof import('../models').BaseEntity>): Promise<Review> {
    this.validateRequiredFields(reviewData, [
      'booking_id', 'reviewer_id', 'reviewee_id', 'rating', 'review_type'
    ]);

    // Validate rating range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if review already exists
    const existingQuery = `
      SELECT id FROM reviews 
      WHERE booking_id = $1 AND reviewer_id = $2 AND review_type = $3
    `;
    
    const existing = await db.query(
      existingQuery, 
      [reviewData.booking_id, reviewData.reviewer_id, reviewData.review_type]
    );

    if (existing.rows.length > 0) {
      throw new Error('Review already exists for this booking');
    }

    // Validate booking and user relationships
    await this.validateReviewRelationships(reviewData);

    const sanitizedData = this.sanitizeInput(reviewData);
    return await this.create(sanitizedData);
  }

  // Validate review relationships
  private async validateReviewRelationships(reviewData: Partial<Review>): Promise<void> {
    const validationQuery = `
      SELECT 
        b.renter_id,
        b.lender_id,
        b.equipment_id,
        b.status,
        e.owner_id
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1
    `;

    const result = await db.query(validationQuery, [reviewData.booking_id]);
    const booking = result.rows[0];

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // Validate reviewer is part of the booking
    if (![booking.renter_id, booking.lender_id].includes(reviewData.reviewer_id)) {
      throw new Error('Only booking participants can leave reviews');
    }

    // Validate review type and reviewee
    if (reviewData.review_type === 'renter_to_lender') {
      if (reviewData.reviewer_id !== booking.renter_id || reviewData.reviewee_id !== booking.lender_id) {
        throw new Error('Invalid reviewer/reviewee for renter_to_lender review');
      }
    } else if (reviewData.review_type === 'lender_to_renter') {
      if (reviewData.reviewer_id !== booking.lender_id || reviewData.reviewee_id !== booking.renter_id) {
        throw new Error('Invalid reviewer/reviewee for lender_to_renter review');
      }
    } else if (reviewData.review_type === 'equipment') {
      if (reviewData.reviewer_id !== booking.renter_id || reviewData.equipment_id !== booking.equipment_id) {
        throw new Error('Only renter can review equipment');
      }
    }
  }

  // Get reviews for a user
  async getUserReviews(
    userId: string, 
    type: 'received' | 'given' = 'received',
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Review & { reviewer_name: string; booking_reference: string }>> {
    const userField = type === 'received' ? 'reviewee_id' : 'reviewer_id';
    
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      filters = {}
    } = options;

    let whereClause = `WHERE r.${userField} = $1 AND r.is_public = true`;
    let params: any[] = [userId];
    let paramIndex = 2;

    // Add filters
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`r.${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
      
      if (conditions.length > 0) {
        whereClause += ' AND ' + conditions.join(' AND ');
      }
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      ${whereClause}
    `;

    const countResult = await db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Data query
    const dataQuery = `
      SELECT 
        r.*,
        u.name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        b.booking_reference,
        e.name as equipment_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN equipment e ON r.equipment_id = e.id
      ${whereClause}
      ORDER BY r.${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query<Review & { 
      reviewer_name: string; 
      booking_reference: string;
      equipment_name?: string;
    }>(
      dataQuery, 
      dataParams,
      {
        cache: true,
        cacheKey: `reviews:user:${userId}:${type}:${JSON.stringify({ filters, limit, offset, sortBy, sortOrder })}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

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

  // Get equipment reviews
  async getEquipmentReviews(equipmentId: string, options: QueryOptions = {}): Promise<PaginatedResult<Review & { reviewer_name: string }>> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      WHERE r.equipment_id = $1 AND r.review_type = 'equipment' AND r.is_public = true
    `;

    const countResult = await db.query<{ total: string }>(countQuery, [equipmentId]);
    const total = parseInt(countResult.rows[0].total);

    // Data query
    const dataQuery = `
      SELECT 
        r.*,
        u.name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        b.booking_reference
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.equipment_id = $1 AND r.review_type = 'equipment' AND r.is_public = true
      ORDER BY r.${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;

    const dataResult = await db.query<Review & { 
      reviewer_name: string; 
      reviewer_avatar: string;
      booking_reference: string;
    }>(
      dataQuery, 
      [equipmentId, limit, offset],
      {
        cache: true,
        cacheKey: `reviews:equipment:${equipmentId}:${limit}:${offset}:${sortBy}:${sortOrder}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

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

  // Get review statistics for user
  async getUserReviewStats(userId: string): Promise<any> {
    const query = `
      SELECT 
        -- Reviews received
        COUNT(*) FILTER (WHERE reviewee_id = $1) as reviews_received,
        ROUND(AVG(rating) FILTER (WHERE reviewee_id = $1), 2) as avg_rating_received,
        
        -- Reviews given
        COUNT(*) FILTER (WHERE reviewer_id = $1) as reviews_given,
        ROUND(AVG(rating) FILTER (WHERE reviewer_id = $1), 2) as avg_rating_given,
        
        -- Rating distribution (received)
        COUNT(*) FILTER (WHERE reviewee_id = $1 AND rating = 5) as five_star,
        COUNT(*) FILTER (WHERE reviewee_id = $1 AND rating = 4) as four_star,
        COUNT(*) FILTER (WHERE reviewee_id = $1 AND rating = 3) as three_star,
        COUNT(*) FILTER (WHERE reviewee_id = $1 AND rating = 2) as two_star,
        COUNT(*) FILTER (WHERE reviewee_id = $1 AND rating = 1) as one_star
      FROM reviews
      WHERE (reviewee_id = $1 OR reviewer_id = $1) AND is_public = true
    `;

    const result = await this.executeQuery(
      query, 
      [userId],
      {
        cache: true,
        cacheKey: `reviews:stats:${userId}`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );

    return result[0] || {};
  }

  // Get pending reviews for user
  async getPendingReviews(userId: string): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        b.id as booking_id,
        b.booking_reference,
        b.renter_id,
        b.lender_id,
        b.equipment_id,
        b.completed_at,
        e.name as equipment_name,
        e.images as equipment_images,
        CASE 
          WHEN b.renter_id = $1 THEN u_lender.name
          ELSE u_renter.name
        END as other_party_name,
        CASE 
          WHEN b.renter_id = $1 THEN 'lender'
          ELSE 'renter'
        END as user_role
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      JOIN users u_renter ON b.renter_id = u_renter.id
      JOIN users u_lender ON b.lender_id = u_lender.id
      WHERE b.status = 'completed'
      AND (b.renter_id = $1 OR b.lender_id = $1)
      AND b.completed_at >= CURRENT_DATE - INTERVAL '30 days'
      AND NOT EXISTS (
        SELECT 1 FROM reviews r 
        WHERE r.booking_id = b.id 
        AND r.reviewer_id = $1
      )
      ORDER BY b.completed_at DESC
      LIMIT 10
    `;

    return await this.executeQuery(
      query, 
      [userId],
      {
        cache: true,
        cacheKey: `reviews:pending:${userId}`,
        cacheTTL: 300 // 5 minutes cache
      }
    );
  }

  // Get review analytics for admin
  async getReviewAnalytics(days: number = 30): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        
        -- Review type distribution
        COUNT(*) FILTER (WHERE review_type = 'renter_to_lender') as renter_to_lender_reviews,
        COUNT(*) FILTER (WHERE review_type = 'lender_to_renter') as lender_to_renter_reviews,
        COUNT(*) FILTER (WHERE review_type = 'equipment') as equipment_reviews,
        
        -- Rating distribution
        COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
        COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
        COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
        COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
        COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
        
        -- Response rate
        ROUND(
          (COUNT(*)::decimal / 
           (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND completed_at >= CURRENT_DATE - INTERVAL '${days} days') * 2) * 100,
          2
        ) as review_response_rate
      FROM reviews
      WHERE is_public = true
    `;

    const result = await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `reviews:analytics:${days}days`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );

    return result[0] || {};
  }

  // Get top rated users
  async getTopRatedUsers(limit: number = 10, role?: string): Promise<any[]> {
    let roleFilter = '';
    let params: any[] = [];
    
    if (role) {
      roleFilter = 'AND u.role = $2';
      params = [limit, role];
    } else {
      params = [limit];
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        u.avatar_url,
        u.role,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 2) as avg_rating
      FROM users u
      JOIN reviews r ON u.id = r.reviewee_id
      WHERE r.is_public = true ${roleFilter}
      GROUP BY u.id, u.name, u.avatar_url, u.role
      HAVING COUNT(r.id) >= 5
      ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
      LIMIT $1
    `;

    return await this.executeQuery(
      query, 
      params,
      {
        cache: true,
        cacheKey: `reviews:top_rated:${role || 'all'}:${limit}`,
        cacheTTL: 3600 // 1 hour cache
      }
    );
  }

  // Update review visibility
  async updateVisibility(reviewId: string, isPublic: boolean): Promise<Review> {
    return await this.update(reviewId, { is_public: isPublic });
  }

  // Flag review for moderation
  async flagReview(reviewId: string, reason: string, flaggedBy: string): Promise<void> {
    // This would typically create a moderation record
    // For now, we'll just update the review to non-public
    await this.update(reviewId, { is_public: false });
    
    // In a real implementation, you'd insert into a moderation_flags table
    console.log(`Review ${reviewId} flagged by ${flaggedBy} for: ${reason}`);
  }

  // Get reviews trend over time
  async getReviewsTrend(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as review_count,
        ROUND(AVG(rating), 2) as avg_rating
      FROM reviews
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND is_public = true
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `reviews:trend:${days}days`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }
}

export const reviewRepository = new ReviewRepository();
