import axios from "axios";

// Automatically use the development backend URL during local dev
// Use /api as default for production Vercel if VITE_API_URL is not set
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_URL.startsWith('http') ? API_URL : API_URL.startsWith('/') ? API_URL : `/${API_URL}`,
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Error parsing user info from local storage", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

