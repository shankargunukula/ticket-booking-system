// Login.jsx
import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  // Toggle state between Login view (false) and Registration view (true)
  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    mobile: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: isRegistering ? 'Provisioning account...' : 'Verifying identity...' });

    // Switch endpoints dynamically based on the current view state
    // Inside your handleFormSubmit execution loop in Login.jsx:
    const endpoint = isRegistering
      ? 'http://localhost:8080/api/v1/auth/register' // Targets Gateway Port 8080
      : 'http://localhost:8080/api/v1/auth/login';


    // Prepare payload depending on whether we are registering or logging in
    const payload = isRegistering
      ? formData
      : { username: formData.username, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setStatus({ type: 'success', message: 'Registration complete! You may now sign in.' });
          // Clear non-essential fields and flip view over to Sign In mode automatically
          setFormData(prev => ({ ...prev, password: '', firstName: '', lastName: '', mobile: '' }));
          setIsRegistering(false);
        } else {
          setStatus({ type: 'success', message: 'Access granted! Loading booking portal...' });

          // Persist token and identity parameters locally matching App.tsx expectations
          localStorage.setItem('authToken', data.token || 'mock_token_value');
          localStorage.setItem('username', formData.username);

          // Trigger root App.tsx state alteration to immediately enter dashboard workspace
          if (onLoginSuccess) {
            onLoginSuccess(formData.username);
          }
        }
      } else {
        setStatus({ type: 'error', message: data.error || 'Authentication rejected.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to communicate with the authentication server.' });
    }
  };

  // Reset status alerts when the user jumps back and forth between forms
  const toggleViewMode = (e) => {
    e.preventDefault();
    setIsRegistering(!isRegistering);
    setStatus({ type: '', message: '' });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Booking System</h1>
          <p>{isRegistering ? 'Create your new directory account' : 'Please enter your credentials to access your account'}</p>
        </div>

        <form className="auth-form" onSubmit={handleFormSubmit}>
          {/* REGISTRATION ONLY FIELDS: First & Last Names */}
          {isRegistering && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {/* BASE COMMON FIELDS: Username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* REGISTRATION ONLY FIELD: Mobile Number */}
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                placeholder="e.g., +919876543210"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* BASE COMMON FIELDS: Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={status.type === 'info'}
          >
            {status.type === 'info'
              ? (isRegistering ? 'Registering...' : 'Signing In...')
              : (isRegistering ? 'Register' : 'Sign In')}
          </button>
        </form>

        {status.message && (
          <div style={{ marginTop: '20px' }} className={`status-toast ${status.type}`}>
            {status.message}
          </div>
        )}

        {/* Dynamic Navigation Footer Footer Toggle Links */}
        <div className="auth-footer">
          {isRegistering ? (
            <>
              Already have an account?
              <span onClick={toggleViewMode} className="auth-link">Sign in here</span>
            </>
          ) : (
            <>
              Don't have an account?
              <span onClick={toggleViewMode} className="auth-link">Register here</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
