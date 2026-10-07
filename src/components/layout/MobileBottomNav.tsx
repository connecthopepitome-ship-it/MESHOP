'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface MobileBottomNavProps {
  onOpenSearch?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/product/')) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md lg:hidden pointer-events-auto">
      <div className="sorayva-glass-bar rounded-full px-4 py-2 flex items-center justify-between shadow-2xl border border-champagne/40 bg-warm-ivory/90 backdrop-blur-xl">
        {/* HOME */}
        <Link
          href="/"
          className={`min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[0.62rem] font-sans-fashion uppercase tracking-wider transition-colors ${
            pathname === '/' ? 'text-terracotta font-bold' : 'text-deep-espresso/70 hover:text-deep-espresso'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>HOME</span>
        </Link>

        {/* SHOP */}
        <Link
          href="/shop"
          className={`min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[0.62rem] font-sans-fashion uppercase tracking-wider transition-colors ${
            pathname === '/shop' ? 'text-terracotta font-bold' : 'text-deep-espresso/70 hover:text-deep-espresso'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>SHOP</span>
        </Link>

        {/* SEARCH */}
        <button
          onClick={() => {
            if (onOpenSearch) onOpenSearch();
            else window.location.href = '/search';
          }}
          className="min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[0.62rem] font-sans-fashion uppercase tracking-wider text-deep-espresso/70 hover:text-deep-espresso transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>SEARCH</span>
        </button>

        {/* WISHLIST */}
        <Link
          href="/wishlist"
          className={`relative min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[0.62rem] font-sans-fashion uppercase tracking-wider transition-colors ${
            pathname === '/wishlist' ? 'text-terracotta font-bold' : 'text-deep-espresso/70 hover:text-deep-espresso'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>WISHLIST</span>
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-2 font-sans-fashion text-[0.55rem] bg-terracotta text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* BAG */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[0.62rem] font-sans-fashion uppercase tracking-wider text-deep-espresso/70 hover:text-deep-espresso transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>BAG</span>
          {itemCount > 0 && (
            <span className="absolute top-1 right-2 font-sans-fashion text-[0.55rem] bg-deep-espresso text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
