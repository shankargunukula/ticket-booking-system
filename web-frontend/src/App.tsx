import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { getItemWithExpiry, setItemWithExpiry } from './utils/storage';

export default function App() {
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getItemWithExpiry('authToken');
    if (token) {
      setUserIsAuthenticated(true);
    } else {
      localStorage.removeItem('username');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (token, username) => {
    setItemWithExpiry('authToken', token); // Persists token with 30-min window
    localStorage.setItem('username', username);
    setUserIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setUserIsAuthenticated(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}>Initializing application security...</div>;
  }

  return userIsAuthenticated ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}
