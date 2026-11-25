"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Short label for what requires login — kept for future use / analytics */
  featureName?: string;
}

/**
 * Wraps protected pages.
 * Non-authenticated users are immediately redirected to /login.
 * Authenticated users see the real content without any flash.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  // Return null (blank screen) while redirect is in flight or hydrating — no flash
  if (!isMounted || !isAuthenticated) return null;

  return <>{children}</>;
}
