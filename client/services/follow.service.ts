import api from "@/lib/axios";
import { UserProfile } from "@/services/user.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FollowStatus {
  is_following: boolean;
  followers_count: number;
  following_count: number;
}

export const followService = {
  follow: async (userId: string): Promise<void> => {
    await api.post(`/${userId}`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await api.delete(`/${userId}`);
  },

  getFollowers: async (
    userId: string,
    params?: Record<string, unknown>
  ): Promise<{ users: UserProfile[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ users: UserProfile[]; total: number }>
    >(`/${userId}/followers`, { params });
    return response.data.data;
  },

  getFollowing: async (
    userId: string,
    params?: Record<string, unknown>
  ): Promise<{ users: UserProfile[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ users: UserProfile[]; total: number }>
    >(`/${userId}/following`, { params });
    return response.data.data;
  },

  getStatus: async (userId: string): Promise<FollowStatus> => {
    const response = await api.get<ApiResponse<FollowStatus>>(
      `/status/${userId}`
    );
    return response.data.data;
  },

  getSuggestions: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<{ users: UserProfile[] }>>(
      `/suggestions`
    );
    return response.data.data.users;
  },
};
