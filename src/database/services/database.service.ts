// Database service layer - High-level API for database operations
import { userRepository } from '../repositories/user.repository';
import { equipmentRepository } from '../repositories/equipment.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { reviewRepository } from '../repositories/review.repository';
import { db } from '../connection';
import { 
  User, 
  Equipment, 
  Booking, 
  Review,
  CreateUserRequest,
  CreateEquipmentRequest,
  CreateBookingRequest,
  EquipmentSearchQuery,
  QueryOptions,
  DashboardStats
} from '../models';

export class DatabaseService {
  // User operations
  async createUser(userData: CreateUserRequest): Promise<User> {
    return await userRepository.createUser(userData);
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    return await userRepository.authenticate(email, password);
  }

  async getUserById(id: string): Promise<User | null> {
    return await userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await userRepository.findByEmail(email);
  }

  async updateUserProfile(userId: string, updateData: any): Promise<User> {
    return await userRepository.updateProfile(userId, updateData);
  }

  async updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    return await userRepository.updatePassword(userId, currentPassword, newPassword);
  }

  async getUserStats(userId: string, role: string): Promise<any> {
    return await userRepository.getUserStats(userId, role);
  }

  // Equipment operations
  async createEquipment(ownerId: string, equipmentData: CreateEquipmentRequest): Promise<Equipment> {
    return await equipmentRepository.createEquipment(ownerId, equipmentData);
  }

  async getEquipmentById(id: string, userId?: string): Promise<any> {
    return await equipmentRepository.findWithDetails(id, userId);
  }

  async searchEquipment(searchParams: EquipmentSearchQuery): Promise<any> {
    return await equipmentRepository.searchEquipment(searchParams);
  }

  async getUserEquipment(ownerId: string, options?: QueryOptions): Promise<any> {
    return await equipmentRepository.findByOwner(ownerId, options);
  }

  async getPopularEquipment(limit?: number): Promise<any[]> {
    return await equipmentRepository.getPopularEquipment(limit);
  }

  async updateEquipment(id: string, updateData: any): Promise<Equipment> {
    return await equipmentRepository.update(id, updateData);
  }

  async incrementEquipmentViews(id: string): Promise<void> {
    return await equipmentRepository.incrementViewCount(id);
  }

  // Booking operations
  async createBooking(renterId: string, bookingData: CreateBookingRequest): Promise<Booking> {
    return await bookingRepository.createBooking(renterId, bookingData);
  }

  async getBookingById(id: string): Promise<any> {
    return await bookingRepository.findWithDetails(id);
  }

  async getUserBookings(userId: string, role: 'renter' | 'lender', options?: QueryOptions): Promise<any> {
    return await bookingRepository.getUserBookings(userId, role, options);
  }

  async updateBookingStatus(bookingId: string, status: string, changedBy?: string, reason?: string): Promise<Booking> {
    return await bookingRepository.updateStatus(bookingId, status as any, changedBy, reason);
  }

  async cancelBooking(bookingId: string, cancelledBy: string, reason?: string): Promise<any> {
    return await bookingRepository.cancelBooking(bookingId, cancelledBy, reason);
  }

  async getBookingStats(userId?: string, role?: 'renter' | 'lender'): Promise<any> {
    return await bookingRepository.getBookingStats(userId, role);
  }

  // Review operations
  async createReview(reviewData: any): Promise<Review> {
    return await reviewRepository.createReview(reviewData);
  }

  async getUserReviews(userId: string, type?: 'received' | 'given', options?: QueryOptions): Promise<any> {
    return await reviewRepository.getUserReviews(userId, type, options);
  }

  async getEquipmentReviews(equipmentId: string, options?: QueryOptions): Promise<any> {
    return await reviewRepository.getEquipmentReviews(equipmentId, options);
  }

  async getUserReviewStats(userId: string): Promise<any> {
    return await reviewRepository.getUserReviewStats(userId);
  }

  async getPendingReviews(userId: string): Promise<any[]> {
    return await reviewRepository.getPendingReviews(userId);
  }

  // Dashboard and analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
        (SELECT COUNT(*) FROM equipment WHERE status = 'active') as total_equipment,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed', 'active')) as active_bookings,
        (SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'investigating')) as pending_disputes,
        
        -- Growth metrics (compared to previous period)
        (SELECT 
          CASE WHEN prev_users > 0 THEN 
            ROUND(((curr_users - prev_users)::decimal / prev_users) * 100, 2)
          ELSE 0 END
         FROM (
           SELECT 
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as curr_users,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '60 days' 
                              AND created_at < CURRENT_DATE - INTERVAL '30 days') as prev_users
           FROM users
         ) growth
        ) as user_growth,
        
        (SELECT 
          CASE WHEN prev_revenue > 0 THEN 
            ROUND(((curr_revenue - prev_revenue) / prev_revenue) * 100, 2)
          ELSE 0 END
         FROM (
           SELECT 
             COALESCE(SUM(total_amount) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as curr_revenue,
             COALESCE(SUM(total_amount) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '60 days' 
                                               AND completed_at < CURRENT_DATE - INTERVAL '30 days'), 0) as prev_revenue
           FROM bookings WHERE status = 'completed'
         ) growth
        ) as revenue_growth
    `;

    const result = await db.query(
      query, 
      [],
      {
        cache: true,
        cacheKey: 'dashboard:stats',
        cacheTTL: 300 // 5 minutes cache
      }
    );

    const stats = result.rows[0];
    return {
      totalUsers: parseInt(stats.total_users),
      totalEquipment: parseInt(stats.total_equipment),
      totalBookings: parseInt(stats.total_bookings),
      totalRevenue: parseFloat(stats.total_revenue),
      activeBookings: parseInt(stats.active_bookings),
      pendingDisputes: parseInt(stats.pending_disputes),
      userGrowth: parseFloat(stats.user_growth),
      revenueGrowth: parseFloat(stats.revenue_growth)
    };
  }

  // Search functionality
  async globalSearch(query: string, type?: string): Promise<any> {
    const searchPromises: Promise<any>[] = [];

    if (!type || type === 'equipment') {
      searchPromises.push(
        equipmentRepository.searchEquipment({ query }).then(result => ({
          type: 'equipment',
          data: result.data,
          total: result.pagination.total
        }))
      );
    }

    if (!type || type === 'users') {
      searchPromises.push(
        userRepository.searchUsers(query).then(result => ({
          type: 'users',
          data: result.data,
          total: result.pagination.total
        }))
      );
    }

    const results = await Promise.all(searchPromises);
    
    return {
      query,
      results: results.filter(r => r.total > 0),
      totalResults: results.reduce((sum, r) => sum + r.total, 0)
    };
  }

  // Health check
  async healthCheck(): Promise<any> {
    return await db.healthCheck();
  }

  // Database maintenance operations
  async refreshMaterializedViews(): Promise<void> {
    await db.query('REFRESH MATERIALIZED VIEW equipment_analytics', [], { cache: false });
    console.log('✅ Materialized views refreshed');
  }

  async cleanupOldData(): Promise<void> {
    await db.transaction(async (client) => {
      // Clean up old search analytics (older than 90 days)
      await client.query(
        `DELETE FROM search_analytics WHERE created_at < CURRENT_DATE - INTERVAL '90 days'`
      );

      // Clean up old notifications (older than 30 days and read)
      await client.query(
        `DELETE FROM notifications 
         WHERE created_at < CURRENT_DATE - INTERVAL '30 days' 
         AND is_read = true`
      );

      // Clean up old booking status history (older than 1 year)
      await client.query(
        `DELETE FROM booking_status_history 
         WHERE created_at < CURRENT_DATE - INTERVAL '1 year'`
      );

      console.log('✅ Old data cleaned up');
    });
  }

  async getSystemMetrics(): Promise<any> {
    const query = `
      SELECT 
        -- Table sizes
        pg_size_pretty(pg_total_relation_size('users')) as users_size,
        pg_size_pretty(pg_total_relation_size('equipment')) as equipment_size,
        pg_size_pretty(pg_total_relation_size('bookings')) as bookings_size,
        pg_size_pretty(pg_total_relation_size('reviews')) as reviews_size,
        
        -- Row counts
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM equipment) as equipment_count,
        (SELECT COUNT(*) FROM bookings) as bookings_count,
        (SELECT COUNT(*) FROM reviews) as reviews_count,
        
        -- Database size
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `;

    const result = await db.query(query, [], {
      cache: true,
      cacheKey: 'system:metrics',
      cacheTTL: 1800 // 30 minutes cache
    });

    return result.rows[0];
  }

  // Backup and export operations
  async exportUserData(userId: string): Promise<any> {
    // GDPR compliance - export all user data
    const userData = await userRepository.findById(userId);
    if (!userData) {
      throw new Error('User not found');
    }

    const [bookings, reviews, equipment] = await Promise.all([
      bookingRepository.getUserBookings(userId, 'renter'),
      reviewRepository.getUserReviews(userId, 'given'),
      equipmentRepository.findByOwner(userId)
    ]);

    return {
      user: userData,
      bookings: bookings.data,
      reviews: reviews.data,
      equipment: equipment.data,
      exported_at: new Date().toISOString()
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    // GDPR compliance - complete data deletion
    await db.transaction(async (client) => {
      // Check for active bookings
      const activeBookings = await client.query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE (renter_id = $1 OR lender_id = $1) 
         AND status IN ('confirmed', 'active')`,
        [userId]
      );

      if (parseInt(activeBookings.rows[0].count) > 0) {
        throw new Error('Cannot delete user with active bookings');
      }

      // Anonymize reviews instead of deleting (preserve integrity)
      await client.query(
        `UPDATE reviews SET 
         reviewer_id = NULL,
         comment = '[User account deleted]'
         WHERE reviewer_id = $1`,
        [userId]
      );

      // Delete user equipment (cascade will handle related data)
      await client.query(`DELETE FROM equipment WHERE owner_id = $1`, [userId]);
      
      // Delete user account
      await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
      
      console.log(`✅ User ${userId} data deleted`);
    });
  }

  // Performance optimization
  async optimizeDatabase(): Promise<void> {
    await db.transaction(async (client) => {
      // Update table statistics
      await client.query('ANALYZE users');
      await client.query('ANALYZE equipment');
      await client.query('ANALYZE bookings');
      await client.query('ANALYZE reviews');
      
      // Reindex if needed (in production, should be done during maintenance windows)
      await client.query('REINDEX TABLE users');
      await client.query('REINDEX TABLE equipment');
      
      console.log('✅ Database optimized');
    });
  }

  // Cache management
  async clearCache(pattern?: string): Promise<void> {
    if (pattern) {
      await db.invalidateCache(pattern);
    } else {
      await db.invalidateCache('*');
    }
    console.log('✅ Cache cleared');
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    await db.close();
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
