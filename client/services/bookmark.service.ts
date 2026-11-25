import api from "@/lib/axios";
import { Post } from "@/services/post.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BookmarkStatus {
  is_bookmarked: boolean;
}

export const bookmarkService = {
  bookmark: async (postId: string): Promise<void> => {
    await api.post(`/${postId}`);
  },

  removeBookmark: async (postId: string): Promise<void> => {
    await api.delete(`/${postId}`);
  },

  getMyBookmarks: async (
    params?: Record<string, unknown>
  ): Promise<{ posts: Post[] }> => {
    const response = await api.get<ApiResponse<{ posts: Post[] }>>(
      "/my-bookmarks",
      { params }
    );
    return response.data.data;
  },

  getStatus: async (postId: string): Promise<BookmarkStatus> => {
    const response = await api.get<ApiResponse<BookmarkStatus>>(
      `/status/${postId}`
    );
    return response.data.data;
  },
};
