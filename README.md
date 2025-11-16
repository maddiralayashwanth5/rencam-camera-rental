# Rencam Camera Rental Platform

A comprehensive, high-performance camera rental platform built with React, TypeScript, and PostgreSQL. Designed specifically for the Indian market with ₹ currency support and optimized for professional camera equipment rental.

## 🚀 **COMPLETE DATABASE INTEGRATION ACHIEVED!**

This platform now features a **production-ready, enterprise-grade database system** with:

### ⚡ **Performance Features**
- **PostgreSQL** with 50+ optimized indexes
- **Redis Caching** for sub-second response times  
- **Connection Pooling** (2-20 connections)
- **Query Optimization** with prepared statements
- **Real-time Analytics** and monitoring

### 🔧 **Quick Database Setup**
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Update database credentials in .env

# 3. Initialize database
npm run db:init        # Creates schema + sample data
npm run db:health      # Verify connection
npm run db:analytics   # View platform stats

# 4. Start application  
npm run dev           # http://localhost:5173
```

### 📱 Make It Portable (Access from any device)

**Option 1: Quick Deploy (Recommended)**
1. Run `npm run build` 
2. Visit [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `build` folder to deploy instantly
4. Get a public URL to access from anywhere!

**Option 2: Simple Static Server**
1. Build: `npm run build`
2. Copy `build` folder to any Mac
3. Serve: `cd build && python3 -m http.server 8000`
4. Access: `http://localhost:8000`

📖 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions**

## 🎯 Features
- **Three User Roles**: Renter, Lender, Admin dashboards
- **AI-Powered**: Smart search, pricing suggestions, recommendations
- **Responsive Design**: Works on all devices
- **Modern UI**: Tailwind CSS + Radix UI components
- **Indian Localization**: ₹ currency throughout