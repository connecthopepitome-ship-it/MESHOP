'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@sorayva.com');
  const [password, setPassword] = useState('sorayva2026');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory text-deep-espresso flex flex-col justify-center items-center px-4 py-12 selection:bg-terracotta selection:text-white">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-brand-border shadow-subtle animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-deep-espresso text-champagne font-serif-editorial font-medium text-2xl flex items-center justify-center mx-auto shadow-sm">
            SY
          </div>
          <div>
            <h1 className="text-3xl font-serif-editorial font-medium text-deep-espresso tracking-tight">SORAYVA</h1>
            <p className="text-xs font-semibold tracking-widest text-terracotta uppercase flex items-center justify-center mt-2 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Admin Control Centre
            </p>
          </div>
          <p className="text-sm text-brand-muted font-sans font-light leading-relaxed px-4">
            Authenticate to access the Google Sheets Catalogue Control Centre and two-way sync manager.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg text-sm font-sans flex items-start space-x-3 shadow-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-deep-espresso mb-2 font-sans">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/60 border border-brand-border rounded-lg py-3 pl-10 pr-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow shadow-sm font-sans"
                placeholder="admin@sorayva.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-deep-espresso mb-2 font-sans">
              Security Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/60 border border-brand-border rounded-lg py-3 pl-10 pr-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow shadow-sm font-sans"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 font-sans mt-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Authenticate & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-6 border-t border-brand-border text-center">
          <p className="text-[10px] uppercase tracking-widest text-brand-muted font-sans font-medium">
            Internal Sourcing Data Security Guaranteed <br className="hidden sm:block" />
            <span className="inline-block mt-1">256-Bit SSL Encrypted Admin Pipeline</span>
          </p>
        </div>
      </div>
    </div>
  );
}
