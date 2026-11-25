import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { followService } from "@/services/follow.service";
import { UserProfile } from "@/services/user.service";

export const useFollowStatus = (userId: string | undefined) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const status = await followService.getStatus(userId);
      setIsFollowing(status.is_following);
      setFollowersCount(status.followers_count);
      setFollowingCount(status.following_count);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { isFollowing, followersCount, followingCount, loading, refetch: fetchStatus };
};

export const useFollowActions = () => {
  const [loading, setLoading] = useState(false);

  const follow = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await followService.follow(userId);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to follow user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await followService.unfollow(userId);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unfollow user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { follow, unfollow, loading };
};

export const useFollowSuggestions = () => {
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await followService.getSuggestions();
      setSuggestions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return { suggestions, loading, error, refetch: fetchSuggestions };
};
