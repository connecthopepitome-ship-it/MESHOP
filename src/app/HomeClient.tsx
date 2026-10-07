'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product } from '@/types';
import { getDynamicCategories } from '@/lib/utils';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductImage } from '@/components/shared/ProductImage';
import { QuickViewModal } from '@/components/shared/QuickViewModal';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';
import { Truck, RotateCcw, ShieldCheck, Sparkles, ArrowRight, ChevronRight, Award } from 'lucide-react';

export default function HomeClient({ initialProducts }: { initialProducts: Product[] }) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [activeFilter, setActiveFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('meshop_recently_viewed');
        if (raw) {
          const ids: string[] = JSON.parse(raw);
          const found = initialProducts.filter((p) => ids.includes(p.productId));
          setRecentlyViewed(found.slice(0, 4));
        }
      } catch (e) {
        console.warn('Could not parse recently viewed products', e);
      }
    }
  }, [initialProducts]);

  const dynamicCategories = getDynamicCategories(allProducts, 1);

  const collectionPills = [
    { label: 'NEW IN', key: 'all' },
    { label: 'FESTIVE', key: 'festive' },
    { label: 'WEDDING', key: 'wedding' },
    { label: 'PARTY', key: 'party' },
    { label: 'OFFICE', key: 'everyday' },
    { label: 'EVERYDAY', key: 'casual' },
  ];

  const handleFilter = (filterKey: string) => {
    setActiveFilter(filterKey);
    if (filterKey === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(
        allProducts.filter(
          (p) =>
            p.category?.toLowerCase().includes(filterKey.toLowerCase()) ||
            (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(filterKey.toLowerCase()))) ||
            p.fabric?.toLowerCase().includes(filterKey.toLowerCase()) ||
            (Array.isArray(p.occasion) && p.occasion.some((o) => o.toLowerCase().includes(filterKey.toLowerCase())))
        )
      );
    }
  };

  const newArrivals = allProducts.filter((p) => p.newArrival || p.published).slice(0, 4);
  const bestSellers = allProducts.filter((p) => p.bestseller || p.featured).slice(0, 4);
  const premiumSarees = (allProducts.filter((p) => p.bestseller || p.featured || (p.price && p.price >= 2000)).length > 0
    ? allProducts.filter((p) => p.bestseller || p.featured || (p.price && p.price >= 2000))
    : allProducts).slice(0, 4);

  const fabricList = [
    {
      name: 'Organza & Tissue',
      slug: 'organza',
      image: '/images/fabrics/organza.jpg',
      description: 'Featherlight translucent weave exuding glass-silk luster and delicate sheen.',
    },
    {
      name: 'Silk & Katan',
      slug: 'silk',
      image: '/images/fabrics/silk.jpg',
      description: 'Structured royal drape crafted with pure filature silk warp and ornate zari.',
    },
    {
      name: 'Chiffon & Georgette',
      slug: 'chiffon',
      image: '/images/fabrics/chiffon.jpg',
      description: 'Ethereal fluid fall with airy crimp texture, ideal for celebratory soirees.',
    },
    {
      name: 'Chanderi & Cotton',
      slug: 'chanderi',
      image: '/images/fabrics/chanderi.jpg',
      description: 'Crisp breathable handloom texture highlighted with subtle metallic selvedges.',
    },
  ].map((f) => {
    const count = allProducts.filter((p) => p.fabric?.toLowerCase().includes(f.slug) || p.category?.toLowerCase().includes(f.slug)).length;
    return { ...f, count: count > 0 ? count : 4 };
  });

  return (
    <main className="w-full bg-warm-ivory text-deep-espresso">
      {/* SECTION 1 — EDITORIAL HERO SECTION */}
      <section className="w-full py-4 sm:py-8 bg-warm-ivory">
        {/* DESKTOP BANNER (hidden sm:block) */}
        <div className="hidden sm:block max-w-7xl w-[94%] sm:w-[88%] lg:w-[84%] mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-champagne/40 shadow-xl relative bg-[#F7F3EE]">
          <Link href="/shop" className="block relative w-full aspect-[2.15/1] min-h-[380px] md:min-h-[460px]">
            <ProductImage
              src="/images/festive-hero.jpg"
              alt="SORAYVA The Festive Edit"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 84vw"
              className="object-cover object-center w-full h-full transition-transform duration-700 hover:scale-[1.01]"
            />
          </Link>
        </div>

        {/* MOBILE HERO (sm:hidden) — PORTRAIT MOBILE COMPOSITION, NO TEXT CLIPPING */}
        <div className="sm:hidden w-[92%] mx-auto overflow-hidden rounded-2xl border border-champagne/40 shadow-xl relative bg-[#251d1a] text-warm-ivory">
          <div className="relative w-full aspect-[4/5] min-h-[380px]">
            <ProductImage
              src="/images/festive-hero.jpg"
              alt="SORAYVA Festive Edit"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[82%_center] w-full h-full filter brightness-[0.9]"
            />
            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-espresso/95 via-deep-espresso/40 to-transparent flex flex-col justify-end p-5" />

            {/* Mobile Hero Structured HTML Content */}
            <div className="absolute inset-x-5 bottom-6 z-10 space-y-2">
              <span className="font-sans-fashion text-[0.65rem] font-bold tracking-[0.25em] text-champagne uppercase block">
                FESTIVE EDIT
              </span>
              <h1 className="font-serif-display text-3xl text-warm-ivory font-normal leading-tight">
                Festive <br />
                <span className="font-serif-editorial italic text-2xl text-champagne font-light">for moments that matter.</span>
              </h1>
              <p className="font-sans-body text-xs text-warm-ivory/80 font-light max-w-[82%] leading-relaxed pb-1">
                Archival Banarasis, romantic tissue organzas, and handcrafted drapes.
              </p>
              <div>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-warm-ivory text-deep-espresso font-sans-fashion text-xs font-bold tracking-[0.16em] uppercase hover:bg-terracotta hover:text-white transition-colors shadow-lg"
                >
                  DISCOVER NEW IN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — HORIZONTAL CAPSULE COLLECTION SLIDER */}
      <section className="sticky top-[56px] sm:top-[72px] z-30 w-full sorayva-glass border-y border-champagne/30 py-3 shadow-sm backdrop-blur-xl">
        <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6">
          <div
            ref={sliderRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 px-1 scroll-smooth"
          >
            <span className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso/50 uppercase whitespace-nowrap mr-2 hidden sm:inline-block">
              CATEGORIES:
            </span>
            {collectionPills.map((pill) => {
              const isActive = activeFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  onClick={() => handleFilter(pill.key)}
                  className={`snap-start flex-shrink-0 px-5 py-2.5 min-h-[44px] rounded-full font-sans-fashion text-xs font-bold tracking-[0.14em] uppercase whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-md scale-102'
                      : 'sorayva-glass-pill text-deep-espresso/80 hover:text-deep-espresso hover:border-terracotta'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
          {/* Right fade gradient indicator */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-warm-ivory to-transparent sm:hidden z-10" />
        </div>
      </section>

      {/* SECTION 3 — FRESH ARRIVALS */}
      <section className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-8 sm:py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-champagne/30 pb-3 mb-6 sm:mb-10">
          <div>
            <span className="font-sans-fashion text-[0.65rem] sm:text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-1">
              CURATED SELECTION
            </span>
            <h2 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              Fresh Arrivals
            </h2>
          </div>
          <Link
            href="/shop?filter=newArrival"
            className="font-sans-fashion text-[0.7rem] sm:text-xs font-bold tracking-[0.2em] text-terracotta hover:text-deep-espresso uppercase flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
          >
            <span>EXPLORE ALL NEW ARRIVALS</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Horizontal Product Carousel */}
        <div className="flex sm:hidden overflow-x-auto gap-3.5 no-scrollbar snap-x snap-mandatory px-1 pb-3 scroll-smooth">
          {newArrivals.map((prod) => (
            <div key={`new-mob-${prod.productId}`} className="w-[76vw] max-w-[280px] flex-shrink-0 snap-start">
              <ProductCard
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </div>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.map((prod) => (
            <ProductCard
              key={`new-desk-${prod.productId}`}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 4 — SHOP BY OCCASION */}
      <section className="w-full bg-soft-sand/50 py-10 sm:py-20 border-y border-champagne/30" id="shop-by-occasion">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-14">
            <span className="font-sans-fashion text-[0.65rem] sm:text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-1">
              HIGH-FASHION EDITORIAL
            </span>
            <h2 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              Shop By Occasion
            </h2>
            <p className="font-serif-editorial italic text-sm sm:text-lg text-deep-espresso/70 mt-1 font-light">
              Tailored drape edits for every moment on your calendar.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                title: 'Everyday & Office',
                tag: 'Casual Elegance',
                query: 'Everyday',
                image: 'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: 'Festive Luminescence',
                tag: 'Pooja & Celebrations',
                query: 'Festive',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: 'Party & Cocktail',
                tag: 'Evening Soiree',
                query: 'Party',
                image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: 'Wedding Guest',
                tag: 'Reception & Mehendi',
                query: 'Wedding',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={`/shop?occasion=${encodeURIComponent(item.query)}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-champagne/30 block shadow-md"
              >
                <ProductImage
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-espresso/90 via-deep-espresso/30 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-6 text-warm-ivory">
                  <span className="font-sans-fashion text-[0.55rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-champagne block mb-0.5 font-bold">
                    {item.tag}
                  </span>
                  <h3 className="font-serif-display text-base sm:text-2xl text-warm-ivory font-normal mb-1">{item.title}</h3>
                  <span className="font-sans-fashion text-[0.6rem] sm:text-xs text-champagne group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                    EXPLORE EDIT ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — EXPLORE BY FABRIC */}
      <section className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-8 sm:py-20" id="explore-by-fabric">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-champagne/30 pb-3 mb-6 sm:mb-12">
          <div>
            <span className="font-sans-fashion text-[0.65rem] sm:text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-1">
              TACTILE DIRECTORY
            </span>
            <h2 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              Explore By Fabric
            </h2>
          </div>
          <p className="font-serif-editorial italic text-xs sm:text-lg text-deep-espresso/70 max-w-md font-light mt-1 sm:mt-0">
            Navigate by drape feel, weave texture, and fabric density.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {fabricList.map((f) => (
            <div
              key={f.name}
              className="sorayva-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-terracotta"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3 sm:mb-4 bg-soft-sand/50">
                  <ProductImage
                    src={f.image}
                    alt={f.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif-display text-base sm:text-xl text-deep-espresso font-normal mb-1 sm:mb-2">
                  {f.name}
                </h3>
                <p className="font-sans-body text-xs text-deep-espresso/70 font-light leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                  {f.description}
                </p>
              </div>
              <div className="pt-2.5 border-t border-champagne/20 flex items-center justify-between">
                <span className="font-sans-fashion text-[0.65rem] sm:text-[0.7rem] font-bold tracking-wider text-deep-espresso">
                  {f.count} SAREES AVAILABLE
                </span>
                <Link
                  href={`/shop?fabric=${encodeURIComponent(f.slug)}`}
                  className="font-sans-fashion text-xs text-terracotta font-bold hover:text-deep-espresso flex items-center gap-1 transition-colors"
                >
                  <span>Browse</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEDICATED SECTION — PREMIUM SAREES */}
      <section className="w-full bg-gradient-to-b from-deep-espresso via-[#251d1a] to-deep-espresso text-warm-ivory py-8 sm:py-20 border-y border-champagne/30" id="premium-sarees">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-champagne/20 pb-3 mb-6 sm:mb-10">
            <div>
              <span className="font-sans-fashion text-[0.65rem] sm:text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-champagne" />
                BESPOKE WEAVES &amp; LUXURY ATELIER
              </span>
              <h2 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl text-warm-ivory font-normal">
                Premium Sarees
              </h2>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center gap-4">
              <p className="font-serif-editorial italic text-base sm:text-lg text-champagne/90 font-light max-w-sm hidden lg:block">
                Archival Kanjeevarams, liquid silk drapes, and handcrafted gold zari heirlooms.
              </p>
              <Link
                href="/shop?filter=premium"
                className="font-sans-fashion text-[0.7rem] sm:text-xs font-bold tracking-[0.2em] text-champagne hover:text-white uppercase flex items-center gap-1 transition-colors px-4 py-2 rounded-full sorayva-glass border border-champagne/30 min-h-[38px]"
              >
                <span>EXPLORE ALL PREMIUM</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Horizontal Swipe Carousel */}
          <div className="flex sm:hidden overflow-x-auto gap-3.5 no-scrollbar snap-x snap-mandatory px-1 pb-3 scroll-smooth">
            {premiumSarees.map((prod) => (
              <div key={`premium-mob-${prod.productId}`} className="w-[76vw] max-w-[280px] flex-shrink-0 snap-start">
                <ProductCard
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            ))}
          </div>

          {/* Desktop Responsive Grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {premiumSarees.map((prod) => (
              <ProductCard
                key={`premium-desk-${prod.productId}`}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — THE SORAYVA EDIT */}
      <section className="w-full bg-soft-sand/40 py-8 sm:py-20 border-y border-champagne/30" id="collections">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
            <span className="font-sans-fashion text-[0.65rem] sm:text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-1">
              CURATED SELECTION
            </span>
            <h2 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              THE SORAYVA EDIT
            </h2>
            <p className="font-serif-editorial italic text-sm sm:text-lg text-deep-espresso/70 mt-1 font-light">
              Handpicked sarees for everyday elegance, celebrations and unforgettable moments.
            </p>
          </div>

          {/* Mobile Product Carousel */}
          <div className="flex sm:hidden overflow-x-auto gap-3.5 no-scrollbar snap-x snap-mandatory px-1 pb-3 scroll-smooth">
            {filteredProducts.slice(0, 8).map((prod) => (
              <div key={`edit-mob-${prod.productId}`} className="w-[76vw] max-w-[280px] flex-shrink-0 snap-start">
                <ProductCard
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.slice(0, 8).map((prod) => (
              <ProductCard
                key={`edit-desk-${prod.productId}`}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-deep-espresso text-warm-ivory px-6 sm:px-8 py-3.5 font-sans-fashion text-xs font-bold tracking-[0.18em] uppercase hover:bg-terracotta transition-colors shadow-md min-h-[48px]"
              href="/shop"
            >
              <span>EXPLORE CATALOGUE ({allProducts.length} SAREES)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 — RECENTLY VIEWED CAROUSEL */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-10 sm:py-16 border-b border-champagne/30">
          <div className="flex items-center justify-between border-b border-champagne/30 pb-3 mb-6">
            <h3 className="font-serif-display text-xl sm:text-2xl text-deep-espresso font-normal">Recently Viewed</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {recentlyViewed.map((prod) => (
              <ProductCard
                key={prod.productId}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 8 — MINIMAL TRUST STRIP */}
      <section className="w-full py-12 bg-warm-ivory border-t border-champagne/30">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl sorayva-glass-card flex flex-col items-center justify-center gap-2">
              <Truck className="w-5 h-5 text-terracotta" />
              <span className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase">
                FAST DISPATCH
              </span>
              <span className="text-[0.7rem] text-deep-espresso/60 font-sans-body">Complimentary insured delivery</span>
            </div>

            <div className="p-4 rounded-xl sorayva-glass-card flex flex-col items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-terracotta" />
              <span className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase">
                SECURE CHECKOUT
              </span>
              <span className="text-[0.7rem] text-deep-espresso/60 font-sans-body">256-bit encrypted card/UPI</span>
            </div>

            <div className="p-4 rounded-xl sorayva-glass-card flex flex-col items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5 text-terracotta" />
              <span className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase">
                EASY RETURNS
              </span>
              <span className="text-[0.7rem] text-deep-espresso/60 font-sans-body">7-day doorstep exchange</span>
            </div>

            <div className="p-4 rounded-xl sorayva-glass-card flex flex-col items-center justify-center gap-2">
              <Award className="w-5 h-5 text-terracotta" />
              <span className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase">
                QUALITY CHECKED
              </span>
              <span className="text-[0.7rem] text-deep-espresso/60 font-sans-body">100% authentic pure weaves</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View & Size Modals */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenSizeGuide={() => setSizeModalOpen(true)}
      />

      <BlouseSizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
      />
    </main>
  );
}
