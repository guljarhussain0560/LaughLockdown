'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up logic
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Sign up failed');
        }

        // Auto sign in after signup
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        router.push(callbackUrl);
      } else {
        // Sign in logic
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Left Side - Branding */}
      <div className="items-center justify-center hidden p-12 bg-blue-600 lg:flex lg:w-1/2 dark:bg-blue-700">
        <div className="max-w-md">
          <Link href="/" className="inline-block mb-8">
            <h1 className="mb-2 text-5xl font-bold text-white">
              LaughLockdown
            </h1>
          </Link>
          <p className="mb-8 text-xl text-blue-100">
            Test your self-control with hilarious memes. Compete with players worldwide.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-50">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Real-time AI face detection</span>
            </div>
            <div className="flex items-center gap-3 text-blue-50">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Multiplayer challenges</span>
            </div>
            <div className="flex items-center gap-3 text-blue-50">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Global leaderboard rankings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center flex-1 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-6 text-center lg:hidden sm:mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                LaughLockdown
              </h1>
            </Link>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-800 sm:p-8">
            <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="mb-4 text-sm text-gray-600 sm:text-base dark:text-gray-400 sm:mb-6">
              {isSignUp ? 'Start your gaming journey' : 'Welcome back, player'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="p-3 mb-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 touch-manipulation">
              {isSignUp && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    required={isSignUp}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required={isSignUp}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 sm:py-3.5 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4 sm:my-6">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              <span className="px-3 text-xs text-gray-500 sm:px-4 dark:text-gray-400 sm:text-sm">or</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full px-6 py-3 sm:py-3.5 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-750 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Toggle Sign In/Sign Up */}
            <div className="mt-4 text-center sm:mt-6">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline active:text-blue-800 sm:text-sm touch-manipulation"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center sm:mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white sm:text-sm touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
