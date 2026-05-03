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
  title: "Koottam",
  description: "Koottam Social Media Platform",
  verification: {
  google: "ot5UHJ4P-aMy3i_N1aObFhE0N9rOHlxftZd2brnywT8"
}
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
