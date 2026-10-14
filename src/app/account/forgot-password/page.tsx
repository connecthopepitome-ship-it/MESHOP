'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const { sendPasswordReset, isFirebaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await sendPasswordReset(email.trim());
      setIsLoading(false);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to dispatch reset email. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'A network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md sorayva-glass-card rounded-2xl p-6 sm:p-10 shadow-xl border border-champagne/40">
        
        <div className="mb-6">
          <Link 
            href="/account/login" 
            className="inline-flex items-center text-[0.65rem] font-sans-fashion tracking-widest text-deep-espresso/60 hover:text-terracotta transition-colors uppercase font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
          </Link>
        </div>

        <div className="mb-8">
          <span className="font-sans-fashion text-[0.65rem] tracking-[0.3em] text-terracotta uppercase block mb-2 font-bold">
            SECURITY &amp; RECOVERY
          </span>
          <h1 className="font-serif-display text-3xl text-deep-espresso mb-2">Reset Password</h1>
          <p className="font-sans-body text-sm text-deep-espresso/70 leading-relaxed">
            {success 
              ? 'Check your inbox for a secure password reset link.' 
              : 'Enter the email address registered with your SORAYVA account to receive a secure password reset link.'}
          </p>
        </div>

        {/* Warning if Firebase not configured */}
        {!isFirebaseReady && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-sans-body flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Firebase credentials are not yet configured in <code className="bg-amber-100 px-1 py-0.5 rounded text-[0.7rem]">.env.local</code>.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-sans-body flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 animate-fadeIn space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif-editorial text-xl text-deep-espresso">CHECK YOUR EMAIL</h2>
            <p className="text-sm font-sans-body text-center text-deep-espresso/70 max-w-[280px] leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure Firebase password reset email has been dispatched.
            </p>
            <div className="pt-4 w-full">
              <Link 
                href="/account/login"
                className="w-full h-12 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.2em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>RETURN TO LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5" noValidate>
            <div className="space-y-1">
              <label 
                htmlFor="forgot-email" 
                className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1 block font-semibold"
              >
                Registered Email Address
              </label>
              <input 
                id="forgot-email"
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

            <button 
              type="submit" 
              disabled={isLoading || !email}
              className="w-full h-12 mt-2 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.2em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-warm-ivory border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>SEND RESET LINK</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
