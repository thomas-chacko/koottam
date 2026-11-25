import api from "@/lib/axios";
import { Post } from "@/services/post.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Hashtag {
  name: string;
  post_count: number;
  trending_score?: number;
}

export const hashtagService = {
  getTrending: async (): Promise<Hashtag[]> => {
    const response = await api.get<ApiResponse<{ hashtags: Hashtag[] }>>(
      "/hashtag/trending"
    );
    return response.data.data.hashtags ?? [];
  },

  getHashtagPosts: async (
    name: string,
    params?: Record<string, unknown>
  ): Promise<{ posts: Post[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ posts: Post[]; total: number }>
    >(`/hashtag/${name}/posts`, { params });
    return response.data.data;
  },

  searchHashtags: async (query: string): Promise<Hashtag[]> => {
    const response = await api.get<ApiResponse<{ hashtags: Hashtag[] }>>(
      `/hashtag/search`,
      { params: { q: query } }
    );
    return response.data.data.hashtags;
  },
};
