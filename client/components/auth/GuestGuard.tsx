'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Prevents authenticated users from accessing guest-only pages (login, signup).
 * Redirects them to the home feed immediately.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // While redirecting, render nothing to avoid flash
  if (isAuthenticated) return null;

  return <>{children}</>;
}
