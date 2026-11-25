import { useState, useEffect, useCallback } from "react";
import { Post } from "@/services/post.service";
import { feedService } from "@/services/feed.service";

export const useHomeFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedService.getHomeFeed();
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { posts, loading, error, refetch: fetchFeed, setPosts };
};

export const useExploreFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedService.getExploreFeed();
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load explore feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { posts, loading, error, refetch: fetchFeed, setPosts };
};
