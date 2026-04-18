'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Repeat2, Bookmark, Share2, BadgeCheck } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const isPrimaryAvatar = (name: string) => name.length % 2 === 0;

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const avatarBg = isPrimaryAvatar(post.author.name) ? 'bg-[#8B5CF6] text-white' : 'bg-[#2a2a3e] text-[#ededed]';

  return (
    <article className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 sm:p-6 mb-4 shadow-sm hover:border-[#8B5CF6]/50 transition-colors cursor-pointer group/card">
      <header className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-lg select-none ${avatarBg}`}>
            {getInitials(post.author.name)}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <h3 className="text-white font-semibold hover:underline cursor-pointer">{post.author.name}</h3>
              {post.author.verified && (
                <BadgeCheck className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
              )}
            </div>
            <p className="text-[#9ca3af] text-sm">{post.author.username} · {post.timestamp}</p>
          </div>
        </div>

        <button className="px-4 py-1.5 bg-[#2a2a3e] text-white text-sm font-medium rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer">
          Follow
        </button>
      </header>

      <div className="mb-4">
        <p className="text-[#ededed] leading-relaxed text-[15px] sm:text-base">{post.content}</p>

        {post.image && (
          <div className="mt-4 rounded-xl overflow-hidden bg-[#2a2a3e] border border-[#2a2a3e] aspect-video relative">
            {/* If missing we just have the nicely colored border box, but since we copied images, it will load */}
            <Image
              src={post.image.replace('.jpg', '.png')}
              alt={`Image posted by ${post.author.name}: ${post.content.substring(0, 60)}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized
            />
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between pt-4 border-t border-[#2a2a3e]/50 mt-4">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className="flex items-center gap-2 p-2 sm:px-4 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#9ca3af] group-hover:text-red-400'}`}
            />
            <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-[#9ca3af] group-hover:text-red-400'}`}>{likes}</span>
          </button>

          <button 
            className="flex items-center gap-2 p-2 sm:px-4 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
            aria-label="Comment on post"
          >
            <MessageCircle className="w-5 h-5 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
            <span className="text-[#9ca3af] text-sm group-hover:text-[#8B5CF6]">{post.comments}</span>
          </button>

          <button 
            className="flex items-center gap-2 p-2 sm:px-4 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
            aria-label="Share post"
          >
            <Repeat2 className="w-5 h-5 text-[#9ca3af] group-hover:text-[#10b981]" />
            <span className="text-[#9ca3af] text-sm group-hover:text-[#10b981]">{post.shares}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip content="Save">
            <button 
              className="flex items-center gap-2 p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer group"
              aria-label="Save post"
            >
              <Bookmark className="w-5 h-5 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
            </button>
          </Tooltip>

          <Tooltip content="Share">
            <button 
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
