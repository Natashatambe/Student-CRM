import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling & fallback resilience
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn(`[Backend API] ${error.config?.method?.toUpperCase()} ${error.config?.url} status: ${error.response.status}`);
    } else {
      console.warn(`[Backend API] ${error.config?.method?.toUpperCase()} ${error.config?.url} offline or unreachable on ${API_BASE_URL}`);
    }
    return Promise.reject(error);
  }
);

export default api;
