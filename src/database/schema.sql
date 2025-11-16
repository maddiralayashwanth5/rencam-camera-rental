-- Rencam Camera Rental Platform Database Schema
-- Optimized for performance with proper indexing and foreign key relationships

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores all platform users (renters, lenders, admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('renter', 'lender', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    kyc_documents JSONB,
    address JSONB,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Categories table - equipment categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table - camera gear listings
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    daily_rate DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'rented', 'maintenance', 'inactive')),
    location JSONB, -- {city, state, country, coordinates}
    pickup_options JSONB, -- {delivery, pickup, meetup}
    images TEXT[], -- Array of image URLs
    specifications JSONB, -- Technical specs
    accessories JSONB, -- Included accessories
    availability_calendar JSONB, -- Blocked dates
    min_rental_days INTEGER DEFAULT 1,
    max_rental_days INTEGER DEFAULT 30,
    insurance_required BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table - rental transactions
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    lender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    daily_rate DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) DEFAULT 0,
    insurance_fee DECIMAL(10,2) DEFAULT 0,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed')),
    pickup_method VARCHAR(20) CHECK (pickup_method IN ('delivery', 'pickup', 'meetup')),
    pickup_address JSONB,
    return_address JSONB,
    special_instructions TEXT,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Booking status history for tracking
CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('renter_to_lender', 'lender_to_renter', 'equipment')),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, reviewer_id, review_type)
);

-- Messages between users
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    attachments TEXT[],
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_reference VARCHAR(20) UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    complainant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    respondent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    dispute_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB, -- Photos, documents, etc.
    amount_disputed DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('booking', 'security_deposit', 'refund', 'payout')),
    payment_method VARCHAR(30),
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    currency VARCHAR(3) DEFAULT 'INR',
    fees DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_id UUID, -- Can reference booking, equipment, etc.
    related_type VARCHAR(50), -- Type of related entity
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences and settings
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    currency VARCHAR(3) DEFAULT 'INR',
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment availability calendar
CREATE TABLE equipment_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    price_override DECIMAL(10,2),
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_id, date)
);

-- Search and analytics
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER,
    clicked_equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for fast queries

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Equipment table indexes
CREATE INDEX idx_equipment_owner_id ON equipment(owner_id);
CREATE INDEX idx_equipment_category_id ON equipment(category_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_daily_rate ON equipment(daily_rate);
CREATE INDEX idx_equipment_rating ON equipment(rating DESC);
CREATE INDEX idx_equipment_location ON equipment USING GIN(location);
CREATE INDEX idx_equipment_created_at ON equipment(created_at);
CREATE INDEX idx_equipment_views_count ON equipment(views_count DESC);
CREATE INDEX idx_equipment_total_bookings ON equipment(total_bookings DESC);

-- Bookings table indexes
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_lender_id ON bookings(lender_id);
CREATE INDEX idx_bookings_equipment_id ON bookings(equipment_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date_range ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- Reviews table indexes
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_equipment_id ON reviews(equipment_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- Messages table indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Notifications table indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Availability table indexes
CREATE INDEX idx_equipment_availability_equipment_date ON equipment_availability(equipment_id, date);
CREATE INDEX idx_equipment_availability_date ON equipment_availability(date);

-- Composite indexes for common queries
CREATE INDEX idx_equipment_search ON equipment(status, category_id, daily_rate) WHERE status = 'active';
CREATE INDEX idx_bookings_user_status ON bookings(renter_id, status, created_at);
CREATE INDEX idx_bookings_equipment_dates ON bookings(equipment_id, start_date, end_date) WHERE status IN ('confirmed', 'active');

-- Full-text search indexes
CREATE INDEX idx_equipment_search_text ON equipment USING GIN(to_tsvector('english', name || ' ' || description || ' ' || brand || ' ' || model));
CREATE INDEX idx_users_search_text ON users USING GIN(to_tsvector('english', name || ' ' || email));

-- Trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user ratings based on reviews
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update reviewee rating
    UPDATE users 
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews 
        WHERE reviewee_id = NEW.reviewee_id AND review_type IN ('renter_to_lender', 'lender_to_renter')
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews 
        WHERE reviewee_id = NEW.reviewee_id AND review_type IN ('renter_to_lender', 'lender_to_renter')
    )
    WHERE id = NEW.reviewee_id;
    
    -- Update equipment rating if it's an equipment review
    IF NEW.equipment_id IS NOT NULL THEN
        UPDATE equipment 
        SET rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM reviews 
            WHERE equipment_id = NEW.equipment_id AND review_type = 'equipment'
        )
        WHERE id = NEW.equipment_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_after_review 
    AFTER INSERT ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_reference = 'RC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(EXTRACT(DOY FROM CURRENT_DATE)::text, 3, '0') || '-' || LPAD((SELECT COUNT(*) + 1 FROM bookings WHERE DATE(created_at) = CURRENT_DATE)::text, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_booking_ref 
    BEFORE INSERT ON bookings 
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Views for common queries
CREATE VIEW active_equipment AS
SELECT 
    e.*,
    u.name as owner_name,
    u.rating as owner_rating,
    c.name as category_name,
    (SELECT COUNT(*) FROM reviews WHERE equipment_id = e.id) as review_count
FROM equipment e
JOIN users u ON e.owner_id = u.id
JOIN categories c ON e.category_id = c.id
WHERE e.status = 'active' AND u.status = 'active';

CREATE VIEW booking_summary AS
SELECT 
    b.*,
    r.name as renter_name,
    r.email as renter_email,
    r.phone as renter_phone,
    l.name as lender_name,
    l.email as lender_email,
    e.name as equipment_name,
    e.brand as equipment_brand,
    e.model as equipment_model
FROM bookings b
JOIN users r ON b.renter_id = r.id
JOIN users l ON b.lender_id = l.id
JOIN equipment e ON b.equipment_id = e.id;

-- Materialized view for analytics (refresh periodically)
CREATE MATERIALIZED VIEW equipment_analytics AS
SELECT 
    e.id,
    e.name,
    e.category_id,
    c.name as category_name,
    e.owner_id,
    e.daily_rate,
    e.rating,
    e.total_bookings,
    e.total_revenue,
    e.views_count,
    (SELECT COUNT(*) FROM bookings WHERE equipment_id = e.id AND status IN ('confirmed', 'active', 'completed')) as successful_bookings,
    (SELECT AVG(total_amount) FROM bookings WHERE equipment_id = e.id AND status = 'completed') as avg_booking_value,
    e.created_at
FROM equipment e
JOIN categories c ON e.category_id = c.id;

-- Create index on materialized view
CREATE INDEX idx_equipment_analytics_category ON equipment_analytics(category_id);
CREATE INDEX idx_equipment_analytics_owner ON equipment_analytics(owner_id);

-- Sample data for categories
INSERT INTO categories (name, description, icon) VALUES
('Camera Bodies', 'DSLR and Mirrorless camera bodies', 'camera'),
('Lenses', 'Camera lenses and optics', 'focus'),
('Lighting', 'Studio lights and accessories', 'lightbulb'),
('Audio Equipment', 'Microphones and recording gear', 'mic'),
('Tripods & Support', 'Tripods, gimbals, and stabilizers', 'tripod'),
('Video Equipment', 'Cinema cameras and video gear', 'video'),
('Accessories', 'Batteries, memory cards, and other accessories', 'settings');
