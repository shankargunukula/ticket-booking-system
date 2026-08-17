import React, { useState } from 'react';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const GATEWAY_URL = 'http://localhost:8080';

  // Helper function to generate valid Zipkin hexadecimal IDs
  const generateHexId = (length) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
  };

  // Create Zipkin/B3 Compliant metadata objects
  const createTracingHeaders = () => {
    const traceId = generateHexId(32); // 128-bit Trace ID
    const spanId = generateHexId(16);  // 64-bit Span ID

    return {
      'Content-Type': 'application/json',
      'X-B3-TraceId': traceId,
      'X-B3-SpanId': spanId,
      'X-B3-Sampled': '1' // Tells Zipkin to force log this transaction
    };
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    try {
      const response = await fetch(`${GATEWAY_URL}/notifications/otp/send`, {
        method: 'POST',
        // Inject the tracking headers into the gateway request
        headers: createTracingHeaders(),
        body: JSON.stringify({ mobileNumber }),
      });

      if (response.ok) {
        setMessage('OTP triggered through Notification Service! Check logs or browser dashboard.');
        setStep(2);
      } else {
        setError('Failed to trigger OTP delivery.');
      }
    } catch (err) {
      setError('Cannot establish link to API Edge Gateway.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    try {
      const response = await fetch(`${GATEWAY_URL}/notifications/otp/verify`, {
        method: 'POST',
        // Inject unique trace IDs for verification requests too
        headers: createTracingHeaders(),
        body: JSON.stringify({ mobileNumber, otpCode }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.jwtToken);
        setMessage('Access Granted! Successfully Logged In.');
      } else {
        setError('Invalid token input code. Verification Failed.');
      }
    } catch (err) {
      setError('Verification connection time out.');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Secure Gateway Login</h2>
        {message && <div style={styles.successMessage}>{message}</div>}
        {error && <div style={styles.errorMessage}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile Number</label>
              <input type="tel" placeholder="+919876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required style={styles.input} />
            </div>
            <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Processing...' : 'Request OTP'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input type="text" maxLength="6" placeholder="XXXXXX" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required style={styles.input} />
            </div>
            <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Authenticating...' : 'Confirm Login'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' },
  card: { background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' },
  title: { margin: '0 0 20px 0', textAlign: 'center', color: '#1f2937' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4b5563' },
  input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '16px' },
  button: { width: '100%', padding: '10px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' },
  successMessage: { padding: '10px', backgroundColor: '#def7ec', color: '#03543f', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
  errorMessage: { padding: '10px', backgroundColor: '#fde8e8', color: '#9b1c1c', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }
};

export default Login;
