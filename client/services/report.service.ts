import api from "@/lib/axios";

export const reportService = {
  reportPost: async (
    postId: string,
    payload: { reason: string; description?: string }
  ): Promise<void> => {
    await api.post(`/report/post/${postId}`, payload);
  },

  reportUser: async (
    userId: string,
    payload: { reason: string; description?: string }
  ): Promise<void> => {
    await api.post(`/report/user/${userId}`, payload);
  },
};
