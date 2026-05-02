'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrendingUp, Settings, MapPin, Calendar, Link as LinkIcon, Camera, Loader2, BadgeCheck } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { useAuthStore } from '@/store/useAuthStore';
import { useUpdateProfile, useCloudinaryUpload, useUserProfile } from '@/hooks/useUser';
import Image from 'next/image';
import { EditProfileModal } from './EditProfileModal';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const formatWebsiteUrl = (url: string) => {
  if (!url) return '';
  // If URL doesn't start with http:// or https://, add https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export function UserProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { user: authUser } = useAuthStore();
  const { updateProfile } = useUpdateProfile();
  const { uploadImage, uploading } = useCloudinaryUpload();
  
  // Fetch profile data from API
  const { profile, loading: profileLoading, refetch } = useUserProfile(authUser?.username || '');

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file, 'avatar');
    if (imageUrl) {
      await updateProfile({ avatar_url: imageUrl });
      // Refetch profile to get updated data
      await refetch();
    }
  };

  // Handle cover upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file, 'cover');
    if (imageUrl) {
      await updateProfile({ cover_url: imageUrl });
      // Refetch profile to get updated data
      await refetch();
    }
  };

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <p>Please login to view your profile</p>
      </div>
    );
  }

  // Use profile data from API, fallback to auth store
  const displayUser = profile || authUser;

  if (profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{displayUser.full_name || displayUser.username}</h1>
                  {displayUser.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-white fill-[#8B5CF6]" />
                  )}
                </div>
                <p className="text-xs text-[#9ca3af] font-medium tracking-wide">{displayUser.posts_count} posts</p>
              </div>
            </div>

            {/* Profile Hero Section */}
            <div className="w-full relative bg-[#1a1a2e] border-b border-[#2a2a3e] overflow-hidden mb-0 pb-2">
              {/* Cover Photo */}
              <div className="h-32 sm:h-48 w-full bg-[#2a2a3e] relative group">
                {displayUser.cover_url ? (
                  <Image 
                    src={displayUser.cover_url} 
                    alt="Profile Cover" 
                    fill 
                    className="object-cover opacity-80"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2a2a3e] to-[#1a1a2e]" />
                )}
                
                {/* Cover Upload Button */}
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute top-2 right-2 p-2 bg-[#0a0a0f]/80 hover:bg-[#0a0a0f] rounded-full transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar & Actions Row */}
              <div className="px-4 flex justify-between items-start relative pb-4">
                <div className="relative -mt-12 sm:-mt-16 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0a0a0f] bg-[#2a2a3e] shrink-0 z-10 flex items-center justify-center overflow-hidden group">
                  {displayUser.avatar_url ? (
                    <Image 
                      src={displayUser.avatar_url} 
                      alt={displayUser.full_name || displayUser.username} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-2xl">
                      {getInitials(displayUser.full_name || displayUser.username)}
                    </div>
                  )}
                  
                  {/* Avatar Upload Button */}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="mt-3 sm:mt-5 flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 font-bold text-sm bg-[#ededed] text-[#0a0a0f] hover:bg-white rounded-full transition-colors cursor-pointer ml-1"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{displayUser.full_name || displayUser.username}</h2>
                  {displayUser.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-white fill-[#8B5CF6]" />
                  )}
                </div>
                <p className="text-[#9ca3af] text-sm md:text-base font-medium mb-3">@{displayUser.username}</p>
                
                {displayUser.bio && (
                  <p className="text-[#ededed] text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap max-w-2xl">
                    {displayUser.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#9ca3af] text-sm mb-4">
                  {displayUser.location && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4" /> {displayUser.location}
                    </span>
                  )}
                  {displayUser.website && (
                    <a href={formatWebsiteUrl(displayUser.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-[#8B5CF6] hover:underline cursor-pointer">
                      <LinkIcon className="w-4 h-4" /> {displayUser.website}
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" /> Joined {new Date(displayUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-sm">
                  <button className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white transition-colors">{displayUser.following_count}</span> <span className="text-[#9ca3af]">Following</span>
                  </button>
                  <button className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white transition-colors">{displayUser.followers_count}</span> <span className="text-[#9ca3af]">Followers</span>
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

            {/* Posts Feed */}
            <div className="py-2 sm:px-4">
              {displayUser.posts_count === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#9ca3af] text-lg">No posts yet</p>
                  <p className="text-[#6b7280] text-sm mt-2">Start sharing your thoughts!</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#9ca3af]">Posts will appear here</p>
                  <p className="text-[#6b7280] text-sm mt-2">Post API coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside ref={rightSidebarRef} className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4">
          <div className="py-6 space-y-6">
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
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={refetch}
        currentProfile={{
          full_name: displayUser.full_name || '',
          bio: displayUser.bio || '',
          location: displayUser.location || '',
          website: displayUser.website || '',
        }}
      />
    </div>
  );
}
