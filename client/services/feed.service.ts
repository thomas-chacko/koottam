import api from "@/lib/axios";
import { Post } from "@/services/post.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const feedService = {
  getHomeFeed: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ posts: Post[]; total: number }>
    >("/feed/home", { params });
    return response.data.data;
  },

  getExploreFeed: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ posts: Post[]; total: number }>
    >("/feed/explore", { params });
    return response.data.data;
  },
};
