import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koottam - Premium Social Media Platform',
    short_name: 'Koottam',
    description: 'Premium social space for deep community engagement',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#8B5CF6',
    icons: [
      {
        src: '/images/koottam-logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
