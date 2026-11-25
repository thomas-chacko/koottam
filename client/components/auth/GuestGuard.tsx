"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Prevents authenticated users from accessing guest-only pages (login, signup).
 * Redirects them to the home feed immediately.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      router.replace("/");
    }
  }, [isMounted, isAuthenticated, router]);

  // While redirecting or hydrating, render nothing to avoid flash
  if (!isMounted || isAuthenticated) return null;

  return <>{children}</>;
}
