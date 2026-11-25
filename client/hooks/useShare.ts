import { useState } from "react";
import { shareService } from "@/services/share.service";

export const useShare = (postId: string, initialCount: number) => {
  const [shareCount, setShareCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const share = async (): Promise<void> => {
    try {
      setLoading(true);
      await shareService.sharePost(postId);
      setShareCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  };

  const unshare = async (): Promise<void> => {
    try {
      setLoading(true);
      await shareService.unsharePost(postId);
      setShareCount((c) => Math.max(0, c - 1));
    } finally {
      setLoading(false);
    }
  };

  return { shareCount, share, unshare, loading };
};
