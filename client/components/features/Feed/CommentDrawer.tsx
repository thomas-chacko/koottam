'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle, Loader2, Send, ChevronDown } from 'lucide-react';
import { Comment, commentService } from '@/services/comment.service';
import { useComments } from '@/hooks/useComment';
import { useCommentLike } from '@/hooks/useLike';
import { Heart } from 'lucide-react';

const timeAgo = (d: string) => {
  const n = /[Zz]|[+-]\d{2}:?\d{2}$/.test(d) ? d : d + 'Z';
  const diff = Date.now() - new Date(n).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const { isLiked, likeCount, toggleLike } = useCommentLike(comment.id, false, comment.like_count);

  const handleLoadReplies = async () => {
    if (repliesLoaded) return;
    setRepliesLoading(true);
    try {
      const loaded = await commentService.getReplies(comment.id);
      setReplies(loaded);
      setRepliesLoaded(true);
    } catch {
      // silently ignore
    } finally {
      setRepliesLoading(false);
    }
  };

  const displayName = comment.author.full_name || comment.author.username;

  return (
    <div className="flex gap-3 py-3">
      <div className="w-9 h-9 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
        {comment.author.avatar_url ? (
          <Image
            src={comment.author.avatar_url}
            alt={displayName}
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials(displayName)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-white font-semibold text-sm">{displayName}</span>
          <span className="text-[#9ca3af] text-xs">@{comment.author.username}</span>
          <span className="text-[#9ca3af] text-xs">· {timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-[#ededed] text-sm mt-1 leading-relaxed">{comment.content}</p>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1 text-xs text-[#9ca3af] hover:text-red-400 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className={isLiked ? 'text-red-500' : ''}>{likeCount}</span>
          </button>

          <button
            onClick={() => setReplyOpen((v) => !v)}
            className="text-xs text-[#9ca3af] hover:text-[#8B5CF6] transition-colors"
          >
            Reply
          </button>

          {comment.reply_count > 0 && !repliesLoaded && (
            <button
              onClick={handleLoadReplies}
              disabled={repliesLoading}
              className="flex items-center gap-1 text-xs text-[#8B5CF6] hover:underline transition-colors"
            >
              {repliesLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              View {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {replyOpen && (
          <div className="flex gap-2 mt-2">
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && replyText.trim()) {
                  try {
                    const r = await commentService.createComment(comment.post_id, replyText.trim(), comment.id);
                    setReplies((prev) => [...prev, r]);
                    setRepliesLoaded(true);
                    setReplyText('');
                    setReplyOpen(false);
                  } catch {
                    // silently ignore
                  }
                }
              }}
              placeholder="Write a reply..."
              className="flex-1 bg-[#2a2a3e] text-white text-sm rounded-full px-4 py-1.5 outline-none placeholder:text-[#9ca3af]"
            />
          </div>
        )}

        {repliesLoaded && replies.length > 0 && (
          <div className="mt-3 pl-4 border-l border-[#2a2a3e] space-y-3">
            {replies.map((reply) => {
              const rName = reply.author.full_name || reply.author.username;
              return (
                <div key={reply.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#2a2a3e] text-[#ededed] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {reply.author.avatar_url ? (
                      <Image
                        src={reply.author.avatar_url}
                        alt={rName}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(rName)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-semibold text-xs">{rName}</span>
                      <span className="text-[#9ca3af] text-xs">@{reply.author.username}</span>
                      <span className="text-[#9ca3af] text-xs">· {timeAgo(reply.created_at)}</span>
                    </div>
                    <p className="text-[#ededed] text-xs mt-0.5 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentDrawerProps {
  postId: string;
  onClose: () => void;
}

export function CommentDrawer({ postId, onClose }: CommentDrawerProps) {
  const { comments, loading, addComment } = useComments(postId);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!inputText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(inputText.trim());
      setInputText('');
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-0 md:w-[480px] h-[85vh] md:h-full bg-[#0a0a0f] border-t md:border-t-0 md:border-l border-[#2a2a3e] flex flex-col rounded-t-2xl md:rounded-none z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3e] shrink-0">
          <h2 className="text-white font-bold text-lg">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2a2a3e] transition-colors text-[#9ca3af] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="w-10 h-10 text-[#2a2a3e] mb-3" />
              <p className="text-white font-semibold">No comments yet</p>
              <p className="text-[#9ca3af] text-sm mt-1">Be the first to comment</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a3e]/50">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-[#2a2a3e] shrink-0">
          <div className="flex gap-3 items-center">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="Write a comment..."
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] text-white rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6] placeholder:text-[#9ca3af] transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || submitting}
              className="p-2.5 bg-[#8B5CF6] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7c4ee6] transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
