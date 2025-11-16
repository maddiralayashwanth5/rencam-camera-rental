// App wrapper with database integration
import React from 'react';
import { DatabaseProvider, useDatabase } from './hooks/useDatabase';
import { Button } from './components/ui/button';
import { Loader2, Database, AlertTriangle } from 'lucide-react';

// Import the main App component (renamed to avoid conflicts)
import MainAppComponent from './App';

// Database connection status component
function DatabaseStatus() {
  const { isConnected, isLoading, error } = useDatabase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Connecting to database...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing Rencam services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Database Connection Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Retry Connection
              </Button>
              <div className="flex items-start space-x-2 text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Troubleshooting Tips:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Check your internet connection</li>
                    <li>• Ensure PostgreSQL is running</li>
                    <li>• Verify environment variables in .env</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Database className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600">Database not connected</p>
        </div>
      </div>
    );
  }

  // Database is connected, render the main app
  return <MainAppComponent />;
}

// Root app component with providers  
export default function AppWrapper() {
  return (
    <DatabaseProvider children={<DatabaseStatus />} />
  );
}
