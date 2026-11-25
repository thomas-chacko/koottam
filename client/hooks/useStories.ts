import { useState, useEffect, useCallback } from "react";
import { Story, StoryGroup, storyService } from "@/services/story.service";

export const useFollowingStories = () => {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const groups = await storyService.getFollowingStories();
      setStoryGroups(groups);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return { storyGroups, loading, error, refetch: fetchStories };
};

export const useCreateStory = () => {
  const [creating, setCreating] = useState(false);

  const createStory = async (payload: {
    media_url: string;
    type?: string;
    duration?: number;
  }): Promise<Story | null> => {
    try {
      setCreating(true);
      const story = await storyService.createStory(payload);
      return story;
    } catch {
      return null;
    } finally {
      setCreating(false);
    }
  };

  return { createStory, creating };
};
