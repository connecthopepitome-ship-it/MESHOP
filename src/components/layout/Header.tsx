'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Search, Menu, X, ChevronRight, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductImage } from '@/components/shared/ProductImage';

export const Header: React.FC = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const trendingTags = [
    'Premium Kanjeevaram',
    'Tissue Organza',
    'Banarasi Katan',
    'Crimson Silk',
    'Cocktail Sarees',
    'Pastel Chiffon',
  ];

  const popularFabrics = ['Organza', 'Kanjeevaram Silk', 'Banarasi', 'Chiffon', 'Georgette'];
  const popularOccasions = ['Premium & Festive', 'Cocktail Soiree', 'Puja & Rituals', 'Wedding Edit'];

  return (
    <>
      <header className="sticky top-2 sm:top-4 z-50 w-full px-2 sm:px-4 pointer-events-none transition-all duration-300">
        <div
          className={`mx-auto max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] pointer-events-auto rounded-full transition-all duration-300 ${
            scrolled
              ? 'sorayva-glass-bar py-2 shadow-xl border-champagne/40 bg-warm-ivory/90'
              : 'sorayva-glass py-3 shadow-md border-champagne/20 bg-warm-ivory/75'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Left: Logo */}
            <div className="flex items-center gap-8 flex-shrink-0">
              <Link href="/" className="block group flex-items-center py-0.5">
                <Image
                  src="/images/sorayva-logo.png"
                  alt="SORAYVA — For Moments That Matter"
                  width={200}
                  height={50}
                  priority
                  className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                    scrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-9 md:h-10'
                  }`}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </Link>
            </div>

            {/* Center: Desktop Capsule Nav */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-sans-fashion text-[0.7rem] xl:text-xs font-semibold tracking-[0.2em] text-deep-espresso uppercase whitespace-nowrap">
              <Link href="/shop?filter=newArrival" className="hover:text-terracotta transition-colors py-1 relative group">
                NEW IN
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop" className="hover:text-terracotta transition-colors py-1 relative group">
                SAREES
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/#premium-sarees" className="hover:text-terracotta text-terracotta font-bold transition-colors py-1 relative group">
                PREMIUM
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop#collections" className="hover:text-terracotta transition-colors py-1 relative group">
                COLLECTIONS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop#shop-by-occasion" className="hover:text-terracotta transition-colors py-1 relative group">
                OCCASIONS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop#explore-by-fabric" className="hover:text-terracotta transition-colors py-1 relative group">
                FABRICS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop?filter=sale" className="hover:text-terracotta text-muted-rose transition-colors py-1 relative group font-bold">
                SALE
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-muted-rose transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Right: Actions (Search, Wishlist, Tote) */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Expanding Search Trigger Pill */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-soft-sand/60 hover:bg-soft-sand/90 text-deep-espresso/80 hover:text-deep-espresso text-xs font-sans-body border border-champagne/30 transition-all cursor-pointer group"
                title="Search Sarees"
                aria-label="Search Sarees"
              >
                <Search className="w-3.5 h-3.5 text-deep-espresso/60 group-hover:text-terracotta transition-colors" />
                <span className="font-sans-fashion tracking-wider text-[0.7rem] uppercase text-deep-espresso/60 group-hover:text-deep-espresso">
                  Search sarees, fabrics...
                </span>
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 text-deep-espresso hover:text-terracotta transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="relative p-2 text-deep-espresso hover:text-terracotta transition-colors flex items-center justify-center"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 font-sans-fashion text-[0.6rem] bg-terracotta text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Tote */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-deep-espresso hover:text-terracotta transition-colors flex items-center justify-center"
                title="Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 font-sans-fashion text-[0.6rem] bg-deep-espresso text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation"
                className="p-2 text-deep-espresso hover:text-terracotta lg:hidden flex items-center justify-center"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Glass Search Panel Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-deep-espresso/40 backdrop-blur-md flex flex-col justify-start transition-all duration-300 animate-fadeIn">
          <div className="w-full sorayva-glass-bar border-b border-champagne/40 pt-6 pb-8 px-4 sm:px-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs font-sans-fashion tracking-widest text-terracotta uppercase font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>SORAYVA Atelier Search</span>
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-full bg-soft-sand hover:bg-champagne/40 text-deep-espresso transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative mb-8">
                <input
                  type="text"
                  placeholder="Search by fabric (Organza, Kanjeevaram), color, occasion, or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-md border border-champagne/50 rounded-full py-4 px-6 pl-14 pr-32 text-base font-sans-body text-deep-espresso placeholder:text-deep-espresso/40 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all shadow-inner"
                  autoFocus
                />
                <Search className="w-6 h-6 text-deep-espresso/50 absolute left-5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-deep-espresso text-warm-ivory px-6 py-2.5 font-sans-fashion text-xs font-semibold tracking-widest uppercase hover:bg-terracotta transition-colors shadow-md flex items-center gap-2"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Trending & Quick Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-champagne/20">
                {/* Trending Queries */}
                <div>
                  <h4 className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
                    Trending Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-soft-sand text-deep-espresso text-xs font-sans-body border border-champagne/30 transition-all hover:border-terracotta text-left"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Fabrics */}
                <div>
                  <h4 className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase mb-3">
                    Popular Fabrics
                  </h4>
                  <ul className="space-y-2 text-xs font-sans-body text-deep-espresso/80">
                    {popularFabrics.map((fabric) => (
                      <li key={fabric}>
                        <Link
                          href={`/shop?fabric=${encodeURIComponent(fabric)}`}
                          onClick={() => setSearchOpen(false)}
                          className="hover:text-terracotta hover:translate-x-1 transition-all inline-flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                          <span>{fabric} Sarees</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Popular Occasions */}
                <div>
                  <h4 className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase mb-3">
                    Shop by Occasion
                  </h4>
                  <ul className="space-y-2 text-xs font-sans-body text-deep-espresso/80">
                    {popularOccasions.map((occ) => (
                      <li key={occ}>
                        <Link
                          href={`/shop?occasion=${encodeURIComponent(occ)}`}
                          onClick={() => setSearchOpen(false)}
                          className="hover:text-terracotta hover:translate-x-1 transition-all inline-flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                          <span>{occ}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-deep-espresso/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-4/5 max-w-sm sorayva-glass h-full p-6 flex flex-col justify-between shadow-2xl animate-slideLeft">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-champagne/30">
                <Image
                  src="/images/sorayva-logo.png"
                  alt="SORAYVA"
                  width={160}
                  height={48}
                  className="h-8 w-auto object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-soft-sand text-deep-espresso hover:text-terracotta"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-3 font-sans-fashion text-xs font-semibold tracking-[0.2em] text-deep-espresso uppercase">
                <Link
                  href="/shop?filter=newArrival"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-champagne/20 flex items-center justify-between hover:text-terracotta"
                >
                  <span>NEW ARRIVALS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-champagne/20 flex items-center justify-between hover:text-terracotta"
                >
                  <span>ALL SAREES</span> <ChevronRight className="w-4 h-4 text-terracotta" />
                </Link>
                <Link
                  href="/shop#collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-champagne/20 flex items-center justify-between hover:text-terracotta"
                >
                  <span>COLLECTIONS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
                </Link>
                <Link
                  href="/shop#shop-by-occasion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-champagne/20 flex items-center justify-between hover:text-terracotta"
                >
                  <span>OCCASIONS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
                </Link>
                <Link
                  href="/shop#explore-by-fabric"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-champagne/20 flex items-center justify-between hover:text-terracotta"
                >
                  <span>FABRICS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
                </Link>
                <Link
                  href="/shop?filter=sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-champagne/20 flex items-center justify-between text-muted-rose font-bold"
                >
                  <span>FESTIVE SALE</span> <ChevronRight className="w-4 h-4 text-muted-rose" />
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-champagne/30 text-xs font-sans-body text-deep-espresso/70">
              <p className="font-sans-fashion text-xs font-bold tracking-wider text-deep-espresso uppercase">
                CONCIERGE STYLIST
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-sans-fashion text-terracotta font-semibold hover:underline"
              >
                💬 WhatsApp Personal Styling
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
