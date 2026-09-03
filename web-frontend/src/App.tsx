import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import { getItemWithExpiry, setItemWithExpiry } from './utils/storage';

export default function App() {
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = getItemWithExpiry('authToken');
    if (savedToken) {
      setToken(savedToken);
      setUserIsAuthenticated(true);
    } else {
      localStorage.removeItem('username');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (receivedToken, username) => {
    setItemWithExpiry('authToken', receivedToken);
    localStorage.setItem('username', username);
    setToken(receivedToken);
    setUserIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setToken(null);
    setUserIsAuthenticated(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}>Initializing application security...</div>;
  }

  return userIsAuthenticated ? (
    // Fixed viewport boundary window container
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', margin: 0, padding: 0 }}>

      {/* 🚀 FIXED: Isolated scrollable layout frame for your Main Dashboard Metrics */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
        <Dashboard onLogout={handleLogout} />
      </div>

      {/* Locked Right Hand Agent Panel Window Lane */}
      <div style={{
        width: '480px',
        height: '100%',
        borderLeft: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        flexShrink: 0 // Prevents the sidebar window layout from shrinking out of bounds
      }}>
        <ChatWindow token={token} />
      </div>
    </div>
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}
