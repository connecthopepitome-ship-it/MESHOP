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

  const { signIn, isFirebaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

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
