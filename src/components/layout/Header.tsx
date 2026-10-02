'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Search, Menu, X, ChevronRight, Calendar } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full atelier-glass border-b border-outline-variant/50 transition-all duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-14 py-3.5 flex items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8 lg:gap-12">
          <Link href="/" className="block group flex-shrink-0 flex items-center bg-transparent">
            <Image
              src="/images/sorayva-logo.png"
              alt="SORAYVA — The Modern Saree House"
              width={220}
              height={55}
              priority
              className="h-10 md:h-11 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mr-6 xl:mr-10">
            <Link
              className="font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/shop"
            >
              COLLECTIONS
            </Link>
            <Link
              className="font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="#the-weaves"
            >
              THE WEAVES
            </Link>
            <Link
              className="font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="#fabric-directory"
            >
              FABRIC DIRECTORY
            </Link>
            <Link
              className="font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/our-story"
            >
              ATELIER &amp; CRAFT
            </Link>
            <Link
              className="font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/shop/bridal"
            >
              BRIDAL TROUSSEAU
            </Link>
            <Link
              className="font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/size-guide"
            >
              EDITORIAL
            </Link>
          </nav>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
            className="text-secondary p-1 hover:text-primary flex items-center justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-5 pl-4 sm:pl-6 border-l border-outline-variant/50">
          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap font-sans-fashion text-xs tracking-wider text-secondary border-r border-outline-variant/60 pr-4 h-6">
            <span className="font-medium">INR ₹</span>
          </div>

          <Link
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 fine-gold-border rounded-full bg-surface-bright text-xs font-sans-fashion tracking-widest text-primary-container uppercase hover:bg-primary-container hover:text-white transition-all shadow-sm whitespace-nowrap"
            href="#concierge"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>BOOK STYLIST</span>
          </Link>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-secondary hover:text-primary p-1.5 transition-colors flex items-center justify-center"
            title="Search Archive"
            aria-label="Search Archive"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            className="relative text-secondary hover:text-primary p-1.5 transition-colors flex items-center justify-center"
            href="/wishlist"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            <span className="absolute top-0 right-0 font-sans-fashion text-[0.6rem] bg-secondary-container text-secondary w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {wishlistCount > 0 ? wishlistCount : 3}
            </span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-secondary hover:text-primary p-1.5 transition-colors flex items-center justify-center"
            title="Atelier Tote"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-0 right-0 font-sans-fashion text-[0.6rem] bg-primary-container text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {itemCount > 0 ? itemCount : 2}
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-outline-variant/50 bg-surface-container py-4 px-margin transition-all animate-fadeIn">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search Kanjeevaram, Organza, Banarasi, Crimson, Zari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant py-3 px-4 pl-12 text-sm font-sans-body text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              <Search className="w-5 h-5 text-on-surface-variant absolute left-4" />
              <button
                type="submit"
                className="absolute right-3 text-xs font-sans-fashion uppercase tracking-widest bg-secondary text-white px-4 py-2 hover:bg-primary transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
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

              <nav className="mt-6 flex flex-col space-y-4 font-sans-fashion text-xs font-medium text-secondary tracking-[0.2em] uppercase">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>COLLECTIONS</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="#the-weaves"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>THE WEAVES</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="#fabric-directory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>FABRIC DIRECTORY</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/our-story"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>ATELIER &amp; CRAFT</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/shop/bridal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>BRIDAL TROUSSEAU</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/size-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>EDITORIAL</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-outline-variant text-xs font-sans-body text-on-surface-variant">
              <p className="font-sans-fashion text-xs font-semibold tracking-wider text-secondary uppercase">ATELIER CONCIERGE</p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-sans-fashion text-primary-container hover:text-primary transition-colors"
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
