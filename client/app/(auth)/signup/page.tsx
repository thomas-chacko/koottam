import Image from 'next/image';
import { SignupForm } from '@/components/features/Auth/SignupForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Join Koottam | കൂട്ടം',
  description: 'Create your Koottam (കൂട്ടം) account and join Kerala\'s social media platform. Connect with Malayalis, share your moments, and build your കൂട്ടം (group of people).',
  keywords: [
    'koottam signup',
    'കൂട്ടം register',
    'join koottam',
    'kerala social media signup',
    'malayali social network',
    'create account koottam',
    'malayalam social media',
    'kerala community join',
    'malayali connect',
    'kerala networking',
  ],
  openGraph: {
    title: 'Sign Up - Join Koottam | കൂട്ടം',
    description: 'Join Kerala\'s social media platform. Connect with Malayalis and build your കൂട്ടം.',
    type: 'website',
    url: 'https://koottam.vercel.app/signup',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up - Join Koottam | കൂട്ടം',
    description: 'Join Kerala\'s social media platform. Connect with Malayalis and build your കൂട്ടം.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupPage() {
  return (
    <div className="h-screen bg-[#0a0a0f] flex overflow-hidden">
      {/* Left Side - Full Blurred Image Background */}
      <aside className="hidden lg:flex lg:w-1/2 relative" aria-label="Hero section">
        {/* Background Image with Blur */}
        <div className="absolute inset-0">
          <Image
            src="/images/signup-hero.webp"
            alt="Diverse group of community members collaborating and engaging in meaningful conversations"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 backdrop-blur-xs bg-black/40" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-12 flex flex-col items-start justify-center max-w-2xl">
          <section className="space-y-6 max-w-2xl">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Connect with your കൂട്ടം
            </h1>
            
            <p className="text-gray-200 text-xl">
              Join Koottam, Kerala's social media platform designed for Malayalis to connect, share, and build meaningful relationships.
            </p>

            {/* Stats Badge */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
              <div className="flex -space-x-2" aria-hidden="true">
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-black" />
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-black" />
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-black" />
              </div>
              <span className="text-white text-sm">Join 12k+ Malayalis</span>
            </div>
          </section>
        </div>
      </aside>

      {/* Right Side - Signup Form */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
