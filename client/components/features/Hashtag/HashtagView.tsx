'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Hash, TrendingUp, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostCard } from '@/components/features/Feed/PostCard';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { useHashtagPosts, useTrendingHashtags } from '@/hooks/useHashtag';

interface HashtagViewProps {
  tag: string;
}

export function HashtagView({ tag }: HashtagViewProps) {
  const router = useRouter();
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const { posts, loading } = useHashtagPosts(tag);
  const { hashtags } = useTrendingHashtags();

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
              <h1 className="text-xl font-bold text-white">#{tag}</h1>
            </div>

            {/* Post Count */}
            <div className="px-4 py-3 border-b border-[#2a2a3e]">
              <p className="text-[#9ca3af] text-sm">{posts.length} posts</p>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Hash className="w-12 h-12 text-[#8B5CF6] mb-4 opacity-40" />
                <p className="text-white font-semibold text-lg">No posts yet</p>
                <p className="text-[#9ca3af] text-sm mt-1">Be the first to post with #{tag}</p>
              </div>
            ) : (
              <div className="py-2">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} onCommentClick={() => {}} />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          ref={rightSidebarRef}
          className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4"
        >
          <div className="py-6 space-y-6">
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="text-white font-bold text-lg">Trending</h2>
              </div>

              <div className="space-y-1">
                {hashtags.slice(0, 8).map((h) => (
                  <Link
                    key={h.name}
                    href={'/hashtag/' + h.name}
                    className="flex items-center justify-between py-2 hover:text-[#8B5CF6] transition-colors group"
                  >
                    <span className="text-white group-hover:text-[#8B5CF6] font-medium">#{h.name}</span>
                    <span className="text-[#9ca3af] text-xs">{h.post_count} posts</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
