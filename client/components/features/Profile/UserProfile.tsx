"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  TrendingUp,
  Settings,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Camera,
  Loader2,
  BadgeCheck,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
} from "lucide-react";
import { useLocalLenis } from "@/hooks/useLocalLenis";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useUpdateProfile,
  useCloudinaryUpload,
  useUserProfile,
  useMyProfile,
} from "@/hooks/useUser";
import { useUserPosts } from "@/hooks/usePost";
import { type Post } from "@/services/post.service";
import Image from "next/image";
import { EditProfileModal } from "./EditProfileModal";
import { ProfileNotFound } from "./ProfileNotFound";
import Link from "next/link";
import { useFollowStatus, useFollowActions } from "@/hooks/useFollow";
import { useTrendingHashtags } from "@/hooks/useHashtag";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const formatWebsiteUrl = (url: string) => {
  if (!url) return "";
  // If URL doesn't start with http:// or https://, add https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export function UserProfile({ username }: { username?: string }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { user: authUser } = useAuthStore();
  const { updateProfile } = useUpdateProfile();
  const { uploadImage, uploading } = useCloudinaryUpload();

  const isOwnProfile = !username || authUser?.username === username;

  // Follow state (only for other-user profiles)
  const { isFollowing: remoteIsFollowing } = useFollowStatus(
    !isOwnProfile ? (profile as any)?.id || undefined : undefined
  );
  const { follow: doFollow, unfollow: doUnfollow } = useFollowActions();
  const [localIsFollowing, setLocalIsFollowing] = useState<boolean | null>(null);
  const isFollowing = localIsFollowing !== null ? localIsFollowing : remoteIsFollowing;

  const handleFollowClick = async () => {
    if (!displayUser) return;
    const prev = isFollowing;
    setLocalIsFollowing(!prev);
    const ok = prev
      ? await doUnfollow((displayUser as any).id)
      : await doFollow((displayUser as any).id);
    if (!ok) setLocalIsFollowing(prev);
  };

  // Fetch profile data from API
  const {
    profile: publicProfile,
    loading: publicLoading,
    refetch: publicRefetch,
  } = useUserProfile(!isOwnProfile ? username : "", !isOwnProfile);
  const {
    profile: privateProfile,
    loading: privateLoading,
    refetch: privateRefetch,
  } = useMyProfile(isOwnProfile);

  const profile = isOwnProfile ? privateProfile : publicProfile;
  const profileLoading = isOwnProfile ? privateLoading : publicLoading;
  const refetch = isOwnProfile ? privateRefetch : publicRefetch;

  // Fetch this user's posts (keyed on username, runs once profile is resolved)
  const profileUsername =
    profile?.username || (isOwnProfile ? authUser?.username : username);
  const {
    posts,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useUserPosts(profileUsername);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file, "avatar");
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

    const imageUrl = await uploadImage(file, "cover");
    if (imageUrl) {
      await updateProfile({ cover_url: imageUrl });
      // Refetch profile to get updated data
      await refetch();
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect to login if viewing OWN profile and NOT authenticated
    if (isMounted && !username && !authUser) {
      router.replace("/login");
    }
  }, [authUser, router, isMounted, username]);

  if (!isMounted) return null;

  if (!username && !authUser) {
    // Render nothing while the redirect is in flight
    return null;
  }

  // Use profile data from API, fallback to auth store ONLY if viewing own profile
  const displayUser = isOwnProfile ? profile || authUser : profile;

  if (profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!displayUser) {
    return <ProfileNotFound />;
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
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full pb-12">
            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-2 py-3 flex items-center gap-4 w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                    {displayUser.full_name || displayUser.username}
                  </h1>
                </div>
                <p className="text-xs text-[#9ca3af] font-medium tracking-wide">
                  {postsLoading ? "..." : posts.length} posts
                </p>
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
                {isOwnProfile && (
                  <>
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
                  </>
                )}
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
                      {getInitials(
                        displayUser.full_name || displayUser.username,
                      )}
                    </div>
                  )}

                  {/* Avatar Upload Button */}
                  {isOwnProfile && (
                    <>
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
                    </>
                  )}
                </div>

                <div className="mt-3 sm:mt-5 flex items-center gap-2">
                  {isOwnProfile ? (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 font-bold text-sm bg-[#ededed] text-[#0a0a0f] hover:bg-white rounded-full transition-colors cursor-pointer ml-1"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleFollowClick}
                      className={`px-6 py-2 font-bold text-sm rounded-full transition-colors cursor-pointer ml-1 ${
                        isFollowing
                          ? "bg-transparent border border-[#2a2a3e] text-white hover:border-red-400 hover:text-red-400"
                          : "bg-white text-black hover:bg-[#ededed]"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {displayUser.full_name || displayUser.username}
                  </h2>
                  {displayUser.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-white fill-[#8B5CF6]" />
                  )}
                </div>
                <p className="text-[#9ca3af] text-sm md:text-base font-medium mb-3">
                  @{displayUser.username}
                </p>

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
                    <a
                      href={formatWebsiteUrl(displayUser.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-medium text-[#8B5CF6] hover:underline cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4" /> {displayUser.website}
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" /> Joined{" "}
                    {new Date(displayUser.created_at).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-sm">
                  <Link href={`/${displayUser.username}/following`} className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white transition-colors">
                      {displayUser.following_count}
                    </span>{" "}
                    <span className="text-[#9ca3af]">Following</span>
                  </Link>
                  <Link href={`/${displayUser.username}/followers`} className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white transition-colors">
                      {displayUser.followers_count}
                    </span>{" "}
                    <span className="text-[#9ca3af]">Followers</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="py-2 mt-4">
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#9ca3af] text-lg">No posts yet</p>
                  <p className="text-[#6b7280] text-sm mt-2">
                    Start sharing your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-0 border-t border-[#2a2a3e]">
                  {posts.map((post) => (
                    <ProfilePostCard key={post.id} post={post} />
                  ))}
                </div>
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
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
                  <h2 className="text-lg font-bold text-white">
                    Trending for you
                  </h2>
                </div>
                <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer group">
                  <Settings className="w-4 h-4 text-[#9ca3af] group-hover:text-white" />
                </button>
              </div>

              <TrendingSection />
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
          full_name: displayUser.full_name || "",
          bio: displayUser.bio || "",
          location: displayUser.location || "",
          website: displayUser.website || "",
        }}
      />
    </div>
  );
}

// ─── ProfilePostCard ──────────────────────────────────────────────────────────

function ProfilePostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.like_count);
  const [slide, setSlide] = useState(0);

  // ── Fix: PostgreSQL TIMESTAMP comes back without 'Z', so the browser
  //        interprets it as local time (IST = UTC+5:30) instead of UTC.
  //        Appending 'Z' forces correct UTC parsing.
  const timeAgo = (dateStr: string) => {
    const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(dateStr)
      ? dateStr // already has timezone info — use as-is
      : dateStr + "Z"; // no timezone → treat as UTC
    const diff = Date.now() - new Date(normalized).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const getInitials = (name: string | null) =>
    (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const images = post.media_urls;
  const hasMultiple = images.length > 1;

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlide((s) => (s - 1 + images.length) % images.length);
  };
  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlide((s) => (s + 1) % images.length);
  };

  return (
    <article className="border-b border-[#2a2a3e] px-4 py-4 hover:bg-[#1a1a2e]/40 transition-colors cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {post.author.avatar_url ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={post.author.avatar_url}
                alt={post.author.username}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">
              {getInitials(post.author.full_name || post.author.username)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-start justify-between gap-2">
            
            {/* Left: Name on top, username + location below */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white text-[15px] leading-none hover:underline cursor-pointer truncate">
                  {post.author.full_name || post.author.username}
                </span>
                {post.author.is_verified && (
                  <BadgeCheck className="w-[15px] h-[15px] text-[#0a0a0f] fill-[#8B5CF6] shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-[#9ca3af] text-[13px] mt-1">
                <span className="truncate">@{post.author.username}</span>
                {post.location && (
                  <>
                    <span className="text-[#4b5563]">·</span>
                    <div className="flex items-center gap-0.5 text-[#8B5CF6]/90">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate hover:underline cursor-pointer">{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Time + Three dots */}
            <div className="flex items-center gap-1 shrink-0 -mt-1">
              <span className="text-[#71767b] text-[13px] hover:underline cursor-pointer mr-1">
                {timeAgo(post.created_at)}
              </span>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#8B5CF6]/10 transition-colors cursor-pointer text-[#71767b] hover:text-[#8B5CF6] shrink-0 -mr-2"
                aria-label="Post options"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[18px] h-[18px]"
                >
                  <circle cx="5" cy="12" r="1.75" />
                  <circle cx="12" cy="12" r="1.75" />
                  <circle cx="19" cy="12" r="1.75" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <p className="text-[#ededed] text-sm leading-relaxed mt-1 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[#8B5CF6] text-xs hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Media — single image or Instagram-style carousel */}
          {images.length > 0 && (
            <div className="mt-3 relative rounded-xl overflow-hidden bg-[#2a2a3e] select-none">
              {/* Slide track */}
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${slide * 100}%)` }}
              >
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-full shrink-0 aspect-[4/3]"
                  >
                    <Image
                      src={url}
                      alt={`Post image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  </div>
                ))}
              </div>

              {/* Prev / Next buttons — only if more than one image */}
              {hasMultiple && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors cursor-pointer z-10"
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors cursor-pointer z-10"
                    aria-label="Next image"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Slide counter badge */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">
                    {slide + 1} / {images.length}
                  </div>

                  {/* Dot indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlide(i);
                        }}
                        className={`rounded-full transition-all duration-200 cursor-pointer ${
                          i === slide
                            ? "w-4 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 -ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
                setLikes(isLiked ? likes - 1 : likes + 1);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-red-500/10 transition-colors cursor-pointer group"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-[#9ca3af] group-hover:text-red-400"}`}
              />
              <span
                className={`text-xs ${isLiked ? "text-red-500" : "text-[#9ca3af] group-hover:text-red-400"}`}
              >
                {likes}
              </span>
            </button>

            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-[#8B5CF6]/10 transition-colors cursor-pointer group">
              <MessageCircle className="w-4 h-4 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
              <span className="text-xs text-[#9ca3af] group-hover:text-[#8B5CF6]">
                {post.comment_count}
              </span>
            </button>

            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-emerald-500/10 transition-colors cursor-pointer group">
              <Repeat2 className="w-4 h-4 text-[#9ca3af] group-hover:text-emerald-400" />
              <span className="text-xs text-[#9ca3af] group-hover:text-emerald-400">
                {post.share_count}
              </span>
            </button>

            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-[#8B5CF6]/10 transition-colors cursor-pointer group ml-auto">
              <Bookmark className="w-4 h-4 text-[#9ca3af] group-hover:text-[#8B5CF6]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
