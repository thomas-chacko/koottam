'use client';

import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Smile, BarChart3, Send, Loader2, X, Globe, Users, Lock } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';
import { useCreatePost } from '@/hooks/usePost';
import { useCloudinaryUpload } from '@/hooks/useUser';

type Visibility = 'public' | 'followers' | 'private';

const PLACEHOLDERS = [
  "What's happening in your community?",
  'Share what\'s on your mind...',
  'Got a question? Ask the community!',
  'What are you working on today?',
  'Share a recent milestone with us',
];

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: typeof Globe }[] = [
  { value: 'public', label: 'Public', icon: Globe },
  { value: 'followers', label: 'Followers', icon: Users },
  { value: 'private', label: 'Private', icon: Lock },
];

interface CreatePostProps {
  onSuccess?: () => void;
}

export function CreatePost({ onSuccess }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('public');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { createPost, creating } = useCreatePost();
  const { uploadImage, uploading } = useCloudinaryUpload();

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'post');
    if (url) {
      setMediaUrls((prev) => [...prev, url]);
    }
    // reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (raw: string) => {
    const cleaned = raw.replace(/^#/, '').trim().toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const cycleVisibility = () => {
    const idx = VISIBILITY_OPTIONS.findIndex((o) => o.value === visibility);
    setVisibility(VISIBILITY_OPTIONS[(idx + 1) % VISIBILITY_OPTIONS.length].value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || creating) return;
    const post = await createPost({ content, media_urls: mediaUrls, tags, visibility });
    if (post) {
      setContent('');
      setMediaUrls([]);
      setTags([]);
      setTagInput('');
      setVisibility('public');
      onSuccess?.();
    }
  };

  const currentVisibility = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!;
  const VisibilityIcon = currentVisibility.icon;

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 sm:p-6 mb-6 mt-2 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8B5CF6] shrink-0 flex items-center justify-center text-white font-bold text-lg select-none overflow-hidden">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.full_name || user?.username || 'User')
              )}
            </div>

            <div className="flex-1 relative">
              {!content && (
                <div
                  className={`absolute top-2 left-0 pointer-events-none text-[#9ca3af] text-lg transition-all duration-300 ${
                    fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                  }`}
                >
                  {PLACEHOLDERS[placeholderIndex]}
                </div>
              )}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent text-white resize-none focus:outline-none min-h-[80px] text-lg py-2 relative z-10"
              />
            </div>
          </div>

          {/* Media previews */}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#2a2a3e]">
                  <Image src={url} alt={`media ${i + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tags input */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1 mb-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs px-2.5 py-1 rounded-full"
                >
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
              placeholder="Add tags (press Enter or comma)"
              className="w-full bg-transparent text-sm text-[#9ca3af] focus:outline-none placeholder:text-[#9ca3af]/60"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#2a2a3e] pt-4 mt-3">
            <div className="flex gap-1 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Tooltip content="Add image">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-[#8B5CF6] flex items-center justify-center disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </button>
              </Tooltip>
              <Tooltip content="Add emoji">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-[#8B5CF6] flex items-center justify-center"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </Tooltip>
              <div className="hidden sm:inline-flex">
                <Tooltip content="Add poll">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-[#8B5CF6] flex items-center justify-center"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>

              <Tooltip content={`Visibility: ${currentVisibility.label}`}>
                <button
                  type="button"
                  onClick={cycleVisibility}
                  className="flex items-center gap-1.5 p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-[#8B5CF6] text-xs font-medium"
                >
                  <VisibilityIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentVisibility.label}</span>
                </button>
              </Tooltip>
            </div>

            <button
              type="submit"
              disabled={!content.trim() || creating}
              className="px-6 py-2 bg-[#8B5CF6] text-white font-semibold rounded-full hover:bg-[#7c4ee6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Post</span>
                  <Send className="w-4 h-4 hidden sm:block" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
