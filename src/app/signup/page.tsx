'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Sign up failed');
        return;
      }

      setSent(true);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-light-secondary dark:bg-dark-secondary rounded-2xl border border-light-200 dark:border-dark-200 p-10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-7 h-7 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-sm text-black/50 dark:text-white/50 mb-6">
              We sent a verification link to{' '}
              <span className="font-medium text-black/80 dark:text-white/80">
                {email}
              </span>
              . Click the link to activate your account.
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition"
                placeholder="Your name"
              />
            </div>

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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-light-200 dark:border-dark-200 bg-light-primary dark:bg-dark-primary text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition"
                  placeholder="Min. 8 characters"
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/50 dark:text-white/50">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
