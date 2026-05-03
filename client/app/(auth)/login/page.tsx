import Image from 'next/image';
import { LoginForm } from '@/components/features/Auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - Koottam | കൂട്ടം',
  description: 'Log in to your Koottam (കൂട്ടം) account. Connect with your Kerala community, share moments with Malayalis, and stay connected with your കൂട്ടം.',
  keywords: [
    'koottam login',
    'കൂട്ടം login',
    'kerala social media login',
    'malayali social network login',
    'sign in koottam',
    'malayalam social media login',
    'kerala community login',
  ],
  openGraph: {
    title: 'Log In - Koottam | കൂട്ടം',
    description: 'Access your Koottam account and connect with your Kerala community.',
    type: 'website',
    url: 'https://koottam.vercel.app/login',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Log In - Koottam | കൂട്ടം',
    description: 'Access your Koottam account and connect with your Kerala community.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <div className="h-screen bg-[#0a0a0f] flex overflow-hidden">
      {/* Left Side - Full Blurred Image Background */}
      <aside className="hidden lg:flex lg:w-1/2 relative" aria-label="Hero section">
        {/* Background Image with Blur */}
        <div className="absolute inset-0">
          <Image
            src="/images/login-hero.webp"
            alt="Community members collaborating and sharing ideas in a welcoming environment"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 backdrop-blur-xs bg-black/50" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-12 flex flex-col items-start justify-center max-w-2xl">
          <section className="space-y-6 max-w-2xl">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Welcome back to your<br />
              <span className="text-primary">കൂട്ടം.</span>
            </h1>
            
            <p className="text-gray-200 text-xl">
              Kerala's social space for meaningful connections and community engagement.
            </p>
          </section>
        </div>
      </aside>

      {/* Right Side - Login Form */}
      <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-xl my-auto">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
