import Image from 'next/image';
import Link from 'next/link';
import { SignupForm } from '@/components/features/Auth/SignupForm';

export default function SignupPage() {
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
            Connect with
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            Join the premium social space designed for deep community engagement and meaningful interactions.
          </p>

          <div className="relative w-full max-w-md h-80 rounded-2xl overflow-hidden">
            <Image
              src="/images/signup-hero.jpg"
              alt="Community members collaborating"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-black" />
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-black" />
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-black" />
              </div>
              <span className="text-white text-sm">Join 12k+ community members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
