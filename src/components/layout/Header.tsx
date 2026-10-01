'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    <header className="sticky top-0 z-40 bg-brand-base/95 backdrop-blur-md border-b border-brand-border transition-all duration-200">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Left: Mobile Menu & Desktop Navigation */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-brand-charcoal p-1 focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden lg:flex items-center space-x-8 text-sm font-sans tracking-wider text-brand-charcoal uppercase">
            <Link href="/" className="hover:text-brand-gold transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-brand-gold transition-colors">
              Shop All
            </Link>
            <Link href="/shop/silk" className="hover:text-brand-gold transition-colors">
              Silk Sarees
            </Link>
            <Link href="/shop/organza" className="hover:text-brand-gold transition-colors">
              Organza
            </Link>
            <Link href="/collections/signature-edit" className="hover:text-brand-gold transition-colors">
              Heritage Edit
            </Link>
            <Link href="/size-guide" className="hover:text-brand-gold transition-colors">
              Size Guide
            </Link>
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <div className="text-center">
          <Link href="/" className="group inline-block">
            <span className="font-serif text-2xl md:text-3xl tracking-widest text-brand-charcoal font-semibold uppercase group-hover:text-brand-gold transition-colors">
              ROYAL SILKS
            </span>
            <span className="block text-[10px] tracking-[0.3em] font-sans text-brand-muted uppercase -mt-1">
              Boutique Storefront
            </span>
          </Link>
        </div>

        {/* Right: Actions (Search, Wishlist, Cart, Account) */}
        <div className="flex items-center space-x-4 md:space-x-6 text-brand-charcoal">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:text-brand-gold transition-colors focus:outline-none"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link href="/wishlist" className="relative p-2 hover:text-brand-gold transition-colors">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-brand-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:text-brand-gold transition-colors focus:outline-none"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-brand-gold text-brand-charcoal text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      {searchOpen && (
        <div className="border-t border-brand-border bg-brand-surface py-4 px-4 md:px-8 transition-all animate-fadeIn">
          <div className="container mx-auto max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search Kanjeevaram, Organza, Banarasi, Crimson, Zari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-base border border-brand-border rounded-none py-3 px-4 pl-12 text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold"
                autoFocus
              />
              <Search className="w-5 h-5 text-brand-muted absolute left-4" />
              <button
                type="submit"
                className="absolute right-3 text-xs uppercase tracking-wider bg-brand-charcoal text-brand-base px-4 py-2 hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
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
          <div className="w-4/5 max-w-sm bg-brand-base h-full p-6 flex flex-col justify-between shadow-drawer animate-slideLeft">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-border">
                <span className="font-serif text-xl tracking-wider text-brand-charcoal">ROYAL SILKS</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-brand-charcoal">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-4 text-sm font-sans uppercase tracking-wider text-brand-charcoal">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Home</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Shop All Sarees</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
                <Link
                  href="/shop/silk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Silk Sarees</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
                <Link
                  href="/shop/organza"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Organza & Tissue</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
                <Link
                  href="/collections/signature-edit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Heritage Collection</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
                <Link
                  href="/size-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Blouse Size Guide</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-brand-border/40 flex items-center justify-between"
                >
                  <span>Track Order</span> <ChevronRight className="w-4 h-4 text-brand-muted" />
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-brand-border text-xs text-brand-muted">
              <p>Boutique Assistance</p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-medium text-brand-charcoal hover:text-brand-gold"
              >
                💬 WhatsApp Stylist Concierge
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
