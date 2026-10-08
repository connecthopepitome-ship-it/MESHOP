'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthService } from '@/lib/services/AuthService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const res = await AuthService.sendPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md sorayva-glass-card rounded-2xl p-6 sm:p-10 shadow-xl border border-champagne/40">
        
        <div className="mb-6">
          <Link href="/account/login" className="inline-flex items-center text-xs font-sans-fashion tracking-widest text-deep-espresso/60 hover:text-terracotta transition-colors uppercase">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Sign In
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-serif-display text-3xl text-deep-espresso mb-2">Reset Password</h1>
          <p className="font-sans-body text-sm text-deep-espresso/70">
            {success ? 'We have sent a reset link to your email.' : 'Enter your email or mobile to receive a reset link.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-sans-body">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-sage mb-4" />
            <h3 className="font-serif-editorial text-xl text-deep-espresso mb-2">CHECK YOUR EMAIL</h3>
            <p className="text-sm font-sans-body text-center text-deep-espresso/70 mb-8 max-w-[250px]">
              If an account exists for {email}, you will receive a secure reset link.
            </p>
            <Link 
              href="/account/login"
              className="w-full h-12 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center"
            >
              RETURN TO LOGIN
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                Email / Mobile
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                placeholder="Enter email or mobile"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !email}
              className="w-full h-12 mt-4 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
