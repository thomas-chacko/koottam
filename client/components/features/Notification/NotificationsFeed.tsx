'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  TrendingUp,
  Settings,
  Heart,
  MessageCircle,
  UserPlus,
  Sparkles,
  CheckCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { useNotifications } from '@/hooks/useNotifications';
import { useTrendingHashtags } from '@/hooks/useHashtag';
import { useFollowSuggestions, useFollowActions } from '@/hooks/useFollow';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const timeAgo = (d: string) => {
  const n = /[Zz]|[+-]\d{2}:?\d{2}$/.test(d) ? d : d + 'Z';
  const diff = Date.now() - new Date(n).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
};

const notifIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
    case 'comment':
      return <MessageCircle className="w-3.5 h-3.5 text-[#8B5CF6] fill-[#8B5CF6]" />;
    case 'follow':
      return <UserPlus className="w-3.5 h-3.5 text-[#10b981]" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-yellow-500" />;
  }
};

export function NotificationsFeed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<'All' | 'Unread'>('All');
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  const { notifications, loading, markRead, markAllRead } = useNotifications();
  const { hashtags } = useTrendingHashtags();
  const { suggestions } = useFollowSuggestions();
  const { follow } = useFollowActions();
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const visible =
    tab === 'Unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const handleFollow = async (userId: string) => {
    const ok = await follow(userId);
    if (ok) setFollowedIds((prev) => new Set(prev).add(userId));
  };

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
          <div className="w-full min-h-full pb-12">

            {/* Header Area */}
            <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-white tracking-tight">Notifications</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="text-sm font-medium text-[#8B5CF6] hover:text-[#7c4ee6] flex items-center gap-1 transition-colors cursor-pointer p-2 rounded-lg hover:bg-[#1a1a2e]"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                </button>
                <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer">
                  <Settings className="w-5 h-5 text-[#9ca3af]" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 px-4 py-3 border-b border-[#2a2a3e]">
              {(['All', 'Unread'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    tab === t
                      ? 'bg-[#8B5CF6] text-white'
                      : 'bg-[#1a1a2e] text-[#9ca3af] hover:text-white hover:bg-[#2a2a3e]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-[#9ca3af]">
                <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {visible.map((notif) => {
                  const actorName =
                    notif.actor?.full_name || notif.actor?.username || 'Someone';

                  return (
                    <article
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`p-4 sm:p-5 border-b border-[#2a2a3e]/50 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group flex gap-4 ${
                        !notif.is_read ? 'bg-[#8B5CF6]/[0.03]' : ''
                      }`}
                    >
                      <div className="relative shrink-0 mt-1">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base tracking-wide bg-[#2a2a3e] overflow-hidden">
                          {notif.actor?.avatar_url ? (
                            <Image
                              src={notif.actor.avatar_url}
                              alt={actorName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(actorName)
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0f] flex items-center justify-center border border-[#2a2a3e]">
                          {notifIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[15px] sm:text-base text-[#ededed] leading-snug break-words">
                            <span className="font-bold text-white hover:underline">{actorName}</span>{' '}
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                          )}
                        </div>

                        {notif.body && (
                          <p className="mt-2 text-[14px] sm:text-[15px] text-[#9ca3af] leading-relaxed group-hover:text-[#ededed] transition-colors line-clamp-2">
                            {notif.body}
                          </p>
                        )}

                        <p className="text-xs text-[#8B5CF6] font-medium mt-2">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                    </article>
                  );
                })}

                <div className="py-12 flex flex-col items-center justify-center text-[#9ca3af]">
                  <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">You&apos;re all caught up!</p>
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
                {hashtags.slice(0, 5).map((ht) => (
                  <Link
                    key={ht.name}
                    href={`/hashtag/${ht.name}`}
                    className="block w-full text-left hover:bg-[#2a2a3e] rounded-lg p-3 transition-colors cursor-pointer group"
                  >
                    <p className="text-[11px] text-[#6b7280] font-semibold tracking-wider mb-1 uppercase">TRENDING</p>
                    <p className="text-white font-semibold mb-1 group-hover:text-[#8B5CF6] transition-colors">#{ht.name}</p>
                    <p className="text-xs text-[#9ca3af]">{ht.post_count.toLocaleString()} posts</p>
                  </Link>
                ))}

                {hashtags.length === 0 && (
                  <p className="text-[#9ca3af] text-sm px-3">No trending hashtags yet.</p>
                )}

                <button className="w-full text-left p-3 text-[#8B5CF6] text-sm font-semibold hover:bg-[#2a2a3e] rounded-lg transition-colors cursor-pointer mt-2">
                  Show more trends
                </button>
              </div>
            </section>

            {/* Who to Follow */}
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-5">Who to follow</h2>

              <div className="space-y-4">
                {suggestions.slice(0, 3).map((user) => {
                  const displayName = user.full_name || user.username;
                  const followed = followedIds.has(user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none bg-[#8B5CF6] text-white overflow-hidden shrink-0">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(displayName)
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm group-hover:underline">{displayName}</p>
                          <p className="text-[#9ca3af] text-xs">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => !followed && handleFollow(user.id)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                          followed
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-[#2a2a3e] text-white hover:bg-[#8B5CF6]'
                        }`}
                      >
                        {followed ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}

                {suggestions.length === 0 && (
                  <p className="text-[#9ca3af] text-sm">No suggestions right now.</p>
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
    </div>
  );
}
