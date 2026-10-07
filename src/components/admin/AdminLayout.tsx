'use client';

import React from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminGuard } from './AdminGuard';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-warm-ivory text-deep-espresso font-sans antialiased flex flex-col selection:bg-champagne selection:text-deep-espresso">
        <AdminHeader />
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8">
          {children}
        </main>
        <footer className="border-t border-brand-border bg-warm-ivory py-6 mb-16 md:mb-0 text-center text-[10px] uppercase tracking-widest text-brand-muted">
          SORAYVA Admin Control Centre • Catalogue Sync Engine
        </footer>
      </div>
    </AdminGuard>
  );
};
