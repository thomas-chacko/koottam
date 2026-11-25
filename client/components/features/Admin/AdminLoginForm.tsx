'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';

export function AdminLoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logoutStore = useAuthStore((s) => s.logout);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      const { user, token } = res.data;

      if (user.role === 'admin' || user.role === 'moderator') {
        setAuth(user, token);
        router.push('/admin');
      } else {
        setError('Access denied. Admin or moderator role required.');
        logoutStore();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4'>
      <div className='bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-8 w-full max-w-md shadow-2xl'>
        <div className='flex items-center gap-3 mb-1'>
          <Lock className='text-[#8B5CF6]' size={24} />
          <h1 className='text-3xl font-bold text-white'>
            <span className='text-[#8B5CF6]'>K</span>oottam
          </h1>
        </div>
        <p className='text-[#9ca3af] text-sm mb-8'>Admin Panel</p>

        <form onSubmit={handleSubmit}>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors mb-4'
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors mb-4'
          />

          {error && (
            <p className='text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/20 rounded-lg p-3'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {loading && <Loader2 size={18} className='animate-spin' />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <Link
          href='/'
          className='text-[#9ca3af] hover:text-[#8B5CF6] text-sm transition-colors mt-6 block text-center'
        >
          ← Back to Koottam
        </Link>
      </div>
    </div>
  );
}
