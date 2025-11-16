# Rencam Database Setup Guide

This guide will help you set up the high-performance database system for the Rencam Camera Rental Platform.

## 🗄️ Database Architecture

The Rencam platform uses a **PostgreSQL** database optimized for high performance with:

- **Connection pooling** for efficient resource utilization
- **Redis caching** for frequently accessed data
- **Comprehensive indexing** for fast queries
- **Materialized views** for complex analytics
- **Full-text search** capabilities
- **Automated backup and maintenance**

## 📋 Prerequisites

1. **PostgreSQL 14+** 
2. **Redis 6+** (optional but recommended for caching)
3. **Node.js 18+**
4. **Docker** (optional, for containerized setup)

## 🚀 Quick Setup

### Option 1: Docker Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd rencam-platform

# Start database services
docker-compose up -d postgres redis

# The services will be available at:
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Option 2: Manual Setup

#### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### 2. Install Redis (Optional)

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
Download from [Redis official website](https://redis.io/download)

## 🔧 Database Configuration

### 1. Create Database and User

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE rencam_db;

-- Create user
CREATE USER rencam_user WITH PASSWORD 'rencam_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rencam_db TO rencam_user;
ALTER USER rencam_user CREATEDB;

-- Connect to the new database
\c rencam_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rencam_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rencam_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rencam_user;

-- Exit
\q
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the database configuration in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rencam_db
DB_USER=rencam_user
DB_PASSWORD=rencam_password

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Install Dependencies

```bash
# Install database-related packages
npm install pg @types/pg ioredis bcryptjs
```

### 4. Initialize Database Schema

```bash
# Run the schema creation script
psql -h localhost -U rencam_user -d rencam_db -f src/database/schema.sql
```

Or programmatically:

```typescript
import { initializeDatabase } from './src/database';

// Initialize database connection and schema
await initializeDatabase();
```

## 🏗️ Database Schema Overview

### Core Tables

1. **users** - User accounts (renters, lenders, admins)
2. **categories** - Equipment categories
3. **equipment** - Camera gear listings
4. **bookings** - Rental transactions
5. **reviews** - User and equipment reviews
6. **payments** - Financial transactions
7. **disputes** - Booking disputes
8. **notifications** - User notifications
9. **messages** - User communications

### Performance Features

#### Indexes
- **Primary indexes** on all ID fields
- **Composite indexes** for common query patterns
- **Full-text search indexes** for text searches
- **GIN indexes** for JSON data queries

#### Materialized Views
- `equipment_analytics` - Pre-computed equipment statistics
- Refreshed automatically via cron jobs

#### Triggers
- Auto-update timestamps
- Rating calculations
- Booking reference generation

## 📊 Performance Optimizations

### 1. Connection Pooling

The database uses connection pooling with:
- **Min connections**: 2
- **Max connections**: 20 (configurable)
- **Idle timeout**: 30 seconds
- **Connection timeout**: 10 seconds

### 2. Caching Strategy

**Redis Cache Layers:**
- **Query cache**: Frequently accessed queries (5-30 minutes TTL)
- **User sessions**: Authentication data (7 days TTL)
- **Search results**: Equipment searches (5 minutes TTL)
- **Analytics**: Dashboard stats (10-60 minutes TTL)

**Memory Cache Fallback:**
- In-memory LRU cache when Redis is unavailable
- Configurable cache size (default: 100 queries)

### 3. Query Optimization

**Best Practices Implemented:**
- Prepared statements for repeated queries
- Batch operations for bulk updates
- Pagination for large result sets
- Selective field loading
- Query result caching

### 4. Monitoring & Metrics

**Performance Monitoring:**
- Slow query detection (>1000ms threshold)
- Connection pool statistics
- Cache hit/miss ratios
- Query execution metrics

## 🔍 Usage Examples

### Basic Database Operations

```typescript
import { databaseService, repositories } from './src/database';

// User operations
const user = await databaseService.createUser({
  email: 'john@example.com',
  password: 'securepassword',
  name: 'John Doe',
  role: 'renter'
});

// Equipment search
const equipment = await databaseService.searchEquipment({
  query: 'Canon EOS',
  price_min: 50,
  price_max: 200,
  location: 'Mumbai'
});

// Create booking
const booking = await databaseService.createBooking(userId, {
  equipment_id: equipmentId,
  start_date: new Date('2024-12-01'),
  end_date: new Date('2024-12-03')
});
```

### Advanced Queries

```typescript
// Get user statistics
const stats = await repositories.user.getUserStats(userId, 'renter');

// Analytics query
const analytics = await repositories.equipment.getEquipmentAnalytics(equipmentId);

// Search with facets
const searchResult = await repositories.equipment.searchEquipment({
  query: 'professional camera',
  sort_by: 'rating',
  sort_order: 'DESC'
});
```

## 🛠️ Maintenance

### Daily Tasks

```bash
# Backup database
pg_dump -h localhost -U rencam_user rencam_db > backup_$(date +%Y%m%d).sql

# Refresh materialized views
psql -h localhost -U rencam_user -d rencam_db -c "REFRESH MATERIALIZED VIEW equipment_analytics;"
```

### Weekly Tasks

```typescript
// Clean up old data
await databaseService.cleanupOldData();

// Optimize database
await databaseService.optimizeDatabase();
```

### Monitoring Commands

```typescript
// Health check
const health = await databaseService.healthCheck();

// System metrics
const metrics = await databaseService.getSystemMetrics();

// Cache statistics
const poolStats = db.getPoolStats();
```

## 🔒 Security Features

### Data Protection
- **Password hashing** using bcrypt with 12 rounds
- **SQL injection prevention** via parameterized queries
- **Input sanitization** and validation
- **GDPR compliance** with data export/deletion

### Access Control
- **Role-based permissions** (renter, lender, admin)
- **Row-level security** for sensitive data
- **API rate limiting** to prevent abuse
- **Session management** with JWT tokens

## 🚨 Troubleshooting

### Common Issues

**Connection Issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check Redis status
sudo systemctl status redis

# Test connection
psql -h localhost -U rencam_user -d rencam_db -c "SELECT 1;"
```

**Performance Issues:**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes;
```

**Cache Issues:**
```bash
# Clear Redis cache
redis-cli FLUSHDB

# Check Redis memory usage
redis-cli INFO memory
```

### Performance Tuning

**PostgreSQL Configuration:**
```sql
-- Update postgresql.conf for better performance
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
```

**Index Maintenance:**
```sql
-- Analyze table statistics
ANALYZE users;
ANALYZE equipment;
ANALYZE bookings;

-- Reindex if needed
REINDEX INDEX CONCURRENTLY idx_equipment_search;
```

## 📚 API Documentation

The database service provides a comprehensive API for all operations:

- **User Management**: Authentication, profiles, KYC
- **Equipment Management**: Listings, search, analytics  
- **Booking System**: Reservations, payments, status tracking
- **Review System**: Ratings, comments, moderation
- **Admin Tools**: Analytics, disputes, user management

For detailed API documentation, see the TypeScript interfaces in `src/database/models.ts`.

## 🔄 Migration & Deployment

### Database Migrations

```bash
# Create migration file
npm run migration:create add_new_feature

# Run migrations
npm run migration:run

# Rollback migration
npm run migration:rollback
```

### Production Deployment

1. **Environment Setup**: Configure production environment variables
2. **SSL Configuration**: Enable SSL connections for security
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Configure logging and monitoring
5. **Scaling**: Set up read replicas for high traffic

## 🤝 Support

For database-related issues:

1. Check the troubleshooting section above
2. Review the application logs
3. Monitor database performance metrics
4. Contact the development team with specific error messages

---

**Note**: This database system is optimized for the Indian market with ₹ (Indian Rupee) as the default currency and includes region-specific optimizations.
