import React, { useEffect,useState } from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  // Replace this with your actual global auth state indicator block later
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(true);

 // Check if a token already exists on application mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setUserIsAuthenticated(true);
    }
  }, []);

   const handleLoginSuccess = (username) => {
      setUserIsAuthenticated(true);
    };

 const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setUserIsAuthenticated(false);
  };

  if (userIsAuthenticated) {
      // Pass logout capability down if you want to add a logout button later
      return <Dashboard onLogout={handleLogout} />;
    }

    return <Login onLoginSuccess={handleLoginSuccess} />;
}