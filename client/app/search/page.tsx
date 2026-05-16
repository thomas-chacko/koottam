import type { Metadata } from 'next';
import { SearchView } from '@/components/features/Search/SearchView';

export const metadata: Metadata = {
  title: 'Search - Koottam',
  description: 'Search for users, posts, and topics on Koottam.',
};

export default function SearchPage() {
  return <SearchView />;
}
