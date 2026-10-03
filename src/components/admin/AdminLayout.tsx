'use client';

import React from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminGuard } from './AdminGuard';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-slate-950">
        <AdminHeader />
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
          SORAYVA Admin Control Centre • Google Sheets Catalogue Database Sync Engine • Confidential Admin Only
        </footer>
      </div>
    </AdminGuard>
  );
};
