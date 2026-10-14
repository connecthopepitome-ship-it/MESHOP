'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle2, ArrowRight, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const {
    currentUser,
    customerProfile,
    resendVerificationEmail,
    refreshVerificationStatus,
    signOut,
  } = useAuth();

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // If already verified, show success and redirect
  useEffect(() => {
    if (currentUser?.emailVerified) {
      setVerifiedSuccess(true);
      const timer = setTimeout(() => {
        router.push('/account');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.emailVerified, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    setResendSuccess(false);

    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        setResendSuccess(true);
        setCooldown(60); // 60s cooldown
      } else {
        setErrorMsg(res.error || 'Failed to dispatch verification email. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setErrorMsg('');

    try {
      const res = await refreshVerificationStatus();
      if (res.verified) {
        setVerifiedSuccess(true);
        setTimeout(() => {
          router.push('/account');
        }, 1500);
      } else {
        setErrorMsg('Email verification is not yet completed. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not verify status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/account/login');
  };

  const userEmail = currentUser?.email || customerProfile?.email || 'your registered email';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md sorayva-glass-card rounded-2xl p-6 sm:p-10 shadow-xl border border-champagne/40 text-center">
        
        {verifiedSuccess ? (
          <div className="py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-serif-display text-2xl text-deep-espresso">Email Verified!</h1>
            <p className="font-sans-body text-sm text-deep-espresso/70">
              Your customer account is now fully verified. Redirecting you to your account overview...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-champagne/20 text-terracotta flex items-center justify-center mx-auto border border-champagne/40 shadow-sm">
              <Mail className="w-8 h-8" />
            </div>

            <div>
              <span className="font-sans-fashion text-[0.65rem] tracking-[0.3em] text-terracotta uppercase block mb-1 font-bold">
                VERIFICATION REQUIRED
              </span>
              <h1 className="font-serif-display text-3xl text-deep-espresso mb-2">Check Your Inbox</h1>
              <p className="font-sans-body text-sm text-deep-espresso/75 leading-relaxed">
                We have dispatched a verification link to:
              </p>
              <p className="font-sans-body text-sm font-semibold text-deep-espresso mt-1 break-all bg-white/60 py-1.5 px-3 rounded-lg border border-champagne/30 inline-block">
                {userEmail}
              </p>
            </div>

            <p className="font-sans-body text-xs text-deep-espresso/60 leading-relaxed max-w-xs mx-auto">
              Please click the link inside the email to confirm your account and enable order history and secure checkout updates.
            </p>

            {resendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-sans-body flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verification email resent successfully!</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-sans-body flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleCheckStatus}
                disabled={isRefreshing}
                className="w-full h-12 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.2em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isRefreshing ? (
                  <div className="w-5 h-5 border-2 border-warm-ivory border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>I&apos;VE VERIFIED MY EMAIL</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className="w-full h-11 bg-white/60 border border-champagne/40 text-deep-espresso rounded-xl font-sans-fashion text-xs font-semibold tracking-wider uppercase hover:bg-soft-sand transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <span>Resend Verification Email</span>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-champagne/30 flex items-center justify-between text-xs font-sans-body text-deep-espresso/60">
              <button
                onClick={handleSignOut}
                className="hover:text-terracotta transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign in with another email</span>
              </button>

              <Link
                href="/shop"
                className="hover:text-terracotta transition-colors flex items-center gap-1"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
