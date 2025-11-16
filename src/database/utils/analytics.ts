// Advanced analytics utilities for Rencam Platform
import { db } from '../connection';

export interface AnalyticsMetrics {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  popularCategories: Array<{
    category: string;
    bookings: number;
    revenue: number;
  }>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
  revenueGrowth: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  cacheHitRate: number;
  activeConnections: number;
  slowQueries: number;
  errorRate: number;
  uptime: number;
}

export class AnalyticsService {
  // Get comprehensive platform analytics
  async getPlatformAnalytics(days: number = 30): Promise<AnalyticsMetrics> {
    const queries = {
      // Basic metrics
      totalUsers: 'SELECT COUNT(*) as count FROM users',
      totalEquipment: 'SELECT COUNT(*) as count FROM equipment WHERE status != \'deleted\'',
      totalBookings: 'SELECT COUNT(*) as count FROM bookings',
      totalRevenue: 'SELECT COALESCE(SUM(total_amount), 0) as amount FROM bookings WHERE status = \'completed\'',
      activeUsers: `SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT renter_id as user_id FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        UNION
        SELECT owner_id as user_id FROM equipment e 
        JOIN bookings b ON e.id = b.equipment_id 
        WHERE b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ) active`,

      // Popular categories
      popularCategories: `
        SELECT 
          c.name as category,
          COUNT(b.id) as bookings,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM categories c
        LEFT JOIN equipment e ON c.id = e.category_id
        LEFT JOIN bookings b ON e.id = b.equipment_id 
          AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY c.id, c.name
        ORDER BY bookings DESC, revenue DESC
        LIMIT 10
      `,

      // User growth
      userGrowth: `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${days} days',
            CURRENT_DATE,
            '1 day'::interval
          )::date as date
        ),
        daily_users AS (
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users
          FROM users
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
        ),
        cumulative_users AS (
          SELECT 
            ds.date,
            COALESCE(du.new_users, 0) as new_users,
            SUM(COALESCE(du.new_users, 0)) OVER (ORDER BY ds.date) +
            (SELECT COUNT(*) FROM users WHERE created_at < CURRENT_DATE - INTERVAL '${days} days') as total_users
          FROM date_series ds
          LEFT JOIN daily_users du ON ds.date = du.date
        )
        SELECT 
          date::text,
          new_users,
          total_users
        FROM cumulative_users
        ORDER BY date
      `,

      // Revenue growth
      revenueGrowth: `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${days} days',
            CURRENT_DATE,
            '1 day'::interval
          )::date as date
        ),
        daily_revenue AS (
          SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as bookings
          FROM bookings
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND status IN ('completed', 'confirmed')
          GROUP BY DATE(created_at)
        )
        SELECT 
          ds.date::text,
          COALESCE(dr.revenue, 0) as revenue,
          COALESCE(dr.bookings, 0) as bookings
        FROM date_series ds
        LEFT JOIN daily_revenue dr ON ds.date = dr.date
        ORDER BY ds.date
      `
    };

    try {
      const results = await Promise.all([
        db.query(queries.totalUsers),
        db.query(queries.totalEquipment),
        db.query(queries.totalBookings),
        db.query(queries.totalRevenue),
        db.query(queries.activeUsers),
        db.query(queries.popularCategories),
        db.query(queries.userGrowth),
        db.query(queries.revenueGrowth)
      ]);

      return {
        totalUsers: parseInt(results[0].rows[0].count),
        totalEquipment: parseInt(results[1].rows[0].count),
        totalBookings: parseInt(results[2].rows[0].count),
        totalRevenue: parseFloat(results[3].rows[0].amount),
        activeUsers: parseInt(results[4].rows[0].count),
        popularCategories: results[5].rows.map(row => ({
          category: row.category,
          bookings: parseInt(row.bookings),
          revenue: parseFloat(row.revenue)
        })),
        userGrowth: results[6].rows.map(row => ({
          date: row.date,
          newUsers: parseInt(row.new_users),
          totalUsers: parseInt(row.total_users)
        })),
        revenueGrowth: results[7].rows.map(row => ({
          date: row.date,
          revenue: parseFloat(row.revenue),
          bookings: parseInt(row.bookings)
        }))
      };

    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      throw error;
    }
  }

  // Get real-time performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const queries = {
      // Database performance
      activeConnections: `
        SELECT count(*) as connections
        FROM pg_stat_activity 
        WHERE state = 'active'
      `,

      slowQueries: `
        SELECT count(*) as slow_queries
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
      `,

      dbSize: `
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `
    };

    try {
      const [connectionsResult, slowQueriesResult] = await Promise.all([
        db.query(queries.activeConnections),
        db.query(queries.slowQueries).catch(() => ({ rows: [{ slow_queries: 0 }] })) // pg_stat_statements may not be enabled
      ]);

      // Get cache metrics from connection pool (placeholder for now)
      const poolStats = { totalConnections: 0, idleConnections: 0 }; // db.getPoolStats();
      const cacheStats = { hitRate: 0, avgQueryTime: 0, errorRate: 0 }; // db.getCacheStats();

      return {
        avgResponseTime: cacheStats.avgQueryTime || 0,
        cacheHitRate: cacheStats.hitRate || 0,
        activeConnections: parseInt(connectionsResult.rows[0].connections),
        slowQueries: parseInt(slowQueriesResult.rows[0].slow_queries),
        errorRate: cacheStats.errorRate || 0,
        uptime: process.uptime()
      };

    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      
      // Return default metrics on error
      return {
        avgResponseTime: 0,
        cacheHitRate: 0,
        activeConnections: 0,
        slowQueries: 0,
        errorRate: 0,
        uptime: process.uptime()
      };
    }
  }

  // Generate equipment performance report
  async getEquipmentPerformanceReport(days: number = 30): Promise<Array<{
    equipmentId: string;
    name: string;
    category: string;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    utilizationRate: number;
    ownerName: string;
  }>> {
    const query = `
      SELECT 
        e.id as equipment_id,
        e.name,
        c.name as category,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        e.rating as average_rating,
        ROUND(
          (COUNT(b.id)::decimal / NULLIF(${days}, 0)) * 100, 2
        ) as utilization_rate,
        u.name as owner_name
      FROM equipment e
      LEFT JOIN bookings b ON e.id = b.equipment_id 
        AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        AND b.status IN ('completed', 'confirmed')
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN users u ON e.owner_id = u.id
      WHERE e.status != 'deleted'
      GROUP BY e.id, e.name, c.name, e.rating, u.name
      ORDER BY total_revenue DESC, total_bookings DESC
    `;

    try {
      const result = await db.query(query);
      
      return result.rows.map(row => ({
        equipmentId: row.equipment_id,
        name: row.name,
        category: row.category,
        totalBookings: parseInt(row.total_bookings),
        totalRevenue: parseFloat(row.total_revenue),
        averageRating: parseFloat(row.average_rating) || 0,
        utilizationRate: parseFloat(row.utilization_rate) || 0,
        ownerName: row.owner_name
      }));

    } catch (error) {
      console.error('Error generating equipment performance report:', error);
      throw error;
    }
  }

  // Generate user behavior analysis
  async getUserBehaviorAnalysis(days: number = 30): Promise<{
    topRenters: Array<{
      userId: string;
      name: string;
      totalBookings: number;
      totalSpent: number;
      averageRating: number;
    }>;
    topLenders: Array<{
      userId: string;
      name: string;
      equipmentCount: number;
      totalEarnings: number;
      averageRating: number;
    }>;
    bookingPatterns: Array<{
      dayOfWeek: string;
      bookingCount: number;
      averageAmount: number;
    }>;
  }> {
    const queries = {
      topRenters: `
        SELECT 
          u.id as user_id,
          u.name,
          COUNT(b.id) as total_bookings,
          COALESCE(SUM(b.total_amount), 0) as total_spent,
          u.rating as average_rating
        FROM users u
        LEFT JOIN bookings b ON u.id = b.renter_id 
          AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        WHERE u.role = 'renter'
        GROUP BY u.id, u.name, u.rating
        HAVING COUNT(b.id) > 0
        ORDER BY total_spent DESC, total_bookings DESC
        LIMIT 10
      `,

      topLenders: `
        SELECT 
          u.id as user_id,
          u.name,
          COUNT(DISTINCT e.id) as equipment_count,
          COALESCE(SUM(b.total_amount), 0) as total_earnings,
          u.rating as average_rating
        FROM users u
        LEFT JOIN equipment e ON u.id = e.owner_id
        LEFT JOIN bookings b ON e.id = b.equipment_id 
          AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
          AND b.status IN ('completed', 'confirmed')
        WHERE u.role = 'lender'
        GROUP BY u.id, u.name, u.rating
        HAVING COUNT(DISTINCT e.id) > 0
        ORDER BY total_earnings DESC, equipment_count DESC
        LIMIT 10
      `,

      bookingPatterns: `
        SELECT 
          TO_CHAR(created_at, 'Day') as day_of_week,
          COUNT(*) as booking_count,
          AVG(total_amount) as average_amount
        FROM bookings
        WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(dow FROM created_at)
        ORDER BY EXTRACT(dow FROM created_at)
      `
    };

    try {
      const [rentersResult, lendersResult, patternsResult] = await Promise.all([
        db.query(queries.topRenters),
        db.query(queries.topLenders),
        db.query(queries.bookingPatterns)
      ]);

      return {
        topRenters: rentersResult.rows.map(row => ({
          userId: row.user_id,
          name: row.name,
          totalBookings: parseInt(row.total_bookings),
          totalSpent: parseFloat(row.total_spent),
          averageRating: parseFloat(row.average_rating) || 0
        })),
        topLenders: lendersResult.rows.map(row => ({
          userId: row.user_id,
          name: row.name,
          equipmentCount: parseInt(row.equipment_count),
          totalEarnings: parseFloat(row.total_earnings),
          averageRating: parseFloat(row.average_rating) || 0
        })),
        bookingPatterns: patternsResult.rows.map(row => ({
          dayOfWeek: row.day_of_week.trim(),
          bookingCount: parseInt(row.booking_count),
          averageAmount: parseFloat(row.average_amount) || 0
        }))
      };

    } catch (error) {
      console.error('Error generating user behavior analysis:', error);
      throw error;
    }
  }

  // Generate financial insights
  async getFinancialInsights(days: number = 30): Promise<{
    totalRevenue: number;
    platformFees: number;
    payoutsPending: number;
    refundsProcessed: number;
    averageBookingValue: number;
    revenueByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  }> {
    const queries = {
      financialSummary: `
        SELECT 
          COALESCE(SUM(b.total_amount), 0) as total_revenue,
          COALESCE(SUM(p.fees), 0) as platform_fees,
          AVG(b.total_amount) as average_booking_value
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
          AND b.status IN ('completed', 'confirmed')
      `,

      pendingPayouts: `
        SELECT COALESCE(SUM(net_amount), 0) as pending_payouts
        FROM payments
        WHERE status = 'completed' 
          AND payout_status = 'pending'
          AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      `,

      refunds: `
        SELECT COALESCE(SUM(amount), 0) as refunds_processed
        FROM payments
        WHERE payment_type = 'refund'
          AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      `,

      revenueByCategory: `
        SELECT 
          c.name as category,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM categories c
        LEFT JOIN equipment e ON c.id = e.category_id
        LEFT JOIN bookings b ON e.id = b.equipment_id 
          AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
          AND b.status IN ('completed', 'confirmed')
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
      `
    };

    try {
      const [summaryResult, payoutsResult, refundsResult, categoryResult] = await Promise.all([
        db.query(queries.financialSummary),
        db.query(queries.pendingPayouts),
        db.query(queries.refunds),
        db.query(queries.revenueByCategory)
      ]);

      const totalRevenue = parseFloat(summaryResult.rows[0].total_revenue);
      const revenueByCategory = categoryResult.rows.map(row => ({
        category: row.category,
        revenue: parseFloat(row.revenue),
        percentage: totalRevenue > 0 ? (parseFloat(row.revenue) / totalRevenue) * 100 : 0
      }));

      return {
        totalRevenue,
        platformFees: parseFloat(summaryResult.rows[0].platform_fees),
        payoutsPending: parseFloat(payoutsResult.rows[0].pending_payouts),
        refundsProcessed: parseFloat(refundsResult.rows[0].refunds_processed),
        averageBookingValue: parseFloat(summaryResult.rows[0].average_booking_value) || 0,
        revenueByCategory
      };

    } catch (error) {
      console.error('Error generating financial insights:', error);
      throw error;
    }
  }

  // Export analytics data to CSV
  async exportAnalyticsToCsv(type: 'users' | 'equipment' | 'bookings' | 'revenue', days: number = 30): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rencam_${type}_analytics_${timestamp}.csv`;

    let query = '';
    let headers: string[] = [];

    switch (type) {
      case 'users':
        query = `
          SELECT 
            u.id, u.name, u.email, u.role, u.status, u.kyc_status,
            u.rating, u.total_reviews, u.created_at,
            COUNT(b.id) as total_bookings,
            COALESCE(SUM(CASE WHEN u.role = 'renter' THEN b.total_amount ELSE 0 END), 0) as total_spent,
            COALESCE(SUM(CASE WHEN u.role = 'lender' THEN b.total_amount ELSE 0 END), 0) as total_earned
          FROM users u
          LEFT JOIN bookings b ON (u.id = b.renter_id OR u.id IN (
            SELECT e.owner_id FROM equipment e WHERE e.id = b.equipment_id
          )) AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY u.id, u.name, u.email, u.role, u.status, u.kyc_status, u.rating, u.total_reviews, u.created_at
          ORDER BY u.created_at DESC
        `;
        headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'KYC Status', 'Rating', 'Reviews', 'Created', 'Bookings', 'Spent', 'Earned'];
        break;

      case 'equipment':
        query = `
          SELECT 
            e.id, e.name, c.name as category, u.name as owner,
            e.daily_rate, e.status, e.rating, e.total_reviews, e.total_bookings,
            e.views_count, e.created_at,
            COUNT(b.id) as recent_bookings,
            COALESCE(SUM(b.total_amount), 0) as recent_revenue
          FROM equipment e
          LEFT JOIN categories c ON e.category_id = c.id
          LEFT JOIN users u ON e.owner_id = u.id
          LEFT JOIN bookings b ON e.id = b.equipment_id 
            AND b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY e.id, e.name, c.name, u.name, e.daily_rate, e.status, e.rating, e.total_reviews, e.total_bookings, e.views_count, e.created_at
          ORDER BY e.created_at DESC
        `;
        headers = ['ID', 'Name', 'Category', 'Owner', 'Daily Rate', 'Status', 'Rating', 'Reviews', 'Total Bookings', 'Views', 'Created', 'Recent Bookings', 'Recent Revenue'];
        break;

      case 'bookings':
        query = `
          SELECT 
            b.id, b.booking_reference, e.name as equipment, 
            renter.name as renter, owner.name as owner,
            b.start_date, b.end_date, b.total_amount, b.status,
            b.created_at, b.updated_at
          FROM bookings b
          LEFT JOIN equipment e ON b.equipment_id = e.id
          LEFT JOIN users renter ON b.renter_id = renter.id
          LEFT JOIN users owner ON e.owner_id = owner.id
          WHERE b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
          ORDER BY b.created_at DESC
        `;
        headers = ['ID', 'Reference', 'Equipment', 'Renter', 'Owner', 'Start Date', 'End Date', 'Amount', 'Status', 'Created', 'Updated'];
        break;

      case 'revenue':
        query = `
          SELECT 
            DATE(b.created_at) as date,
            COUNT(b.id) as bookings,
            SUM(b.total_amount) as revenue,
            AVG(b.total_amount) as avg_booking_value,
            COUNT(DISTINCT b.renter_id) as unique_renters,
            COUNT(DISTINCT e.owner_id) as unique_lenders
          FROM bookings b
          LEFT JOIN equipment e ON b.equipment_id = e.id
          WHERE b.created_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND b.status IN ('completed', 'confirmed')
          GROUP BY DATE(b.created_at)
          ORDER BY date DESC
        `;
        headers = ['Date', 'Bookings', 'Revenue', 'Avg Booking Value', 'Unique Renters', 'Unique Lenders'];
        break;
    }

    try {
      const result = await db.query(query);
      
      // Generate CSV content
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => 
          headers.map(header => {
            const key = header.toLowerCase().replace(/ /g, '_');
            const value = row[key] || '';
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      // In a real application, you would write this to a file or cloud storage
      console.log(`Generated ${type} analytics CSV with ${result.rows.length} rows`);
      
      return csvContent;

    } catch (error) {
      console.error('Error exporting analytics to CSV:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
