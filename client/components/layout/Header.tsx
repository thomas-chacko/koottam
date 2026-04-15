'use client';

import Link from 'next/link';
import { Search, Bell, MessageCircle, User, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <header className="bg-[#0a0a0f] sticky top-0 z-50 h-16 border-b border-[#2a2a3e]/50">
      <div className="flex flex-row justify-between w-full h-full px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto gap-2">
        {/* Left Column matching left sidebar width */}
        <div className="flex items-center gap-3 md:w-64 lg:w-72 shrink-0 lg:pl-10 h-full">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="hidden md:block cursor-pointer shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-white"> <span className="text-[#8B5CF6]">K</span>oottam</h1>
          </Link>
        </div>

        {/* Middle Column matching feed width */}
        <div className="flex-1 w-full max-w-[650px] mx-auto flex items-center justify-end md:justify-center h-full sm:px-4">
          <div
            className={`relative flex items-center bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden transition-all duration-300 ease-in-out cursor-text
              ${isSearchExpanded ? 'w-full rounded-xl' : 'w-10 h-10 md:w-full md:h-auto rounded-full md:rounded-xl'}`}
            onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
          >
            <button
              className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors cursor-pointer z-10"
              onClick={(e) => {
                if (!isSearchExpanded) {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSearchExpanded(true);
                }
              }}
              title="Search"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search Koottam..."
              className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm md:text-base text-white placeholder-[#9ca3af] focus:outline-none transition-opacity duration-200
                ${isSearchExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
              onBlur={(e) => {
                if (e.target.value.trim() === '') {
                  setIsSearchExpanded(false);
                }
              }}
            />
          </div>
        </div>

        {/* Right Column matching right sidebar width */}
        <div className="hidden xl:flex items-center justify-end gap-2 md:gap-4 w-[350px] shrink-0 h-full">
          <Link
            href="/notifications"
            className="p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#8B5CF6] rounded-full" />
          </Link>
          <Link
            href="/messages"
            className="p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          <Link
            href="/profile"
            className="p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer"
            title="Profile"
          >
            <User className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
        </div>

        {/* Mobile Right Column */}
        <div className="flex xl:hidden items-center justify-end gap-1 sm:gap-2 shrink-0 h-full">
          <Link
            href="/notifications"
            className="p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#8B5CF6] rounded-full" />
          </Link>
          <Link
            href="/profile"
            className="p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
