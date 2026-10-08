'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <h1 className="font-serif-display text-3xl text-deep-espresso mb-6">Account Settings</h1>

      <div className="sorayva-glass-card rounded-2xl p-6 sm:p-8 border border-champagne/40 space-y-8">
        
        <div className="space-y-4">
          <h3 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase border-b border-champagne/40 pb-2">
            NOTIFICATIONS
          </h3>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-sans-body text-sm font-medium text-deep-espresso">Email Updates</p>
              <p className="font-sans-body text-xs text-deep-espresso/60">Receive offers, new launches and editorials.</p>
            </div>
            <div className="relative w-10 h-6 bg-terracotta/20 rounded-full transition-colors">
              <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-terracotta transition-transform" />
            </div>
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-sans-body text-sm font-medium text-deep-espresso">WhatsApp Alerts</p>
              <p className="font-sans-body text-xs text-deep-espresso/60">Order tracking and shipping updates.</p>
            </div>
            <div className="relative w-10 h-6 bg-terracotta rounded-full transition-colors">
              <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform" />
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase border-b border-champagne/40 pb-2">
            SECURITY
          </h3>
          
          <button className="text-sm font-sans-body text-deep-espresso hover:text-terracotta transition-colors">
            Change Password
          </button>
          
          <div className="pt-4 mt-4 border-t border-red-100">
            <button className="text-sm font-sans-body text-red-500 hover:text-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
