import axios from 'axios';

const API_BASE_URL = 'https://prepverse-backend-ltk2.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prepverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized: clear token if invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // preserve session or re-authenticate
      }
    }
    return Promise.reject(error);
  }
);
