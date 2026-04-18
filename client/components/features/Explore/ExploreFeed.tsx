'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostCard } from '../Feed/PostCard';
import { TrendingUp, Settings, MoreHorizontal } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import Image from 'next/image';

const mockTrending = [
  { rank: 1, category: 'TECHNOLOGY · TRENDING', title: '#NextGenDesign', posts: '12.5K posts' },
  { rank: 2, category: 'DESIGN · TRENDING', title: 'Minimalist Architecture', posts: '8,432 posts' },
  { rank: 3, category: 'DEVELOPMENT · TRENDING', title: 'React Server Components', posts: '6,210 posts' },
  { rank: 4, category: 'SOCIAL · TRENDING', title: '#KoottamCommunity', posts: '4,198 posts' },
  { rank: 5, category: 'ARTS & CULTURE', title: 'Digital Art', posts: '2,845 posts' },
];

const mockPosts = [
  {
    id: 'e1',
    author: {
      name: 'Elara Vance',
      username: '@elara',
      avatar: '/images/avatar-2.jpg',
      verified: false,
    },
    content: 'The morning light in the studio today was absolutely perfect for capturing these new ceramic pieces. There\'s something so therapeutic about the tactile nature of clay. 🌅🎨',
    image: '/images/post-ceramic.png', // Assuming user has this mock from our earlier data
    timestamp: '5h ago',
    likes: 89,
    comments: 12,
    shares: 3,
    isLiked: true,
  },
  {
    id: 'e2',
    author: {
       name: 'Julian Rivera',
       username: '@jrivera',
       avatar: '/images/avatar-1.jpg',
       verified: true,
    },
    content: 'Fascinating developments in AI-assisted spatial computing. The implications for collaborative architecture are massive.',
    timestamp: '1d ago',
    likes: 541,
    comments: 89,
    shares: 42,
    isLiked: false,
  }
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const isPrimaryAvatar = (name: string) => name.length % 2 === 0;

export function ExploreFeed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('For you');
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

        {/* Main Explore Content */}
        <main ref={mainFeedRef} className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full min-h-full pb-12">
            
            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col w-full border-b border-[#2a2a3e]">
              <div className="px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Explore</h1>
                <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer group">
                  <Settings className="w-5 h-5 text-[#ededed] group-hover:text-white" />
                </button>
              </div>
              
              {/* Explore Nav Tabs */}
              <nav className="flex items-center justify-between px-2 sm:px-4 font-semibold text-sm sm:text-[15px] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {['For you', 'Trending', 'Technology', 'Design', 'News'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative py-3 sm:py-4 px-3 sm:px-1 min-w-max sm:flex-1 text-center cursor-pointer transition-colors hover:bg-[#1a1a2e]/60 ${activeTab === tab ? 'text-white' : 'text-[#9ca3af] hover:text-[#ededed]'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8B5CF6] rounded-t-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Explore Hero Banner (No gradients via SKILLS.md) */}
            <div className="w-full h-48 sm:h-64 relative bg-[#1a1a2e] mb-1 group cursor-pointer overflow-hidden border-b border-[#2a2a3e]">
              <Image 
                src="/images/post-architecture.png" 
                alt="Trending Topic" 
                fill 
                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                priority
              />
              <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full bg-[#0a0a0f]/80 backdrop-blur-md border-t border-[#8B5CF6]/30">
                <p className="text-xs sm:text-sm font-semibold text-[#8B5CF6] tracking-wide mb-1 uppercase">Architecture · Live Event</p>
                <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight">The Future of Urban Spatial Experiences</h2>
              </div>
            </div>

            {/* Trending Lists container */}
            <div className="border-b border-[#2a2a3e] pb-2 bg-[#0a0a0f]">
              <h3 className="px-4 py-3 text-xl font-bold text-white">Trending for you</h3>
              {mockTrending.map((trend) => (
                <div key={trend.rank} className="px-4 py-3 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer flex justify-between items-start group">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-[#9ca3af] mb-1 font-medium tracking-wide">
                      <span>{trend.rank}</span>
                      <span>·</span>
                      <span>{trend.category}</span>
                    </div>
                    <p className="font-bold text-white text-[15px] sm:text-base group-hover:text-[#8B5CF6] transition-colors">{trend.title}</p>
                    <p className="text-[13px] text-[#9ca3af] mt-1 font-medium">{trend.posts}</p>
                  </div>
                  <button className="p-2 -mt-2 -mr-2 rounded-full hover:bg-[#2a2a3e] text-[#9ca3af] hover:text-[#ededed] transition-colors cursor-pointer">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button className="px-4 py-4 text-[#8B5CF6] text-[15px] font-semibold hover:bg-[#1a1a2e]/60 w-full text-left transition-colors cursor-pointer">
                Show more
              </button>
            </div>

            <div className="w-full h-2 bg-[#1a1a2e] border-b border-[#2a2a3e]" />

            {/* Relevant Posts Feed */}
            <div className="pt-2 sm:px-4">
              <h3 className="px-4 sm:px-0 py-3 text-xl font-bold text-white">Discover</h3>
              <div className="space-y-0">
                {mockPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

          </div>
        </main>

        {/* Right Sidebar - Retaining Layout Symmetry */}
        <aside ref={rightSidebarRef} className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4">
          <div className="py-6 space-y-6">
            
            {/* Who to Follow Section - Promoted to top in Explore */}
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

            {/* Featured Creators Section */}
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
                  <h2 className="text-lg font-bold text-white">Top Creators</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {/* Mini grid of creators */}
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-[#2a2a3e] rounded-lg hover:ring-2 hover:ring-[#8B5CF6] transition-all cursor-pointer flex items-center justify-center text-[#9ca3af]">
                        <span className="font-bold text-lg">C{i+1}</span>
                    </div>
                 ))}
              </div>
            </section>

            {/* Footer Links */}
            <footer className="text-xs text-[#6b7280] space-y-2 px-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Terms</button>
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
