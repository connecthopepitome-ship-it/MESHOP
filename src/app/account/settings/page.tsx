'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, sendPasswordReset, signOut, loading } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleChangePassword = async () => {
    if (!currentUser?.email || isResetting) return;
    setIsResetting(true);
    setResetSuccess(false);
    setResetError('');

    try {
      const res = await sendPasswordReset(currentUser.email);
      if (res.success) {
        setResetSuccess(true);
      } else {
        setResetError(res.error || 'Failed to dispatch password reset email.');
      }
    } catch (err: any) {
      setResetError(err?.message || 'Error initiating password reset.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/account/login');
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <h1 className="font-serif-display text-3xl text-deep-espresso mb-6">Account Settings</h1>

      <div className="sorayva-glass-card rounded-2xl p-6 sm:p-8 border border-champagne/40 space-y-8">
        
        {/* NOTIFICATIONS SECTION */}
        <div className="space-y-4">
          <h2 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase border-b border-champagne/40 pb-2">
            PREFERENCES &amp; NOTIFICATIONS
          </h2>
          
          <label className="flex items-center justify-between cursor-pointer group py-2">
            <div>
              <p className="font-sans-body text-sm font-semibold text-deep-espresso">Atelier Email Updates</p>
              <p className="font-sans-body text-xs text-deep-espresso/60">Receive invitations to private seasonal saree previews and archival releases.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`relative w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                emailAlerts ? 'bg-terracotta' : 'bg-black/20'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  emailAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group py-2">
            <div>
              <p className="font-sans-body text-sm font-semibold text-deep-espresso">Courier &amp; Delivery WhatsApp Alerts</p>
              <p className="font-sans-body text-xs text-deep-espresso/60">Live courier dispatch notifications and real-time transit updates.</p>
            </div>
            <button
              type="button"
              onClick={() => setWhatsappAlerts(!whatsappAlerts)}
              className={`relative w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                whatsappAlerts ? 'bg-terracotta' : 'bg-black/20'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  whatsappAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
          </label>
        </div>

        {/* SECURITY & CREDENTIALS SECTION */}
        <div className="space-y-4 pt-4 border-t border-champagne/30">
          <h2 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase border-b border-champagne/40 pb-2">
            AUTHENTICATION &amp; SECURITY
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <p className="font-sans-body text-sm font-semibold text-deep-espresso">Account Password</p>
              <p className="font-sans-body text-xs text-deep-espresso/60">
                Managed via Firebase Authentication for account: <strong>{currentUser?.email}</strong>
              </p>
            </div>

            <button 
              onClick={handleChangePassword}
              disabled={isResetting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-champagne/60 text-xs font-sans-fashion tracking-wider uppercase text-deep-espresso hover:bg-white/60 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-terracotta" />
              <span>{isResetting ? 'Sending...' : 'Send Password Reset Email'}</span>
            </button>
          </div>

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-sans-body flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>A secure password reset link has been dispatched to {currentUser?.email}.</span>
            </div>
          )}

          {resetError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-sans-body flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{resetError}</span>
            </div>
          )}
        </div>

        {/* LOGOUT & SESSION */}
        <div className="pt-6 border-t border-champagne/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans-body text-deep-espresso/60">
            <Shield className="w-4 h-4 text-terracotta" />
            <span>End session on this device</span>
          </div>

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-deep-espresso text-warm-ivory font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
