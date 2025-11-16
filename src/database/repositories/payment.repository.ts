// Payment repository for financial transactions
import { BaseRepository } from './base.repository';
import { Payment, QueryOptions, PaginatedResult } from '../models';
import { db } from '../connection';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments', `
      id, booking_id, payer_id, payee_id, amount, payment_type, 
      payment_method, payment_gateway, gateway_transaction_id, 
      status, currency, fees, net_amount, created_at, processed_at
    `);
    this.defaultCacheTTL = 600; // 10 minutes cache for payments
  }

  // Create payment record
  async createPayment(paymentData: Omit<Payment, keyof import('../models').BaseEntity>): Promise<Payment> {
    this.validateRequiredFields(paymentData, [
      'booking_id', 'payer_id', 'payee_id', 'amount', 'payment_type'
    ]);

    // Calculate net amount (amount - fees)
    const fees = paymentData.fees || 0;
    const netAmount = paymentData.amount - fees;

    const sanitizedData = this.sanitizeInput({
      ...paymentData,
      net_amount: netAmount,
      currency: paymentData.currency || 'INR',
      status: paymentData.status || 'pending'
    }) as Omit<Payment, keyof import('../models').BaseEntity>;

    return await this.create(sanitizedData);
  }

  // Update payment status
  async updatePaymentStatus(
    paymentId: string, 
    status: Payment['status'], 
    gatewayTransactionId?: string
  ): Promise<Payment> {
    const updateData: Partial<Payment> = { 
      status,
      processed_at: status === 'completed' ? new Date() : undefined
    };
    
    if (gatewayTransactionId) {
      updateData.gateway_transaction_id = gatewayTransactionId;
    }

    return await this.update(paymentId, updateData);
  }

  // Get payment by booking
  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return await this.executeQuery(
      `SELECT ${this.selectFields} FROM ${this.tableName} WHERE booking_id = $1 ORDER BY created_at DESC`,
      [bookingId],
      {
        cache: true,
        cacheKey: `payments:booking:${bookingId}`,
        cacheTTL: this.defaultCacheTTL
      }
    );
  }

  // Get user payments (as payer or payee)
  async getUserPayments(
    userId: string, 
    role: 'payer' | 'payee' | 'both' = 'both',
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Payment & { booking_reference: string; equipment_name: string }>> {
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
    if (role === 'payer') {
      whereClause = 'WHERE p.payer_id = $' + paramIndex++;
      params.push(userId);
    } else if (role === 'payee') {
      whereClause = 'WHERE p.payee_id = $' + paramIndex++;
      params.push(userId);
    } else {
      whereClause = 'WHERE (p.payer_id = $' + paramIndex + ' OR p.payee_id = $' + paramIndex + ')';
      params.push(userId);
      paramIndex++;
    }

    // Add additional filters
    if (Object.keys(filters).length > 0) {
      const conditions: string[] = [];
      
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`p.${key} = $${paramIndex++}`);
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
      FROM payments p
      ${whereClause}
    `;

    const countResult = await db.query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main query
    const dataQuery = `
      SELECT 
        p.*,
        b.booking_reference,
        e.name as equipment_name,
        payer.name as payer_name,
        payee.name as payee_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN equipment e ON b.equipment_id = e.id
      JOIN users payer ON p.payer_id = payer.id
      JOIN users payee ON p.payee_id = payee.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query<Payment & { 
      booking_reference: string; 
      equipment_name: string;
      payer_name: string;
      payee_name: string;
    }>(
      dataQuery, 
      dataParams,
      {
        cache: true,
        cacheKey: `payments:user:${userId}:${role}:${JSON.stringify({ filters, limit, offset, sortBy, sortOrder })}`,
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

  // Get payment statistics
  async getPaymentStats(userId?: string, days: number = 30): Promise<any> {
    let whereClause = '';
    let params: any[] = [];
    
    if (userId) {
      whereClause = 'WHERE (payer_id = $1 OR payee_id = $1) AND';
      params = [userId];
    } else {
      whereClause = 'WHERE';
    }

    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_payments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_payments,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_amount,
        COALESCE(SUM(fees) FILTER (WHERE status = 'completed'), 0) as total_fees,
        COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0) as avg_transaction_amount,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent_transactions
      FROM payments
      ${whereClause} created_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    const cacheKey = userId ? 
      `payments:stats:${userId}:${days}days` : 
      `payments:stats:global:${days}days`;

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

  // Get revenue analytics
  async getRevenueAnalytics(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        DATE(processed_at) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as gross_revenue,
        SUM(fees) as platform_fees,
        SUM(net_amount) as net_revenue,
        COUNT(*) FILTER (WHERE payment_type = 'booking') as booking_payments,
        COUNT(*) FILTER (WHERE payment_type = 'refund') as refund_payments
      FROM payments
      WHERE status = 'completed'
      AND processed_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(processed_at)
      ORDER BY date DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `payments:revenue:${days}days`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Get payment method statistics
  async getPaymentMethodStats(days: number = 30): Promise<any[]> {
    const query = `
      SELECT 
        payment_method,
        payment_gateway,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        ROUND(AVG(amount), 2) as avg_amount,
        COUNT(*) FILTER (WHERE status = 'completed') as successful_count,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed')::decimal / COUNT(*)) * 100, 
          2
        ) as success_rate
      FROM payments
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND payment_method IS NOT NULL
      GROUP BY payment_method, payment_gateway
      ORDER BY transaction_count DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: `payments:methods:${days}days`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Process refund
  async processRefund(
    originalPaymentId: string, 
    refundAmount: number, 
    reason?: string
  ): Promise<Payment> {
    return await db.transaction(async (client) => {
      // Get original payment
      const originalResult = await client.query<Payment>(
        'SELECT * FROM payments WHERE id = $1',
        [originalPaymentId]
      );

      const originalPayment = originalResult.rows[0];
      if (!originalPayment) {
        throw new Error('Original payment not found');
      }

      if (originalPayment.status !== 'completed') {
        throw new Error('Cannot refund incomplete payment');
      }

      if (refundAmount > originalPayment.amount) {
        throw new Error('Refund amount cannot exceed original payment amount');
      }

      // Create refund payment record
      const refundPayment = await client.query<Payment>(
        `INSERT INTO payments (
          booking_id, payer_id, payee_id, amount, payment_type, 
          payment_method, payment_gateway, status, currency, 
          fees, net_amount
        ) VALUES ($1, $2, $3, $4, 'refund', $5, $6, 'pending', $7, 0, $4)
        RETURNING *`,
        [
          originalPayment.booking_id,
          originalPayment.payee_id, // Reversed: payee becomes payer
          originalPayment.payer_id,  // Reversed: payer becomes payee
          refundAmount,
          originalPayment.payment_method,
          originalPayment.payment_gateway,
          originalPayment.currency
        ]
      );

      await this.invalidateCache();
      return refundPayment.rows[0];
    });
  }

  // Get pending settlements for lenders
  async getPendingSettlements(): Promise<any[]> {
    const query = `
      SELECT 
        p.payee_id as lender_id,
        u.name as lender_name,
        u.email as lender_email,
        COUNT(p.id) as pending_count,
        SUM(p.net_amount) as total_pending_amount,
        MIN(p.processed_at) as oldest_payment
      FROM payments p
      JOIN users u ON p.payee_id = u.id
      WHERE p.payment_type = 'booking'
      AND p.status = 'completed'
      AND p.processed_at <= CURRENT_DATE - INTERVAL '7 days' -- Settlement after 7 days
      AND NOT EXISTS (
        SELECT 1 FROM payments payout 
        WHERE payout.payment_type = 'payout' 
        AND payout.payer_id = 'system' 
        AND payout.payee_id = p.payee_id
        AND payout.created_at > p.processed_at
      )
      GROUP BY p.payee_id, u.name, u.email
      ORDER BY total_pending_amount DESC
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: 'payments:pending_settlements',
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }
}

export const paymentRepository = new PaymentRepository();
