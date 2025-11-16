# 🚀 Production Deployment Checklist - Rencam Platform

## ✅ **Pre-Deployment Verification**

### **Database Setup**
- [ ] PostgreSQL server installed and running
- [ ] Database credentials configured in `.env`
- [ ] Schema deployed: `npm run db:setup`
- [ ] Sample data loaded: `npm run db:seed`
- [ ] Database health verified: `npm run db:health`
- [ ] Backup system tested: `npm run db:backup`

### **Environment Configuration**
- [ ] Production `.env` file created
- [ ] Database connection strings updated
- [ ] Redis configuration (optional but recommended)
- [ ] JWT secrets configured
- [ ] Payment gateway credentials added
- [ ] SMTP settings for notifications

### **Security Checklist**
- [ ] Database passwords are strong (16+ characters)
- [ ] PostgreSQL configured to only accept SSL connections
- [ ] Redis password protection enabled
- [ ] API rate limiting configured
- [ ] Input validation enabled on all endpoints
- [ ] CORS settings configured for production domains

---

## 🔧 **Required Environment Variables**

### **Database Configuration**
```bash
# PostgreSQL Settings
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=rencam_production
DB_USER=rencam_prod_user
DB_PASSWORD=your_secure_password_here
DB_SSL=true
DB_MAX_CONNECTIONS=20

# Redis Cache (Optional)
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
CACHE_TTL=3600

# Application Settings
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_min_32_chars
ENABLE_QUERY_CACHE=true
ENABLE_METRICS=true
```

### **Payment Gateway (Razorpay)**
```bash
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### **Email Notifications**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@rencam.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@rencam.com
```

---

## 🏗️ **Infrastructure Setup**

### **Database Server (PostgreSQL)**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create production database
sudo -u postgres createdb rencam_production
sudo -u postgres createuser rencam_prod_user
sudo -u postgres psql -c "ALTER USER rencam_prod_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rencam_production TO rencam_prod_user;"

# Configure PostgreSQL for production
sudo nano /etc/postgresql/*/main/postgresql.conf
# Set: shared_preload_libraries = 'pg_stat_statements'
# Set: max_connections = 100
# Set: shared_buffers = 256MB

sudo systemctl restart postgresql
```

### **Redis Cache (Optional)**
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

sudo systemctl restart redis
```

### **Node.js Application**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Deploy application
git clone your_repository
cd rencam-camera-rental-platform
npm install --production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 **Performance Monitoring**

### **Database Monitoring**
```sql
-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries
SELECT query, mean_exec_time, calls, total_exec_time 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Monitor connection usage
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
```

### **Application Monitoring**
```bash
# Monitor application health
npm run db:health
npm run db:analytics

# PM2 monitoring
pm2 monit
pm2 logs
```

---

## 🔒 **Security Hardening**

### **Database Security**
```bash
# PostgreSQL security
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Change 'trust' to 'md5' for local connections
# Add: hostssl all all 0.0.0.0/0 md5

# Firewall configuration
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP  
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp from your_app_server_ip  # PostgreSQL
sudo ufw enable
```

### **Application Security**
- [ ] HTTPS/SSL certificates installed
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] API rate limiting enabled
- [ ] Authentication tokens expire properly
- [ ] File upload restrictions in place
- [ ] Regular security updates scheduled

---

## 📈 **Analytics & Reporting**

### **Business Metrics Dashboard**
```bash
# Generate daily analytics report
npm run db:analytics

# Export data for analysis
node -e "
const { analyticsService } = require('./src/database/utils/analytics');
analyticsService.exportAnalyticsToCsv('revenue', 30)
  .then(csv => console.log('Revenue data exported'))
  .catch(console.error);
"
```

### **Performance Metrics**
- [ ] Database query performance tracked
- [ ] Cache hit rates monitored
- [ ] Application response times logged
- [ ] Error rates tracked and alerted
- [ ] User activity analytics enabled

---

## 🔄 **Backup & Recovery**

### **Automated Backups**
```bash
# Daily backup cron job
crontab -e
# Add: 0 2 * * * cd /path/to/app && npm run db:backup

# Weekly full backup with cleanup
0 2 * * 0 cd /path/to/app && node scripts/db-manager.js backup --keep-count=4
```

### **Disaster Recovery**
- [ ] Database backups tested and verified
- [ ] Recovery procedures documented
- [ ] Backup retention policy defined (30 days recommended)
- [ ] Offsite backup storage configured
- [ ] Recovery time objective (RTO) defined

---

## 🚀 **Go-Live Checklist**

### **Final Testing**
- [ ] Database connection pool tested under load
- [ ] Payment processing tested with test transactions
- [ ] Email notifications working correctly
- [ ] Search functionality performing well
- [ ] Booking workflow end-to-end tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility confirmed

### **Launch Preparation**
- [ ] DNS records configured
- [ ] SSL certificates installed and verified
- [ ] CDN configured for static assets
- [ ] Monitoring alerts configured
- [ ] Support team trained
- [ ] Documentation updated

### **Post-Launch Monitoring**
- [ ] Monitor application logs for errors
- [ ] Track database performance metrics
- [ ] Monitor user registration and booking rates
- [ ] Watch for payment processing issues
- [ ] Check email delivery rates
- [ ] Monitor server resource usage

---

## 📞 **Support & Maintenance**

### **Daily Tasks**
- Monitor application health and error logs
- Check database performance metrics
- Verify backup completion
- Review user activity and booking trends

### **Weekly Tasks**
- Analyze performance reports
- Review security logs
- Update system dependencies
- Clean up old log files and temporary data

### **Monthly Tasks**
- Database maintenance and optimization
- Security updates and patches
- Review and archive old bookings/data
- Performance optimization based on metrics
- Business analytics review

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- Database response time: < 100ms for queries
- Cache hit rate: > 80%
- Application uptime: > 99.5%
- Page load time: < 3 seconds
- Error rate: < 0.1%

### **Business KPIs**
- User registration conversion: > 15%
- Booking completion rate: > 80%
- Equipment utilization rate: > 30%
- Average revenue per booking: ₹500+
- Customer satisfaction score: > 4.5/5

---

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Database Connection Failures**
   - Check PostgreSQL service status
   - Verify connection string and credentials
   - Check firewall and network connectivity

2. **Slow Query Performance**
   - Review pg_stat_statements for slow queries
   - Check if indexes are being used properly
   - Consider query optimization or caching

3. **Cache Miss Issues**
   - Verify Redis connection and configuration
   - Check cache TTL settings
   - Monitor cache hit/miss ratios

4. **Payment Processing Errors**
   - Verify Razorpay credentials and webhook URLs
   - Check payment gateway connectivity
   - Review transaction logs for error patterns

---

## ✅ **Deployment Complete!**

Once all items in this checklist are completed, your Rencam Camera Rental Platform will be ready for production use with:

- **High-performance database** handling thousands of concurrent users
- **Secure payment processing** with ₹ currency support
- **Real-time search and booking** capabilities
- **Comprehensive analytics** for business insights
- **Automated backup and monitoring** systems
- **Scalable architecture** ready for growth

🎉 **Welcome to production-ready camera rental platform!**
