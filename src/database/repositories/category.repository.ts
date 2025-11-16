// Category repository for equipment categorization
import { BaseRepository } from './base.repository';
import { Category, QueryOptions, PaginatedResult } from '../models';
import { db } from '../connection';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories', `
      id, name, description, icon, parent_id, is_active, created_at
    `);
    this.defaultCacheTTL = 3600; // 1 hour cache for categories (rarely change)
  }

  // Get all active categories with hierarchy
  async getActiveCategories(): Promise<Category[]> {
    const query = `
      WITH RECURSIVE category_tree AS (
        -- Base case: root categories
        SELECT id, name, description, icon, parent_id, is_active, created_at, 0 as level
        FROM categories
        WHERE parent_id IS NULL AND is_active = true
        
        UNION ALL
        
        -- Recursive case: child categories
        SELECT c.id, c.name, c.description, c.icon, c.parent_id, c.is_active, c.created_at, ct.level + 1
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.is_active = true
      )
      SELECT * FROM category_tree
      ORDER BY level, name
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: 'categories:active:hierarchy',
        cacheTTL: this.defaultCacheTTL
      }
    );
  }

  // Get category with equipment count
  async getCategoriesWithStats(): Promise<any[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(e.id) as equipment_count,
        COALESCE(AVG(e.rating), 0) as avg_equipment_rating,
        COALESCE(AVG(e.daily_rate), 0) as avg_daily_rate
      FROM categories c
      LEFT JOIN equipment e ON c.id = e.category_id AND e.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.description, c.icon, c.parent_id, c.is_active, c.created_at
      ORDER BY equipment_count DESC, c.name
    `;

    return await this.executeQuery(
      query, 
      [],
      {
        cache: true,
        cacheKey: 'categories:with_stats',
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Get popular categories based on bookings
  async getPopularCategories(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as total_revenue
      FROM categories c
      JOIN equipment e ON c.id = e.category_id
      JOIN bookings b ON e.id = b.equipment_id
      WHERE c.is_active = true 
      AND e.status = 'active'
      AND b.status = 'completed'
      AND b.completed_at >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY c.id
      ORDER BY booking_count DESC, total_revenue DESC
      LIMIT $1
    `;

    return await this.executeQuery(
      query, 
      [limit],
      {
        cache: true,
        cacheKey: `categories:popular:${limit}`,
        cacheTTL: 1800 // 30 minutes cache
      }
    );
  }

  // Search categories
  async searchCategories(query: string): Promise<Category[]> {
    return await this.search(query, ['name', 'description'], {
      filters: { is_active: true },
      cache: true,
      cacheTTL: this.defaultCacheTTL
    }).then(result => result.data);
  }
}

export const categoryRepository = new CategoryRepository();
