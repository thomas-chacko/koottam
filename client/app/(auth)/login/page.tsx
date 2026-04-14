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
      {/* Left Side - Hero Section */}
      <aside className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] p-12 flex-col justify-between overflow-y-auto" aria-label="Hero section">
        <header className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-bold">K</span>
          </div>
          <span className="text-white text-xl font-semibold">Koottam</span>
        </header>

        <section className="space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Welcome back
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            Continue your journey in the Koottam community.
          </p>

          <figure className="relative w-full max-w-md h-80 rounded-2xl overflow-hidden">
            <Image
              src="/images/signup-hero.jpg"
              alt="Community members collaborating and sharing ideas in a welcoming environment"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </figure>
        </section>
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
