'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! You can now sign in.');
    }
    if (searchParams.get('error') === 'invalid-token') {
      toast.error('Verification link is invalid or expired.');
    }
    if (searchParams.get('error') === 'server-error') {
      toast.error('Something went wrong. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Sign in failed');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Shion AI
          </h1>
          <p className="mt-2 text-sm text-black/50 dark:text-white/50">
            AI powered research assistant
          </p>
        </div>

        {/* Card */}
        <div className="bg-light-secondary dark:bg-dark-secondary rounded-2xl border border-light-200 dark:border-dark-200 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/50 dark:text-white/50">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
