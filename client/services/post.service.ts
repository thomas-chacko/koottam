import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostAuthor {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  visibility: "public" | "followers" | "private";
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  location?: string | null;
  author: PostAuthor;
}

export interface CreatePostPayload {
  content: string;
  media_urls?: string[];
  visibility?: "public" | "followers" | "private";
  tags?: string[];
  location?: string;
}

export interface UpdatePostPayload {
  content?: string;
  media_urls?: string[];
  visibility?: "public" | "followers" | "private";
  tags?: string[];
  location?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const postService = {
  /** POST /api/v1/post/createpost — create a new post */
  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const response = await api.post<ApiResponse<{ post: Post }>>(
      "/post/createpost",
      payload
    );
    return response.data.data.post;
  },

  /** GET /api/v1/post/:id — fetch a single post */
  getPost: async (id: string): Promise<Post> => {
    const response = await api.get<ApiResponse<{ post: Post }>>(`/post/${id}`);
    return response.data.data.post;
  },

  /** PUT /api/v1/post/:id — update a post (owner only) */
  updatePost: async (id: string, payload: UpdatePostPayload): Promise<Post> => {
    const response = await api.put<ApiResponse<{ post: Post }>>(
      `/post/${id}`,
      payload
    );
    return response.data.data.post;
  },

  /** DELETE /api/v1/post/:id — delete a post (owner only) */
  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/post/${id}`);
  },

  /** GET /api/v1/post/user/:username — get all posts by a user */
  getUserPosts: async (
    username: string,
    params?: { limit?: number; offset?: number }
  ): Promise<{ posts: Post[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ posts: Post[]; total: number }>
    >(`/post/user/${username}`, { params });
    return response.data.data;
  },
};
