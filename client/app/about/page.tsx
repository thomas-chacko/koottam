import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Koottam | കൂട്ടം - Kerala Social Media Platform',
  description: 'Learn about Koottam (കൂട്ടം), the social media platform built for Kerala and Malayalis. Koottam means "group of people" in Malayalam - connecting Malayalis worldwide.',
  keywords: [
    'about koottam',
    'കൂട്ടം meaning',
    'kerala social media',
    'malayali platform',
    'koottam story',
    'malayalam social network',
    'kerala community',
    'about കൂട്ടം',
  ],
  openGraph: {
    title: 'About Koottam | കൂട്ടം - Kerala Social Media Platform',
    description: 'Koottam (കൂട്ടം) means "group of people" in Malayalam. We\'re building Kerala\'s social media platform for Malayalis worldwide.',
    type: 'website',
    url: 'https://koottam.vercel.app/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Koottam | കൂട്ടം',
    description: 'Kerala\'s social media platform connecting Malayalis worldwide.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            About <span className="text-primary">Koottam</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            കൂട്ടം - Group of People
          </p>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Kerala's social media platform connecting Malayalis worldwide
          </p>
        </div>
      </section>

      {/* What is Koottam */}
      <section className="py-16 px-6 bg-[#1a1a2e]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">What is Koottam?</h2>
          <div className="space-y-6 text-lg text-gray-300">
            <p>
              <strong className="text-white">Koottam (കൂട്ടം)</strong> is a Malayalam word that means{' '}
              <strong className="text-primary">"group of people"</strong> or "community". 
              It represents the essence of togetherness, connection, and belonging.
            </p>
            <p>
              We built Koottam as a social media platform specifically for the Kerala community 
              and Malayalis around the world. Whether you're in Kochi, Thiruvananthapuram, 
              Dubai, or anywhere else, Koottam helps you stay connected with your കൂട്ടം.
            </p>
            <p>
              Our platform celebrates Kerala culture, Malayalam language, and the unique bond 
              that Malayalis share. From Onam celebrations to everyday moments, Koottam is 
              where your കൂട്ടം comes together.
            </p>
          </div>
        </div>
      </section>

      {/* Why Koottam */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Why Koottam?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a2e] p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">🌴 For Kerala</h3>
              <p className="text-gray-300">
                Built specifically for the Kerala community with features and content 
                that resonate with Malayali culture and values.
              </p>
            </div>
            <div className="bg-[#1a1a2e] p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">🗣️ Malayalam First</h3>
              <p className="text-gray-300">
                Support for Malayalam language and script, making it easy to express 
                yourself in your mother tongue.
              </p>
            </div>
            <div className="bg-[#1a1a2e] p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">🌍 Global Malayalis</h3>
              <p className="text-gray-300">
                Connect with Malayalis worldwide - from Kerala to the Gulf, USA, UK, 
                and beyond. Your കൂട്ടം knows no boundaries.
              </p>
            </div>
            <div className="bg-[#1a1a2e] p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">🤝 Community First</h3>
              <p className="text-gray-300">
                Focus on meaningful connections and community engagement rather than 
                just likes and followers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-6 bg-[#1a1a2e]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
          <div className="text-lg text-gray-300 space-y-4">
            <p>
              To create a digital space where Malayalis can connect, share, and celebrate 
              their culture and identity. We believe that every Malayali deserves a platform 
              that understands their language, culture, and values.
            </p>
            <p>
              Koottam is more than just a social media platform - it's a digital home for 
              the Kerala community, a place where your കൂട്ടം thrives.
            </p>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Join Your കൂട്ടം Today</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of Kerala's growing social media community
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
