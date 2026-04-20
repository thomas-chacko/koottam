import api from "@/lib/axios";
import { User } from "@/store/useAuthStore";

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  signup: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", userData);
    return response.data;
  },
};
