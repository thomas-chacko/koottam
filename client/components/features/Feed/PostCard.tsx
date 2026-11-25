'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Repeat2, Bookmark, Share2, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Post } from '@/services/post.service';
import { usePostLike } from '@/hooks/useLike';
import { useBookmarkStatus } from '@/hooks/useBookmark';
import { useShare } from '@/hooks/useShare';
import api from '@/lib/axios';

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

interface PostCardProps {
  post: Post;
  onCommentClick?: (postId: string) => void;
  onRemoveBookmark?: (postId: string) => void;
}

export function PostCard({ post, onCommentClick, onRemoveBookmark }: PostCardProps) {
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);

  const { isLiked, likeCount, toggleLike } = usePostLike(post.id, false, post.like_count);
  const { isBookmarked, toggleBookmark } = useBookmarkStatus(post.id);
  const { shareCount, share } = useShare(post.id, post.share_count);

  useEffect(() => {
    api.post('/view/' + post.id).catch(() => {});
  }, [post.id]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasBookmarked = isBookmarked;
    await toggleBookmark();
    if (wasBookmarked && onRemoveBookmark) {
      onRemoveBookmark(post.id);
    }
  };

  const handleCardClick = () => {
    router.push('/post/' + post.id);
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((i) => Math.max(0, i - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((i) => Math.min(post.media_urls.length - 1, i + 1));
  };

  const displayName = post.author.full_name || post.author.username;

  return (
    <article
      onClick={handleCardClick}
      className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 sm:p-6 mb-4 shadow-sm hover:border-[#8B5CF6]/50 transition-colors cursor-pointer group/card"
    >
      <header className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-lg select-none bg-[#8B5CF6] text-white overflow-hidden">
            {post.author.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={displayName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(displayName)
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <h3 className="text-white font-semibold hover:underline cursor-pointer">{displayName}</h3>
              {post.author.is_verified && (
                <BadgeCheck className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
              )}
            </div>
            <p className="text-[#9ca3af] text-sm">@{post.author.username} · {timeAgo(post.created_at)}</p>
          </div>
        </div>

        <button
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-1.5 bg-[#2a2a3e] text-white text-sm font-medium rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer"
        >
          Follow
        </button>
      </header>

      <div className="mb-4">
        <p className="text-[#ededed] leading-relaxed text-[15px] sm:text-base">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={'/hashtag/' + tag}
                className="text-[#8B5CF6] text-sm hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-4 rounded-xl overflow-hidden bg-[#2a2a3e] border border-[#2a2a3e] aspect-video relative">
            <Image
              src={post.media_urls[slideIndex]}
              alt={`Media ${slideIndex + 1} from ${displayName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized
            />
            {post.media_urls.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  disabled={slideIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleNextSlide}
                  disabled={slideIndex === post.media_urls.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 disabled:opacity-30 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.media_urls.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === slideIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between pt-4 border-t border-[#2a2a3e]/50 mt-4">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(); }}
            className="flex items-center gap-2 p-2 sm:px-4 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#9ca3af] group-hover:text-red-400'}`} />
            <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-[#9ca3af] group-hover:text-red-400'}`}>{likeCount}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onCommentClick?.(post.id); }}
            className="flex items-center gap-2 p-2 sm:px-4 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
            aria-label="Comment on post"
          >
            <MessageCircle className="w-5 h-5 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
            <span className="text-[#9ca3af] text-sm group-hover:text-[#8B5CF6]">{post.comment_count}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); share(); }}
            className="flex items-center gap-2 p-2 sm:px-4 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
            aria-label="Share post"
          >
            <Repeat2 className="w-5 h-5 text-[#9ca3af] group-hover:text-[#10b981]" />
            <span className="text-[#9ca3af] text-sm group-hover:text-[#10b981]">{shareCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip content={isBookmarked ? 'Unsave' : 'Save'}>
            <button
              onClick={handleBookmark}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#8B5CF6] text-[#8B5CF6]' : 'text-[#9ca3af] group-hover:text-[#8B5CF6]'}`} />
            </button>
          </Tooltip>

          <Tooltip content="Share">
            <button
              onClick={(e) => { e.stopPropagation(); share(); }}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
              aria-label="Copy link to post"
            >
              <Share2 className="w-5 h-5 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
            </button>
          </Tooltip>
        </div>
      </footer>
    </article>
  );
}
