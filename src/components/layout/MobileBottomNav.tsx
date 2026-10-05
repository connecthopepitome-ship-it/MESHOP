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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md lg:hidden pointer-events-auto">
      <div className="sorayva-glass-bar rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl border border-champagne/30">
        {/* HOME */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[0.65rem] font-sans-fashion uppercase tracking-wider transition-colors ${
            pathname === '/' ? 'text-terracotta font-semibold' : 'text-deep-espresso/70 hover:text-deep-espresso'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>HOME</span>
        </Link>

        {/* SHOP */}
        <Link
          href="/shop"
          className={`flex flex-col items-center gap-0.5 text-[0.65rem] font-sans-fashion uppercase tracking-wider transition-colors ${
            pathname === '/shop' ? 'text-terracotta font-semibold' : 'text-deep-espresso/70 hover:text-deep-espresso'
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
          className="flex flex-col items-center gap-0.5 text-[0.65rem] font-sans-fashion uppercase tracking-wider text-deep-espresso/70 hover:text-deep-espresso transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>SEARCH</span>
        </button>

        {/* WISHLIST */}
        <Link
          href="/wishlist"
          className={`relative flex flex-col items-center gap-0.5 text-[0.65rem] font-sans-fashion uppercase tracking-wider transition-colors ${
            pathname === '/wishlist' ? 'text-terracotta font-semibold' : 'text-deep-espresso/70 hover:text-deep-espresso'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>WISHLIST</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 right-1 font-sans-fashion text-[0.55rem] bg-terracotta text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* BAG */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[0.65rem] font-sans-fashion uppercase tracking-wider text-deep-espresso/70 hover:text-deep-espresso transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>BAG</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 right-1 font-sans-fashion text-[0.55rem] bg-deep-espresso text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
