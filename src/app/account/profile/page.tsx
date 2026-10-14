'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, customerProfile, updateCustomerProfile, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customerProfile || currentUser) {
      setFormData({
        name: customerProfile?.name || customerProfile?.displayName || currentUser?.displayName || '',
        email: customerProfile?.email || currentUser?.email || '',
        phone: customerProfile?.phone || '',
      });
    }
  }, [customerProfile, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const res = await updateCustomerProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      if (res.success) {
        setSuccessMsg('Your profile has been saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif-display text-3xl text-deep-espresso">Profile Details</h1>
        {currentUser?.emailVerified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-sans-fashion tracking-wider uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified Patron
          </span>
        ) : (
          <Link
            href="/account/verify-email"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-sans-fashion tracking-wider uppercase font-bold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
          >
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Verify Email
          </Link>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-sans-body flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-sans-body flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="sorayva-glass-card rounded-2xl p-6 sm:p-8 border border-champagne/40 space-y-6">
        <div className="space-y-1">
          <label 
            htmlFor="profile-name"
            className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1 block font-semibold"
          >
            Full Name
          </label>
          <input 
            id="profile-name"
            type="text" 
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full h-12 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
            required
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label 
              htmlFor="profile-email"
              className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1 block font-semibold"
            >
              Email Address
            </label>
            <input 
              id="profile-email"
              type="email" 
              name="email"
              value={formData.email}
              className="w-full h-12 bg-black/5 border border-champagne/30 rounded-xl px-4 text-sm focus:outline-none transition-all text-deep-espresso/60 cursor-not-allowed"
              disabled
            />
            <p className="text-[0.65rem] font-sans-body text-deep-espresso/50 pl-1 pt-1">
              Managed through Firebase Auth. Contact support to change.
            </p>
          </div>
          
          <div className="space-y-1">
            <label 
              htmlFor="profile-phone"
              className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1 block font-semibold"
            >
              Mobile Number
            </label>
            <input 
              id="profile-phone"
              type="tel" 
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full h-12 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all placeholder:text-deep-espresso/30"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-champagne/30 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="h-11 px-8 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors disabled:opacity-50 shadow-md"
          >
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}
