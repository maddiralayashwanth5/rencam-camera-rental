// Notification repository for user notifications
import { BaseRepository } from './base.repository';
import { Notification, QueryOptions, PaginatedResult } from '../models';
import { db } from '../connection';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications', `
      id, user_id, title, message, notification_type, related_id, 
      related_type, is_read, action_url, metadata, created_at
    `);
    this.defaultCacheTTL = 180; // 3 minutes cache for notifications
  }

  // Create notification
  async createNotification(notificationData: Omit<Notification, keyof import('../models').BaseEntity>): Promise<Notification> {
    this.validateRequiredFields(notificationData, [
      'user_id', 'title', 'message', 'notification_type'
    ]);

    const sanitizedData = this.sanitizeInput(notificationData);
    return await this.create(sanitizedData);
  }

  // Get user notifications with pagination
  async getUserNotifications(userId: string, options: QueryOptions = {}): Promise<PaginatedResult<Notification>> {
    return await this.findMany({
      ...options,
      filters: { ...options.filters, user_id: userId },
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    return await this.update(notificationId, { is_read: true });
  }

  // Mark all user notifications as read
  async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
    `;
    
    const result = await db.query(query, [userId], { cache: false });
    await this.invalidateCache();
    return result.rowCount;
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    return await this.count({ user_id: userId, is_read: false });
  }

  // Bulk create notifications
  async createBulkNotifications(notifications: Omit<Notification, keyof import('../models').BaseEntity>[]): Promise<Notification[]> {
    return await this.bulkCreate(notifications);
  }

  // Delete old read notifications
  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
    const query = `
      DELETE FROM notifications 
      WHERE user_id = $1 
      AND is_read = true 
      AND created_at < CURRENT_DATE - INTERVAL '${daysOld} days'
    `;
    
    const result = await db.query(query, [userId], { cache: false });
    await this.invalidateCache();
    return result.rowCount;
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(*) FILTER (WHERE is_read = false) as unread_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_count,
        COUNT(*) FILTER (WHERE notification_type = 'booking') as booking_notifications,
        COUNT(*) FILTER (WHERE notification_type = 'payment') as payment_notifications,
        COUNT(*) FILTER (WHERE notification_type = 'review') as review_notifications
      FROM notifications
      WHERE user_id = $1
    `;

    const result = await this.executeQuery(
      query, 
      [userId],
      {
        cache: true,
        cacheKey: `notifications:stats:${userId}`,
        cacheTTL: 300 // 5 minutes cache
      }
    );

    return result[0] || {};
  }
}

export const notificationRepository = new NotificationRepository();
