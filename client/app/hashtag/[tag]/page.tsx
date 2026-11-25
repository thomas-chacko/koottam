import { HashtagView } from '@/components/features/Hashtag/HashtagView';
export default function HashtagPage({ params }: { params: { tag: string } }) {
  return <HashtagView tag={params.tag} />;
}
