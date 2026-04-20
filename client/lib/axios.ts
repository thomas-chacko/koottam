import axios, { AxiosError } from "axios";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// Base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const baseURL = `${API_URL}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Show global loading state
    useAppStore.getState().setLoading(true);

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    useAppStore.getState().setLoading(false);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Hide global loading state
    useAppStore.getState().setLoading(false);
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    useAppStore.getState().setLoading(false);

    // Global Error Handling using Sonner toast
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";

      if (status === 401) {
        toast.error(message || "Session expired. Please login again.");
        useAuthStore.getState().logout();
        // Redirect logic can be added here if needed, or handled inside private route guards
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
