'use client';

import { useState, useRef, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostCard } from '../Feed/PostCard';
import { MoreHorizontal, Search, Bookmark, Loader2 } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { useMyBookmarks } from '@/hooks/useBookmark';
import { useAuthStore } from '@/store/useAuthStore';

export function BookmarksFeed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  const { bookmarks, loading, removeBookmark } = useMyBookmarks();
  const authUser = useAuthStore((s) => s.user);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return bookmarks;
    return bookmarks.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q)
    );
  }, [bookmarks, query]);

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full h-[calc(100vh-64px)] px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Feed Content */}
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full pb-12">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col w-full border-b border-[#2a2a3e]">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Bookmarks</h1>
                  <p className="text-xs text-[#9ca3af] font-medium mt-0.5">
                    {authUser ? `@${authUser.username}` : ''}
                  </p>
                </div>
                <button
                  className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer group"
                  aria-label="Settings"
                >
                  <MoreHorizontal className="w-5 h-5 text-[#ededed]" />
                </button>
              </div>
            </div>

            {/* Local Search */}
            <div className="p-4 py-3 border-b border-[#2a2a3e] shrink-0">
              <div className="relative flex items-center bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden transition-all duration-300 rounded-full cursor-text group focus-within:border-[#8B5CF6]">
                <div className="pl-4 pr-3 py-2.5 text-[#9ca3af] group-focus-within:text-[#8B5CF6] transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Bookmarks"
                  className="w-full bg-transparent text-white placeholder-[#9ca3af] focus:outline-none text-[15px]"
                />
              </div>
            </div>

            {/* Feed List */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="text-[#9ca3af] mb-4">
                  <Bookmark className="w-16 h-16 mx-auto opacity-20" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Save posts for later</h2>
                <p className="text-[#9ca3af] max-w-sm mb-6">
                  Don&apos;t let the good ones fly away! Bookmark posts to easily find them again in the future.
                </p>
              </div>
            ) : (
              <div className="py-2 sm:px-4 mt-2">
                <div className="space-y-0">
                  {filtered.map((post) => (
                    <PostCard key={post.id} post={post} onRemoveBookmark={removeBookmark} />
                  ))}
                </div>
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
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-3">Folders &amp; Collections</h2>
              <p className="text-[#9ca3af] text-sm leading-relaxed mb-4">
                Koottam Premium gives you the ability to organize your bookmarks into isolated folders for seamless tracking.
              </p>
              <button className="w-full px-4 py-2.5 bg-white text-[#0a0a0f] font-bold rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                Upgrade to Premium
              </button>
            </section>

            {/* Footer Links */}
            <footer className="text-xs text-[#6b7280] space-y-2 px-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Terms</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Privacy</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Accessibility</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Advertising</button>
              </div>
              <p className="text-[#6b7280] pt-2">© 2024 Koottam Inc.</p>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
}
