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
import { AuthProvider } from '@/context/AuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;
  const isCheckout = pathname === '/checkout';

  if (isAdmin) {
    return (
      <AdminAuthProvider>
        <div className="min-h-screen flex flex-col">{children}</div>
      </AdminAuthProvider>
    );
  }

  if (isCheckout) {
    return (
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <main className="flex-1 min-h-screen pb-[env(safe-area-inset-bottom)]">{children}</main>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <AuthProvider>
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
      </AuthProvider>
    </AdminAuthProvider>
  );
};
