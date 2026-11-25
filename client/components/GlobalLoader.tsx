"use client";

import { useAppStore } from "@/store/useAppStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalLoader() {
  const isLoading = useAppStore((state) => state.isLoading);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
          Processing...
        </p>
      </div>
    </div>
  );
}
