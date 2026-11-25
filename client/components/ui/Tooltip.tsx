"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      // Position above the trigger, centred horizontally
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  return (
    <div
      ref={triggerRef}
      className="inline-flex items-center justify-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {mounted &&
        visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="bg-[#2a2a3e] text-[#e2e8f0] text-xs py-1.5 px-3 rounded-lg shadow-xl border border-[#3f3f5a] whitespace-nowrap animate-fade-in"
          >
            {content}
            {/* Downward arrow */}
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#2a2a3e] border-b border-r border-[#3f3f5a] rotate-45" />
          </div>,
          document.body
        )}
    </div>
  );
}
