import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AuthResponse {
  token: string;
  message: string;
}

export const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Input Mobile, 2: Input OTP Code
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear transient message elements automatically after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  /**
   * Phase 1: Request Login Handshake OTP Code
   * Dispatches the phone number directly to the Edge API Gateway routing layers.
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Maps to the transparent development proxy endpoint configuration block
      await axios.post('/api/v1/auth/login', { phoneNumber });

      setSuccessMessage('Verification code sent successfully! Check your phone.');
      setStep(2); // Advance UI screen viewport to the entry pin code frame
    } catch (err: any) {
      setErrorMessage(
        err.response?.data || 'Failed to dispatch verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Phase 2: Submit PIN Code and Exchange for Session JWT
   * Validates code against the notification broker backend and stores credentials safely.
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post<AuthResponse>('/api/v1/auth/verify', {
        phoneNumber,
        otpCode
      });

      const { token } = response.data;

      // Store token inside secure local storage to track authentication state across sessions
      localStorage.setItem('authToken', token);
      localStorage.setItem('userMobile', phoneNumber);

      setSuccessMessage('Authentication complete! Redirecting...');

      // Redirect step or global user context refresh handler hook execution block goes here
      window.location.reload();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'The validation pin code provided is incorrect or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        {/* Header Content Section Layout */}
        <div className="text-center">
          <span className="text-4xl">🎫</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            {step === 1 ? 'Sign in with Mobile' : 'Verify Your Identity'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1
              ? 'Enter your mobile number to receive a secure one-time passcode'
              : `Enter the 4-digit code dispatched to ${phoneNumber}`}
          </p>
        </div>

        {/* Dynamic Alerts Banner Display Engine */}
        {errorMessage && (
          <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200 animate-pulse">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-200">
            ✓ {successMessage}
          </div>
        )}

        {/* Phase 1 Form: Request Token Code */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="phone-number" className="sr-only">Mobile Number</label>
                <input
                  id="phone-number"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  placeholder="+1234567890"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm font-semibold transition duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Request Passcode'}
              </button>
            </div>
          </form>
        )}

        {/* Phase 2 Form: Validate Received Code String */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="otp-code" className="sr-only">One-Time Passcode</label>
                <input
                  id="otp-code"
                  name="otp"
                  type="text"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={loading}
                  placeholder="0000"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 tracking-[0.5em] text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition duration-150"
              >
                ← Edit Phone Number
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Confirm & Log In'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
