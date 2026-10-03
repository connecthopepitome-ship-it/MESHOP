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
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-sans font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white hover:opacity-80 text-xs font-bold">×</button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand Identity */}
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm tracking-wider">
                SY
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-sm tracking-wider text-slate-100 uppercase">SORAYVA</span>
                <span className="font-sans text-[10px] text-amber-400 font-semibold tracking-widest uppercase flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1 inline" /> CATALOGUE CONTROL CENTRE
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded text-xs font-sans font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
          <div className="flex items-center space-x-3">
            {/* Cache Refresh Action */}
            <button
              onClick={handleClearCache}
              disabled={isRefreshing}
              title="Clear catalogue cache to force immediate Google Sheets revalidation"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Cache</span>
            </button>

            {/* View Live Storefront */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Live Storefront</span>
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              title={`Logged in as ${adminEmail || 'Admin'}`}
              className="flex items-center space-x-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
