// Login.jsx
import React, { useState } from 'react';
import api from '../api/axiosConfig';
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
    setStatus({ type: 'info', message: 'Verifying identity with LDAP directory...' });

    try {
     const response = await api.post('/auth/login', formData);

      if (response.status === 200 && response.data.authenticated) {
             setStatus({ type: 'success', message: 'Access granted!' });

        // Pass the returned JWT token values up to your App State container
        onLoginSuccess(response.data.username, response.data.token);
      } else {
        setStatus({ type: 'error', message: data.message || 'LDAP Verification failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to communicate with the secure Gateway layer.' });
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
