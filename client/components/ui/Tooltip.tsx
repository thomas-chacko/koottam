'use client';

import React, { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group inline-flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#2a2a3e] text-[#e2e8f0] text-xs py-1.5 px-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-[#3f3f5a] whitespace-nowrap pointer-events-none z-50">
        {content}
        {/* Downward pointing arrow */}
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#2a2a3e] border-b border-r border-[#3f3f5a] transform rotate-45"></div>
      </div>
    </div>
  );
}
