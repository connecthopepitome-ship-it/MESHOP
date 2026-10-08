'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Search, Menu, X, ChevronRight, ArrowRight, Sparkles, TrendingUp, MessageCircle, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

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

  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchOpen]);

  return (
    <>
      <header className={`sticky top-0 inset-x-0 z-40 transition-all duration-300 ease-out ${scrolled ? 'py-2 lg:py-3' : 'py-3 lg:py-6'}`}>
        <div className={`mx-auto max-w-[1440px] px-4 md:px-8 transition-all duration-300 ${
          scrolled 
            ? 'bg-warm-ivory/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(44,33,30,0.06)] border border-champagne/30 rounded-full lg:w-[95%] lg:px-8' 
            : 'bg-transparent lg:px-8'
        }`}>
          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center justify-between min-h-[56px]">
            {/* Left: Logo */}
            <Link href="/" className="block flex-shrink-0 relative top-[2px]">
              <Image
                src="/images/sorayva-logo.png"
                alt="SORAYVA"
                width={140}
                height={35}
                priority
                className="w-[130px] xl:w-[150px] h-auto object-contain transition-transform duration-300 hover:scale-105"
                style={{ mixBlendMode: 'multiply' }}
              />
            </Link>

            {/* Center: Navigation */}
            <nav className="flex items-center gap-6 xl:gap-10 font-sans-fashion text-[0.68rem] xl:text-[0.72rem] font-bold tracking-[0.18em] text-deep-espresso uppercase">
              <Link href="/shop?filter=newArrival" className="hover:text-terracotta transition-colors py-2 relative group">
                NEW IN
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop" className="hover:text-terracotta transition-colors py-2 relative group">
                SAREES
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop#collections" className="hover:text-terracotta transition-colors py-2 relative group">
                COLLECTIONS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop#shop-by-occasion" className="hover:text-terracotta transition-colors py-2 relative group">
                OCCASIONS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/shop#explore-by-fabric" className="hover:text-terracotta transition-colors py-2 relative group">
                FABRICS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center gap-2 h-[44px] px-4 rounded-full hover:bg-soft-sand text-deep-espresso transition-all group border border-transparent hover:border-champagne/30"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px] text-deep-espresso/70 group-hover:text-terracotta transition-colors" />
                <span className="font-sans-fashion tracking-widest text-[0.65rem] uppercase font-bold text-deep-espresso/70 group-hover:text-deep-espresso hidden xl:inline">
                  SEARCH
                </span>
              </button>

              <Link
                href="/account"
                className="relative w-[44px] h-[44px] rounded-full text-deep-espresso hover:bg-soft-sand hover:text-terracotta transition-all flex items-center justify-center border border-transparent hover:border-champagne/30"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" />
              </Link>

              <Link
                href="/wishlist"
                className="relative w-[44px] h-[44px] rounded-full text-deep-espresso hover:bg-soft-sand hover:text-terracotta transition-all flex items-center justify-center border border-transparent hover:border-champagne/30"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-[8px] right-[6px] font-sans-fashion text-[0.6rem] bg-terracotta text-white w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-[44px] h-[44px] rounded-full text-deep-espresso hover:bg-soft-sand hover:text-terracotta transition-all flex items-center justify-center border border-transparent hover:border-champagne/30"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute top-[8px] right-[6px] font-sans-fashion text-[0.6rem] bg-deep-espresso text-white w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* MOBILE NAV (Glass Capsule) */}
          <div className={`lg:hidden flex items-center justify-between h-[64px] px-5 transition-all duration-300 ${
            scrolled || !scrolled 
              ? 'bg-white/80 backdrop-blur-xl rounded-[20px] border border-champagne/40 shadow-[0_4px_20px_rgba(44,33,30,0.06)]'
              : ''
          }`}>
            <Link href="/" className="block flex-shrink-0">
              <Image
                src="/images/sorayva-logo.png"
                alt="SORAYVA"
                width={110}
                height={28}
                priority
                className="w-[110px] h-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-[44px] h-[44px] flex items-center justify-center text-deep-espresso hover:text-terracotta transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/account"
                className="w-[44px] h-[44px] flex items-center justify-center text-deep-espresso hover:text-terracotta transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              <Link
                href="/wishlist"
                className="relative w-[44px] h-[44px] flex items-center justify-center text-deep-espresso hover:text-terracotta transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-[8px] right-[6px] font-sans-fashion text-[0.6rem] bg-terracotta text-white w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-[44px] h-[44px] flex items-center justify-center text-deep-espresso hover:text-terracotta transition-colors"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-[8px] right-[6px] font-sans-fashion text-[0.6rem] bg-deep-espresso text-white w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-[44px] h-[44px] flex items-center justify-center text-deep-espresso hover:text-terracotta transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Glass Search Panel Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col justify-start transition-all duration-300 animate-fadeIn">
          <div className="w-full bg-transparent pt-6 pb-8 px-4 sm:px-8 max-h-[100vh] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-[0.65rem] font-sans-fashion tracking-widest text-terracotta uppercase font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>SORAYVA Atelier Search</span>
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2.5 rounded-full bg-soft-sand hover:bg-champagne/40 text-deep-espresso transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative mb-10">
                <input
                  type="text"
                  placeholder="Search by fabric, color, occasion, or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-champagne/50 rounded-[20px] py-5 px-6 pl-14 pr-[120px] text-[1.1rem] font-sans-body text-deep-espresso placeholder:text-deep-espresso/40 focus:outline-none focus:border-terracotta shadow-[0_4px_24px_rgba(44,33,30,0.04)] transition-all"
                  autoFocus
                />
                <Search className="w-6 h-6 text-deep-espresso/40 absolute left-5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[14px] bg-deep-espresso text-warm-ivory px-6 py-3 font-sans-fashion text-[0.65rem] font-bold tracking-widest uppercase hover:bg-terracotta transition-colors flex items-center gap-2"
                >
                  <span>SEARCH</span>
                </button>
              </form>

              {/* Trending & Quick Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-6 border-t border-champagne/30">
                <div>
                  <h4 className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-deep-espresso uppercase mb-4 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
                    TRENDING SEARCHES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                        }}
                        className="px-4 py-2 rounded-full bg-soft-sand hover:bg-champagne text-deep-espresso text-[0.75rem] font-sans-body font-medium transition-all text-left"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-deep-espresso uppercase mb-4">
                    POPULAR FABRICS
                  </h4>
                  <ul className="space-y-3 text-[0.8rem] font-sans-body text-deep-espresso/80">
                    {popularFabrics.map((fabric) => (
                      <li key={fabric}>
                        <Link
                          href={`/shop?fabric=${encodeURIComponent(fabric)}`}
                          onClick={() => setSearchOpen(false)}
                          className="hover:text-terracotta hover:translate-x-1 transition-all inline-flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                          <span>{fabric}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-deep-espresso uppercase mb-4">
                    SHOP BY OCCASION
                  </h4>
                  <ul className="space-y-3 text-[0.8rem] font-sans-body text-deep-espresso/80">
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden flex">
          <div className="w-[85%] max-w-[380px] bg-warm-ivory h-full p-6 flex flex-col shadow-2xl overflow-y-auto animate-slideLeft">
            
            <div className="flex items-center justify-between pb-6 border-b border-champagne/40">
              <Image
                src="/images/sorayva-logo.png"
                alt="SORAYVA"
                width={120}
                height={30}
                className="w-[120px] h-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-soft-sand text-deep-espresso hover:text-terracotta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col font-sans-fashion text-[0.75rem] font-bold tracking-[0.18em] text-deep-espresso uppercase flex-1">
              <Link
                href="/shop?filter=newArrival"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>NEW ARRIVALS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>SAREES</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/shop#collections"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>COLLECTIONS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/shop#shop-by-occasion"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>OCCASIONS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/shop#explore-by-fabric"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>FABRICS</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/shop?filter=sale"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between text-terracotta"
              >
                <span>SALE</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>MY ACCOUNT</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="py-4 border-b border-champagne/30 flex items-center justify-between hover:text-terracotta"
              >
                <span>TRACK ORDER</span> <ChevronRight className="w-4 h-4 text-terracotta" />
              </Link>
            </nav>

            <div className="pt-8 mt-auto text-center">
              <p className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-deep-espresso uppercase mb-3">
                CONCIERGE STYLIST
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-sans-fashion text-[0.7rem] font-bold text-[#1E5631] uppercase tracking-widest bg-[#E8F3EC] px-6 py-3 rounded-[12px] w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                WHATSAPP STYLIST
              </a>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};
