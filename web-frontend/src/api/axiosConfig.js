// src/api/axiosConfig.js
import axios from 'axios';

// 1. Initialize instance targeting the central Spring Cloud API Gateway
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Automatically appends the JWT bearer token before outbound transmission
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Automatically handles security failure anomalies globally (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the API Gateway throws a 401, the JWT is either expired, tampered with, or missing
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request detected. Clearing invalid authentication context.");
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');

      // Forcefully refresh the page to bump the user back to the login screen view state
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
