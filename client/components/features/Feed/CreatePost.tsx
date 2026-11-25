"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Smile, BarChart3, Send } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

const PLACEHOLDERS = [
  "What's happening in your community?",
  "Share what's on your mind...",
  "Got a question? Ask the community!",
  "What are you working on today?",
  "Share a recent milestone with us",
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export function CreatePost() {
  const [content, setContent] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFade(true);
      }, 300); // Wait for fade out to complete before swapping text
    }, 4000); // Change placeholder every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    // API call to create post
    console.log("Creating post:", content);
    setContent("");
  };

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
              {/* Custom Animated Placeholder */}
              {!content && (
                <div
                  className={`absolute top-2 left-0 pointer-events-none text-[#9ca3af] text-lg transition-all duration-300 ${
                    fade
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1"
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

          <div className="flex items-center justify-between border-t border-[#2a2a3e] pt-4">
            <div className="flex gap-1 sm:gap-2">
              <Tooltip content="Add image">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-[#8B5CF6] flex items-center justify-center"
                >
                  <ImageIcon className="w-5 h-5" />
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
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-6 py-2 bg-[#8B5CF6] text-white font-semibold rounded-full hover:bg-[#7c4ee6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Post</span>
              <Send className="w-4 h-4 hidden sm:block" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
