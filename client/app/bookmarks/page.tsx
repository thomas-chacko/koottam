import type { Metadata } from 'next';
import { BookmarksFeed } from '@/components/features/Bookmarks/BookmarksFeed';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'Bookmarks - Koottam',
  description: 'View your saved posts and organized collections on Koottam.',
};

export default function BookmarksPage() {
  return (
    <AuthGuard featureName="Bookmarks">
      <BookmarksFeed />
    </AuthGuard>
  );
}
