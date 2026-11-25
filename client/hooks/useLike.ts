import { useState } from "react";
import { likeService } from "@/services/like.service";

export const usePostLike = (
  postId: string,
  initialLiked: boolean,
  initialCount: number
) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  const toggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likeCount;
    // optimistic update
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      if (prevLiked) {
        await likeService.unlikePost(postId);
      } else {
        await likeService.likePost(postId);
      }
    } catch {
      // revert on failure
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  return { isLiked, likeCount, toggleLike };
};

export const useCommentLike = (
  commentId: string,
  initialLiked: boolean,
  initialCount: number
) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  const toggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      if (prevLiked) {
        await likeService.unlikeComment(commentId);
      } else {
        await likeService.likeComment(commentId);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  return { isLiked, likeCount, toggleLike };
};
