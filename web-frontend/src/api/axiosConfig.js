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


// Response Interceptor: Catches 401 Unauthorized exceptions globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('username');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
