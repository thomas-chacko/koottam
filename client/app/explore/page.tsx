import type { Metadata } from 'next';
import { ExploreFeed } from '@/components/features/Explore/ExploreFeed';

export const metadata: Metadata = {
  title: 'Explore - Koottam',
  description: 'Discover trending topics, popular posts, and what is happening right now on Koottam.',
};

export default function ExplorePage() {
  return <ExploreFeed />;
}
