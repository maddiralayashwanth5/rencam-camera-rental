// Simplified App component without database complexity
import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Menu, X, Sun, Moon, LogOut, User, Camera } from 'lucide-react';

// Import screen components
import { RenterScreens } from './components/renter-screens';
import { LenderScreens } from './components/lender-screens';
import { AdminScreens } from './components/admin-screens';
import { AuthScreens } from './components/auth-screens';

// Simple user type
interface SimpleUser {
  id: string;
  name: string;
  email: string;
  role: 'renter' | 'lender' | 'admin';
}

// Main App component - simplified for demo
export default function App() {
  // Mock user for demo (bypass database connection)
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [currentRole, setCurrentRole] = useState<'renter' | 'lender' | 'admin'>('renter');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Simplified authentication
  const handleLogin = (email: string, password: string) => {
    // Mock login for demo
    const role = email.includes('admin') ? 'admin' : email.includes('lender') ? 'lender' : 'renter';
    setCurrentUser({
      id: 'user-' + Date.now(),
      name: email.includes('admin') ? 'Admin User' : email.includes('lender') ? 'Lender User' : 'Renter User',
      email: email,
      role: role
    });
    setCurrentRole(role);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Show auth screen if not logged in
  if (!currentUser) {
    return (
      <AuthScreens 
        onLogin={(userData) => {
          setCurrentUser(userData);
          setCurrentRole(userData.role || 'renter');
        }}
        currentRole={currentRole}
        roleColors={{
          renter: 'blue',
          lender: 'green', 
          admin: 'purple'
        }}
      />
    );
  }

  // Navigation component
  const NavigationHeader = () => (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Rencam</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['renter', 'lender', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentRole === role
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{currentUser.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Role Switcher */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Switch Role:</p>
              <div className="flex space-x-2">
                {(['renter', 'lender', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentRole === role
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{currentUser.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="p-2"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <NavigationHeader />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentRole === 'renter' && (
          <RenterScreens 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentRole === 'lender' && (
          <LenderScreens 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        {currentRole === 'admin' && (
          <AdminScreens 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
      </main>
    </div>
  );
}
