'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { TrendingUp, Settings, Plus } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';

// Mock data - will be replaced with API calls
const mockStories = [
  { id: '1', name: 'My Story', avatar: '/images/avatar-me.jpg', isOwn: true },
  { id: '2', name: 'Lila Rose', avatar: '/images/avatar-1.jpg', isOwn: false },
  { id: '3', name: 'Zayn', avatar: '/images/avatar-2.jpg', isOwn: false },
  { id: '4', name: 'Mia Wong', avatar: '/images/avatar-3.jpg', isOwn: false },
  { id: '5', name: 'Daniel K.', avatar: '/images/avatar-4.jpg', isOwn: false },
  { id: '6', name: 'Sarah', avatar: '/images/avatar-5.jpg', isOwn: false },
];

const mockPosts = [
  {
    id: '1',
    author: {
      name: 'Julian Rivera',
      username: '@jrivera',
      avatar: '/images/avatar-1.jpg',
      verified: true,
    },
    content: 'Just finished the first draft of the new architectural concept for the Koottam hub. The focus is on fluid spaces and natural light integration. Can\'t wait to share more! 🏗️✨ #Architecture #Minimalism',
    image: '/images/post-architecture.png',
    timestamp: '2h ago',
    likes: 124,
    comments: 84,
    shares: 12,
    isLiked: false,
  },
  {
    id: '2',
    author: {
      name: 'Elara Vance',
      username: '@elara',
      avatar: '/images/avatar-2.jpg',
    },
    content: 'The morning light in the studio today was absolutely perfect for capturing these new ceramic pieces. There\'s something so therapeutic about the tactile nature of clay. 🌅🎨',
    image: '/images/post-ceramic.png',
    timestamp: '5h ago',
    likes: 89,
    comments: 12,
    shares: 3,
    isLiked: true,
  },
];

const getInitials = (name: string) => name === 'My Story' ? 'ME' : name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const isPrimaryAvatar = (name: string) => name.length % 2 === 0;

export function HomeFeed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

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
        <main ref={mainFeedRef} className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full min-h-full">
            {/* Stories */}
            <div className="px-4 py-6">
              <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4 pb-4 px-2">
                {mockStories.map((story) => {
                  const isPrimary = isPrimaryAvatar(story.name);
                  const bgClass = isPrimary ? 'bg-[#8B5CF6] text-white' : 'bg-[#1a1a2e] text-[#ededed]';

                  return (
                    <button
                      key={story.id}
                      className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group transition-all"
                    >
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl select-none relative z-10 transition-transform group-hover:scale-105
                          ${story.isOwn ? 'border-2 border-[#8B5CF6] border-dashed p-1' : 'border-2 border-transparent ring-2 ring-offset-2 ring-offset-[#0a0a0f] ' + (isPrimary ? 'ring-[#8B5CF6]' : 'ring-[#2a2a3e]')}`}>
                          <div className={`w-full h-full rounded-full flex items-center justify-center ${bgClass}`}>
                            {getInitials(story.name)}
                          </div>
                        </div>
                        {story.isOwn && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#8B5CF6] rounded-full border-2 border-[#0a0a0f] flex items-center justify-center z-20">
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#9ca3af] group-hover:text-white transition-colors max-w-[64px] truncate">
                        {story.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feed Content */}
            <div className="px-4 py-2 pb-12">
              <CreatePost />

              <div className="space-y-0">
                {mockPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside ref={rightSidebarRef} className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4">
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
                {[
                  { category: 'ARTS & CULTURE', tag: '#ModernArt2024', posts: '2.5K posts' },
                  { category: 'SOCIAL', tag: '#KoottamCommunity', posts: '12.2K posts' },
                  { category: 'TECHNOLOGY', tag: '#NextGenDesign', posts: '8.3K posts' },
                  { category: 'DEVELOPMENT', tag: '#CreativeCoding', posts: '5.4K posts' },
                  { category: 'LIFESTYLE', tag: '#PastelAesthetics', posts: '3.2K posts' },
                ].map((trend, index) => (
                  <button
                    key={index}
                    className="block w-full text-left hover:bg-[#2a2a3e] rounded-lg p-3 transition-colors cursor-pointer group"
                  >
                    <p className="text-[11px] text-[#6b7280] font-semibold tracking-wider mb-1 uppercase">{trend.category}</p>
                    <p className="text-white font-semibold mb-1 group-hover:text-[#8B5CF6] transition-colors">{trend.tag}</p>
                    <p className="text-xs text-[#9ca3af]">{trend.posts}</p>
                  </button>
                ))}

                <button className="w-full text-left p-3 text-[#8B5CF6] text-sm font-semibold hover:bg-[#2a2a3e] rounded-lg transition-colors cursor-pointer mt-2">
                  Show more trends
                </button>
              </div>
            </section>

            {/* Who to Follow Section */}
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-5">Who to follow</h2>

              <div className="space-y-4">
                {[
                  { name: 'Elena Gilbert', username: '@elenag', avatar: '/images/avatar-6.jpg' },
                  { name: 'Marcus Wright', username: '@wright_tech', avatar: '/images/avatar-7.jpg' },
                  { name: 'Sophia Chen', username: '@sophiachen', avatar: '/images/avatar-8.jpg' },
                ].map((user) => {
                  const isPrimary = isPrimaryAvatar(user.name);
                  const bgClass = isPrimary ? 'bg-[#8B5CF6] text-white' : 'bg-[#2a2a3e] text-[#ededed]';
                  return (
                    <div
                      key={user.username}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none ${bgClass}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm group-hover:underline">{user.name}</p>
                          <p className="text-[#9ca3af] text-xs">{user.username}</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-[#2a2a3e] text-white text-sm font-medium rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer">
                        Follow
                      </button>
                    </div>
                  );
                })}

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
    </div>
  );
}
