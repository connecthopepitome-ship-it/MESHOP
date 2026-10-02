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
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between gap-4">
        {/* Left & Center: Logo + Desktop Nav */}
        <div className="flex items-center gap-6 xl:gap-10 min-w-0">
          <Link href="/" className="block group flex-shrink-0 flex items-center bg-transparent py-1">
            <Image
              src="/images/sorayva-logo.png"
              alt="SORAYVA — The Modern Saree House"
              width={220}
              height={55}
              priority
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 whitespace-nowrap">
            <Link
              className="font-sans-fashion text-[0.725rem] xl:text-xs font-medium text-secondary tracking-[0.16em] xl:tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/shop"
            >
              SHOP
            </Link>
            <Link
              className="font-sans-fashion text-[0.725rem] xl:text-xs font-medium text-secondary tracking-[0.16em] xl:tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/shop?filter=newArrival"
            >
              NEW ARRIVALS
            </Link>
            <Link
              className="font-sans-fashion text-[0.725rem] xl:text-xs font-medium text-secondary tracking-[0.16em] xl:tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="#collections"
            >
              COLLECTIONS
            </Link>
            <Link
              className="font-sans-fashion text-[0.725rem] xl:text-xs font-medium text-secondary tracking-[0.16em] xl:tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="#shop-by-occasion"
            >
              SHOP BY OCCASION
            </Link>
            <Link
              className="font-sans-fashion text-[0.725rem] xl:text-xs font-medium text-secondary tracking-[0.16em] xl:tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="#explore-by-fabric"
            >
              SHOP BY FABRIC
            </Link>
            <Link
              className="font-sans-fashion text-[0.725rem] xl:text-xs font-medium text-secondary tracking-[0.16em] xl:tracking-[0.2em] uppercase hover:text-primary transition-all relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary-container hover:after:w-full after:transition-all"
              href="/shop?filter=sale"
            >
              SALE
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
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap font-sans-fashion text-xs tracking-wider text-secondary border-r border-outline-variant/60 pr-4 h-5">
            <span className="font-medium">INR ₹</span>
          </div>

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
                  style={{ mixBlendMode: 'multiply' }}
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
                  <span>SHOP</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/shop?filter=newArrival"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>NEW ARRIVALS</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="#collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>COLLECTIONS</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="#shop-by-occasion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>SHOP BY OCCASION</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="#explore-by-fabric"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>SHOP BY FABRIC</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </Link>
                <Link
                  href="/shop?filter=sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 border-b border-outline-variant/60 flex items-center justify-between"
                >
                  <span>SALE</span> <ChevronRight className="w-4 h-4 text-on-surface-variant" />
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
