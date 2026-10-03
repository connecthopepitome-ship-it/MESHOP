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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-amber-500 text-slate-950 font-bold text-xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            SY
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">SORAYVA</h1>
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase flex items-center justify-center mt-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Admin Control Centre
            </p>
          </div>
          <p className="text-xs text-slate-400 font-light">
            Authenticate to access the Google Sheets Catalogue Control Centre and two-way sync manager.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded py-2.5 pl-10 pr-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="admin@sorayva.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded py-2.5 pl-10 pr-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest py-3 rounded transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'AUTHENTICATE & ENTER'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Internal Sourcing Data Security Guaranteed • 256-Bit SSL Encrypted Admin Pipeline
          </p>
        </div>
      </div>
    </div>
  );
}
