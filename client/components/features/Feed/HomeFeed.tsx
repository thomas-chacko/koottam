'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { CommentDrawer } from './CommentDrawer';
import { TrendingUp, Settings, Plus, Loader2, BookOpen } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';
import Link from 'next/link';
import { useHomeFeed } from '@/hooks/useFeed';
import { useFollowingStories } from '@/hooks/useStories';
import { useTrendingHashtags } from '@/hooks/useHashtag';
import { useFollowSuggestions, useFollowActions } from '@/hooks/useFollow';
import { feedService } from '@/services/feed.service';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

export function HomeFeed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentDrawerPostId, setCommentDrawerPostId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hiddenSuggestions, setHiddenSuggestions] = useState<string[]>([]);

  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const { user } = useAuthStore();

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const { posts, loading, setPosts } = useHomeFeed();
  const { storyGroups } = useFollowingStories();
  const { hashtags } = useTrendingHashtags();
  const { suggestions } = useFollowSuggestions();
  const { follow } = useFollowActions();

  const handleFollow = async (userId: string) => {
    const ok = await follow(userId);
    if (ok) {
      setHiddenSuggestions((prev) => [...prev, userId]);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newOffset = offset + 20;
    try {
      const data = await feedService.getHomeFeed({ limit: 20, offset: newOffset });
      setPosts((prev) => [...prev, ...data.posts]);
      setOffset(newOffset);
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const visibleSuggestions = suggestions.filter((s) => !hiddenSuggestions.includes(s.id));

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

        {/* Main Feed */}
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full">
            {/* Stories */}
            <div className="py-2">
              <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4 pb-4 px-2">
                {/* My Story */}
                {user && (
                  <button className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group transition-all">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl select-none relative z-10 transition-transform group-hover:scale-105 border-2 border-[#8B5CF6] border-dashed p-1">
                        <div className="w-full h-full rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.username}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white">
                              {getInitials(user.full_name || user.username)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#8B5CF6] rounded-full border-2 border-[#0a0a0f] flex items-center justify-center z-20">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#9ca3af] group-hover:text-white transition-colors max-w-[64px] truncate">
                      My Story
                    </span>
                  </button>
                )}

                {/* Following stories */}
                {storyGroups.map((group) => {
                  const name = group.user.full_name || group.user.username;
                  return (
                    <button
                      key={group.user.id}
                      className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group transition-all"
                    >
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl select-none relative z-10 transition-transform group-hover:scale-105 border-2 border-transparent ring-2 ring-offset-2 ring-offset-[#0a0a0f] ${
                            group.has_unseen ? 'ring-[#8B5CF6]' : 'ring-[#2a2a3e]'
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
                            {group.user.avatar_url ? (
                              <Image
                                src={group.user.avatar_url}
                                alt={name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[#ededed]">{getInitials(name)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#9ca3af] group-hover:text-white transition-colors max-w-[64px] truncate">
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feed Content */}
            <div className="py-2 pb-12">
              <CreatePost />

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="w-12 h-12 text-[#2a2a3e] mb-4" />
                  <p className="text-white font-semibold text-lg">No posts yet</p>
                  <p className="text-[#9ca3af] text-sm mt-1">Follow people to see their posts here</p>
                </div>
              ) : (
                <>
                  <div className="space-y-0">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onCommentClick={(id) => setCommentDrawerPostId(id)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-[#1a1a2e] border border-[#2a2a3e] text-[#9ca3af] text-sm font-medium rounded-full hover:border-[#8B5CF6] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Load more
                    </button>
                  </div>
                </>
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
            {/* Trending Section */}
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
                  <h2 className="text-lg font-bold text-white">Trending for you</h2>
                </div>
                <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer group">
                  <Settings className="w-4 h-4 text-[#9ca3af] group-hover:text-white" />
                </button>
              </div>

              <div className="space-y-2">
                {hashtags.length > 0 ? (
                  hashtags.map((tag) => (
                    <Link
                      key={tag.name}
                      href={'/hashtag/' + tag.name}
                      className="block w-full text-left hover:bg-[#2a2a3e] rounded-lg p-3 transition-colors cursor-pointer group"
                    >
                      <p className="text-white font-semibold mb-1 group-hover:text-[#8B5CF6] transition-colors">
                        #{tag.name}
                      </p>
                      <p className="text-xs text-[#9ca3af]">
                        {tag.post_count.toLocaleString()} posts
                      </p>
                    </Link>
                  ))
                ) : (
                  [
                    { tag: '#ModernArt2024', posts: '2.5K posts' },
                    { tag: '#KoottamCommunity', posts: '12.2K posts' },
                    { tag: '#NextGenDesign', posts: '8.3K posts' },
                    { tag: '#CreativeCoding', posts: '5.4K posts' },
                    { tag: '#PastelAesthetics', posts: '3.2K posts' },
                  ].map((trend, index) => (
                    <div
                      key={index}
                      className="block w-full text-left hover:bg-[#2a2a3e] rounded-lg p-3 transition-colors cursor-pointer group"
                    >
                      <p className="text-white font-semibold mb-1 group-hover:text-[#8B5CF6] transition-colors">{trend.tag}</p>
                      <p className="text-xs text-[#9ca3af]">{trend.posts}</p>
                    </div>
                  ))
                )}

                <button className="w-full text-left p-3 text-[#8B5CF6] text-sm font-semibold hover:bg-[#2a2a3e] rounded-lg transition-colors cursor-pointer mt-2">
                  Show more trends
                </button>
              </div>
            </section>

            {/* Who to Follow Section */}
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-5">Who to follow</h2>

              <div className="space-y-4">
                {visibleSuggestions.length > 0 ? (
                  visibleSuggestions.slice(0, 5).map((suggestion) => {
                    const name = suggestion.full_name || suggestion.username;
                    return (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2a2a3e] text-[#ededed] flex items-center justify-center font-bold text-sm select-none overflow-hidden">
                            {suggestion.avatar_url ? (
                              <Image
                                src={suggestion.avatar_url}
                                alt={name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(name)
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm group-hover:underline">{name}</p>
                            <p className="text-[#9ca3af] text-xs">@{suggestion.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFollow(suggestion.id)}
                          className="px-4 py-1.5 bg-[#2a2a3e] text-white text-sm font-medium rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer"
                        >
                          Follow
                        </button>
                      </div>
                    );
                  })
                ) : (
                  [
                    { name: 'Elena Gilbert', username: '@elenag' },
                    { name: 'Marcus Wright', username: '@wright_tech' },
                    { name: 'Sophia Chen', username: '@sophiachen' },
                  ].map((u) => (
                    <div
                      key={u.username}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a3e] text-[#ededed] flex items-center justify-center font-bold text-sm select-none">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm group-hover:underline">{u.name}</p>
                          <p className="text-[#9ca3af] text-xs">{u.username}</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-[#2a2a3e] text-white text-sm font-medium rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer">
                        Follow
                      </button>
                    </div>
                  ))
                )}

                <button className="w-full text-left p-3 mt-2 text-[#8B5CF6] text-sm font-semibold hover:bg-[#2a2a3e] rounded-lg transition-colors cursor-pointer">
                  Show more suggestions
                </button>
              </div>
            </section>

            {/* Footer Links */}
            <footer className="text-xs text-[#6b7280] space-y-2 px-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Terms of Service</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Cookie Policy</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Accessibility</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Ads info</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">More...</button>
              </div>
              <p className="text-[#6b7280] pt-2">© 2024 Koottam Inc.</p>
            </footer>
          </div>
        </aside>
      </div>

      {/* Comment Drawer */}
      {commentDrawerPostId && (
        <CommentDrawer
          postId={commentDrawerPostId}
          onClose={() => setCommentDrawerPostId(null)}
        />
      )}
    </div>
  );
}
