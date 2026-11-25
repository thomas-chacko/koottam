import type { Metadata } from 'next';
import { NotificationsFeed } from '@/components/features/Notification/NotificationsFeed';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'Notifications - Koottam',
  description: 'View your recent activity, likes, followers, and mentions on Koottam.',
};

export default function NotificationsPage() {
  return (
    <AuthGuard featureName="Notifications">
      <NotificationsFeed />
    </AuthGuard>
  );
}
