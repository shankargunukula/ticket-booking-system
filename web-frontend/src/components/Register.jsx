// Register.jsx
import React, { useState } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    mobile: '',
    password: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Provisioning account...' });

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Registration complete! You may now sign in.' });
        setFormData({ username: '', firstName: '', lastName: '', mobile: '', password: '' }); // Reset
      } else {
        setStatus({ type: 'error', message: data.error || 'Registration rejected.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network connection lost. Try again later.' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>System Registration</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="text" name="username" value={formData.username} placeholder="Username" onChange={handleChange} required />
        <input type="text" name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} required />
        <input type="tel" name="mobile" value={formData.mobile} placeholder="Mobile Number (e.g. +919876543210)" onChange={handleChange} required />
        <input type="password" name="password" value={formData.password} placeholder="Password (Min 8 characters)" onChange={handleChange} required />

        <button type="submit" style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create Account
        </button>
      </form>

      {status.message && (
        <p style={{
          marginTop: '16px',
          padding: '8px',
          borderRadius: '4px',
          textAlign: 'center',
          color: status.type === 'success' ? 'green' : status.type === 'info' ? 'blue' : 'red',
          backgroundColor: status.type === 'success' ? '#e6f4ea' : status.type === 'info' ? '#e8f0fe' : '#fce8e6'
        }}>
          {status.message}
        </p>
      )}
    </div>
  );
}
