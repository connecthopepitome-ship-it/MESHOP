'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;

  if (isAdmin) {
    return (
      <AdminAuthProvider>
        <div className="min-h-screen flex flex-col">{children}</div>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1 min-h-[calc(100dvh-100px)] pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
          <MobileBottomNav />
          <CartDrawer />
          <Footer />
        </WishlistProvider>
      </CartProvider>
    </AdminAuthProvider>
  );
};
