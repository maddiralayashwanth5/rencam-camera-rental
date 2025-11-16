# 🚀 Full-Stack Camera Rental System - Complete Setup Guide

## 📋 Overview

This is a **complete, production-ready** camera rental platform with:
- ✅ React + TypeScript frontend
- ✅ Node.js + Express + TypeScript backend
- ✅ PostgreSQL database
- ✅ Real-time notifications (Socket.IO)
- ✅ Payment integration (Razorpay)
- ✅ File uploads (Multer + AWS S3)
- ✅ Authentication & Authorization (JWT)
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Booking system
- ✅ Review & rating system
- ✅ Dispute management

## 🏗️ Architecture

```
rencam-camera-rental/
├── client/                    # React Frontend (already built)
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── services/         # API Services
│   │   ├── utils/            # Utilities
│   │   └── ProductionApp.tsx # Main App
│   └── package.json
│
├── server/                    # Node.js Backend (new)
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities
│   │   ├── database/         # Database setup
│   │   └── server.ts         # Main server file
│   ├── uploads/              # File uploads
│   ├── logs/                 # Application logs
│   ├── package.json
│   └── tsconfig.json
│
└── database/                  # Database files
    ├── schema.sql            # Database schema
    ├── migrations/           # Database migrations
    └── seeds/                # Seed data
```

## 🔧 Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version  # Should be 14+
   ```

3. **npm** or **yarn**
   ```bash
   npm --version
   ```

### Optional (for production)
- **Redis** (for caching)
- **AWS Account** (for S3 file storage)
- **Razorpay Account** (for payments)
- **SMTP Server** (for emails)

## 📦 Installation

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- express, cors, helmet, compression
- pg (PostgreSQL client)
- bcryptjs, jsonwebtoken (authentication)
- multer (file uploads)
- razorpay (payments)
- socket.io (real-time)
- nodemailer (emails)
- winston (logging)
- And all TypeScript types

### Step 2: Set Up Database

#### Create PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rencam_db;

# Create user (optional)
CREATE USER rencam_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rencam_db TO rencam_user;

# Exit
\q
```

#### Run Database Schema
```bash
# From server directory
psql -U postgres -d rencam_db -f src/database/schema.sql
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Minimum required configuration:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/rencam_db
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

Server will start at: **http://localhost:5000**

### Step 5: Update Frontend to Use Backend

The frontend is already configured to work with the backend. Just ensure the API URL is correct in the frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /verify-email/:token` - Verify email

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `PUT /password` - Change password
- `POST /avatar` - Upload profile picture
- `GET /:id` - Get user by ID
- `GET /:id/reviews` - Get user reviews

### Equipment (`/api/equipment`)
- `GET /` - List all equipment (with filters)
- `GET /:id` - Get equipment details
- `POST /` - Create equipment (lender only)
- `PUT /:id` - Update equipment
- `DELETE /:id` - Delete equipment
- `POST /:id/images` - Upload equipment images
- `GET /search` - Search equipment
- `GET /categories` - Get categories
- `POST /:id/favorite` - Add to favorites

### Bookings (`/api/bookings`)
- `GET /` - List user bookings
- `GET /:id` - Get booking details
- `POST /` - Create booking
- `PUT /:id/confirm` - Confirm booking (lender)
- `PUT /:id/cancel` - Cancel booking
- `PUT /:id/complete` - Complete booking
- `GET /availability/:equipmentId` - Check availability

### Payments (`/api/payments`)
- `POST /create-order` - Create Razorpay order
- `POST /verify` - Verify payment
- `POST /refund` - Process refund
- `GET /history` - Payment history

### Reviews (`/api/reviews`)
- `POST /` - Create review
- `GET /equipment/:id` - Get equipment reviews
- `GET /user/:id` - Get user reviews
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Admin (`/api/admin`)
- `GET /stats` - Platform statistics
- `GET /users` - List all users
- `PUT /users/:id/status` - Update user status
- `GET /bookings` - List all bookings
- `GET /disputes` - List disputes
- `PUT /disputes/:id/resolve` - Resolve dispute
- `GET /revenue` - Revenue analytics

## 🔐 Authentication Flow

### Registration
```javascript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "renter", // or "lender"
  "phone": "+91 98765 43210"
}

Response:
{
  "success": true,
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Login
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Using JWT Token
```javascript
// Add to request headers
headers: {
  'Authorization': 'Bearer jwt_token_here'
}
```

## 💳 Payment Integration (Razorpay)

### Setup Razorpay
1. Sign up at https://razorpay.com
2. Get API keys from Dashboard
3. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```

### Payment Flow
1. Frontend creates order: `POST /api/payments/create-order`
2. Razorpay checkout opens
3. User completes payment
4. Frontend verifies: `POST /api/payments/verify`
5. Booking confirmed

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Add to `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

### Email Templates
- Welcome email
- Booking confirmation
- Payment receipt
- Booking reminder
- Review request

## 📁 File Upload

### Local Storage (Development)
Files stored in `server/uploads/`

### AWS S3 (Production)
1. Create S3 bucket
2. Get AWS credentials
3. Add to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_S3_BUCKET=rencam-images
   AWS_REGION=ap-south-1
   ```

## 🔄 Real-Time Features (Socket.IO)

### Events
- `new-booking` - New booking notification
- `booking-confirmed` - Booking confirmed
- `new-message` - Chat message
- `payment-received` - Payment notification

### Usage
```javascript
// Frontend
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

socket.on('new-booking', (data) => {
  // Handle notification
});
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### API Testing
Use Postman collection (included in `/docs/postman/`)

### Test Users
After seeding database:
- Renter: renter@rencam.com / password123
- Lender: lender@rencam.com / password123
- Admin: admin@rencam.com / password123

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
heroku create rencam-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify)
```bash
# Build frontend
cd ../
npm run build

# Deploy
netlify deploy --prod
```

### Database Migration
```bash
# Run migrations on production
heroku run npm run db:migrate
```

## 📊 Database Seeding

```bash
# Seed sample data
npm run db:seed
```

This creates:
- 3 demo users (renter, lender, admin)
- 10 sample cameras
- 5 sample bookings
- Sample reviews and categories

## 🔍 Monitoring & Logging

### Logs Location
- Application logs: `server/logs/app.log`
- Error logs: `server/logs/error.log`
- Access logs: Console (Morgan)

### Log Levels
- error: Critical errors
- warn: Warnings
- info: General information
- debug: Debugging information

## 🛡️ Security Features

✅ Helmet.js for security headers
✅ CORS configuration
✅ Rate limiting
✅ JWT authentication
✅ Password hashing (bcrypt)
✅ SQL injection prevention
✅ XSS protection
✅ Input validation
✅ File upload restrictions

## 📈 Performance Optimization

- Database indexing
- Query optimization
- Response compression
- Caching (Redis)
- Connection pooling
- Image optimization

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection string
echo $DATABASE_URL
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🎯 Next Steps

1. ✅ Install backend dependencies
2. ✅ Set up PostgreSQL database
3. ✅ Configure environment variables
4. ✅ Start backend server
5. ✅ Test API endpoints
6. ✅ Connect frontend to backend
7. ✅ Set up payments (Razorpay)
8. ✅ Configure email service
9. ✅ Deploy to production

## 💡 Quick Start Commands

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd ..
npm run dev

# Terminal 3: Database
psql -U postgres -d rencam_db
```

## 📞 Support

For issues or questions:
- Check documentation
- Review logs
- Open GitHub issue
- Contact: support@rencam.com

---

**Status**: Backend Infrastructure Ready ✅  
**Version**: 1.0.0  
**Last Updated**: November 2024
