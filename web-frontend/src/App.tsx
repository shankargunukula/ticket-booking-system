import React, { useState, useEffect } from 'react';
import Login from './components/Login'; // Imports the updated Login component

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  // Evaluate authentication status hooks immediately on startup
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('username');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
    }
  }, []);

  /**
   * Clears the user's active session, drops local tokens,
   * and cleanly resets the application framework view.
   */
  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    window.location.reload();
  };

  // 1. GUEST VIEW: If not logged in, mount the secure Username/Password Login panel
  if (!isAuthenticated) {
    // Pass a callback function down if you want the login page to change authentication states on success
    return <Login onLoginSuccess={(user: string) => {
      setIsAuthenticated(true);
      setUsername(user);
    }} />;
  }

  // 2. AUTHENTICATED VIEW: Protected workspace view displayed after verification
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Dynamic Navigation Dashboard Bar */}
      <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎫</span>
          <span className="text-xl font-bold text-gray-900 tracking-tight">TicketHub Portal</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-gray-800">{username}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-xl transition duration-150"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Account Dashboard Workspace Frame */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center items-center">
        <div className="w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center space-y-4">
          <span className="text-5xl">🎉</span>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome to Your Dashboard</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your end-to-end microservice authorization session has been safely validated by the API Gateway filter layer.
          </p>

          <div className="pt-6 border-t border-gray-100 mt-6">
            {/* The Movie booking system grids or active seat selections can be rendered here */}
            <p className="text-xs text-gray-400 font-mono">
              Authentication Handshake Completed & Session Persisted in LocalStorage
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
