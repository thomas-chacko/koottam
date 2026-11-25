import { useState, useEffect, useCallback } from "react";
import { Comment, commentService } from "@/services/comment.service";

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getPostComments(postId);
      setComments(data.comments);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string): Promise<void> => {
    const comment = await commentService.createComment(postId, content, parentId);
    setComments((prev) => [comment, ...prev]);
  };

  const deleteComment = async (id: string): Promise<void> => {
    await commentService.deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return { comments, loading, error, refetch: fetchComments, addComment, deleteComment };
};
