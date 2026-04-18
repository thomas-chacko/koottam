'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostCard } from '../Feed/PostCard';
import { TrendingUp, Settings, MapPin, Calendar, Link as LinkIcon, Edit, Share, Mail } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import Image from 'next/image';

const MOCK_PROFILE = {
  name: 'Julian Rivera',
  username: '@jrivera',
  avatar: '/images/avatar-1.jpg',
  cover: '/images/post-architecture.png',
  bio: 'Digital architect & UI engineer. Passionate about building minimal, meaningful experiences on the web. Exploring the intersection of design and code.',
  location: 'San Francisco, CA',
  website: 'jrivera.design',
  joined: 'Joined March 2024',
  following: 428,
  followers: '12.4K',
};

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
    id: '3',
    author: {
      name: 'Julian Rivera',
      username: '@jrivera',
      avatar: '/images/avatar-1.jpg',
      verified: true,
    },
    content: 'Refactoring the entire state management flow today. Finding that sweet spot between overly complex stores and prop drilling is an absolute art form. What is your go-to approach these days?',
    timestamp: '1d ago',
    likes: 342,
    comments: 56,
    shares: 24,
    isLiked: true,
  }
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const isPrimaryAvatar = (name: string) => name.length % 2 === 0;

export function UserProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');
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

        {/* Main Feed Content */}
        <main ref={mainFeedRef} className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full min-h-full pb-12">
            
            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-3 flex items-center gap-4 w-full">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{MOCK_PROFILE.name}</h1>
                <p className="text-xs text-[#9ca3af] font-medium tracking-wide">3,492 posts</p>
              </div>
            </div>

            {/* Profile Hero Section */}
            <div className="w-full relative bg-[#1a1a2e] border-b border-[#2a2a3e] overflow-hidden mb-0 pb-2">
              {/* Cover Photo */}
              <div className="h-32 sm:h-48 w-full bg-[#2a2a3e] relative">
                <Image 
                  src={MOCK_PROFILE.cover} 
                  alt="Profile Cover" 
                  fill 
                  className="object-cover opacity-80"
                  priority
                />
              </div>

              {/* Avatar & Actions Row */}
              <div className="px-4 flex justify-between items-start relative pb-4">
                <div className="relative -mt-12 sm:-mt-16 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0a0a0f] bg-[#2a2a3e] shrink-0 z-10 flex items-center justify-center overflow-hidden">
                  <Image 
                    src={MOCK_PROFILE.avatar} 
                    alt={MOCK_PROFILE.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                
                <div className="mt-3 sm:mt-5 flex items-center gap-2">
                  <button className="p-2 rounded-full border border-[#2a2a3e] hover:bg-[#2a2a3e] text-[#ededed] transition-colors cursor-pointer" aria-label="Message User">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full border border-[#2a2a3e] hover:bg-[#2a2a3e] text-[#ededed] transition-colors cursor-pointer" aria-label="Share Profile">
                    <Share className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-2 font-bold text-sm bg-[#ededed] text-[#0a0a0f] hover:bg-white rounded-full transition-colors cursor-pointer ml-1">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="px-4 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{MOCK_PROFILE.name}</h2>
                <p className="text-[#9ca3af] text-sm md:text-base font-medium mb-3">{MOCK_PROFILE.username}</p>
                
                <p className="text-[#ededed] text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap max-w-2xl">
                  {MOCK_PROFILE.bio}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#9ca3af] text-sm mb-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4" /> {MOCK_PROFILE.location}
                  </span>
                  <a href="#" className="flex items-center gap-1.5 font-medium text-[#8B5CF6] hover:underline cursor-pointer">
                    <LinkIcon className="w-4 h-4" /> {MOCK_PROFILE.website}
                  </a>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" /> {MOCK_PROFILE.joined}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-sm">
                  <button className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white transition-colors">{MOCK_PROFILE.following}</span> <span className="text-[#9ca3af]">Following</span>
                  </button>
                  <button className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white transition-colors">{MOCK_PROFILE.followers}</span> <span className="text-[#9ca3af]">Followers</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Nav Tabs */}
            <nav className="flex items-center justify-between border-b border-[#2a2a3e] px-4 font-semibold text-sm bg-[#0a0a0f] mb-2">
              {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-4 px-1 flex-1 text-center cursor-pointer transition-colors hover:bg-[#1a1a2e]/60 ${activeTab === tab ? 'text-white' : 'text-[#9ca3af] hover:text-[#ededed]'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8B5CF6] rounded-t-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* Posts Feed for Profile */}
            <div className="py-2 sm:px-4">
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
                  { category: 'TECHNOLOGY', tag: '#NextGenDesign', posts: '8.3K posts' }
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
              </div>
            </section>

            {/* Gallery Hint / Right Rail Specific Module */}
             <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-4">You might like</h2>
              <div className="space-y-4">
                {[
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
              </div>
            </section>

            {/* Footer Links */}
            <footer className="text-xs text-[#6b7280] space-y-2 px-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Terms</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Privacy</button>
                <button className="hover:underline hover:text-white transition-colors cursor-pointer">Accessibility</button>
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
