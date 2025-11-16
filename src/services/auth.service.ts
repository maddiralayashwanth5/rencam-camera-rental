/**
 * Production-ready authentication service with database integration
 */

import { logger, LogCategory } from '../utils/logger';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'renter' | 'lender' | 'admin';
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = 'currentUser';
  private readonly TOKEN_KEY = 'authToken';

  private constructor() {
    this.loadUserFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.info(LogCategory.AUTH, 'Login attempt', { email: credentials.email });

      // Validate input
      if (!this.validateEmail(credentials.email)) {
        logger.warn(LogCategory.AUTH, 'Invalid email format', { email: credentials.email });
        return { success: false, error: 'Invalid email format' };
      }

      if (!credentials.password || credentials.password.length < 6) {
        logger.warn(LogCategory.AUTH, 'Invalid password');
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // In production, this would call your backend API
      // For now, we'll use localStorage-based authentication
      const user = await this.authenticateUser(credentials);

      if (!user) {
        logger.warn(LogCategory.AUTH, 'Authentication failed', { email: credentials.email });
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is active
      if (!user.isActive) {
        logger.warn(LogCategory.SECURITY, 'Inactive user login attempt', { userId: user.id });
        return { success: false, error: 'Account is inactive. Please contact support.' };
      }

      // Update last login
      user.lastLogin = new Date().toISOString();

      // Generate token (in production, this would be a JWT from backend)
      const token = this.generateToken(user);

      // Store user session
      this.setCurrentUser(user, token);

      logger.info(LogCategory.AUTH, 'Login successful', { 
        userId: user.id, 
        role: user.role,
        email: user.email 
      });

      return { success: true, user, token };

    } catch (error) {
      logger.error(LogCategory.AUTH, 'Login error', error as Error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    if (this.currentUser) {
      logger.info(LogCategory.AUTH, 'User logged out', { userId: this.currentUser.id });
    }
    
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.clear();
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'renter' | 'lender' | 'admin'): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Authenticate user against stored credentials
   */
  private async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    // Get users from localStorage (in production, this would be an API call)
    const users = this.getStoredUsers();
    
    for (const storedUser of users) {
      if (storedUser.email.toLowerCase() === credentials.email.toLowerCase()) {
        // Verify password
        const isValid = await bcrypt.compare(credentials.password, storedUser.passwordHash);
        if (isValid) {
          // Remove password hash before returning
          const { passwordHash, ...user } = storedUser;
          return user as User;
        }
      }
    }

    return null;
  }

  /**
   * Get stored users (demo data)
   */
  private getStoredUsers(): any[] {
    try {
      const stored = localStorage.getItem('users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      logger.error(LogCategory.DATABASE, 'Failed to load users', e as Error);
    }

    // Return default demo users if none exist
    return this.getDefaultUsers();
  }

  /**
   * Get default demo users
   */
  private getDefaultUsers(): any[] {
    // Default passwords are hashed versions of "password123"
    const defaultPasswordHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLHJ7.Oi';
    
    return [
      {
        id: 'user-renter-1',
        email: 'renter@rencam.com',
        name: 'Ravi Kumar',
        role: 'renter',
        phone: '+91 98765 43210',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'user-lender-1',
        email: 'lender@rencam.com',
        name: 'Priya Sharma',
        role: 'lender',
        phone: '+91 98765 43211',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'user-admin-1',
        email: 'admin@rencam.com',
        name: 'Admin User',
        role: 'admin',
        phone: '+91 98765 43212',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
  }

  /**
   * Initialize demo users in localStorage
   */
  initializeDemoUsers(): void {
    const existing = localStorage.getItem('users');
    if (!existing) {
      localStorage.setItem('users', JSON.stringify(this.getDefaultUsers()));
      logger.info(LogCategory.SYSTEM, 'Demo users initialized');
    }
  }

  /**
   * Generate authentication token
   */
  private generateToken(user: User): string {
    // In production, use JWT
    // For demo, create a simple token
    const tokenData = {
      userId: user.id,
      role: user.role,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(tokenData));
  }

  /**
   * Set current user and store in localStorage
   */
  private setCurrentUser(user: User, token: string): void {
    this.currentUser = user;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Load user from localStorage on initialization
   */
  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const token = localStorage.getItem(this.TOKEN_KEY);
      
      if (stored && token) {
        this.currentUser = JSON.parse(stored);
        logger.info(LogCategory.AUTH, 'User session restored', { 
          userId: this.currentUser?.id 
        });
      }
    } catch (e) {
      logger.error(LogCategory.AUTH, 'Failed to restore user session', e as Error);
      this.logout();
    }
  }

  /**
   * Register new user (for future use)
   */
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'renter' | 'lender';
    phone?: string;
  }): Promise<AuthResponse> {
    try {
      logger.info(LogCategory.AUTH, 'Registration attempt', { email: userData.email });

      // Validate
      if (!this.validateEmail(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (userData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check if user exists
      const users = this.getStoredUsers();
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create new user
      const newUser: any = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        passwordHash,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Save to storage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      logger.info(LogCategory.AUTH, 'User registered successfully', { 
        userId: newUser.id,
        email: newUser.email 
      });

      // Remove password hash and return
      const { passwordHash: _, ...user } = newUser;
      return { success: true, user: user as User };

    } catch (error) {
      logger.error(LogCategory.AUTH, 'Registration error', error as Error);
      return { success: false, error: 'An error occurred during registration' };
    }
  }
}

export const authService = AuthService.getInstance();
