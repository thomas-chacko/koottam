import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const likeService = {
  likePost: async (postId: string): Promise<void> => {
    await api.post(`/like/post/${postId}`);
  },

  unlikePost: async (postId: string): Promise<void> => {
    await api.delete(`/like/post/${postId}`);
  },

  likeComment: async (commentId: string): Promise<void> => {
    await api.post(`/like/comment/${commentId}`);
  },

  unlikeComment: async (commentId: string): Promise<void> => {
    await api.delete(`/like/comment/${commentId}`);
  },

  getPostLikeStatus: async (
    postId: string
  ): Promise<{ is_liked: boolean; like_count: number }> => {
    const response = await api.get<
      ApiResponse<{ is_liked: boolean; like_count: number }>
    >(`/like/status`, { params: { postId } });
    return response.data.data;
  },
};
