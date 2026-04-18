'use client';

import { useState } from 'react';
import { Image as ImageIcon, Smile, BarChart3, Send } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export function CreatePost() {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    // API call to create post
    console.log('Creating post:', content);
    setContent('');
  };

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 sm:p-6 mb-6 mt-2 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6] shrink-0 flex items-center justify-center text-white font-bold text-lg select-none">
            ME
          </div>

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your community?"
              className="w-full bg-transparent text-white placeholder-[#9ca3af] resize-none focus:outline-none min-h-[80px] text-lg py-2"
            />

            <div className="flex items-center justify-between border-t border-[#2a2a3e] pt-4 mt-2">
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
                className="px-6 py-2 bg-[#8B5CF6] text-white font-semibold rounded-full hover:bg-[#7c4ee6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Post</span>
                <Send className="w-4 h-4 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
