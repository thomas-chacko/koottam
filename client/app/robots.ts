import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://koottam.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Don't index API routes
          '/settings/',      // Private user settings
          '/messages/',      // Private messages
          '/*?*',            // Don't index URLs with query parameters
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/settings/', '/messages/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
