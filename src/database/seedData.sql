-- Seed Data for Rencam Camera Rental Platform
-- Run this after schema.sql to populate the database with sample data

-- Insert sample categories (if not already inserted)
INSERT INTO categories (name, description, is_active) VALUES
('DSLR Cameras', 'Digital Single-Lens Reflex cameras for professional photography', true),
('Mirrorless Cameras', 'Compact cameras with interchangeable lenses', true),
('Action Cameras', 'Compact, rugged cameras for adventure and sports', true),
('Professional Camcorders', 'High-end video recording equipment', true),
('Camera Lenses', 'Various lenses for different photography needs', true),
('Camera Accessories', 'Tripods, flashes, batteries and other accessories', true),
('Vintage Cameras', 'Classic film and retro digital cameras', true),
('Drone Cameras', 'Aerial photography and videography equipment', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, phone, role, status, kyc_status, address, rating, total_reviews) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440001', 'admin@rencam.com', '$2a$12$mock_hash_admin_password', 'Rencam Administrator', '+91-9876543210', 'admin', 'active', 'verified', 
 '{"street": "Tech Park", "city": "Mumbai", "state": "Maharashtra", "country": "India", "zipcode": "400001"}', 5.0, 0),

-- Sample lenders
('550e8400-e29b-41d4-a716-446655440002', 'photographer.raj@example.com', '$2a$12$mock_hash_photographer_raj', 'Raj Photography Studio', '+91-9876543211', 'lender', 'active', 'verified',
 '{"street": "Commercial Street", "city": "Bangalore", "state": "Karnataka", "country": "India", "zipcode": "560001"}', 4.8, 25),

('550e8400-e29b-41d4-a716-446655440003', 'priya.lens@example.com', '$2a$12$mock_hash_priya_lens', 'Priya Camera Collections', '+91-9876543212', 'lender', 'active', 'verified',
 '{"street": "Park Street", "city": "Kolkata", "state": "West Bengal", "country": "India", "zipcode": "700016"}', 4.9, 18),

('550e8400-e29b-41d4-a716-446655440004', 'amit.gear@example.com', '$2a$12$mock_hash_amit_gear', 'Amit Camera Rentals', '+91-9876543213', 'lender', 'active', 'verified',
 '{"street": "MG Road", "city": "Pune", "state": "Maharashtra", "country": "India", "zipcode": "411001"}', 4.7, 32),

-- Sample renters  
('550e8400-e29b-41d4-a716-446655440005', 'neha.student@example.com', '$2a$12$mock_hash_neha_student', 'Neha Sharma', '+91-9876543214', 'renter', 'active', 'verified',
 '{"street": "University Road", "city": "Delhi", "state": "Delhi", "country": "India", "zipcode": "110007"}', 4.6, 8),

('550e8400-e29b-41d4-a716-446655440006', 'karan.wedding@example.com', '$2a$12$mock_hash_karan_wedding', 'Karan Malhotra', '+91-9876543215', 'renter', 'active', 'verified',
 '{"street": "Civil Lines", "city": "Jaipur", "state": "Rajasthan", "country": "India", "zipcode": "302006"}', 4.9, 12),

('550e8400-e29b-41d4-a716-446655440007', 'sarah.travel@example.com', '$2a$12$mock_hash_sarah_travel', 'Sarah Johnson', '+91-9876543216', 'renter', 'active', 'pending',
 '{"street": "Beach Road", "city": "Chennai", "state": "Tamil Nadu", "country": "India", "zipcode": "600001"}', 0.0, 0)
ON CONFLICT (id) DO NOTHING;

-- Get category IDs for equipment insertion
-- Insert sample equipment
INSERT INTO equipment (id, owner_id, category_id, name, description, specifications, daily_rate, security_deposit, location, status, images, rating, total_reviews, total_bookings, views_count) VALUES
-- DSLR Cameras
('650e8400-e29b-41d4-a716-446655440001', 
 '550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM categories WHERE name = 'DSLR Cameras' LIMIT 1),
 'Canon EOS 5D Mark IV', 
 'Professional full-frame DSLR camera perfect for portraits and landscapes. Comes with 24-70mm f/2.8 lens.',
 '{"sensor": "Full Frame CMOS", "megapixels": 30.4, "iso_range": "100-32000", "video": "4K", "weight": "890g"}',
 250.00, 5000.00,
 '{"city": "Bangalore", "state": "Karnataka", "pincode": "560001"}',
 'available',
 '["canon-5d-1.jpg", "canon-5d-2.jpg"]',
 4.8, 15, 45, 234),

('650e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM categories WHERE name = 'DSLR Cameras' LIMIT 1),
 'Nikon D850',
 'High-resolution DSLR for professional photography with exceptional image quality.',
 '{"sensor": "Full Frame CMOS", "megapixels": 45.7, "iso_range": "64-25600", "video": "4K UHD", "weight": "1005g"}',
 280.00, 5500.00,
 '{"city": "Bangalore", "state": "Karnataka", "pincode": "560001"}',
 'available',
 '["nikon-d850-1.jpg", "nikon-d850-2.jpg"]',
 4.9, 12, 38, 189),

-- Mirrorless Cameras
('650e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440003',
 (SELECT id FROM categories WHERE name = 'Mirrorless Cameras' LIMIT 1),
 'Sony A7R V',
 'Latest mirrorless camera with incredible 61MP resolution and advanced autofocus system.',
 '{"sensor": "Full Frame CMOS", "megapixels": 61, "iso_range": "100-32000", "video": "8K", "weight": "723g"}',
 320.00, 6000.00,
 '{"city": "Kolkata", "state": "West Bengal", "pincode": "700016"}',
 'available',
 '["sony-a7r5-1.jpg", "sony-a7r5-2.jpg"]',
 5.0, 8, 24, 156),

('650e8400-e29b-41d4-a716-446655440004',
 '550e8400-e29b-41d4-a716-446655440003',
 (SELECT id FROM categories WHERE name = 'Mirrorless Cameras' LIMIT 1),
 'Fujifilm X-T5',
 'Compact mirrorless camera with film simulation modes and excellent build quality.',
 '{"sensor": "APS-C X-Trans", "megapixels": 40.2, "iso_range": "125-12800", "video": "6.2K", "weight": "557g"}',
 200.00, 4000.00,
 '{"city": "Kolkata", "state": "West Bengal", "pincode": "700016"}',
 'available',
 '["fuji-xt5-1.jpg", "fuji-xt5-2.jpg"]',
 4.7, 10, 28, 145),

-- Action Cameras
('650e8400-e29b-41d4-a716-446655440005',
 '550e8400-e29b-41d4-a716-446655440004',
 (SELECT id FROM categories WHERE name = 'Action Cameras' LIMIT 1),
 'GoPro HERO 12 Black',
 'Ultimate action camera for adventure photography and videography. Waterproof and durable.',
 '{"sensor": "1/1.9 inch", "video": "5.3K60", "waterproof": "10m", "weight": "154g", "stabilization": "HyperSmooth 6.0"}',
 80.00, 1500.00,
 '{"city": "Pune", "state": "Maharashtra", "pincode": "411001"}',
 'available',
 '["gopro-12-1.jpg", "gopro-12-2.jpg"]',
 4.8, 22, 67, 298),

-- Professional Lenses
('650e8400-e29b-41d4-a716-446655440006',
 '550e8400-e29b-41d4-a716-446655440004',
 (SELECT id FROM categories WHERE name = 'Camera Lenses' LIMIT 1),
 'Canon EF 70-200mm f/2.8L IS III',
 'Professional telephoto lens perfect for portraits, sports, and wildlife photography.',
 '{"mount": "Canon EF", "focal_length": "70-200mm", "aperture": "f/2.8", "stabilization": "Yes", "weight": "1480g"}',
 150.00, 3000.00,
 '{"city": "Pune", "state": "Maharashtra", "pincode": "411001"}',
 'available',
 '["canon-70200-1.jpg", "canon-70200-2.jpg"]',
 4.9, 18, 42, 167),

-- Drone Cameras
('650e8400-e29b-41d4-a716-446655440007',
 '550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM categories WHERE name = 'Drone Cameras' LIMIT 1),
 'DJI Mavic 3 Pro',
 'Professional drone with Hasselblad camera for stunning aerial photography and videography.',
 '{"camera": "Hasselblad L2D-20c", "video": "5.1K", "flight_time": "43 minutes", "range": "15km", "weight": "958g"}',
 350.00, 8000.00,
 '{"city": "Bangalore", "state": "Karnataka", "pincode": "560001"}',
 'available',
 '["mavic3-1.jpg", "mavic3-2.jpg"]',
 4.9, 14, 31, 203),

-- Camera Accessories
('650e8400-e29b-41d4-a716-446655440008',
 '550e8400-e29b-41d4-a716-446655440003',
 (SELECT id FROM categories WHERE name = 'Camera Accessories' LIMIT 1),
 'Manfrotto Professional Tripod Kit',
 'Sturdy carbon fiber tripod with fluid head for professional photography and videography.',
 '{"material": "Carbon Fiber", "max_height": "1.8m", "load_capacity": "12kg", "weight": "2.1kg", "head_type": "Fluid"}',
 50.00, 800.00,
 '{"city": "Kolkata", "state": "West Bengal", "pincode": "700016"}',
 'available',
 '["manfrotto-tripod-1.jpg", "manfrotto-tripod-2.jpg"]',
 4.6, 25, 58, 134)
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings (recent activity)
INSERT INTO bookings (id, equipment_id, renter_id, start_date, end_date, total_amount, status, booking_reference) VALUES
('750e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440005',
 '2024-11-15', '2024-11-18',
 750.00, 'confirmed',
 'BOOK-20241115-001'),

('750e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440005',
 '550e8400-e29b-41d4-a716-446655440006',
 '2024-11-20', '2024-11-22',
 160.00, 'pending',
 'BOOK-20241120-002'),

('750e8400-e29b-41d4-a716-446655440003',
 '650e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440007',
 '2024-11-10', '2024-11-13',
 960.00, 'completed',
 'BOOK-20241110-003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (id, reviewer_id, reviewee_id, booking_id, equipment_id, rating, review_text, review_type) VALUES
('850e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440007',
 '550e8400-e29b-41d4-a716-446655440003',
 '750e8400-e29b-41d4-a716-446655440003',
 '650e8400-e29b-41d4-a716-446655440003',
 5, 'Amazing camera quality! The Sony A7R V delivered exceptional results for my wedding shoot. Highly recommended!', 'equipment'),

('850e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440007',
 '750e8400-e29b-41d4-a716-446655440003',
 NULL,
 5, 'Professional and reliable renter. Took excellent care of the equipment. Would rent again!', 'user')
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, booking_id, payer_id, payee_id, amount, fees, net_amount, payment_method, gateway_transaction_id, status) VALUES
('950e8400-e29b-41d4-a716-446655440001',
 '750e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440007',
 '550e8400-e29b-41d4-a716-446655440003',
 960.00, 48.00, 912.00,
 'razorpay', 'pay_razorpay_12345678',
 'completed')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('a50e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440005',
 'Booking Confirmed',
 'Your booking for Canon EOS 5D Mark IV has been confirmed for Nov 15-18, 2024.',
 'booking', false),

('a50e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440006',
 'Payment Required',
 'Please complete payment for your GoPro HERO 12 booking to confirm reservation.',
 'payment', false),

('a50e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440003',
 'New Review Received',
 'You received a 5-star review from Sarah for the Sony A7R V rental!',
 'review', true)
ON CONFLICT (id) DO NOTHING;

-- Update equipment ratings based on reviews (this would normally be done by triggers)
UPDATE equipment SET 
  rating = COALESCE((
    SELECT AVG(rating::numeric) 
    FROM reviews 
    WHERE equipment_id = equipment.id AND review_type = 'equipment'
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*) 
    FROM reviews 
    WHERE equipment_id = equipment.id AND review_type = 'equipment'
  ), 0);

-- Update user ratings based on reviews
UPDATE users SET 
  rating = COALESCE((
    SELECT AVG(rating::numeric) 
    FROM reviews 
    WHERE reviewee_id = users.id AND review_type = 'user'
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*) 
    FROM reviews 
    WHERE reviewee_id = users.id AND review_type = 'user'  
  ), 0);

-- Refresh materialized views
REFRESH MATERIALIZED VIEW equipment_analytics;

-- Display summary of inserted data
SELECT 'Data insertion completed successfully!' as status;
SELECT 'Users: ' || COUNT(*) as summary FROM users;
SELECT 'Equipment: ' || COUNT(*) as summary FROM equipment;  
SELECT 'Bookings: ' || COUNT(*) as summary FROM bookings;
SELECT 'Reviews: ' || COUNT(*) as summary FROM reviews;
SELECT 'Categories: ' || COUNT(*) as summary FROM categories;
