import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PrivacySettings {
  is_private: boolean;
  allow_mentions: string;
  allow_dms: string;
}

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  messages: boolean;
}

export interface BlockedUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  blocked_at: string;
}

export const settingsService = {
  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const response = await api.get<ApiResponse<PrivacySettings>>(
      "/settings/privacy"
    );
    return response.data.data;
  },

  updatePrivacySettings: async (
    payload: Partial<PrivacySettings>
  ): Promise<PrivacySettings> => {
    const response = await api.put<ApiResponse<PrivacySettings>>(
      "/settings/privacy",
      payload
    );
    return response.data.data;
  },

  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get<ApiResponse<NotificationSettings>>(
      "/settings/notifications"
    );
    return response.data.data;
  },

  updateNotificationSettings: async (
    payload: Partial<NotificationSettings>
  ): Promise<NotificationSettings> => {
    const response = await api.put<ApiResponse<NotificationSettings>>(
      "/settings/notifications",
      payload
    );
    return response.data.data;
  },

  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    const response = await api.get<ApiResponse<{ users: BlockedUser[] }>>(
      "/settings/blocked-users"
    );
    return response.data.data.users;
  },

  blockUser: async (userId: string): Promise<void> => {
    await api.post(`/settings/block/${userId}`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await api.delete(`/settings/unblock/${userId}`);
  },
};
