import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://koottam.vercel.app'),
  title: {
    default: 'Koottam - Social Media for Kerala | കൂട്ടം',
    template: '%s | Koottam',
  },
  description: 'Koottam (കൂട്ടം) - Social media platform for Malayalis and Kerala community. Connect with people from Kerala, share posts, photos, and build your കൂട്ടം (group). Join the largest Malayalam social network.',
  keywords: [
    'koottam',
    'കൂട്ടം',
    'kerala social media',
    'malayali social network',
    'malayalam social media',
    'kerala community',
    'malayali community',
    'social media kerala',
    'kerala people',
    'malayali connect',
    'kerala networking',
    'malayalam platform',
    'kerala online community',
    'malayali friends',
    'kerala social network',
    'indian social media',
    'south indian social media',
    'regional social media india',
    'malayalam app',
    'kerala app',
  ],
  authors: [{ name: 'Koottam Team' }],
  creator: 'Koottam',
  publisher: 'Koottam',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ml_IN'],
    url: 'https://koottam.vercel.app',
    siteName: 'Koottam',
    title: 'Koottam - Social Media for Kerala & Malayalis | കൂട്ടം',
    description: 'Join Koottam (കൂട്ടം), the social media platform built for Kerala community. Connect with Malayalis worldwide, share your moments, and build your കൂട്ടം.',
    images: [
      {
        url: '/images/koottam-logo.png',
        width: 1200,
        height: 630,
        alt: 'Koottam - Kerala Social Media Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koottam - Social Media for Kerala | കൂട്ടം',
    description: 'Join Koottam (കൂട്ടം), the social media platform for Kerala community. Connect with Malayalis, share posts, and build your group.',
    images: ['/images/koottam-logo.png'],
    creator: '@koottam',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    // yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
    // bing: 'YOUR_BING_VERIFICATION_CODE',
  },
  alternates: {
    canonical: 'https://koottam.vercel.app',
  },
  category: 'Social Networking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Koottam',
    alternateName: 'കൂട്ടം',
    url: 'https://koottam.vercel.app',
    description: 'Social media platform for Kerala community and Malayalis. Koottam (കൂട്ടം) means "group of people" in Malayalam.',
    inLanguage: ['en', 'ml'],
    audience: {
      '@type': 'Audience',
      geographicArea: {
        '@type': 'Place',
        name: 'Kerala, India',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://koottam.vercel.app/explore?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Koottam',
      description: 'Social media platform for Kerala and Malayalam-speaking community',
      logo: {
        '@type': 'ImageObject',
        url: 'https://koottam.vercel.app/images/koottam-logo.png',
      },
      areaServed: {
        '@type': 'Place',
        name: 'Kerala, India',
      },
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
