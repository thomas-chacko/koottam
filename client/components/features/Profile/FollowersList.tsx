'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { userService, UserProfile } from '@/services/user.service';
import { followService } from '@/services/follow.service';
import { useFollowActions } from '@/hooks/useFollow';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

interface FollowersListProps {
  username: string;
  initialTab: 'followers' | 'following';
}

interface UserRowProps {
  user: UserProfile;
}

function UserRow({ user }: UserRowProps) {
  const { follow, unfollow } = useFollowActions();
  const [isFollowing, setIsFollowing] = useState(false);
  const displayName = user.full_name || user.username;

  const handleToggle = async () => {
    const prev = isFollowing;
    setIsFollowing(!prev);
    const ok = prev ? await unfollow(user.id) : await follow(user.id);
    if (!ok) setIsFollowing(prev);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a3e]/50 hover:bg-[#1a1a2e]/60 transition-colors">
      <Link href={`/${user.username}`} className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">{getInitials(displayName)}</span>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/${user.username}`} className="hover:underline">
          <p className="text-white font-semibold text-sm truncate">{displayName}</p>
        </Link>
        <p className="text-[#9ca3af] text-xs truncate">@{user.username}</p>
      </div>

      <button
        onClick={handleToggle}
        className="border border-[#2a2a3e] rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-[#2a2a3e] text-white cursor-pointer transition-colors shrink-0"
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

export function FollowersList({ username, initialTab }: FollowersListProps) {
  const router = useRouter();
  const mainFeedRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useLocalLenis(mainFeedRef);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const profile = await userService.getProfile(username);
        const [followersData, followingData] = await Promise.all([
          followService.getFollowers(profile.id),
          followService.getFollowing(profile.id),
        ]);
        if (!cancelled) {
          setFollowers(followersData.users);
          setFollowing(followingData.users);
        }
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [username]);

  const list = activeTab === 'followers' ? followers : following;

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
                onClick={() => router.push(`/${username}`)}
                className="p-2 hover:bg-[#1a1a2e] rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">@{username}</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2a2a3e]">
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-3 font-semibold text-[15px] transition-colors cursor-pointer ${
                  activeTab === 'followers'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Followers ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-3 font-semibold text-[15px] transition-colors cursor-pointer ${
                  activeTab === 'following'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Following ({following.length})
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-[#8B5CF6] mb-4 opacity-40" />
                <p className="text-white font-semibold text-lg">No users found</p>
                <p className="text-[#9ca3af] text-sm mt-1">
                  {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                </p>
              </div>
            ) : (
              <div>
                {list.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
