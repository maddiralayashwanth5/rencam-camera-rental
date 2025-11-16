// Frontend database implementation for React development
// This provides the same interface as the backend database but with mock data

import { User, Equipment, Booking, Review, Category } from './models';

// Sample data for development
const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@rencam.com',
    password_hash: '$2a$12$mock_hash',
    name: 'Rencam Administrator',
    phone: '+91-9876543210',
    role: 'admin',
    status: 'active',
    kyc_status: 'verified',
    address: {
      street: 'Tech Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '400001'
    },
    rating: 5.0,
    total_reviews: 0,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'photographer.raj@example.com',
    password_hash: '$2a$12$mock_hash',
    name: 'Raj Photography Studio',
    phone: '+91-9876543211',
    role: 'lender',
    status: 'active',
    kyc_status: 'verified',
    address: {
      street: 'Commercial Street',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postal_code: '560001'
    },
    rating: 4.8,
    total_reviews: 25,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'neha.student@example.com',
    password_hash: '$2a$12$mock_hash',
    name: 'Neha Sharma',
    phone: '+91-9876543214',
    role: 'renter',
    status: 'active',
    kyc_status: 'verified',
    address: {
      street: 'University Road',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postal_code: '110007'
    },
    rating: 4.6,
    total_reviews: 8,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01')
  }
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'DSLR Cameras',
    description: 'Digital Single-Lens Reflex cameras for professional photography',
    icon: 'camera',
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Mirrorless Cameras',
    description: 'Compact cameras with interchangeable lenses',
    icon: 'camera',
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Action Cameras',
    description: 'Compact, rugged cameras for adventure and sports',
    icon: 'video',
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

const mockEquipment: Equipment[] = [
  {
    id: '650e8400-e29b-41d4-a716-446655440001',
    owner_id: '550e8400-e29b-41d4-a716-446655440002',
    category_id: '1',
    name: 'Canon EOS 5D Mark IV',
    description: 'Professional full-frame DSLR camera perfect for portraits and landscapes. Comes with 24-70mm f/2.8 lens.',
    specifications: {
      sensor: 'Full Frame CMOS',
      megapixels: 30.4,
      iso_range: '100-32000',
      video: '4K',
      weight: '890g'
    },
    daily_rate: 250.00,
    security_deposit: 5000.00,
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India'
    },
    status: 'active',
    images: ['canon-5d-1.jpg', 'canon-5d-2.jpg'],
    rating: 4.8,
    total_reviews: 15,
    total_bookings: 45,
    views_count: 234,
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10')
  },
  {
    id: '650e8400-e29b-41d4-a716-446655440003',
    owner_id: '550e8400-e29b-41d4-a716-446655440002',
    category_id: '2',
    name: 'Sony A7R V',
    description: 'Latest mirrorless camera with incredible 61MP resolution and advanced autofocus system.',
    specifications: {
      sensor: 'Full Frame CMOS',
      megapixels: 61,
      iso_range: '100-32000',
      video: '8K',
      weight: '723g'
    },
    daily_rate: 320.00,
    security_deposit: 6000.00,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    status: 'active',
    images: ['sony-a7r5-1.jpg', 'sony-a7r5-2.jpg'],
    rating: 5.0,
    total_reviews: 8,
    total_bookings: 24,
    views_count: 156,
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20')
  }
];

// Frontend database service
export class FrontendDatabaseService {
  private connected = false;
  private currentUser: User | null = null;

  // Initialize connection (mock)
  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connected = true;
    console.log('🎭 Frontend database connected (mock)');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.currentUser = null;
    console.log('🎭 Frontend database disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      this.currentUser = user;
      console.log(`🎭 Mock login successful for ${email}`);
      return user;
    }
    
    console.log(`🎭 Mock login failed for ${email}`);
    throw new Error('Invalid email or password');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    console.log('🎭 User logged out');
  }

  // Equipment search
  async searchEquipment(query?: string, filters: any = {}): Promise<{
    equipment: Equipment[];
    total: number;
    facets: any;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let results = [...mockEquipment];
    
    // Filter by query
    if (query) {
      results = results.filter(eq => 
        eq.name.toLowerCase().includes(query.toLowerCase()) ||
        (eq.description && eq.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filter by price range
    if (filters.price_min !== undefined) {
      results = results.filter(eq => eq.daily_rate >= filters.price_min);
    }
    if (filters.price_max !== undefined) {
      results = results.filter(eq => eq.daily_rate <= filters.price_max);
    }
    
    // Filter by category
    if (filters.category) {
      const category = mockCategories.find(c => c.name === filters.category);
      if (category) {
        results = results.filter(eq => eq.category_id === category.id);
      }
    }
    
    console.log(`🎭 Mock search for "${query}" returned ${results.length} results`);
    
    return {
      equipment: results,
      total: results.length,
      facets: {
        categories: mockCategories.map(c => ({
          name: c.name,
          count: results.filter(eq => eq.category_id === c.id).length
        })),
        price_ranges: [
          { min: 0, max: 200, count: results.filter(eq => eq.daily_rate <= 200).length },
          { min: 200, max: 500, count: results.filter(eq => eq.daily_rate > 200 && eq.daily_rate <= 500).length },
          { min: 500, max: 1000, count: results.filter(eq => eq.daily_rate > 500).length }
        ]
      }
    };
  }

  // Get user bookings
  async getUserBookings(userId: string, type: 'renter' | 'lender'): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return empty array for now - can be extended with mock booking data
    console.log(`🎭 Getting ${type} bookings for user ${userId}`);
    return [];
  }

  // Create booking
  async createBooking(userId: string, bookingData: any): Promise<Booking> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const booking: Booking = {
      id: 'mock-booking-' + Date.now(),
      equipment_id: bookingData.equipment_id,
      renter_id: userId,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      total_amount: bookingData.total_amount || 500,
      status: 'pending',
      booking_reference: 'BOOK-' + Date.now(),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('🎭 Mock booking created:', booking.booking_reference);
    return booking;
  }

  // Dashboard data
  async getDashboardData(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      stats: {
        totalBookings: 12,
        activeBookings: 3,
        totalRevenue: 15000,
        avgRating: 4.8
      },
      recentActivity: [
        {
          id: '1',
          type: 'booking',
          message: 'New booking for Canon EOS 5D Mark IV',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '2',
          type: 'review',
          message: 'Received 5-star review from Neha Sharma',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        }
      ]
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    return {
      status: 'healthy',
      details: {
        database: 'frontend-mock',
        connected: this.connected,
        users: mockUsers.length,
        equipment: mockEquipment.length,
        currentUser: this.currentUser?.email || 'none'
      }
    };
  }
}

// Export singleton instance
export const frontendDb = new FrontendDatabaseService();
