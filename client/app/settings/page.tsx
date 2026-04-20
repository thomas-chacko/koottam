import type { Metadata } from 'next';
import { SettingsView } from '@/components/features/Settings/SettingsView';

export const metadata: Metadata = {
  title: 'Settings - Koottam',
  description: 'Manage your Koottam account settings, privacy, and preferences.',
};

export default function SettingsPage() {
  return <SettingsView />;
}
