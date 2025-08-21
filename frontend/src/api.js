// src/api.js
import axios from 'axios';

// ✅ Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'|| 'https://firstcraft-backend-q68n.onrender.com/api', // <-- add /api if backend uses it
  timeout: 15000, // Optional: 15s timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Optional: only needed if backend uses cookies
});

// ✅ Add request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// ❗ Optional: Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized. Token may be expired.");
      // Optional: clear token + redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      // Optional redirect
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
