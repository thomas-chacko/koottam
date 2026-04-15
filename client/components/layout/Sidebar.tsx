'use client';

import Link from 'next/link';
import { Home, Compass, Users, Bookmark, User, Settings, PlusCircle } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navItems = [
    { label: 'Feed', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Communities', href: '/communities', icon: Users },
    { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 p-6 bg-[#0a0a0f] shrink-0
        transform transition-transform duration-300 lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#ededed] hover:bg-[#1a1a2e] hover:text-white transition-colors cursor-pointer"
                onClick={onClose}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <button className="w-full mt-6 px-6 py-3 bg-[#8B5CF6] text-white font-semibold rounded-lg hover:bg-[#7c4ee6] transition-colors cursor-pointer flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Create Post
        </button>
      </aside>
    </>
  );
}
