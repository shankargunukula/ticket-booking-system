import axios from 'axios';
import { getItemWithExpiry } from '../utils/storage'; // <-- MANDATORY IMPORT

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  withCredentials: true,
});

// Outbound Request Interceptor: Inject JWT token into HTTP Header pipeline
api.interceptors.request.use(
  (config) => {
    // FIX: Extract the actual string value using the custom expiration helper
    const token = getItemWithExpiry('authToken'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Clean string token
    } else {
      localStorage.removeItem('username');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🚀 Register Response Interceptor to globally catch 401 Authentication Failures
api.interceptors.response.use(
  (response) => {
    // Pass successful API requests along instantly
    return response;
  },
  (error) => {
    // Intercept failing response payloads safely
    if (error.response && error.response.status === 401) {
      console.warn("🚨 [Network Interceptor] Received 401 Unauthorized. Evicting expired session tokens...");

      // 1. Wipe out local storage data to reset client state containers cleanly
      localStorage.removeItem('username');
      localStorage.removeItem('authToken'); // Backup cleaning if stored here as well

      // 2. Safely force-reload the page back to the base directory view.
      // This forces App.js initialization logic to recalculate and shift into Login view mode.
      window.location.href = '/';
    }

    // Return the error layout down to caller functions so catch blocks can process it if needed
    return Promise.reject(error);
  }
);

export default api;
