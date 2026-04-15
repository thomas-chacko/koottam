'use client';

import Link from 'next/link';
import { Search, Bell, MessageCircle, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-[#0a0a0f] sticky top-0 z-50 h-16">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="cursor-pointer shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-white">Koottam</h1>
          </Link>
        </div>
        
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#9ca3af]" />
            <input
              type="search"
              placeholder="Search Koottam..."
              className="w-full pl-9 md:pl-10 pr-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm md:text-base text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>
        </div>
        
        <nav className="flex items-center gap-2 md:gap-4">
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
            className="hidden sm:block p-2 text-[#ededed] hover:text-white transition-colors cursor-pointer"
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
        </nav>
      </div>
    </header>
  );
}
