import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/features/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="h-screen bg-[#0a0a0f] flex overflow-hidden">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] p-12 flex-col justify-between overflow-y-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">K</span>
          </div>
          <span className="text-white text-xl font-semibold">Koottam</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Welcome back
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            Continue your journey in the Koottam community.
          </p>

          <div className="relative w-full max-w-md h-80 rounded-2xl overflow-hidden">
            <Image
              src="/images/signup-hero.jpg"
              alt="Community members collaborating"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-xl my-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
