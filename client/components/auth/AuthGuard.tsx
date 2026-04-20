'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Short label for what requires login, e.g. "Messages", "Bookmarks" */
  featureName: string;
}

/**
 * Wraps protected pages. Non-authenticated users see a clean login prompt;
 * authenticated users see the real content.
 */
export function AuthGuard({ children, featureName }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#8B5CF6]" />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {featureName} requires login
            </h2>
            <p className="text-[#9ca3af] text-sm leading-relaxed">
              Join Koottam to access {featureName.toLowerCase()} and connect with your community.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/login"
              className="flex-1 px-5 py-2.5 bg-[#8B5CF6] text-white font-semibold rounded-lg hover:bg-[#7c4ee6] transition-colors cursor-pointer text-center text-sm"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex-1 px-5 py-2.5 bg-[#1a1a2e] text-[#ededed] font-semibold rounded-lg border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-colors cursor-pointer text-center text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
