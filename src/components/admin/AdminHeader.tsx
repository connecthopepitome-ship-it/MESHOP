'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { repository } from '@/lib/api/googleSheetsRepository';
import { LayoutDashboard, Package, PlusCircle, ExternalLink, RefreshCw, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const pathname = usePathname();
  const { adminEmail, logout } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleClearCache = async () => {
    setIsRefreshing(true);
    try {
      const res = await repository.clearCatalogueCache();
      if (res) {
        setToastMsg('Published catalogue cache cleared. Live storefront is reading updated Google Sheets data.');
      } else {
        setToastMsg('Catalogue cache refresh triggered.');
      }
    } catch (e) {
      setToastMsg('Cache refresh triggered.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Catalogue', href: '/admin/products', icon: Package },
    { label: 'Add Saree', href: '/admin/products/new', icon: PlusCircle },
  ];

  return (
    <header className="sorayva-glass sticky top-0 z-40 border-b border-brand-border transition-all duration-300">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="bg-soft-sage text-deep-espresso px-4 py-2 text-xs font-sans font-medium flex items-center justify-between animate-fadeIn border-b border-brand-border/50">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-deep-espresso" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-deep-espresso hover:opacity-70 text-xs font-bold touch-target">×</button>
        </div>
      )}

      {/* Desktop & Top Header Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand Identity */}
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-deep-espresso flex items-center justify-center text-champagne font-serif-display text-sm tracking-widest shadow-subtle">
                SY
              </div>
              <div className="flex flex-col">
                <span className="font-serif-display font-medium text-lg tracking-widest text-deep-espresso uppercase leading-none">SORAYVA</span>
                <span className="font-sans text-[9px] text-terracotta font-semibold tracking-widest uppercase flex items-center mt-0.5">
                  <ShieldCheck className="w-3 h-3 mr-1 inline" /> CATALOGUE CONTROL
                </span>
              </div>
            </Link>

            {/* Main Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname ? (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) : false;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-surface text-deep-espresso shadow-subtle'
                        : 'text-brand-muted hover:bg-white/40 hover:text-deep-espresso'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cache Refresh Action */}
            <button
              onClick={handleClearCache}
              disabled={isRefreshing}
              title="Clear catalogue cache to force immediate Google Sheets revalidation"
              className="flex items-center space-x-1.5 bg-white/50 hover:bg-white text-brand-muted hover:text-deep-espresso border border-brand-border px-2 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-200 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-terracotta' : ''}`} />
              <span className="hidden lg:inline">Refresh Cache</span>
            </button>

            {/* View Live Storefront */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-1.5 bg-white/50 hover:bg-white text-brand-muted hover:text-deep-espresso border border-brand-border px-2 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-200 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Live Storefront</span>
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              title={`Logged in as ${adminEmail || 'Admin'}`}
              className="flex items-center space-x-1.5 bg-brand-surface hover:bg-rose-50 text-terracotta hover:text-rose-600 border border-brand-border/60 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-brand-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe pt-1 z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname ? (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-terracotta' : 'text-brand-muted hover:text-deep-espresso'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-brand-surface shadow-sm' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-terracotta' : ''}`} />
                </div>
                <span className="text-[10px] font-sans font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
