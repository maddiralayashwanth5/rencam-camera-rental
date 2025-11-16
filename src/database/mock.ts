// Mock database implementation for frontend development
// This simulates database operations without requiring PostgreSQL

import { User, Equipment, Booking, Review, Category } from './models';

// Mock data storage
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
      zipcode: '400001'
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
      zipcode: '560001'
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
      zipcode: '110007'
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
      pincode: '560001'
    },
    status: 'available',
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
      pincode: '400001'
    },
    status: 'available',
    images: ['sony-a7r5-1.jpg', 'sony-a7r5-2.jpg'],
    rating: 5.0,
    total_reviews: 8,
    total_bookings: 24,
    views_count: 156,
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20')
  }
];

// Mock database connection class
export class MockDatabaseConnection {
  private connected = false;

  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection time
    this.connected = true;
    console.log('🎭 Mock database connected');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('🎭 Mock database disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async query<T = any>(query: string, params?: any[]): Promise<{ rows: T[] }> {
    console.log('🎭 Mock query:', query.substring(0, 50) + '...');
    
    // Simulate different query responses
    if (query.includes('SELECT * FROM users WHERE email')) {
      const email = params?.[0];
      const user = mockUsers.find(u => u.email === email);
      return { rows: user ? [user as T] : [] };
    }
    
    if (query.includes('SELECT COUNT(*) FROM users')) {
      return { rows: [{ count: mockUsers.length } as T] };
    }
    
    if (query.includes('SELECT * FROM equipment')) {
      return { rows: mockEquipment as T[] };
    }
    
    if (query.includes('SELECT * FROM categories')) {
      return { rows: mockCategories as T[] };
    }

    // Default empty response
    return { rows: [] };
  }

  // Mock health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    return {
      status: 'healthy',
      details: {
        database: 'mock',
        connected: this.connected,
        users: mockUsers.length,
        equipment: mockEquipment.length
      }
    };
  }
}

// Mock authentication functions
export const mockAuth = {
  async authenticate(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate auth delay
    
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      // In real implementation, we'd verify password
      console.log(`🎭 Mock login successful for ${email}`);
      return user;
    }
    
    console.log(`🎭 Mock login failed for ${email}`);
    return null;
  },

  async hashPassword(password: string): Promise<string> {
    return `$2a$12$mock_hash_${password.length}_characters`;
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return hash.includes(`_${password.length}_characters`);
  }
};

// Mock equipment search
export const mockEquipmentSearch = {
  async search(query: string, filters: any = {}): Promise<{
    equipment: Equipment[];
    total: number;
    facets: any;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate search delay
    
    let results = [...mockEquipment];
    
    // Filter by query
    if (query) {
      results = results.filter(eq => 
        eq.name.toLowerCase().includes(query.toLowerCase()) ||
        eq.description.toLowerCase().includes(query.toLowerCase())
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
};

// Export mock database instance
export const mockDb = new MockDatabaseConnection();
