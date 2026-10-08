'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthService } from '@/lib/services/AuthService';

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await AuthService.login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await AuthService.sendOtp(phone);
    setIsLoading(false);
    
    if (res.success) {
      setOtpSent(true);
    } else {
      setError(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    
    setError('');
    setIsLoading(true);
    const res = await AuthService.verifyOtp(phone, otp);
    setIsLoading(false);
    
    if (res.success) {
      router.push('/account');
    } else {
      setError(res.error || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md sorayva-glass-card rounded-2xl p-6 sm:p-10 shadow-xl border border-champagne/40">
        
        <div className="text-center mb-8">
          <h1 className="font-sans-fashion text-xs tracking-[0.3em] text-terracotta uppercase mb-3">SORAYVA</h1>
          <h2 className="font-serif-display text-3xl text-deep-espresso mb-2">Welcome Back</h2>
          <p className="font-sans-body text-sm text-deep-espresso/70">
            {otpSent 
              ? 'Enter the 6-digit code sent to your mobile.' 
              : 'Sign in to view your orders, wishlist and saved details.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-sans-body">
            {error}
          </div>
        )}

        {method === 'email' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                Email / Mobile
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                placeholder="Enter your email or mobile"
                required
              />
            </div>
            
            <div className="space-y-1 relative">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase">
                  Password
                </label>
                <Link href="/account/forgot-password" className="text-xs text-terracotta hover:text-deep-espresso transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-deep-espresso/50 hover:text-deep-espresso"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        )}

        {method === 'otp' && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                ENTER MOBILE NUMBER
              </label>
              <div className="flex items-center gap-2">
                <div className="h-12 w-16 bg-white/50 border border-champagne/40 rounded-xl flex items-center justify-center text-sm text-deep-espresso/70 shrink-0">
                  +91
                </div>
                <input 
                  type="tel" 
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors disabled:opacity-70"
            >
              {isLoading ? 'SENDING...' : 'SEND OTP'}
            </button>
          </form>
        )}

        {method === 'otp' && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
            <div className="space-y-2 text-center">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase">
                VERIFY YOUR NUMBER
              </label>
              <input 
                type="text" 
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 bg-white/70 border border-champagne/60 rounded-xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all font-mono"
                placeholder="••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              className="w-full h-12 mt-2 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors disabled:opacity-70"
            >
              {isLoading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
            </button>
            
            <div className="flex items-center justify-between text-xs font-sans-body px-1">
              <button type="button" onClick={() => setOtpSent(false)} className="text-deep-espresso/60 hover:text-terracotta">
                Change number
              </button>
              <button type="button" onClick={handleSendOtp} className="text-deep-espresso font-medium hover:text-terracotta">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {!otpSent && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-champagne/40 flex-1" />
              <span className="text-xs font-sans-body text-deep-espresso/40">or</span>
              <div className="h-px bg-champagne/40 flex-1" />
            </div>

            <button 
              type="button"
              onClick={() => setMethod(method === 'email' ? 'otp' : 'email')}
              className="w-full h-12 bg-transparent border border-champagne/60 text-deep-espresso rounded-xl font-sans-fashion text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/50 transition-colors"
            >
              {method === 'email' ? 'CONTINUE WITH PHONE' : 'CONTINUE WITH EMAIL'}
            </button>
          </>
        )}

        <div className="mt-8 text-center border-t border-champagne/30 pt-6">
          <p className="text-sm font-sans-body text-deep-espresso/70 mb-3">New to SORAYVA?</p>
          <Link 
            href="/account/signup"
            className="inline-flex font-sans-fashion text-xs font-bold tracking-[0.15em] text-terracotta uppercase hover:text-deep-espresso transition-colors items-center gap-1"
          >
            CREATE ACCOUNT <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}
