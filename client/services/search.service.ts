import api from "@/lib/axios";
import { UserProfile } from "./user.service";

export interface SearchResults {
  users: UserProfile[];
  posts: any[];
  locations: any[];
}

export const searchService = {
  // Global search across multiple entities
  globalSearch: async (query: string): Promise<SearchResults> => {
    if (!query) return { users: [], posts: [], locations: [] };
    const response = await api.get<{ success: boolean; message: string; data: SearchResults }>(
      `/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data;
  },
};
