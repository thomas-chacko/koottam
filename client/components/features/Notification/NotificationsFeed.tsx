'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrendingUp, Settings, Heart, MessageCircle, UserPlus, Sparkles, CheckCheck, CheckCircle2 } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';

const MOCK_NOTIFICATIONS = [
  { id: 1, user: 'Sarah Jen', action: 'liked your post', time: '2m ago', isUnread: true, type: 'like', text: 'This is exactly what I was looking for!' },
  { id: 2, user: 'Alex Walker', action: 'started following you', time: '1h ago', isUnread: true, type: 'follow' },
  { id: 3, user: 'David Kim', action: 'commented on your post', time: '3h ago', isUnread: false, type: 'comment', text: '"Incredible work 🔥 Keep it up!"' },
  { id: 4, user: 'Koottam Team', action: 'Welcome to Koottam! Check out our getting started guide.', time: '1d ago', isUnread: false, type: 'system' },
  { id: 5, user: 'Elena Gilbert', action: 'liked your comment', time: '2d ago', isUnread: false, type: 'like' },
  { id: 6, user: 'Marcus Wright', action: 'mentioned you in a post', time: '3d ago', isUnread: false, type: 'comment', text: '"Hey @user, have you seen this new design pattern?"' },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const isPrimaryAvatar = (name: string) => name.length % 2 === 0;

export function NotificationsFeed() {
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
          <div className="w-full min-h-full pb-12">
            
            {/* Header Area */}
            <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-white tracking-tight">Notifications</h1>
              <div className="flex items-center gap-2">
                <button className="text-sm font-medium text-[#8B5CF6] hover:text-[#7c4ee6] flex items-center gap-1 transition-colors cursor-pointer p-2 rounded-lg hover:bg-[#1a1a2e]">
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                </button>
                <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer">
                  <Settings className="w-5 h-5 text-[#9ca3af]" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col">
              {MOCK_NOTIFICATIONS.map((notif) => (
                <article 
                  key={notif.id} 
                  className={`p-4 sm:p-5 border-b border-[#2a2a3e]/50 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group flex gap-4 ${notif.isUnread ? 'bg-[#8B5CF6]/[0.03]' : ''}`}
                >
                  <div className="relative shrink-0 mt-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base tracking-wide bg-[#2a2a3e]`}>
                      {getInitials(notif.user)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0f] flex items-center justify-center border border-[#2a2a3e]">
                      {notif.type === 'like' && <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
                      {notif.type === 'comment' && <MessageCircle className="w-3.5 h-3.5 text-[#8B5CF6] fill-[#8B5CF6]" />}
                      {notif.type === 'follow' && <UserPlus className="w-3.5 h-3.5 text-[#10b981]" />}
                      {notif.type === 'system' && <Sparkles className="w-3.5 h-3.5 text-yellow-500" />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[15px] sm:text-base text-[#ededed] leading-snug break-words">
                        <span className="font-bold text-white hover:underline">{notif.user}</span> {notif.action}
                      </p>
                      {notif.isUnread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                      )}
                    </div>
                    
                    {notif.text && (
                      <p className="mt-2 text-[14px] sm:text-[15px] text-[#9ca3af] leading-relaxed group-hover:text-[#ededed] transition-colors line-clamp-2">
                        {notif.text}
                      </p>
                    )}
                    
                    <p className="text-xs text-[#8B5CF6] font-medium mt-2">{notif.time}</p>
                  </div>
                </article>
              ))}

              {/* End of notifications */}
              <div className="py-12 flex flex-col items-center justify-center text-[#9ca3af]">
                <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">You're all caught up!</p>
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
