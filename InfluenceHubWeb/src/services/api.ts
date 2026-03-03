import axios from 'axios';

// Get base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Modify config before request is sent (e.g., add auth token)
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors (401, 500 etc)
    if (error.response && error.response.status === 401) {
        // Handle unauthorized access
        console.warn('Unauthorized access. Redirecting designed to handle logout.');
    }
    return Promise.reject(error);
  }
);

export default api;
