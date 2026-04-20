import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// Initialize base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const baseURL = `${API_URL}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — global error toasts
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";

      if (status === 401) {
        toast.error(message || "Session expired. Please login again.");
        useAuthStore.getState().logout();
      } else if (status >= 500) {
        toast.error("Server Error: Please try again later.");
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network Error: Please check your internet connection.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default api;
