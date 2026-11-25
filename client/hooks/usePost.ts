import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  postService,
  CreatePostPayload,
  UpdatePostPayload,
  Post,
} from "@/services/post.service";

// ─── useUserPosts ─────────────────────────────────────────────────────────────

export const useUserPosts = (username: string | undefined) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!username) return;
    try {
      setLoading(true);
      setError(null);
      const data = await postService.getUserPosts(username);
      setPosts(data.posts);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to load posts";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return { posts, loading, error, refetch: fetchPosts };
};

// ─── useCreatePost ────────────────────────────────────────────────────────────

export const useCreatePost = () => {
  const [creating, setCreating] = useState(false);

  const createPost = async (
    payload: CreatePostPayload
  ): Promise<Post | null> => {
    try {
      setCreating(true);
      const post = await postService.createPost(payload);
      toast.success("Post published!");
      return post;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create post";
      toast.error(message);
      return null;
    } finally {
      setCreating(false);
    }
  };

  return { createPost, creating };
};

// ─── useUpdatePost ────────────────────────────────────────────────────────────

export const useUpdatePost = () => {
  const [updating, setUpdating] = useState(false);

  const updatePost = async (
    id: string,
    payload: UpdatePostPayload
  ): Promise<Post | null> => {
    try {
      setUpdating(true);
      const post = await postService.updatePost(id, payload);
      toast.success("Post updated!");
      return post;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update post";
      toast.error(message);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  return { updatePost, updating };
};

// ─── useDeletePost ────────────────────────────────────────────────────────────

export const useDeletePost = () => {
  const [deleting, setDeleting] = useState(false);

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      await postService.deletePost(id);
      toast.success("Post deleted");
      return true;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to delete post";
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deletePost, deleting };
};
