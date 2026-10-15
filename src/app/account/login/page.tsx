'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const { signIn, signInWithGoogle, isFirebaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (isLoading || isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        router.push(redirectTarget);
      } else {
        setError(res.error || 'Google authentication was not completed.');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGoogleLoading) return;

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await signIn(email.trim(), password);
      if (res.success) {
        router.push(redirectTarget);
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'A network or system error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md sorayva-glass-card rounded-2xl p-6 sm:p-10 shadow-xl border border-champagne/40">
        
        {/* Atelier Brand Eyebrow */}
        <div className="text-center mb-8">
          <span className="font-sans-fashion text-[0.65rem] tracking-[0.3em] text-terracotta uppercase block mb-2 font-bold">
            SORAYVA ATELIER
          </span>
          <h1 className="font-serif-display text-3xl text-deep-espresso mb-2">Welcome Back</h1>
          <p className="font-sans-body text-sm text-deep-espresso/70">
            Sign in to view your bespoke orders, wishlist and saved addresses.
          </p>
        </div>

        {/* Warning if Firebase not configured */}
        {!isFirebaseReady && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-sans-body flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Firebase credentials are not yet configured in <code className="bg-amber-100 px-1 py-0.5 rounded text-[0.7rem]">.env.local</code>. Please configure your Firebase Web App keys.
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-sans-body flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Premium Continue with Google Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 bg-white/85 hover:bg-white text-deep-espresso border border-champagne/60 hover:border-terracotta/50 rounded-xl font-sans-fashion text-xs font-semibold tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-champagne/40" />
            </div>
            <div className="relative flex justify-center text-[0.65rem] uppercase tracking-widest">
              <span className="bg-warm-ivory px-3 text-deep-espresso/50 font-sans-fashion font-semibold">
                Or sign in with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div className="space-y-1">
            <label 
              htmlFor="customer-email" 
              className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1 block font-semibold"
            >
              Email Address
            </label>
            <input 
              id="customer-email"
              type="email" 
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all placeholder:text-deep-espresso/30"
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1 relative">
            <div className="flex items-center justify-between pl-1 pr-1">
              <label 
                htmlFor="customer-password" 
                className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold"
              >
                Password
              </label>
              <Link 
                href="/account/forgot-password" 
                className="text-xs text-terracotta hover:text-deep-espresso transition-colors font-sans-body"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input 
                id="customer-password"
                type={showPassword ? 'text' : 'password'} 
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/70 border border-champagne/40 rounded-xl pl-4 pr-11 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all placeholder:text-deep-espresso/30"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-deep-espresso/40 hover:text-deep-espresso transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !email || !password}
            className="w-full h-12 mt-2 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.2em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-warm-ivory border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Guest and Registration Links */}
        <div className="mt-8 pt-6 border-t border-champagne/30 text-center space-y-4">
          <p className="font-sans-body text-xs text-deep-espresso/70">
            Don&apos;t have an account yet?{' '}
            <Link 
              href="/account/signup" 
              className="text-terracotta hover:text-deep-espresso font-semibold underline underline-offset-4 transition-colors"
            >
              Create Account
            </Link>
          </p>
          <div className="pt-2">
            <Link 
              href="/shop" 
              className="text-[0.65rem] font-sans-fashion tracking-widest text-deep-espresso/50 hover:text-deep-espresso uppercase transition-colors"
            >
              Continue Browsing as Guest &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
