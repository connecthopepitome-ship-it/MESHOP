'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Search, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export const Header: React.FC = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-outline-variant">
      <div className="h-20 w-full px-margin md:px-margin-tablet xl:px-margin-desktop flex items-center justify-between">
        {/* Left Nav (Desktop) */}
        <nav className="hidden lg:flex items-center gap-space-lg">
          <Link
            className="font-label-uppercase text-label-uppercase text-on-surface-variant hover:text-on-surface transition-colors py-1"
            href="/shop"
          >
            COLLECTIONS
          </Link>
          <Link
            className="font-label-uppercase text-label-uppercase text-on-surface-variant hover:text-on-surface transition-colors py-1"
            href="/shop?sort=newest"
          >
            NEW ARRIVALS
          </Link>
          <Link
            className="font-label-uppercase text-label-uppercase text-on-surface-variant hover:text-on-surface transition-colors py-1"
            href="/shop/silk"
          >
            HERITAGE
          </Link>
          <Link
            className="font-label-uppercase text-label-uppercase text-on-surface-variant hover:text-on-surface transition-colors py-1"
            href="/size-guide"
          >
            SIZE GUIDE
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-secondary hover:text-on-surface transition-colors p-1"
            aria-label="Open Mobile Navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Center Logo */}
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex flex-col items-center group py-1">
            <Image
              src="/images/sorayva-logo.png"
              alt="SORAYVA - The Modern Saree House"
              width={240}
              height={64}
              priority
              className="h-10 sm:h-12 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-space-md sm:gap-space-lg">
          <button className="hidden sm:flex items-center gap-space-xs font-label-numeric text-label-numeric text-secondary hover:text-on-surface transition-colors">
            <span>INR ₹</span>
          </button>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-secondary hover:text-on-surface transition-colors p-1"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            className="relative text-secondary hover:text-on-surface transition-colors p-1"
            href="/wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 font-label-numeric text-[0.625rem] bg-surface-container text-secondary w-4 h-4 rounded-full flex items-center justify-center border border-outline-variant font-semibold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-secondary hover:text-on-surface transition-colors p-1"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 font-label-numeric text-[0.625rem] bg-secondary text-on-secondary w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      {searchOpen && (
        <div className="border-t border-outline-variant bg-surface-container py-4 px-margin transition-all animate-fadeIn">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search Kanjeevaram, Organza, Banarasi, Crimson, Zari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant py-3 px-4 pl-12 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              <Search className="w-5 h-5 text-on-surface-variant absolute left-4" />
              <button
                type="submit"
                className="absolute right-3 text-label-uppercase font-label-uppercase bg-secondary text-on-secondary px-4 py-2 hover:bg-primary transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden flex">
          <div className="w-4/5 max-w-sm bg-surface h-full p-6 flex flex-col justify-between shadow-xl animate-slideLeft">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant">
                <Image
                  src="/images/sorayva-logo.png"
                  alt="SORAYVA"
                  width={160}
                  height={48}
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-secondary hover:text-on-surface"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-4 font-label-uppercase text-label-uppercase text-on-surface">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>HOME</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>COLLECTIONS</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/shop/silk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>KANJEEVARAM & SILK</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/shop/organza"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>ORGANZA & TISSUE</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/size-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>BLOUSE SIZE GUIDE</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>TRACK ORDER</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-outline-variant text-body-sm text-on-surface-variant">
              <p className="font-subhead-eyebrow text-subhead-eyebrow text-secondary uppercase tracking-wider">ATELIER STYLIST CONCIERGE</p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-label-numeric text-secondary hover:text-primary transition-colors"
              >
                💬 WhatsApp Concierge
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
