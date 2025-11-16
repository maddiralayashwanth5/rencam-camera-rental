// Dispute repository for managing booking disputes
import { BaseRepository } from './base.repository';
import { Dispute, QueryOptions, PaginatedResult } from '../models';
import { db } from '../connection';

export class DisputeRepository extends BaseRepository<Dispute> {
  constructor() {
    super('disputes', `
      id, dispute_reference, booking_id, complainant_id, respondent_id, 
      dispute_type, title, description, evidence, amount_disputed, 
      status, resolution, resolved_by, resolved_at, created_at, updated_at
    `);
    this.defaultCacheTTL = 300; // 5 minutes cache for disputes
  }

  // Create dispute with auto-generated reference
  async createDispute(disputeData: Omit<Dispute, keyof import('../models').BaseEntity | 'dispute_reference'>): Promise<Dispute> {
    this.validateRequiredFields(disputeData, [
      'booking_id', 'complainant_id', 'respondent_id', 'dispute_type', 'title', 'description'
    ]);

    // Check if dispute already exists for booking
    const existingQuery = `
      SELECT id FROM disputes 
      WHERE booking_id = $1 AND status NOT IN ('resolved', 'closed')
    `;
    
    const existing = await db.query(existingQuery, [disputeData.booking_id]);
    if (existing.rows.length > 0) {
      throw new Error('Active dispute already exists for this booking');
    }

    const sanitizedData = this.sanitizeInput({
      ...disputeData,
      status: 'open'
    });

    return await this.create(sanitizedData as Omit<Dispute, keyof import('../models').BaseEntity>);
  }

  // Get dispute with full details
  async findWithDetails(disputeId: string): Promise<any> {
    const query = `
      SELECT 
        d.*,
        b.booking_reference,
        b.start_date,
        b.end_date,
        b.total_amount as booking_amount,
        complainant.name as complainant_name,
        complainant.email as complainant_email,
        respondent.name as respondent_name,
        respondent.email as respondent_email,
        e.name as equipment_name,
        e.images as equipment_images,
        resolver.name as resolver_name
      FROM disputes d
      JOIN bookings b ON d.booking_id = b.id
      JOIN equipment e ON b.equipment_id = e.id
      JOIN users complainant ON d.complainant_id = complainant.id
      JOIN users respondent ON d.respondent_id = respondent.id
      LEFT JOIN users resolver ON d.resolved_by = resolver.id
      WHERE d.id = $1
    `;

    const result = await db.query(
      query, 
      [disputeId],
      {
        cache: true,
        cacheKey: `dispute:details:${disputeId}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return result.rows[0] || null;
  }

  // Get user disputes
  async getUserDisputes(
    userId: string, 
    role: 'complainant' | 'respondent' | 'both' = 'both',
    options: QueryOptions = {}
  ): Promise<PaginatedResult<any>> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      filters = {}
    } = options;

    let whereClause = '';
    let params: any[] = [];
    let paramIndex = 1;

    // Role-based filtering
    if (role === 'complainant') {
      whereClause = 'WHERE d.complainant_id = $' + paramIndex++;
      params.push(userId);
    } else if (role === 'respondent') {
      whereClause = 'WHERE d.respondent_id = $' + paramIndex++;
      params.push(userId);
    } else {
      whereClause = 'WHERE (d.complainant_id = $' + paramIndex + ' OR d.respondent_id = $' + paramIndex + ')';
      params.push(userId);
      paramIndex++;
    }

    // Add additional filters
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`d.${key} = $${paramIndex++}`);
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
      FROM disputes d
      ${whereClause}
    `;

    const countResult = await db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main query
    const dataQuery = `
      SELECT 
        d.*,
        b.booking_reference,
        e.name as equipment_name,
        CASE 
          WHEN d.complainant_id = $${role === 'both' ? '1' : '1'} THEN respondent.name
          ELSE complainant.name
        END as other_party_name
      FROM disputes d
      JOIN bookings b ON d.booking_id = b.id
      JOIN equipment e ON b.equipment_id = e.id
      JOIN users complainant ON d.complainant_id = complainant.id
      JOIN users respondent ON d.respondent_id = respondent.id
      ${whereClause}
      ORDER BY d.${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(
      dataQuery, 
      dataParams,
      {
        cache: true,
        cacheKey: `disputes:user:${userId}:${role}:${JSON.stringify({ filters, limit, offset, sortBy, sortOrder })}`,
        cacheTTL: 300 // 5 minutes cache
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

  // Update dispute status
  async updateStatus(
    disputeId: string, 
    status: Dispute['status'], 
    resolvedBy?: string,
    resolution?: string
  ): Promise<Dispute> {
    const updateData: Partial<Dispute> = { status };
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_by = resolvedBy;
      updateData.resolution = resolution;
      updateData.resolved_at = new Date();
    }

    return await this.update(disputeId, updateData);
  }

  // Get dispute statistics
  async getDisputeStats(days: number = 30): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_disputes,
        COUNT(*) FILTER (WHERE status = 'open') as open_disputes,
        COUNT(*) FILTER (WHERE status = 'investigating') as investigating_disputes,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_disputes,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_disputes,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent_disputes,
        COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL), 0) as avg_resolution_hours,
        COALESCE(SUM(amount_disputed) FILTER (WHERE status IN ('open', 'investigating')), 0) as total_disputed_amount
      FROM disputes
    `;

    const result = await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `disputes:stats:${days}days`,
        cacheTTL: 600 // 10 minutes cache
      }
    );

    return result[0] || {};
  }

  // Get dispute trends
  async getDisputeTrends(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as dispute_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COALESCE(SUM(amount_disputed), 0) as total_amount_disputed
      FROM disputes
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `disputes:trends:${days}days`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Get disputes by type
  async getDisputesByType(): Promise<any[]> {
    const query = `
      SELECT 
        dispute_type,
        COUNT(*) as dispute_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'resolved')::decimal / COUNT(*)) * 100, 
          2
        ) as resolution_rate,
        COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL), 0) as avg_resolution_hours
      FROM disputes
      GROUP BY dispute_type
      ORDER BY dispute_count DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: 'disputes:by_type',
        cacheTTL: 3600 // 1 hour cache
      }
    );
  }

  // Get urgent disputes (old open disputes)
  async getUrgentDisputes(hoursOld: number = 72): Promise<any[]> {
    const query = `
      SELECT 
        d.*,
        b.booking_reference,
        e.name as equipment_name,
        complainant.name as complainant_name,
        respondent.name as respondent_name,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - d.created_at))/3600 as hours_old
      FROM disputes d
      JOIN bookings b ON d.booking_id = b.id
      JOIN equipment e ON b.equipment_id = e.id
      JOIN users complainant ON d.complainant_id = complainant.id
      JOIN users respondent ON d.respondent_id = respondent.id
      WHERE d.status IN ('open', 'investigating')
      AND d.created_at < CURRENT_TIMESTAMP - INTERVAL '${hoursOld} hours'
      ORDER BY d.created_at ASC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `disputes:urgent:${hoursOld}h`,
        cacheTTL: 600 // 10 minutes cache
      }
    );
  }
}

export const disputeRepository = new DisputeRepository();
