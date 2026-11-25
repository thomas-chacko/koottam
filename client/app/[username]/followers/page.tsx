import { FollowersList } from '@/components/features/Profile/FollowersList';
export default function FollowersPage({ params, searchParams }: { params: { username: string }; searchParams: { tab?: string } }) {
  return <FollowersList username={params.username} initialTab={searchParams.tab === 'following' ? 'following' : 'followers'} />;
}
