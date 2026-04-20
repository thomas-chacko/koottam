import { GuestGuard } from '@/components/auth/GuestGuard';

/**
 * Shared layout for all (auth) routes: /login, /signup.
 * GuestGuard redirects already-authenticated users back to home.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
