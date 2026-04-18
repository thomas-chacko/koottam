import type { Metadata } from 'next';
import { UserProfile } from '@/components/features/Profile/UserProfile';

export const metadata: Metadata = {
  title: 'Profile - Koottam',
  description: 'View and manage your Koottam profile and posts.',
};

export default function ProfilePage() {
  return <UserProfile />;
}
