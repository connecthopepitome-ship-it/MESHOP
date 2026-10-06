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

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await repository.getProducts({});
        setAllProducts(prods);
        setFilteredProducts(prods);

        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('meshop_recently_viewed');
            if (raw) {
              const ids: string[] = JSON.parse(raw);
              const found = prods.filter((p) => ids.includes(p.productId));
              setRecentlyViewed(found.slice(0, 4));
            }
          } catch (e) {
            console.warn('Could not parse recently viewed products', e);
          }
        }
      } catch (e) {
        console.error('Failed to load homepage products:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      description: 'Featherlight translucent weave exuding glass-silk luster and delicate sheen.',
    },
    {
      name: 'Silk & Katan',
      slug: 'silk',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      description: 'Structured royal drape crafted with pure filature silk warp and ornate zari.',
    },
    {
      name: 'Chiffon & Georgette',
      slug: 'chiffon',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      description: 'Ethereal fluid fall with airy crimp texture, ideal for celebratory soirees.',
    },
    {
      name: 'Chanderi & Cotton',
      slug: 'chanderi',
      image: 'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=800&q=80',
      description: 'Crisp breathable handloom texture highlighted with subtle metallic selvedges.',
    },
  ].map((f) => {
    const count = allProducts.filter((p) => p.fabric?.toLowerCase().includes(f.slug) || p.category?.toLowerCase().includes(f.slug)).length;
    return { ...f, count: count > 0 ? count : 4 };
  });

  return (
    <main className="w-full bg-warm-ivory text-deep-espresso">
      {/* SECTION 1 — EDITORIAL HERO SECTION (MATCHING USER DESIGN) */}
      <section className="w-full py-6 sm:py-10 bg-warm-ivory">
        <div className="max-w-7xl w-[94%] sm:w-[88%] lg:w-[84%] mx-auto overflow-hidden rounded-3xl border border-champagne/40 shadow-xl bg-[#F8F4EE]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px] lg:min-h-[540px]">
            {/* Left Image Column */}
            <div className="lg:col-span-6 xl:col-span-7 relative min-h-[360px] sm:min-h-[440px] lg:min-h-full overflow-hidden">
              <ProductImage
                src="/images/festive-hero.jpg"
                alt="SORAYVA The Festive Edit Kanjeevaram Saree"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Right Content Column */}
            <div className="lg:col-span-6 xl:col-span-5 relative p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-[#F8F4EE] text-deep-espresso">
              {/* Decorative Background Lotus SVG Ornament in Top Right */}
              <div className="absolute top-4 right-4 pointer-events-none opacity-25 text-terracotta">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C50 15 35 35 35 50C35 65 50 85 50 85C50 85 65 65 65 50C65 35 50 15 50 15Z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M50 30C50 30 25 45 25 55C25 65 40 75 50 85C60 75 75 65 75 55C75 45 50 30 50 30Z" stroke="currentColor" strokeWidth="1" />
                  <path d="M50 40C50 40 15 50 15 60C15 70 30 80 50 85C70 80 85 70 85 60C85 50 50 40 50 40Z" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="50" cy="15" r="2" fill="currentColor" />
                  <circle cx="50" cy="85" r="2" fill="currentColor" />
                </svg>
              </div>

              {/* Top Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-deep-espresso/25 bg-warm-ivory/60 text-deep-espresso text-[11px] font-sans-fashion font-semibold tracking-[0.2em] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                  NEW ARRIVAL
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-deep-espresso font-normal leading-[1.08] mb-4">
                The Festive <br />
                <span className="font-serif-editorial italic text-terracotta font-light">Edit</span>
                <span className="inline-block w-16 sm:w-20 lg:w-24 h-[1.5px] bg-deep-espresso/40 align-middle ml-3" />
              </h1>

              {/* Description */}
              <p className="font-sans-body text-xs sm:text-sm text-deep-espresso/80 font-light leading-relaxed mb-8 max-w-md">
                Discover sarees made for moments that matter. Handcrafted Kanjeevarams, romantic tissue organzas, and liquid silk drapes.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/shop"
                  className="rounded-full bg-deep-espresso text-warm-ivory px-7 py-3.5 font-sans-fashion text-xs font-semibold tracking-[0.18em] uppercase hover:bg-terracotta transition-colors shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>SHOP COLLECTION</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/shop?filter=newArrival"
                  className="rounded-full bg-[#EFE9E0] hover:bg-white text-deep-espresso px-6 py-3.5 font-sans-fashion text-xs font-semibold tracking-[0.18em] uppercase border border-deep-espresso/20 transition-colors flex items-center justify-center gap-2 group"
                >
                  <span>DISCOVER NEW ARRIVALS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — HORIZONTAL CAPSULE COLLECTION SLIDER */}
      <section className="sticky top-[72px] z-30 w-full sorayva-glass border-y border-champagne/30 py-4 shadow-sm backdrop-blur-xl">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div
            ref={sliderRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
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
                  className={`px-6 py-2.5 rounded-full font-sans-fashion text-xs font-bold tracking-[0.16em] uppercase whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-md scale-105'
                      : 'sorayva-glass-pill text-deep-espresso/80 hover:text-deep-espresso hover:border-terracotta'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 — FRESH ARRIVALS */}
      <section className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-champagne/30 pb-6 mb-12">
          <div>
            <span className="font-sans-fashion text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-2">
              CURATED SELECTION
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              Fresh Arrivals
            </h2>
          </div>
          <Link
            href="/shop?filter=newArrival"
            className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-terracotta hover:text-deep-espresso uppercase flex items-center gap-1 mt-4 md:mt-0 transition-colors"
          >
            <span>EXPLORE ALL NEW ARRIVALS</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.productId}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 4 — SHOP BY OCCASION */}
      <section className="w-full bg-soft-sand/50 py-20 border-y border-champagne/30" id="shop-by-occasion">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans-fashion text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-2">
              HIGH-FASHION EDITORIAL
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              Shop By Occasion
            </h2>
            <p className="font-serif-editorial italic text-lg text-deep-espresso/70 mt-2 font-light">
              Tailored drape edits for every moment on your calendar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-espresso/90 via-deep-espresso/30 to-transparent" />
                <div className="absolute bottom-6 inset-x-6 text-warm-ivory">
                  <span className="font-sans-fashion text-[0.65rem] tracking-[0.25em] uppercase text-champagne block mb-1 font-bold">
                    {item.tag}
                  </span>
                  <h3 className="font-serif-display text-2xl text-warm-ivory font-normal mb-2">{item.title}</h3>
                  <span className="font-sans-fashion text-xs text-champagne group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                    EXPLORE EDIT ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — EXPLORE BY FABRIC */}
      <section className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-20" id="explore-by-fabric">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-champagne/30 pb-6 mb-12">
          <div>
            <span className="font-sans-fashion text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-2">
              TACTILE DIRECTORY
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              Explore By Fabric
            </h2>
          </div>
          <p className="font-serif-editorial italic text-lg text-deep-espresso/70 max-w-md font-light">
            Navigate by drape feel, weave texture, and fabric density.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fabricList.map((f) => (
            <div
              key={f.name}
              className="sorayva-glass-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-terracotta"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4 bg-soft-sand/50">
                  <ProductImage
                    src={f.image}
                    alt={f.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif-display text-xl text-deep-espresso font-normal mb-2">
                  {f.name}
                </h3>
                <p className="font-sans-body text-xs text-deep-espresso/70 font-light leading-relaxed mb-4">
                  {f.description}
                </p>
              </div>
              <div className="pt-3 border-t border-champagne/20 flex items-center justify-between">
                <span className="font-sans-fashion text-[0.7rem] font-bold tracking-wider text-deep-espresso">
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
      <section className="w-full bg-gradient-to-b from-deep-espresso via-[#251d1a] to-deep-espresso text-warm-ivory py-24 border-y border-champagne/30" id="premium-sarees">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-champagne/20 pb-6 mb-12">
            <div>
              <span className="font-sans-fashion text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-champagne" />
                BESPOKE WEAVES &amp; LUXURY ATELIER
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-warm-ivory font-normal">
                Premium Sarees
              </h2>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <p className="font-serif-editorial italic text-base sm:text-lg text-champagne/90 font-light max-w-sm hidden lg:block">
                Archival Kanjeevarams, liquid silk drapes, and handcrafted gold zari heirlooms.
              </p>
              <Link
                href="/shop?filter=premium"
                className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-champagne hover:text-white uppercase flex items-center gap-1 transition-colors px-5 py-2.5 rounded-full sorayva-glass border border-champagne/30"
              >
                <span>EXPLORE ALL PREMIUM</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {premiumSarees.map((prod) => (
              <ProductCard
                key={`premium-${prod.productId}`}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — THE SORAYVA EDIT */}
      <section className="w-full bg-soft-sand/40 py-24 border-y border-champagne/30" id="collections">
        <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans-fashion text-xs font-bold tracking-[0.25em] text-terracotta uppercase block mb-2">
              CURATED SELECTION
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal">
              THE SORAYVA EDIT
            </h2>
            <p className="font-serif-editorial italic text-lg text-deep-espresso/70 mt-2 font-light">
              Handpicked sarees for everyday elegance, celebrations and unforgettable moments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.slice(0, 8).map((prod) => (
              <ProductCard
                key={prod.productId}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-deep-espresso text-warm-ivory px-8 py-3.5 font-sans-fashion text-xs font-bold tracking-[0.2em] uppercase hover:bg-terracotta transition-colors shadow-md"
              href="/shop"
            >
              <span>EXPLORE ENTIRE CATALOGUE ({allProducts.length} SAREES)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 — RECENTLY VIEWED CAROUSEL */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-16 border-b border-champagne/30">
          <div className="flex items-center justify-between border-b border-champagne/30 pb-4 mb-8">
            <h3 className="font-serif-display text-2xl text-deep-espresso font-normal">Recently Viewed</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
