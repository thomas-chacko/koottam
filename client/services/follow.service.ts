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
    await api.post(`/follow/${userId}`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await api.delete(`/follow/${userId}`);
  },

  getFollowers: async (
    userId: string,
    params?: Record<string, unknown>
  ): Promise<{ users: UserProfile[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ users: UserProfile[]; total: number }>
    >(`/follow/${userId}/followers`, { params });
    return response.data.data;
  },

  getFollowing: async (
    userId: string,
    params?: Record<string, unknown>
  ): Promise<{ users: UserProfile[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ users: UserProfile[]; total: number }>
    >(`/follow/${userId}/following`, { params });
    return response.data.data;
  },

  getStatus: async (userId: string): Promise<FollowStatus> => {
    const response = await api.get<ApiResponse<FollowStatus>>(
      `/follow/status/${userId}`
    );
    return response.data.data;
  },

  getSuggestions: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<{ users: UserProfile[] }>>(
      `/follow/suggestions`
    );
    return response.data.data.users;
  },
};
