'use client';

import React, { useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="font-sans text-xs tracking-widest uppercase text-slate-400">Authenticating SORAYVA Admin Control Centre...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-800 p-8 rounded-lg border border-slate-700 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
          <p className="text-xs text-slate-400 font-light">
            You must be logged in as an authorized SORAYVA Administrator to access this section.
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded transition-colors"
          >
            PROCEED TO ADMIN LOGIN
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
