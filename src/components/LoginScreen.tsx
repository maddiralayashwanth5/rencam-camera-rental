/**
 * Clean, production-ready login screen
 */

import React, { useState } from 'react';
import { Camera, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { authService, type User } from '../services/auth.service';
import { logger, LogCategory } from '../utils/logger';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endTimer = logger.startTimer('Login process');

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.user) {
        logger.info(LogCategory.AUTH, 'Login successful', { 
          userId: response.user.id,
          role: response.user.role 
        });
        onLoginSuccess(response.user);
      } else {
        setError(response.error || 'Login failed');
        logger.warn(LogCategory.AUTH, 'Login failed', { email, error: response.error });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      logger.error(LogCategory.AUTH, 'Login exception', err as Error, { email });
    } finally {
      setIsLoading(false);
      endTimer();
    }
  };

  const handleDemoLogin = async (role: 'renter' | 'lender' | 'admin') => {
    const demoCredentials = {
      renter: { email: 'renter@rencam.com', password: 'password123' },
      lender: { email: 'lender@rencam.com', password: 'password123' },
      admin: { email: 'admin@rencam.com', password: 'password123' }
    };

    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <Camera className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Rencam
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Camera Rental Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            {showDemoCredentials && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                  Demo Accounts (Click to auto-fill)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin('renter')}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Renter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin('lender')}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Lender
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
                  Password: password123
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 Rencam. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
