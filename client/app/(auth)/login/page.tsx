import Image from 'next/image';
import { LoginForm } from '@/components/features/Auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - Koottam | Access Your Account',
  description: 'Log in to your Koottam account and continue your journey in the premium social space for meaningful community engagement.',
  keywords: ['login', 'sign in', 'access account', 'koottam login', 'social media login'],
  openGraph: {
    title: 'Log In - Koottam',
    description: 'Access your Koottam account and continue your journey.',
    type: 'website',
    url: 'https://koottam.vercel.app/login',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Log In - Koottam',
    description: 'Access your Koottam account and continue your journey.',
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
              Connect with your<br />
              <span className="text-primary">inner circle.</span>
            </h1>
            
            <p className="text-gray-200 text-xl">
              The premium space for meaningful community engagement and discovery.
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
