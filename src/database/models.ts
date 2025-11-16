// TypeScript interfaces and models for Rencam database entities

// Base interface for all entities
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// User related interfaces
export interface User extends BaseEntity {
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  role: 'renter' | 'lender' | 'admin';
  status: 'active' | 'suspended' | 'deactivated';
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_documents?: KYCDocuments;
  address?: Address;
  rating: number;
  total_reviews: number;
  last_login?: Date;
}

export interface KYCDocuments {
  identity_proof?: string;
  address_proof?: string;
  bank_details?: string;
  verification_selfie?: string;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UserSettings extends BaseEntity {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  language: string;
  timezone: string;
  currency: string;
  privacy_settings?: PrivacySettings;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private';
  show_location: boolean;
  show_phone: boolean;
  allow_contact: boolean;
}

// Category interface
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  is_active: boolean;
}

// Equipment interfaces
export interface Equipment extends BaseEntity {
  owner_id: string;
  category_id: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  daily_rate: number;
  security_deposit: number;
  status: 'active' | 'rented' | 'maintenance' | 'inactive';
  location?: Location;
  pickup_options?: PickupOptions;
  images: string[];
  specifications?: EquipmentSpecs;
  accessories?: string[];
  availability_calendar?: Record<string, boolean>;
  min_rental_days: number;
  max_rental_days: number;
  insurance_required: boolean;
  rating: number;
  total_bookings: number;
  total_revenue: number;
  views_count: number;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export interface PickupOptions {
  delivery: boolean;
  pickup: boolean;
  meetup: boolean;
  delivery_fee?: number;
  delivery_radius?: number;
}

export interface EquipmentSpecs {
  [key: string]: string | number | boolean;
}

export interface EquipmentAvailability extends BaseEntity {
  equipment_id: string;
  date: Date;
  is_available: boolean;
  price_override?: number;
  reason?: string;
}

// Booking interfaces
export interface Booking extends BaseEntity {
  booking_reference: string;
  renter_id: string;
  lender_id: string;
  equipment_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  service_fee: number;
  insurance_fee: number;
  security_deposit: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';
  pickup_method?: 'delivery' | 'pickup' | 'meetup';
  pickup_address?: Address;
  return_address?: Address;
  special_instructions?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_id?: string;
  confirmed_at?: Date;
  completed_at?: Date;
}

export interface BookingStatusHistory extends BaseEntity {
  booking_id: string;
  from_status?: string;
  to_status: string;
  changed_by?: string;
  reason?: string;
}

// Review interfaces
export interface Review extends BaseEntity {
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  equipment_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  review_type: 'renter_to_lender' | 'lender_to_renter' | 'equipment';
  is_public: boolean;
}

// Message interfaces
export interface Message extends BaseEntity {
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  booking_id?: string;
  message_text: string;
  message_type: 'text' | 'image' | 'system';
  attachments?: string[];
  is_read: boolean;
}

// Dispute interfaces
export interface Dispute extends BaseEntity {
  dispute_reference: string;
  booking_id: string;
  complainant_id: string;
  respondent_id: string;
  dispute_type: string;
  title: string;
  description: string;
  evidence?: DisputeEvidence;
  amount_disputed?: number;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolved_by?: string;
  resolved_at?: Date;
}

export interface DisputeEvidence {
  photos?: string[];
  documents?: string[];
  videos?: string[];
}

// Payment interfaces
export interface Payment extends BaseEntity {
  booking_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  payment_type: 'booking' | 'security_deposit' | 'refund' | 'payout';
  payment_method?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  currency: string;
  fees: number;
  net_amount?: number;
  processed_at?: Date;
}

// Notification interfaces
export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  related_id?: string;
  related_type?: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

// Analytics interfaces
export interface SearchAnalytics extends BaseEntity {
  user_id?: string;
  search_query: string;
  filters?: SearchFilters;
  results_count?: number;
  clicked_equipment_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SearchFilters {
  category?: string;
  price_range?: [number, number];
  location?: string;
  date_range?: [Date, Date];
  rating_min?: number;
  availability?: boolean;
}

// Extended interfaces for API responses
export interface UserWithStats extends User {
  total_bookings?: number;
  total_earnings?: number;
  active_listings?: number;
  completion_rate?: number;
}

export interface EquipmentWithDetails extends Equipment {
  owner_name: string;
  owner_rating: number;
  category_name: string;
  review_count: number;
  is_favorited?: boolean;
  availability_status?: 'available' | 'partially_available' | 'unavailable';
  next_available_date?: Date;
}

export interface BookingWithDetails extends Booking {
  renter_name: string;
  renter_email: string;
  renter_phone?: string;
  lender_name: string;
  lender_email: string;
  equipment_name: string;
  equipment_brand?: string;
  equipment_model?: string;
  equipment_images?: string[];
  reviews?: Review[];
}

// Database query interfaces
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  include?: string[];
  cache?: boolean;
  cacheTTL?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchResult<T> extends PaginatedResult<T> {
  facets?: Record<string, { value: string; count: number }[]>;
  aggregations?: Record<string, number>;
  searchTime?: number;
}

// API request/response types
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'renter' | 'lender';
  phone?: string;
  address?: Address;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar_url?: string;
  address?: Address;
}

export interface CreateEquipmentRequest {
  name: string;
  description?: string;
  category_id: string;
  brand?: string;
  model?: string;
  year?: number;
  condition: Equipment['condition'];
  daily_rate: number;
  security_deposit?: number;
  location: Location;
  pickup_options?: PickupOptions;
  images: string[];
  specifications?: EquipmentSpecs;
  accessories?: string[];
  min_rental_days?: number;
  max_rental_days?: number;
  insurance_required?: boolean;
}

export interface CreateBookingRequest {
  equipment_id: string;
  start_date: Date;
  end_date: Date;
  pickup_method?: Booking['pickup_method'];
  pickup_address?: Address;
  return_address?: Address;
  special_instructions?: string;
}

export interface EquipmentSearchQuery {
  query?: string;
  category_id?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  start_date?: Date;
  end_date?: Date;
  rating_min?: number;
  condition?: Equipment['condition'][];
  sort_by?: 'price' | 'rating' | 'distance' | 'popularity' | 'newest';
  sort_order?: 'ASC' | 'DESC';
}

// Dashboard analytics types
export interface DashboardStats {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  pendingDisputes: number;
  userGrowth: number;
  revenueGrowth: number;
}

export interface EquipmentAnalytics {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  owner_id: string;
  daily_rate: number;
  rating: number;
  total_bookings: number;
  total_revenue: number;
  views_count: number;
  successful_bookings: number;
  avg_booking_value: number;
  created_at: Date;
}

// Error types
export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  column?: string;
  constraint?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Utility types
export type EntityId = string;
export type Timestamp = Date;
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

// Generic repository interface
export interface Repository<T extends BaseEntity> {
  create(data: Omit<T, keyof BaseEntity>): Promise<T>;
  findById(id: EntityId): Promise<T | null>;
  findMany(options?: QueryOptions): Promise<PaginatedResult<T>>;
  update(id: EntityId, data: Partial<T>): Promise<T>;
  delete(id: EntityId): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}
