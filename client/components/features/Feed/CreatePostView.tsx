'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Smile,
  BarChart3,
  MapPin,
  X,
  ArrowLeft,
  Send,
  Globe,
  Users,
  Lock,
  ChevronDown,
  Hash,
  Sparkles,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { Tooltip } from '@/components/ui/Tooltip';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { useCreatePost } from '@/hooks/usePost';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

const MAX_CHARS = 500;

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🎉', label: 'Excited' },
  { emoji: '🤔', label: 'Curious' },
  { emoji: '💡', label: 'Inspired' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '🥰', label: 'Grateful' },
  { emoji: '🔥', label: 'Passionate' },
];

const AUDIENCES = [
  { icon: Globe, label: 'Everyone', value: 'public' },
  { icon: Users, label: 'Followers', value: 'followers' },
  { icon: Lock, label: 'Only me', value: 'private' },
];

const TRENDING = [
  { category: 'ARTS & CULTURE', tag: '#ModernArt2024', posts: '2.5K posts' },
  { category: 'SOCIAL', tag: '#KoottamCommunity', posts: '12.2K posts' },
  { category: 'TECHNOLOGY', tag: '#NextGenDesign', posts: '8.3K posts' },
  { category: 'DEVELOPMENT', tag: '#CreativeCoding', posts: '5.4K posts' },
  { category: 'LIFESTYLE', tag: '#PastelAesthetics', posts: '3.2K posts' },
];

const SUGGESTIONS = [
  { name: 'Elena Gilbert', username: '@elenag' },
  { name: 'Marcus Wright', username: '@wright_tech' },
  { name: 'Sophia Chen', username: '@sophiachen' },
];

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
const isPrimaryAvatar = (name: string) => name.length % 2 === 0;

export function CreatePostView() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createPost } = useCreatePost();
  const { uploadImage, uploading } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const rightRef = useRef<HTMLElement>(null);

  useLocalLenis(mainRef);
  useLocalLenis(rightRef);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [content, setContent] = useState('');
  // imageFiles: raw File objects used for Cloudinary upload
  // images: base64 data-URLs used for local preview only
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [location, setLocation] = useState('');
  const [showLocation, setShowLocation] = useState(false);

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      // Store raw File for upload
      setImageFiles((prev) => (prev.length < 4 ? [...prev, file] : prev));
      // Generate base64 preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages((prev) => (prev.length < 4 ? [...prev, result] : prev));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, '');
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags((prev) => [...prev, tag]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!canPost) return;
    setIsSubmitting(true);
    try {
      // Step 1: Upload each image to Cloudinary, collect URLs
      let mediaUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(
          imageFiles.map((file) => uploadImage(file, 'post'))
        );
        // Filter out any failed uploads (null)
        mediaUrls = uploadResults.filter((url): url is string => url !== null);
      }

      // Step 2: Build content — prepend mood if selected
      const moodPrefix = selectedMood ? `${selectedMood.emoji} Feeling ${selectedMood.label}\n\n` : '';
      const finalContent = moodPrefix + content.trim();

      // Step 3: Call create post API
      const post = await createPost({
        content: finalContent,
        media_urls: mediaUrls,
        visibility: audience.value as 'public' | 'followers' | 'private',
        tags,
        location: location.trim() || undefined,
      });

      if (post) {
        router.push('/');
      }
    } catch (err) {
      console.error('Create post error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [canPost, content, imageFiles, tags, audience, selectedMood, createPost, uploadImage, router]);

  const AudienceIcon = audience.icon;

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full h-[calc(100vh-64px)] px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto">
        {/* Left Sidebar – desktop */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Left Sidebar – mobile */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* ── Centre: Compose Area ── */}
        <main
          ref={mainRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full pb-12">
            {/* Sticky page header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-1.5 rounded-full hover:bg-[#1a1a2e] transition-colors cursor-pointer text-[#9ca3af] hover:text-white group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <h1 className="text-xl font-bold text-white tracking-tight">Create Post</h1>
              </div>

              {/* Audience Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowAudiencePicker(!showAudiencePicker)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-full text-sm text-[#ededed] hover:border-[#8B5CF6] transition-colors cursor-pointer"
                >
                  <AudienceIcon className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>{audience.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#9ca3af] transition-transform ${showAudiencePicker ? 'rotate-180' : ''}`} />
                </button>

                {showAudiencePicker && (
                  <div className="absolute right-0 top-10 w-44 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden z-50">
                    {AUDIENCES.map((a) => {
                      const Icon = a.icon;
                      return (
                        <button
                          key={a.value}
                          onClick={() => { setAudience(a); setShowAudiencePicker(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#2a2a3e] transition-colors cursor-pointer ${audience.value === a.value ? 'text-[#8B5CF6] font-semibold' : 'text-[#ededed]'}`}
                        >
                          <Icon className="w-4 h-4" />
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Compose card */}
            <div className="px-4 py-6">
              {/* Author Row */}
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6] shrink-0 flex items-center justify-center text-white font-bold text-lg select-none overflow-hidden ring-2 ring-[#8B5CF6]/30">
                  {user?.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.username} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.full_name || user?.username || 'User')
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-white font-semibold text-sm">{user?.full_name || user?.username || 'You'}</span>
                  <span className="text-[#9ca3af] text-xs">@{user?.username || 'user'}</span>
                </div>
              </div>

              {/* Mood badge */}
              {selectedMood && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full text-sm text-[#8B5CF6]">
                    {selectedMood.emoji} Feeling {selectedMood.label}
                    <button onClick={() => setSelectedMood(null)} className="ml-1 hover:text-white transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}

              {/* Textarea */}
              <div className="relative mb-4">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening in your community?"
                  rows={6}
                  className="w-full bg-transparent text-white text-lg placeholder-[#4b5563] resize-none focus:outline-none leading-relaxed"
                  autoFocus
                />
                <div className="absolute bottom-2 right-2">
                  <CharProgress current={content.length} max={MAX_CHARS} />
                </div>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className={`grid gap-2 mb-4 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {images.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-[#1a1a2e]">
                      <Image src={src} alt={`Upload ${i + 1}`} fill className="object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Poll */}
              {showPoll && (
                <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#8B5CF6]" /> Poll
                    </h3>
                    <button onClick={() => setShowPoll(false)} className="text-[#9ca3af] hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[i] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-3 py-2 text-white text-sm placeholder-[#4b5563] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                      />
                    ))}
                    {pollOptions.length < 4 && (
                      <button
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-[#8B5CF6] text-sm hover:underline cursor-pointer"
                      >
                        + Add option
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Location Input */}
              {showLocation && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#1a1a2e]/50 border border-[#2a2a3e] rounded-xl text-sm">
                  <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where are you?"
                    className="bg-transparent text-white placeholder-[#4b5563] focus:outline-none flex-1"
                    autoFocus
                  />
                  <button onClick={() => { setShowLocation(false); setLocation(''); }} className="text-[#9ca3af] hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tag Input */}
              <div className="flex flex-wrap items-center gap-2 mb-6 min-h-[36px]">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 rounded-full text-xs text-[#8B5CF6]">
                    #{tag}
                    <button onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} className="cursor-pointer hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <div className="flex items-center gap-1 text-[#4b5563]">
                    <Hash className="w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder={tags.length === 0 ? 'Add tags (press Enter)' : ''}
                      className="bg-transparent text-sm text-[#9ca3af] placeholder-[#4b5563] focus:outline-none w-36"
                    />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#2a2a3e] mb-4" />

              {/* Toolbar */}
              <div className="flex items-center gap-1 flex-wrap">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />

                <Tooltip content="Add image (up to 4)">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= 4}
                    className="p-2.5 rounded-full hover:bg-[#1a1a2e] transition-colors cursor-pointer text-[#8B5CF6] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </Tooltip>

                <Tooltip content="Add mood">
                  <button
                    type="button"
                    onClick={() => setShowMoodPicker(!showMoodPicker)}
                    className="p-2.5 rounded-full hover:bg-[#1a1a2e] transition-colors cursor-pointer text-[#8B5CF6]"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </Tooltip>

                <Tooltip content="Create poll">
                  <button
                    type="button"
                    onClick={() => setShowPoll(!showPoll)}
                    className="p-2.5 rounded-full hover:bg-[#1a1a2e] transition-colors cursor-pointer text-[#8B5CF6]"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </Tooltip>

                <Tooltip content="Add location">
                  <button
                    type="button"
                    onClick={() => setShowLocation(!showLocation)}
                    className="p-2.5 rounded-full hover:bg-[#1a1a2e] transition-colors cursor-pointer text-[#8B5CF6]"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </Tooltip>

                <div className="flex-1" />

                {content.length > 0 && (
                  <span className={`text-sm font-medium mr-3 tabular-nums ${isOverLimit ? 'text-red-400' : charsLeft <= 50 ? 'text-yellow-400' : 'text-[#9ca3af]'}`}>
                    {charsLeft}
                  </span>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canPost}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#8B5CF6] text-white font-semibold rounded-full hover:bg-[#7c4ee6] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Posting…</span>
                    </>
                  ) : (
                    <>
                      <span>Post</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Mood Picker */}
              {showMoodPicker && (
                <div className="mt-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
                  <p className="text-[#9ca3af] text-xs mb-3 font-medium uppercase tracking-wide">How are you feeling?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => { setSelectedMood(mood); setShowMoodPicker(false); }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer ${selectedMood?.label === mood.label ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40' : ''}`}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-[#9ca3af] text-xs">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <aside
          ref={rightRef}
          className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4"
        >
          <div className="py-6 space-y-6">
            {/* Trending */}
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
                {TRENDING.map((trend, i) => (
                  <button
                    key={i}
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

            {/* Who to follow */}
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-5">Who to follow</h2>
              <div className="space-y-4">
                {SUGGESTIONS.map((u) => {
                  const isPrimary = isPrimaryAvatar(u.name);
                  const bgClass = isPrimary ? 'bg-[#8B5CF6] text-white' : 'bg-[#2a2a3e] text-[#ededed]';
                  return (
                    <div key={u.username} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none ${bgClass}`}>
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
                  );
                })}
                <button className="w-full text-left p-3 mt-2 text-[#8B5CF6] text-sm font-semibold hover:bg-[#2a2a3e] rounded-lg transition-colors cursor-pointer">
                  Show more suggestions
                </button>
              </div>
            </section>

            {/* Footer */}
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

/* ── Character progress ring ── */
function CharProgress({ current, max }: { current: number; max: number }) {
  const size = 32;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(current / max, 1);
  const dashOffset = circumference * (1 - ratio);
  const isOver = current > max;
  const isNear = current > max - 50;
  const color = isOver ? '#f87171' : isNear ? '#facc15' : '#8B5CF6';

  if (current === 0) return null;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a3e" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.2s, stroke 0.2s' }}
      />
    </svg>
  );
}
