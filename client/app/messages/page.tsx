import type { Metadata } from 'next';
import { MessagesView } from '@/components/features/Messages/MessagesView';

export const metadata: Metadata = {
  title: 'Messages - Koottam',
  description: 'Direct messages and private conversations on Koottam.',
};

export default function MessagesPage() {
  return <MessagesView />;
}
