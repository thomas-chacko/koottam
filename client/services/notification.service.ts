import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  post_id?: string;
  comment_id?: string;
}

export const notificationService = {
  getNotifications: async (
    params?: Record<string, unknown>
  ): Promise<{ notifications: Notification[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ notifications: Notification[]; total: number }>
    >("/notification", { params });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/notification/unread-count"
    );
    return response.data.data;
  },

  markRead: async (id: string): Promise<void> => {
    await api.patch(`/notification/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await api.patch("/notification/read-all");
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notification/${id}`);
  },
};
