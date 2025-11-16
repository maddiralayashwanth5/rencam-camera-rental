// React hooks for database operations - Frontend implementation
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { frontendDb } from '../database/frontend-db';
import { User, Equipment, Booking } from '../database/models';

// Database Context
interface DatabaseContextType {
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Current user
  currentUser: User | null;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

// Create context
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Database Provider Component
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize database connection
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize frontend database connection
        await frontendDb.connect();
        
        // Clear any existing session for fresh start in mock mode
        localStorage.removeItem('rencam_user');
        console.log('🎭 Mock database ready - please login to continue');
        
        setIsConnected(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Database connection failed');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();

    // Cleanup on unmount
    return () => {
      frontendDb.disconnect().catch(console.error);
    };
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      setError(null);
      const user = await frontendDb.authenticate(email, password);
      
      if (user) {
        setCurrentUser(user);
        // Save to localStorage
        localStorage.setItem('rencam_user', JSON.stringify(user));
        return user;
      } else {
        setError('Invalid email or password');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('rencam_user');
    frontendDb.logout();
  }, []);

  const contextValue: DatabaseContextType = {
    isConnected,
    isLoading,
    error,
    currentUser,
    login,
    logout
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook to use database context
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Hook for equipment search
export function useEquipmentSearch() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEquipment = useCallback(async (query?: string, filters: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await frontendDb.searchEquipment(query, filters);
      setEquipment(result.equipment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    equipment,
    searchEquipment,
    isLoading,
    error
  };
}

// Hook for user bookings
export function useUserBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await frontendDb.getUserBookings(userId, 'renter');
        setBookings(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  return {
    bookings,
    isLoading,
    error
  };
}

// Hook for dashboard data
export function useDashboardData(userId?: string) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await frontendDb.getDashboardData(userId);
        setDashboardData(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  return {
    dashboardData,
    isLoading,
    error
  };
}

// Hook for creating bookings
export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (userId: string, bookingData: any): Promise<Booking | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const booking = await frontendDb.createBooking(userId, bookingData);
      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createBooking,
    isLoading,
    error
  };
}

// Simple error fallback component
export function DatabaseErrorFallback({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Database Connection Error
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>{error.message}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={retry || (() => window.location.reload())}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}
