import { useState, useEffect, useCallback } from "react";
import { bookmarkService } from "@/services/bookmark.service";
import { Post } from "@/services/post.service";

export const useBookmarkStatus = (postId: string, initialStatus?: boolean) => {
  const [isBookmarked, setIsBookmarked] = useState(initialStatus ?? false);

  const toggleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      if (prev) {
        await bookmarkService.removeBookmark(postId);
      } else {
        await bookmarkService.bookmark(postId);
      }
    } catch {
      setIsBookmarked(prev);
    }
  };

  return { isBookmarked, toggleBookmark };
};

export const useMyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookmarkService.getMyBookmarks();
      setBookmarks(data.posts);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const removeBookmark = async (postId: string): Promise<void> => {
    await bookmarkService.removeBookmark(postId);
    setBookmarks((prev) => prev.filter((p) => p.id !== postId));
  };

  return { bookmarks, loading, error, refetch: fetchBookmarks, removeBookmark };
};
