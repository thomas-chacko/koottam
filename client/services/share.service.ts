import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const shareService = {
  sharePost: async (postId: string): Promise<void> => {
    await api.post(`/share/${postId}`);
  },

  unsharePost: async (postId: string): Promise<void> => {
    await api.delete(`/share/${postId}`);
  },

  getSharers: async (postId: string): Promise<{ users: unknown[] }> => {
    const response = await api.get<ApiResponse<{ users: unknown[] }>>(
      `/share/${postId}/sharers`
    );
    return response.data.data;
  },
};
