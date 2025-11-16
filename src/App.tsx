import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Switch } from './components/ui/switch';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  Camera, 
  User, 
  Shield, 
  Home, 
  Search, 
  Calendar, 
  CreditCard, 
  Settings, 
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  AlertCircle,
  Loader2,
  Database
} from 'lucide-react';

// Import screen components
import { RenterScreens } from './components/renter-screens';
import { LenderScreens } from './components/lender-screens';
import { AdminScreens } from './components/admin-screens';
import { AuthScreens } from './components/auth-screens';

// Import database hooks and providers
import { DatabaseProvider, useDatabase } from './hooks/useDatabase';

// Main App component - simplified for demo
function App() {
  // Mock user for demo (bypass database connection)
  const [currentUser, setCurrentUser] = useState({
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@rencam.com',
    role: 'renter' as const
  });
  
  const [currentRole, setCurrentRole] = useState('renter' as 'renter' | 'lender' | 'admin');
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Database loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  // Database error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Database Connection Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry Connection</Button>
        </div>
      </div>
    );
  }

  // Set role based on current user if available
  React.useEffect(() => {
    if (currentUser && currentUser.role) {
      setCurrentRole(currentUser.role as 'renter' | 'lender' | 'admin');
    }
  }, [currentUser]);

  const roleColors = {
    renter: 'from-teal-500 to-blue-600',
    lender: 'from-green-500 to-emerald-600',
    admin: 'from-orange-500 to-red-600'
  };

  const roleNavigation = {
    renter: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'search', label: 'Search', icon: Search },
      { id: 'bookings', label: 'My Bookings', icon: Calendar },
      { id: 'support', label: 'Support', icon: Settings }
    ],
    lender: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'inventory', label: 'My Gear', icon: Camera },
      { id: 'requests', label: 'Requests', icon: Bell },
      { id: 'earnings', label: 'Earnings', icon: CreditCard }
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'users', label: 'Users', icon: User },
      { id: 'disputes', label: 'Disputes', icon: Shield },
      { id: 'analytics', label: 'Analytics', icon: Settings }
    ]
  };

  const renderScreen = () => {
    switch (currentRole) {
      case 'renter':
        return <RenterScreens currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />;
      case 'lender':
        return <LenderScreens currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />;
      case 'admin':
        return <AdminScreens currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />;
      default:
        return null;
    }
  };

  // Show auth screens if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        {/* Auth Header with Role Selector */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${roleColors[currentRole]} flex items-center justify-center`}>
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-medium">Rencam</span>
            </div>

            {/* Role switcher for auth */}
            <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as typeof currentRole)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="renter" className="text-teal-600 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                  Renter
                </TabsTrigger>
                <TabsTrigger value="lender" className="text-green-600 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                  Lender
                </TabsTrigger>
                <TabsTrigger value="admin" className="text-orange-600 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                  Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
        
        <AuthScreens currentRole={currentRole} onLogin={login} roleColors={roleColors} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${roleColors[currentRole]} flex items-center justify-center`}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium">Rencam</span>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Role switcher - only show if admin */}
            {currentUser?.role === 'admin' && (
              <Tabs value={currentRole} onValueChange={(value) => {
                setCurrentRole(value as typeof currentRole);
                setCurrentScreen('dashboard');
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="renter" className="text-teal-600 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                    Renter
                  </TabsTrigger>
                  <TabsTrigger value="lender" className="text-green-600 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                    Lender
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="text-orange-600 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* User status indicator */}
            {currentUser?.kyc_status === 'pending' && (
              <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
                Verification Pending
              </Badge>
            )}

            {/* Dark mode toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              <Moon className="h-4 w-4" />
            </div>

            {/* User avatar with dropdown */}
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>
                  {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container px-4 py-4 space-y-4">
              {/* User info mobile */}
              <div className="flex items-center space-x-3 pb-4 border-b">
                <Avatar>
                  <AvatarFallback>
                    {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>

              {/* KYC status mobile */}
              {currentUser?.kyc_status === 'pending' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Verification pending - you have limited access until approved.
                  </AlertDescription>
                </Alert>
              )}

              {/* Role switcher mobile - only show if admin */}
              {currentUser?.role === 'admin' && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Switch Role</label>
                  <Tabs value={currentRole} onValueChange={(value) => {
                    setCurrentRole(value as typeof currentRole);
                    setCurrentScreen('dashboard');
                    setIsMobileMenuOpen(false);
                  }}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="renter">Renter</TabsTrigger>
                      <TabsTrigger value="lender">Lender</TabsTrigger>
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Dark mode toggle mobile */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Dark Mode</span>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              {/* Logout mobile */}
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background">
          <div className="flex-1 overflow-auto py-6">
            <nav className="space-y-2 px-4">
              {roleNavigation[currentRole].map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentScreen === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      currentScreen === item.id 
                        ? currentRole === 'renter' 
                          ? 'bg-teal-50 text-teal-700 border-teal-200' 
                          : currentRole === 'lender'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                        : ''
                    }`}
                    onClick={() => setCurrentScreen(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {currentUser?.kyc_status === 'pending' && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-3">
              <div className="container px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Your account verification is pending. Some features may be limited.
                    </span>
                  </div>
                  <Button variant="link" size="sm" className="text-yellow-700 hover:text-yellow-800">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          )}
          {renderScreen()}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="flex items-center justify-around py-2">
          {roleNavigation[currentRole].map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center space-y-1 ${
                  currentScreen === item.id 
                    ? currentRole === 'renter' 
                      ? 'text-teal-600' 
                      : currentRole === 'lender'
                      ? 'text-green-600'
                      : 'text-orange-600'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setCurrentScreen(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Export the main app component (will be wrapped by AppWrapper)
export default MainApp;