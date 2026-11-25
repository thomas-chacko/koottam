import { useState, useEffect, useCallback } from "react";
import { Hashtag, hashtagService } from "@/services/hashtag.service";
import { Post } from "@/services/post.service";

export const useTrendingHashtags = () => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hashtagService.getTrending();
        setHashtags(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load trending hashtags");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { hashtags, loading, error };
};

export const useHashtagPosts = (name: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!name) return;
    try {
      setLoading(true);
      setError(null);
      const data = await hashtagService.getHashtagPosts(name);
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load hashtag posts");
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};
