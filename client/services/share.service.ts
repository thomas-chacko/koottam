import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const shareService = {
  sharePost: async (postId: string): Promise<void> => {
    await api.post(`/${postId}`);
  },

  unsharePost: async (postId: string): Promise<void> => {
    await api.delete(`/${postId}`);
  },

  getSharers: async (postId: string): Promise<{ users: unknown[] }> => {
    const response = await api.get<ApiResponse<{ users: unknown[] }>>(
      `/${postId}/sharers`
    );
    return response.data.data;
  },
};
