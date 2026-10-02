'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product } from '@/types';
import { getDynamicCategories, getDynamicFilterOptions } from '@/lib/utils';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductImage } from '@/components/shared/ProductImage';
import { QuickViewModal } from '@/components/shared/QuickViewModal';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';
import { Truck, RotateCcw, ShieldCheck, Headphones, MapPin, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await repository.getProducts({});
        setAllProducts(prods);
        setFilteredProducts(prods);

        // Load recently viewed products from localStorage
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
  const dynamicFilterOpts = getDynamicFilterOptions(allProducts);

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
            p.fabric?.toLowerCase().includes(filterKey.toLowerCase())
        )
      );
    }
  };

  const newArrivals = allProducts.filter((p) => p.newArrival || p.published).slice(0, 4);
  const bestSellers = allProducts.filter((p) => p.bestseller || p.featured).slice(0, 4);

  // Dynamic fabric list with counts
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
    <main className="w-full bg-surface">
      {/* SECTION 1 — HERO */}
      <section
        className="relative w-full overflow-hidden min-h-[85vh] lg:min-h-[800px] flex items-center justify-center border-b border-outline-variant/40 py-20 lg:py-24"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCnB9vHgJxa43szzkS7jBzykvoR1YuTQEiLjBpArq71LhEMQHgz1UlryxRlcby6hRuD52dWEWuFvoFFfZJTmS8Cm9wWCF8lwmA2ijttT5tIjox1KeRoZMdiijNRv_ewzR9H0twih3EiJoJem35QC_0V0Vgq865HstugSKja5mSNdwx1bo2BHpIpejZ8blpVz8sKYQs7iqphIX1VKkT0NjpGt8afl-27X63TzskjIzY-JCXjL62BXABR8w")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c0a]/80 via-[#1a120c]/60 to-[#0f0c0a]/90 pointer-events-none"></div>

        {/* Radiant Golden Glow Overlays */}
        <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
          <div
            className="absolute -top-24 -left-20 w-[650px] h-[650px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(238, 190, 135, 0.42) 0%, rgba(200, 155, 103, 0.22) 42%, rgba(200, 155, 103, 0) 72%)',
              filter: 'blur(55px)',
              mixBlendMode: 'screen',
            }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className="relative w-full max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full fine-gold-border bg-black/40 backdrop-blur-md font-sans-fashion text-xs tracking-[0.25em] uppercase text-[#ffddb9] font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              SORAYVA SAREE HOUSE
            </span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-[4.75rem] text-[#fbf9f5] leading-[1.08] tracking-tight mb-6 max-w-4xl">
            For Moments <span className="font-serif-editorial italic font-normal text-[#eebe87]">That Matter.</span>
          </h1>

          <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#ede6dc] leading-relaxed mb-8 max-w-2xl font-light">
            “Discover your next signature drape.”
          </p>

          <p className="font-sans-body text-sm md:text-base text-[#d3c4b6] leading-relaxed max-w-xl mb-10 font-light">
            Explore our curated online collection of pure silk, ethereal organza, and fluid georgette sarees crafted for celebrations and everyday elegance.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              className="h-12 px-10 rounded-full bg-primary-container text-[#1b1c1a] font-sans-fashion text-xs font-semibold tracking-[0.2em] uppercase text-center shadow-xl shadow-primary-container/25 hover:bg-[#ffddb9] transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              href="/shop"
            >
              <span>SHOP SAREES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DYNAMIC CATEGORY BAR */}
      <section className="w-full bg-surface-container-low border-b border-outline-variant/50 py-6">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-center flex-wrap gap-3">
          <button
            onClick={() => handleFilter('all')}
            className={`px-5 py-2 rounded-full font-sans-fashion text-xs tracking-widest uppercase transition-all ${
              activeFilter === 'all'
                ? 'bg-secondary text-white font-medium shadow-sm'
                : 'bg-surface fine-gold-border text-secondary hover:bg-secondary hover:text-white'
            }`}
          >
            NEW IN
          </button>
          {dynamicCategories.slice(0, 6).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleFilter(cat.slug)}
              className={`px-5 py-2 rounded-full font-sans-fashion text-xs tracking-widest uppercase transition-all ${
                activeFilter === cat.slug
                  ? 'bg-secondary text-white font-medium shadow-sm'
                  : 'bg-surface fine-gold-border text-secondary hover:bg-secondary hover:text-white'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
          <Link
            href="/shop"
            className="px-5 py-2 rounded-full font-sans-fashion text-xs tracking-widest uppercase bg-primary-container text-white hover:bg-primary transition-all font-medium"
          >
            SHOP ALL
          </Link>
        </div>
      </section>

      {/* SECTION 3 — NEW ARRIVALS */}
      <section className="w-full py-20 bg-surface border-b border-outline-variant/40">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/60 pb-8 mb-12">
            <div>
              <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-2">
                FRESH FROM THE CATALOGUE
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop?filter=newArrival"
              className="font-sans-fashion text-xs tracking-[0.2em] text-primary-container hover:text-primary uppercase font-medium flex items-center gap-1 mt-4 md:mt-0"
            >
              <span>VIEW ALL NEW ARRIVALS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((prod) => (
              <ProductCard
                key={prod.productId}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — SHOP BY OCCASION */}
      <section className="w-full py-20 bg-surface-container-low border-b border-outline-variant/50" id="shop-by-occasion">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-2">
              CURATED STYLING
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
              Shop By Occasion
            </h2>
            <p className="font-serif-editorial italic text-lg text-on-surface-variant mt-2 font-light">
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
                className="group relative aspect-[3/4] overflow-hidden fine-gold-border bg-surface-container block"
              >
                <ProductImage
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent"></div>
                <div className="absolute bottom-6 inset-x-6 text-white">
                  <span className="font-sans-fashion text-[0.65rem] tracking-[0.25em] uppercase text-primary-fixed block mb-1">
                    {item.tag}
                  </span>
                  <h3 className="font-serif-display text-2xl text-white font-normal mb-2">{item.title}</h3>
                  <span className="font-sans-fashion text-xs text-primary-fixed group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
                    EXPLORE EDIT ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — EXPLORE BY FABRIC */}
      <section className="w-full py-20 bg-surface border-b border-outline-variant/40" id="explore-by-fabric">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/60 pb-8 mb-12">
            <div>
              <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-2">
                TACTILE DIRECTORY
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
                Explore By Fabric
              </h2>
            </div>
            <p className="font-serif-editorial italic text-lg text-on-surface-variant max-w-md mt-4 md:mt-0 font-light leading-relaxed">
              Navigate by drape feel, weave texture, and fabric density.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fabricList.map((f) => (
              <div
                key={f.name}
                className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xs mb-4 bg-surface-container">
                    <ProductImage
                      src={f.image}
                      alt={f.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 flex items-center group-hover:text-primary transition-colors">
                    {f.name}
                  </h3>
                  <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                    {f.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                  <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">
                    {f.count} SAREES AVAILABLE
                  </span>
                  <Link
                    href={`/shop?fabric=${encodeURIComponent(f.slug)}`}
                    className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>Browse</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — THE SORAYVA EDIT */}
      <section className="w-full py-24 bg-surface-container-low border-y border-outline-variant/50" id="collections">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div>
              <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-2">
                CURATED SELECTION
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
                THE SORAYVA EDIT
              </h2>
              <p className="font-serif-editorial italic text-lg sm:text-xl text-on-surface-variant mt-2 font-light">
                Curated sarees for everyday elegance, celebrations and unforgettable moments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleFilter('all')}
                className={`h-10 px-5 rounded-full font-sans-fashion text-xs tracking-wider uppercase transition-colors inline-flex items-center justify-center ${
                  activeFilter === 'all'
                    ? 'bg-secondary text-white font-medium'
                    : 'bg-surface fine-gold-border text-secondary hover:bg-secondary hover:text-white'
                }`}
              >
                ALL DRAPES
              </button>
              {dynamicCategories.slice(0, 4).map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleFilter(cat.slug)}
                  className={`h-10 px-5 rounded-full font-sans-fashion text-xs tracking-wider uppercase transition-colors inline-flex items-center justify-center ${
                    activeFilter === cat.slug
                      ? 'bg-secondary text-white font-medium'
                      : 'bg-surface fine-gold-border text-secondary hover:bg-secondary hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.slice(0, 8).map((prod) => (
              <ProductCard
                key={prod.productId}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              className="inline-flex items-center gap-2 font-sans-fashion text-xs tracking-[0.2em] text-secondary uppercase pb-1 border-b border-primary-container hover:text-primary transition-all"
              href="/shop"
            >
              <span>EXPLORE ENTIRE CATALOGUE ({allProducts.length} SAREES)</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 — BEST SELLERS */}
      <section className="w-full py-20 bg-surface border-b border-outline-variant/40">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-2">
              CUSTOMER FAVORITES
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
              Best Sellers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((prod) => (
              <ProductCard
                key={prod.productId}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <section className="w-full py-16 bg-surface-container-low border-b border-outline-variant/50">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-6 mb-10">
              <h3 className="font-serif-display text-2xl text-secondary font-normal">Recently Viewed</h3>
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
          </div>
        </section>
      )}

      {/* SECTION 9 — TRUST & VALUE PROPOSITION */}
      <section className="w-full py-16 bg-surface border-t border-outline-variant/60">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-xs flex flex-col justify-between rounded-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                EXPRESS DOORSTEP SHIPPING
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Complimentary insured delivery across India on orders over ₹15,000.
              </p>
            </div>

            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-xs flex flex-col justify-between rounded-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                EASY EXCHANGES
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Hassle-free 7-day doorstep exchange and quality inspection process.
              </p>
            </div>

            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-xs flex flex-col justify-between rounded-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                COD & SECURE PAYMENTS
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Cash on Delivery available along with 256-bit encrypted online card & UPI payments.
              </p>
            </div>

            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-xs flex flex-col justify-between rounded-xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                CUSTOMER CARE & TRACKING
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Dedicated WhatsApp support assistance and real-time order tracking dispatch updates.
              </p>
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
