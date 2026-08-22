// Login.jsx
import React, { useState } from 'react';
import './Login.css';

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const executeLoginSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Verifying identity...' });

    try {
      // Connects directly across to your Node.js container mapping port
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Access granted! Loading booking portal...' });
        // Clean session integration logic (e.g. saving a token or routing to dashboard) belongs here
      } else {
        setStatus({ type: 'error', message: data.error || 'Authentication rejected.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to communicate with the authentication server.' });
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Booking System</h1>
          <p>Please enter your credentials to access your account</p>
        </div>

        <form className="auth-form" onSubmit={executeLoginSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={status.type === 'info'}
          >
            {status.type === 'info' ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {status.message && (
          <div style={{ marginTop: '20px' }} className={`status-toast ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="auth-footer">
          Don't have an account?
          <a href="/register" className="auth-link">Register here</a>
        </div>
      </div>
    </div>
  );
}
