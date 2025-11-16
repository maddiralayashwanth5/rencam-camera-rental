// User repository with optimized queries for user management
import { BaseRepository } from './base.repository';
import { User, UserWithStats, CreateUserRequest, UpdateUserRequest, QueryOptions, PaginatedResult } from '../models';
import { db } from '../connection';
// Mock bcrypt implementation - replace with actual bcryptjs in production
const bcrypt = {
  hash: async (password: string, rounds: number): Promise<string> => {
    // This is a mock implementation - use actual bcryptjs in production
    return `$2a$${rounds}$mock_hash_${password.length}_characters`;
  },
  compare: async (password: string, hash: string): Promise<boolean> => {
    // This is a mock implementation - use actual bcryptjs in production
    return hash.includes(`_${password.length}_characters`);
  }
};

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', `
      id, email, name, phone, avatar_url, role, status, kyc_status, 
      kyc_documents, address, rating, total_reviews, created_at, 
      updated_at, last_login
    `);
    this.defaultCacheTTL = 300; // 5 minutes cache for user data
  }

  // Create user with encrypted password
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate required fields
    this.validateRequiredFields(userData, ['email', 'password', 'name', 'role']);

    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    const sanitizedData = this.sanitizeInput({
      ...userData,
      password_hash,
      status: 'active',
      kyc_status: 'pending',
      rating: 0.0,
      total_reviews: 0
    });

    // Remove password from data before storing
    delete (sanitizedData as any).password;

    return await this.create(sanitizedData as Omit<User, keyof import('../models').BaseEntity>);
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT ${this.selectFields} FROM ${this.tableName} WHERE email = $1`;
    const result = await db.query<User>(
      query, 
      [email.toLowerCase()], 
      { 
        cache: true,
        cacheKey: `user:email:${email.toLowerCase()}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return result.rows[0] || null;
  }

  // Authenticate user
  async authenticate(email: string, password: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1 AND status = 'active'`;
    const result = await db.query<User & { password_hash: string }>(
      query, 
      [email.toLowerCase()],
      { cache: false } // Don't cache auth queries
    );

    const user = result.rows[0];
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Update last login
    await this.updateLastLogin(user.id);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Update last login timestamp
  async updateLastLogin(userId: string): Promise<void> {
    const query = `UPDATE ${this.tableName} SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;
    await db.query(query, [userId], { cache: false });
    await this.invalidateEntityCache(userId);
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateUserRequest): Promise<User> {
    const sanitizedData = this.sanitizeInput(updateData);
    return await this.update(userId, sanitizedData);
  }

  // Update user password
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Get current user with password
    const query = `SELECT password_hash FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query<{ password_hash: string }>(query, [userId]);
    
    const user = result.rows[0];
    if (!user) throw new Error('User not found');

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) throw new Error('Current password is incorrect');

    // Hash new password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updateQuery = `UPDATE ${this.tableName} SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;
    await db.query(updateQuery, [password_hash, userId], { cache: false });
    
    await this.invalidateEntityCache(userId);
    return true;
  }

  // Update KYC status
  async updateKYCStatus(userId: string, status: 'pending' | 'verified' | 'rejected', documents?: any): Promise<User> {
    const updateData: any = { kyc_status: status };
    if (documents) {
      updateData.kyc_documents = documents;
    }
    
    return await this.update(userId, updateData);
  }

  // Find users with statistics
  async findUsersWithStats(options: QueryOptions = {}): Promise<PaginatedResult<UserWithStats>> {
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

    // Build WHERE clause
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`u.${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countResult = await db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Data query with stats
    const dataQuery = `
      SELECT 
        u.id, u.email, u.name, u.phone, u.avatar_url, u.role, u.status, 
        u.kyc_status, u.address, u.rating, u.total_reviews, 
        u.created_at, u.updated_at, u.last_login,
        
        -- Renter stats
        CASE WHEN u.role IN ('renter', 'admin') THEN
          COALESCE(renter_stats.total_bookings, 0)
        END as total_bookings,
        
        CASE WHEN u.role IN ('renter', 'admin') THEN
          COALESCE(renter_stats.completion_rate, 0)
        END as completion_rate,
        
        -- Lender stats
        CASE WHEN u.role IN ('lender', 'admin') THEN
          COALESCE(lender_stats.total_earnings, 0)
        END as total_earnings,
        
        CASE WHEN u.role IN ('lender', 'admin') THEN
          COALESCE(lender_stats.active_listings, 0)
        END as active_listings

      FROM users u
      
      -- Left join for renter statistics
      LEFT JOIN (
        SELECT 
          renter_id,
          COUNT(*) as total_bookings,
          ROUND(
            (COUNT(*) FILTER (WHERE status = 'completed')::decimal / 
             NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'cancelled')), 0)) * 100, 
            2
          ) as completion_rate
        FROM bookings 
        GROUP BY renter_id
      ) renter_stats ON u.id = renter_stats.renter_id
      
      -- Left join for lender statistics  
      LEFT JOIN (
        SELECT 
          owner_id,
          COUNT(*) FILTER (WHERE status = 'active') as active_listings,
          COALESCE(SUM(total_revenue), 0) as total_earnings
        FROM equipment
        GROUP BY owner_id
      ) lender_stats ON u.id = lender_stats.owner_id
      
      ${whereClause}
      ORDER BY u.${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query<UserWithStats>(
      dataQuery, 
      dataParams,
      {
        cache: true,
        cacheKey: `users:stats:${JSON.stringify({ filters, limit, offset, sortBy, sortOrder })}`,
        cacheTTL: 120 // 2 minutes cache for stats
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

  // Get user dashboard statistics
  async getUserStats(userId: string, role: string): Promise<any> {
    const cacheKey = `user:stats:${userId}:${role}`;
    
    try {
      let statsQuery = '';
      
      if (role === 'renter' || role === 'admin') {
        statsQuery = `
          SELECT 
            COUNT(*) FILTER (WHERE status IN ('confirmed', 'active')) as active_bookings,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
            COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as total_spent,
            COALESCE(AVG(
              CASE WHEN r.rating IS NOT NULL THEN r.rating END
            ), 0) as avg_rating_given
          FROM bookings b
          LEFT JOIN reviews r ON b.id = r.booking_id AND r.reviewer_id = $1
          WHERE b.renter_id = $1
        `;
      } else if (role === 'lender') {
        statsQuery = `
          SELECT 
            COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as active_listings,
            COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('confirmed', 'active')) as active_rentals,
            COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_rentals,
            COALESCE(SUM(e.total_revenue), 0) as total_earnings,
            COALESCE(AVG(e.rating), 0) as avg_equipment_rating,
            COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'pending') as pending_requests
          FROM equipment e
          LEFT JOIN bookings b ON e.id = b.equipment_id
          WHERE e.owner_id = $1
        `;
      }

      const result = await db.query(
        statsQuery, 
        [userId],
        {
          cache: true,
          cacheKey,
          cacheTTL: 300 // 5 minutes
        }
      );

      return result.rows[0] || {};
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {};
    }
  }

  // Search users with full-text search
  async searchUsers(query: string, options: QueryOptions = {}): Promise<PaginatedResult<User>> {
    return await this.search(
      query, 
      ['name', 'email'], 
      {
        ...options,
        cache: true,
        cacheTTL: 180 // 3 minutes cache for search results
      }
    );
  }

  // Get users by role with pagination
  async findByRole(role: string, options: QueryOptions = {}): Promise<PaginatedResult<User>> {
    return await this.findMany({
      ...options,
      filters: { ...options.filters, role }
    });
  }

  // Get users requiring KYC verification
  async getPendingKYCUsers(options: QueryOptions = {}): Promise<PaginatedResult<User>> {
    return await this.findMany({
      ...options,
      filters: { ...options.filters, kyc_status: 'pending' }
    });
  }

  // Bulk update user status
  async bulkUpdateStatus(userIds: string[], status: 'active' | 'suspended' | 'deactivated'): Promise<User[]> {
    const updates = userIds.map(id => ({ id, data: { status } as Partial<User> }));
    return await this.bulkUpdate(updates);
  }

  // Analytics: User growth over time
  async getUserGrowthStats(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(*) FILTER (WHERE role = 'renter') as new_renters,
        COUNT(*) FILTER (WHERE role = 'lender') as new_lenders
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `user:growth:${days}days`,
        cacheTTL: 3600 // 1 hour cache
      }
    );
  }

  // Get user activity summary
  async getUserActivity(userId: string, days: number = 30): Promise<any> {
    const query = `
      SELECT 
        -- Recent bookings
        (SELECT COUNT(*) FROM bookings WHERE renter_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent_bookings,
        
        -- Recent listings (for lenders)
        (SELECT COUNT(*) FROM equipment WHERE owner_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent_listings,
        
        -- Recent messages
        (SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days') as messages_sent,
        
        -- Recent reviews
        (SELECT COUNT(*) FROM reviews WHERE reviewer_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days') as reviews_given
    `;

    const result = await this.executeQuery(
      query, 
      [userId],
      {
        cache: true,
        cacheKey: `user:activity:${userId}:${days}days`,
        cacheTTL: 600 // 10 minutes cache
      }
    );

    return result[0] || {};
  }
}

// Export singleton instance  
export const userRepository = new UserRepository();
