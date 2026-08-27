import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('warung_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid
      if (localStorage.getItem('warung_token')) {
        localStorage.removeItem('warung_token');
        localStorage.removeItem('warung_user');
      }
    }
    return Promise.reject(error);
  }
);
