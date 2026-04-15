import type { Metadata } from 'next';
import { HomeFeed } from '@/components/features/Feed/HomeFeed';

export const metadata: Metadata = {
  title: 'Home - Koottam | Your Social Feed',
  description: 'Stay connected with your community. Discover posts, engage with content, and share your thoughts on Koottam.',
  keywords: ['social feed', 'community', 'posts', 'social media', 'koottam'],
  openGraph: {
    title: 'Home - Koottam',
    description: 'Stay connected with your community. Discover posts, engage with content, and share your thoughts.',
    type: 'website',
    url: 'https://koottam.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home - Koottam',
    description: 'Stay connected with your community. Discover posts, engage with content, and share your thoughts.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <HomeFeed />;
}
