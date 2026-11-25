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
    const response = await api.get<ApiResponse<{ stories: any[] }>>(
      "/story/following"
    );
    // Server returns flat stories array, group by user
    const stories = response.data.data.stories ?? [];
    const groupMap = new Map<string, StoryGroup>();
    for (const s of stories) {
      if (!groupMap.has(s.user_id)) {
        groupMap.set(s.user_id, {
          user: { id: s.user_id, username: s.username, full_name: s.full_name, avatar_url: s.avatar_url },
          stories: [],
          has_unseen: false,
        });
      }
      groupMap.get(s.user_id)!.stories.push(s);
    }
    return Array.from(groupMap.values());
  },

  getUserStories: async (userId: string): Promise<Story[]> => {
    const response = await api.get<ApiResponse<{ stories: Story[] }>>(
      `/story/user/${userId}`
    );
    return response.data.data.stories;
  },

  viewStory: async (id: string): Promise<void> => {
    await api.post(`/story/${id}/view`);
  },

  deleteStory: async (id: string): Promise<void> => {
    await api.delete(`/story/${id}`);
  },
};
