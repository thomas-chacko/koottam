import type { Metadata } from 'next';
import { HomeFeed } from '@/components/features/Feed/HomeFeed';

export const metadata: Metadata = {
  title: 'Koottam - Social Media for Kerala | കൂട്ടം',
  description: 'Koottam (കൂട്ടം) - Social media platform for Kerala and Malayalis. Connect with people from Kerala, share posts, photos, and build your കൂട്ടം (group). Join the Malayalam social network.',
  keywords: [
    'koottam',
    'കൂട്ടം',
    'kerala social media',
    'malayali social network',
    'malayalam social media',
    'kerala community',
    'malayali connect',
    'kerala posts',
    'malayalam platform',
    'kerala people',
  ],
  openGraph: {
    title: 'Koottam - Social Media for Kerala | കൂട്ടം',
    description: 'Connect with Malayalis, share your moments, and build your കൂട്ടം on Kerala\'s social media platform.',
    type: 'website',
    url: 'https://koottam.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koottam - Social Media for Kerala | കൂട്ടം',
    description: 'Connect with Malayalis, share your moments, and build your കൂട്ടം on Kerala\'s social media platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <HomeFeed />;
}
