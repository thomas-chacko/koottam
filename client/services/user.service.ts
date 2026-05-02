import api from "@/lib/axios";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  website: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_private: boolean;
  email_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  cover_url?: string;
  is_private?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userService = {
  // Get user profile by username
  getProfile: async (username: string): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>(
      `/user/${username}`
    );
    return response.data.data.user;
  },

  // Update current user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<{ user: UserProfile }>>(
      "/user",
      data
    );
    return response.data.data.user;
  },

  // Delete user account
  deleteAccount: async (): Promise<void> => {
    await api.delete("/user");
  },
};
