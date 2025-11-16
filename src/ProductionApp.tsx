/**
 * Production-ready App with authentication and role-based routing
 */

import React, { useState, useEffect } from 'react';
import { Camera, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Button } from './components/ui/button';
import { LoginScreen } from './components/LoginScreen';
import { RenterScreens } from './components/renter-screens';
import { LenderScreens } from './components/lender-screens';
import { AdminScreens } from './components/admin-screens';
import { authService, type User } from './services/auth.service';
import { logger, LogCategory } from './utils/logger';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app
  useEffect(() => {
    logger.info(LogCategory.SYSTEM, 'Application starting');
    
    // Initialize demo users
    authService.initializeDemoUsers();
    
    // Check for existing session
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      logger.info(LogCategory.AUTH, 'Session restored', { userId: user.id });
    }
    
    setIsInitialized(true);
    logger.info(LogCategory.SYSTEM, 'Application initialized');
  }, []);

  // Handle login success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
    logger.info(LogCategory.AUTH, 'User logged in', { 
      userId: user.id, 
      role: user.role 
    });
  };

  // Handle logout
  const handleLogout = () => {
    logger.info(LogCategory.AUTH, 'User logging out', { 
      userId: currentUser?.id 
    });
    authService.logout();
    setCurrentUser(null);
    setCurrentScreen('dashboard');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    logger.debug(LogCategory.UI, 'Dark mode toggled', { enabled: !isDarkMode });
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Camera className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Main application UI
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Rencam
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {currentUser.role} Portal
                </p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
                title="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentUser.role === 'renter' && (
          <RenterScreens 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentUser.role === 'lender' && (
          <LenderScreens 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentUser.role === 'admin' && (
          <AdminScreens 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 Rencam Camera Rental Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>System Online</span>
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
