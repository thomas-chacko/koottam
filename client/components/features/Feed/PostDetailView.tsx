'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { Post, postService } from '@/services/post.service';
import { commentService, Comment } from '@/services/comment.service';
import { usePostLike } from '@/hooks/useLike';
import { useBookmarkStatus } from '@/hooks/useBookmark';
import { useFollowStatus, useFollowActions } from '@/hooks/useFollow';
import { useAuthStore } from '@/store/useAuthStore';
import { useShare } from '@/hooks/useShare';

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

// ── LikeBar: needs post already loaded so hooks are stable ───────────────────
function LikeBar({ post }: { post: Post }) {
  const { isLiked, likeCount, toggleLike } = usePostLike(post.id, false, post.like_count);
  const { isBookmarked, toggleBookmark } = useBookmarkStatus(post.id);
  const { share } = useShare(post.id, post.share_count);

  return (
    <div className="flex items-center justify-between py-4 border-t border-b border-[#2a2a3e] my-4">
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#9ca3af] group-hover:text-red-400'}`}
          />
          <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-[#9ca3af]'}`}>{likeCount}</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[#9ca3af] cursor-default">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comment_count}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleBookmark}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
        >
          <Bookmark
            className={`w-5 h-5 ${isBookmarked ? 'fill-[#8B5CF6] text-[#8B5CF6]' : 'text-[#9ca3af] group-hover:text-[#8B5CF6]'}`}
          />
        </button>

        <button
          onClick={share}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
        >
          <Share2 className="w-5 h-5 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
        </button>
      </div>
    </div>
  );
}

interface PostDetailViewProps {
  postId: string;
}

export function PostDetailView({ postId }: PostDetailViewProps) {
  const router = useRouter();
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [morePosts, setMorePosts] = useState<Post[]>([]);

  const { user } = useAuthStore();

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postService.getPost(postId);
      setPost(data);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const data = await commentService.getPostComments(postId);
      setComments(data.comments);
    } catch {
      // silently ignore
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  useEffect(() => {
    if (!post) return;
    postService
      .getUserPosts(post.author.username)
      .then((data) => {
        setMorePosts(data.posts.filter((p) => p.id !== postId).slice(0, 3));
      })
      .catch(() => {});
  }, [post, postId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await commentService.createComment(postId, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <p className="text-[#9ca3af]">Post not found.</p>
      </div>
    );
  }

  const authorName = post.author.full_name || post.author.username;

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full h-[calc(100vh-64px)] px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Feed */}
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-3 flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[#1a1a2e] rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">Post</h1>
            </div>

            <div className="px-4 py-4">
              {/* Media Carousel */}
              {post.media_urls.length > 0 && (
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-4">
                  <Image
                    src={post.media_urls[mediaIndex]}
                    alt="media"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {post.media_urls.length > 1 && (
                    <>
                      <button
                        onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                        disabled={mediaIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30 hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => setMediaIndex((i) => Math.min(post.media_urls.length - 1, i + 1))}
                        disabled={mediaIndex === post.media_urls.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30 hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {post.media_urls.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i === mediaIndex ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Author Row */}
              <div className="flex items-center gap-3 mb-3">
                <Link href={`/${post.author.username}`}>
                  <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden shrink-0">
                    {post.author.avatar_url ? (
                      <Image
                        src={post.author.avatar_url}
                        alt={authorName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">{getInitials(authorName)}</span>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Link href={`/${post.author.username}`} className="text-white font-bold hover:underline">
                      {authorName}
                    </Link>
                    {post.author.is_verified && (
                      <BadgeCheck className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
                    )}
                  </div>
                  <p className="text-[#9ca3af] text-sm">@{post.author.username} · {timeAgo(post.created_at)}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
                {post.content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={'/hashtag/' + tag}
                      className="text-[#8B5CF6] hover:underline text-sm"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <LikeBar post={post} />

              {/* Comments Section */}
              <h2 className="text-white font-bold text-lg mb-4">Comments</h2>

              {/* Comment Input */}
              {user && (
                <div className="flex gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {getInitials(user.full_name || user.username)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={newComment}
                      onChange={handleTextareaInput}
                      placeholder="Write a comment..."
                      rows={1}
                      className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-[#8B5CF6] resize-none placeholder-[#9ca3af] text-sm"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || submitting}
                        className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-full px-5 py-2 text-sm disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <MessageCircle className="w-10 h-10 text-[#8B5CF6] mb-3 opacity-40" />
                  <p className="text-[#9ca3af]">No comments yet</p>
                  <p className="text-[#6b7280] text-sm mt-1">Be the first to reply</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const cName = comment.author.full_name || comment.author.username;
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden shrink-0">
                          {comment.author.avatar_url ? (
                            <Image
                              src={comment.author.avatar_url}
                              alt={cName}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-xs">{getInitials(cName)}</span>
                          )}
                        </div>
                        <div className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-white font-semibold text-sm">{cName}</span>
                            {comment.author.is_verified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-[#8B5CF6] fill-[#8B5CF6]" />
                            )}
                            <span className="text-[#9ca3af] text-xs ml-1">@{comment.author.username}</span>
                            <span className="text-[#6b7280] text-xs ml-auto">{timeAgo(comment.created_at)}</span>
                          </div>
                          <p className="text-[#ededed] text-sm leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          ref={rightSidebarRef}
          className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4"
        >
          <div className="py-6 space-y-6">
            {/* Author Card */}
            <AuthorCard post={post} />

            {/* More from this author */}
            {morePosts.length > 0 && (
              <MoreFromAuthor posts={morePosts} authorName={authorName} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── AuthorCard ────────────────────────────────────────────────────────────────
function AuthorCard({ post }: { post: Post }) {
  const authorName = post.author.full_name || post.author.username;
  const { isFollowing: remoteFollowing } = useFollowStatus(post.author.id);
  const { follow, unfollow } = useFollowActions();
  const [localFollowing, setLocalFollowing] = useState<boolean | null>(null);
  const isFollowing = localFollowing !== null ? localFollowing : remoteFollowing;

  const handleFollow = async () => {
    const prev = isFollowing;
    setLocalFollowing(!prev);
    const ok = prev ? await unfollow(post.author.id) : await follow(post.author.id);
    if (!ok) setLocalFollowing(prev);
  };

  return (
    <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden mb-3">
          {post.author.avatar_url ? (
            <Image
              src={post.author.avatar_url}
              alt={authorName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xl">
              {(post.author.full_name || post.author.username).split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <Link href={`/${post.author.username}`} className="text-white font-bold hover:underline">
          {authorName}
        </Link>
        <p className="text-[#9ca3af] text-sm">@{post.author.username}</p>
      </div>

      <button
        onClick={handleFollow}
        className={`w-full py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer ${
          isFollowing
            ? 'border border-[#2a2a3e] text-white hover:border-red-400 hover:text-red-400'
            : 'bg-[#8B5CF6] text-white hover:bg-[#7c3aed]'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </section>
  );
}

// ── MoreFromAuthor ────────────────────────────────────────────────────────────
function MoreFromAuthor({ posts, authorName }: { posts: Post[]; authorName: string }) {
  return (
    <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
      <h3 className="text-white font-bold mb-3">More from {authorName}</h3>
      <div className="space-y-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/post/${p.id}`}
            className="flex gap-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-3 hover:bg-[#1a1a2e]/80 transition-colors"
          >
            {p.media_urls.length > 0 ? (
              <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden shrink-0">
                <Image
                  src={p.media_urls[0]}
                  alt="thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-[60px] h-[60px] rounded-lg bg-[#2a2a3e] shrink-0" />
            )}
            <p className="text-[#ededed] text-xs leading-relaxed line-clamp-3">
              {p.content.substring(0, 60)}{p.content.length > 60 ? '…' : ''}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
