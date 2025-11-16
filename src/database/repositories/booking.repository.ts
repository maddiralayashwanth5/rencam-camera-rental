// Booking repository with comprehensive rental management
import { BaseRepository } from './base.repository';
import { 
  Booking, 
  BookingWithDetails, 
  CreateBookingRequest, 
  QueryOptions, 
  PaginatedResult 
} from '../models';
import { db } from '../connection';

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super('bookings', `
      id, booking_reference, renter_id, lender_id, equipment_id, 
      start_date, end_date, total_days, daily_rate, subtotal, 
      service_fee, insurance_fee, security_deposit, total_amount, 
      status, pickup_method, pickup_address, return_address, 
      special_instructions, payment_status, payment_id, 
      created_at, updated_at, confirmed_at, completed_at
    `);
    this.defaultCacheTTL = 300; // 5 minutes cache
  }

  // Create booking with validation and pricing calculation
  async createBooking(renterId: string, bookingData: CreateBookingRequest): Promise<Booking> {
    this.validateRequiredFields(bookingData, [
      'equipment_id', 'start_date', 'end_date'
    ]);

    // Get equipment details for pricing
    const equipmentQuery = `
      SELECT daily_rate, security_deposit, owner_id, min_rental_days, max_rental_days
      FROM equipment 
      WHERE id = $1 AND status = 'active'
    `;
    
    const equipmentResult = await db.query(equipmentQuery, [bookingData.equipment_id]);
    const equipment = equipmentResult.rows[0];
    
    if (!equipment) {
      throw new Error('Equipment not found or not available');
    }

    if (equipment.owner_id === renterId) {
      throw new Error('Cannot book your own equipment');
    }

    // Calculate booking duration and validate
    const startDate = new Date(bookingData.start_date);
    const endDate = new Date(bookingData.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays < equipment.min_rental_days) {
      throw new Error(`Minimum rental period is ${equipment.min_rental_days} days`);
    }

    if (totalDays > equipment.max_rental_days) {
      throw new Error(`Maximum rental period is ${equipment.max_rental_days} days`);
    }

    // Check availability
    const availabilityQuery = `
      SELECT COUNT(*) as conflicts
      FROM bookings 
      WHERE equipment_id = $1 
      AND status IN ('confirmed', 'active')
      AND NOT (end_date < $2 OR start_date > $3)
    `;

    const availabilityResult = await db.query(
      availabilityQuery, 
      [bookingData.equipment_id, startDate, endDate]
    );

    if (parseInt(availabilityResult.rows[0].conflicts) > 0) {
      throw new Error('Equipment is not available for the selected dates');
    }

    // Calculate pricing
    const dailyRate = equipment.daily_rate;
    const subtotal = dailyRate * totalDays;
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% service fee
    const insuranceFee = Math.round(subtotal * 0.03 * 100) / 100; // 3% insurance fee
    const securityDeposit = equipment.security_deposit;
    const totalAmount = subtotal + serviceFee + insuranceFee + securityDeposit;

    const sanitizedData = this.sanitizeInput({
      ...bookingData,
      renter_id: renterId,
      lender_id: equipment.owner_id,
      daily_rate: dailyRate,
      subtotal,
      service_fee: serviceFee,
      insurance_fee: insuranceFee,
      security_deposit: securityDeposit,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending'
    });

    return await this.create(sanitizedData as Omit<Booking, keyof import('../models').BaseEntity>);
  }

  // Get booking with full details
  async findWithDetails(bookingId: string): Promise<BookingWithDetails | null> {
    const query = `
      SELECT 
        b.*,
        r.name as renter_name,
        r.email as renter_email,
        r.phone as renter_phone,
        r.rating as renter_rating,
        l.name as lender_name,
        l.email as lender_email,
        l.phone as lender_phone,
        l.rating as lender_rating,
        e.name as equipment_name,
        e.brand as equipment_brand,
        e.model as equipment_model,
        e.images as equipment_images,
        e.condition as equipment_condition,
        c.name as category_name
      FROM bookings b
      JOIN users r ON b.renter_id = r.id
      JOIN users l ON b.lender_id = l.id
      JOIN equipment e ON b.equipment_id = e.id
      JOIN categories c ON e.category_id = c.id
      WHERE b.id = $1
    `;

    const result = await db.query<BookingWithDetails>(
      query, 
      [bookingId],
      {
        cache: true,
        cacheKey: `booking:details:${bookingId}`,
        cacheTTL: this.defaultCacheTTL
      }
    );

    return result.rows[0] || null;
  }

  // Get user bookings (renter or lender)
  async getUserBookings(
    userId: string, 
    role: 'renter' | 'lender',
    options: QueryOptions = {}
  ): Promise<PaginatedResult<BookingWithDetails>> {
    const userField = role === 'renter' ? 'renter_id' : 'lender_id';
    
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      filters = {}
    } = options;

    let whereClause = `WHERE b.${userField} = $1`;
    let params: any[] = [userId];
    let paramIndex = 2;

    // Add additional filters
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`b.${key} = $${paramIndex++}`);
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
      FROM bookings b
      ${whereClause}
    `;

    const countResult = await db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main query
    const dataQuery = `
      SELECT 
        b.*,
        r.name as renter_name,
        r.email as renter_email,
        r.phone as renter_phone,
        l.name as lender_name,
        l.email as lender_email,
        e.name as equipment_name,
        e.brand as equipment_brand,
        e.model as equipment_model,
        e.images as equipment_images,
        c.name as category_name
      FROM bookings b
      JOIN users r ON b.renter_id = r.id
      JOIN users l ON b.lender_id = l.id
      JOIN equipment e ON b.equipment_id = e.id
      JOIN categories c ON e.category_id = c.id
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query<BookingWithDetails>(
      dataQuery, 
      dataParams,
      {
        cache: true,
        cacheKey: `bookings:user:${userId}:${role}:${JSON.stringify({ filters, limit, offset, sortBy, sortOrder })}`,
        cacheTTL: 180 // 3 minutes cache
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

  // Update booking status with history tracking
  async updateStatus(
    bookingId: string, 
    newStatus: Booking['status'], 
    changedBy?: string,
    reason?: string
  ): Promise<Booking> {
    return await db.transaction(async (client) => {
      // Get current booking
      const currentResult = await client.query<Booking>(
        `SELECT * FROM bookings WHERE id = $1`, 
        [bookingId]
      );
      
      const currentBooking = currentResult.rows[0];
      if (!currentBooking) {
        throw new Error('Booking not found');
      }

      // Update booking status
      const updateData: Partial<Booking> = { status: newStatus };
      
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date();
      }

      const updateResult = await client.query<Booking>(
        `UPDATE bookings 
         SET status = $1, ${newStatus === 'confirmed' ? 'confirmed_at = CURRENT_TIMESTAMP,' : ''}
             ${newStatus === 'completed' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 
         RETURNING *`,
        [newStatus, bookingId]
      );

      // Record status change history
      await client.query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [bookingId, currentBooking.status, newStatus, changedBy, reason]
      );

      // Update equipment stats if completed
      if (newStatus === 'completed') {
        await client.query(
          `UPDATE equipment 
           SET total_bookings = total_bookings + 1,
               total_revenue = total_revenue + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [currentBooking.total_amount, currentBooking.equipment_id]
        );
      }

      await this.invalidateCache();
      return updateResult.rows[0];
    });
  }

  // Update payment status
  async updatePaymentStatus(
    bookingId: string, 
    paymentStatus: Booking['payment_status'], 
    paymentId?: string
  ): Promise<Booking> {
    const updateData: Partial<Booking> = { payment_status: paymentStatus };
    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    return await this.update(bookingId, updateData);
  }

  // Get booking statistics for dashboard
  async getBookingStats(userId?: string, role?: 'renter' | 'lender'): Promise<any> {
    let whereClause = '';
    let params: any[] = [];
    
    if (userId && role) {
      const userField = role === 'renter' ? 'renter_id' : 'lender_id';
      whereClause = `WHERE ${userField} = $1`;
      params = [userId];
    }

    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'active') as active_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        COUNT(*) FILTER (WHERE status = 'disputed') as disputed_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as total_revenue,
        COALESCE(AVG(total_amount) FILTER (WHERE status = 'completed'), 0) as avg_booking_value,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_bookings
      FROM bookings
      ${whereClause}
    `;

    const cacheKey = userId ? 
      `booking:stats:${userId}:${role}` : 
      'booking:stats:global';

    const result = await this.executeQuery(
      query, 
      params,
      {
        cache: true,
        cacheKey,
        cacheTTL: 600 // 10 minutes cache
      }
    );

    return result[0] || {};
  }

  // Get bookings requiring action (pending, expiring, etc.)
  async getActionableBookings(userId: string, role: 'renter' | 'lender'): Promise<BookingWithDetails[]> {
    const userField = role === 'renter' ? 'renter_id' : 'lender_id';
    
    const query = `
      SELECT 
        b.*,
        r.name as renter_name,
        l.name as lender_name,
        e.name as equipment_name,
        e.images as equipment_images
      FROM bookings b
      JOIN users r ON b.renter_id = r.id
      JOIN users l ON b.lender_id = l.id
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.${userField} = $1
      AND (
        -- Pending approval (for lenders)
        (b.status = 'pending' AND $2 = 'lender') OR
        -- Payment required (for renters)
        (b.status = 'confirmed' AND b.payment_status = 'pending' AND $2 = 'renter') OR
        -- Starting soon (within 24 hours)
        (b.status = 'confirmed' AND b.start_date <= CURRENT_DATE + INTERVAL '1 day') OR
        -- Ending soon (within 24 hours)
        (b.status = 'active' AND b.end_date <= CURRENT_DATE + INTERVAL '1 day')
      )
      ORDER BY 
        CASE 
          WHEN b.status = 'pending' THEN 1
          WHEN b.payment_status = 'pending' THEN 2
          WHEN b.start_date <= CURRENT_DATE + INTERVAL '1 day' THEN 3
          ELSE 4
        END,
        b.start_date ASC
      LIMIT 10
    `;

    return await this.executeQuery(
      query, 
      [userId, role],
      {
        cache: true,
        cacheKey: `bookings:actionable:${userId}:${role}`,
        cacheTTL: 300 // 5 minutes cache
      }
    );
  }

  // Get booking calendar data for equipment
  async getEquipmentBookingCalendar(equipmentId: string, year: number, month: number): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query = `
      SELECT 
        start_date,
        end_date,
        status,
        booking_reference,
        renter_id,
        (SELECT name FROM users WHERE id = renter_id) as renter_name
      FROM bookings
      WHERE equipment_id = $1
      AND status IN ('confirmed', 'active', 'completed')
      AND NOT (end_date < $2 OR start_date > $3)
      ORDER BY start_date
    `;

    return await this.executeQuery(
      query, 
      [equipmentId, startDate, endDate],
      {
        cache: true,
        cacheKey: `bookings:calendar:${equipmentId}:${year}-${month}`,
        cacheTTL: 3600 // 1 hour cache
      }
    );
  }

  // Get revenue analytics
  async getRevenueAnalytics(userId?: string, days: number = 30): Promise<any[]> {
    let whereClause = '';
    let params: any[] = [];
    
    if (userId) {
      whereClause = 'WHERE b.lender_id = $1 AND';
      params = [userId];
    } else {
      whereClause = 'WHERE';
    }

    const paramIndex = params.length + 1;
    
    const query = `
      SELECT 
        DATE(b.completed_at) as date,
        COUNT(*) as bookings_count,
        SUM(b.total_amount) as revenue,
        AVG(b.total_amount) as avg_booking_value
      FROM bookings b
      ${whereClause} b.status = 'completed'
      AND b.completed_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(b.completed_at)
      ORDER BY date DESC
    `;

    return await this.executeQuery(
      query, 
      params,
      {
        cache: true,
        cacheKey: `bookings:revenue:${userId || 'global'}:${days}days`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Cancel booking with refund calculation
  async cancelBooking(bookingId: string, cancelledBy: string, reason?: string): Promise<{ booking: Booking; refundAmount: number }> {
    return await db.transaction(async (client) => {
      const bookingResult = await client.query<Booking>(
        'SELECT * FROM bookings WHERE id = $1',
        [bookingId]
      );

      const booking = bookingResult.rows[0];
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new Error('Cannot cancel booking in current status');
      }

      // Calculate refund based on cancellation policy
      let refundAmount = 0;
      const daysUntilStart = Math.ceil(
        (new Date(booking.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilStart > 7) {
        refundAmount = booking.total_amount; // Full refund
      } else if (daysUntilStart > 1) {
        refundAmount = booking.total_amount * 0.5; // 50% refund
      } else {
        refundAmount = booking.security_deposit; // Only security deposit
      }

      // Update booking status
      const updatedResult = await client.query<Booking>(
        `UPDATE bookings 
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 
         RETURNING *`,
        [bookingId]
      );

      // Record cancellation in history
      await client.query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, 'cancelled', $3, $4)`,
        [bookingId, booking.status, cancelledBy, reason]
      );

      await this.invalidateCache();
      
      return {
        booking: updatedResult.rows[0],
        refundAmount
      };
    });
  }
}

export const bookingRepository = new BookingRepository();
