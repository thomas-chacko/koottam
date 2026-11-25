import type { Metadata } from 'next';
import { CreatePostView } from '@/components/features/Feed/CreatePostView';

export const metadata: Metadata = {
  title: 'Create Post · Koottam',
  description: 'Share what\'s on your mind with the Koottam community.',
  robots: { index: false, follow: false },
};

export default function CreatePostPage() {
  return <CreatePostView />;
}
