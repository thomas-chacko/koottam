import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export const commentService = {
  createComment: async (
    postId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> => {
    const body: { content: string; parent_id?: string } = { content };
    if (parentId) body.parent_id = parentId;
    const response = await api.post<ApiResponse<{ comment: Comment }>>(
      `/comment/${postId}`,
      body
    );
    return response.data.data.comment;
  },

  getPostComments: async (
    postId: string,
    params?: Record<string, unknown>
  ): Promise<{ comments: Comment[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ comments: Comment[]; total: number }>
    >(`/comment/post/${postId}`, { params });
    return response.data.data;
  },

  getReplies: async (commentId: string): Promise<Comment[]> => {
    const response = await api.get<ApiResponse<{ comments: Comment[] }>>(
      `/comment/${commentId}/replies`
    );
    return response.data.data.comments;
  },

  updateComment: async (id: string, content: string): Promise<Comment> => {
    const response = await api.put<ApiResponse<{ comment: Comment }>>(
      `/comment/${id}`,
      { content }
    );
    return response.data.data.comment;
  },

  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/comment/${id}`);
  },
};
