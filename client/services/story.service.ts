import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  type: string;
  duration: number;
  view_count: number;
  created_at: string;
  expires_at: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export interface StoryGroup {
  user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  stories: Story[];
  has_unseen: boolean;
}

export const storyService = {
  createStory: async (payload: {
    media_url: string;
    type?: string;
    duration?: number;
  }): Promise<Story> => {
    const response = await api.post<ApiResponse<{ story: Story }>>(
      "/story",
      payload
    );
    return response.data.data.story;
  },

  getFollowingStories: async (): Promise<StoryGroup[]> => {
    const response = await api.get<ApiResponse<{ groups: StoryGroup[] }>>(
      "/story/following"
    );
    return response.data.data.groups;
  },

  getUserStories: async (userId: string): Promise<Story[]> => {
    const response = await api.get<ApiResponse<{ stories: Story[] }>>(
      `/story/user/${userId}`
    );
    return response.data.data.stories;
  },

  viewStory: async (id: string): Promise<void> => {
    await api.post(`/${id}/view`);
  },

  deleteStory: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },
};
