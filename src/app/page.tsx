'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Truck, RefreshCw, Award, HeartHandshake } from 'lucide-react';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product, Category, Collection } from '@/types';
import { ProductCard } from '@/components/catalog/ProductCard';
import { QuickViewModal } from '@/components/shared/QuickViewModal';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, cols] = await Promise.all([
          repository.getProducts({ featuredOnly: true }),
          repository.getCategories(),
          repository.getCollections(),
        ]);
        setFeaturedProducts(prods.slice(0, 6));
        setCategories(cats);
        setCollections(cols);
      } catch (e) {
        console.error('Failed to load homepage data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. Hero Editorial Banner */}
      <section className="relative w-full h-[80vh] min-h-[550px] bg-brand-charcoal overflow-hidden flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90"
          alt="Royal Kanjeevaram Saree Banner"
          fill
          priority
          className="object-cover object-center opacity-45 transform scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="container mx-auto px-6 md:px-12 relative z-10 text-brand-base max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/20 backdrop-blur-md px-3.5 py-1.5 border border-brand-gold/40 text-brand-gold text-xs font-sans tracking-widest uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autumn Royal Heritage '26</span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light tracking-wide leading-tight text-white">
            Timeless Drapes. <br />
            <span className="italic font-serif font-normal text-brand-gold">Modern Elegance.</span>
          </h1>

          <p className="text-sm md:text-base font-sans text-brand-base/80 max-w-xl font-light leading-relaxed">
            Discover handloom Kanjeevarams, Banarasi Katan silks, and romantic tissue organzas meticulously woven for celebrations that matter.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover px-8 py-4 text-xs uppercase tracking-widest font-semibold transition-all shadow-lg flex items-center space-x-2"
            >
              <span>Explore All Sarees</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/collections/signature-edit"
              className="border border-brand-base/60 text-brand-base hover:bg-brand-base hover:text-brand-charcoal px-8 py-4 text-xs uppercase tracking-widest font-semibold transition-all"
            >
              The Royal Edit
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Values Strip */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 bg-brand-surface border border-brand-border/60 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Award className="w-6 h-6 text-brand-gold" />
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal uppercase tracking-wider">100% Silk Mark</h4>
            <p className="text-xs text-brand-muted">Authentic handloom silk certified.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-6 h-6 text-brand-gold" />
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal uppercase tracking-wider">Express Shipping</h4>
            <p className="text-xs text-brand-muted">Free delivery on orders over ₹10k.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 text-brand-gold" />
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal uppercase tracking-wider">Hassle-Free Returns</h4>
            <p className="text-xs text-brand-muted">7-day easy exchange guarantee.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <HeartHandshake className="w-6 h-6 text-brand-gold" />
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal uppercase tracking-wider">Stylist Concierge</h4>
            <p className="text-xs text-brand-muted">Dedicated WhatsApp assistance.</p>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category */}
      <section className="container mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Taxonomy</span>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal font-medium">Curated Categories</h2>
          <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.categoryId}
              href={`/shop/${cat.slug}`}
              className="group relative aspect-[4/5] overflow-hidden bg-brand-surface border border-brand-border/60 block"
            >
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-brand-base">
                <span className="text-[10px] tracking-widest uppercase text-brand-gold font-semibold block">Category</span>
                <h3 className="font-serif text-2xl font-normal text-white mt-1 group-hover:text-brand-gold transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-brand-base/80 mt-1 line-clamp-1 font-light">{cat.description}</p>
                <span className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-brand-gold group-hover:translate-x-1 transition-transform">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Bestsellers Grid */}
      <section className="container mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Handwoven Spotlight</span>
            <h2 className="font-serif text-3xl text-brand-charcoal font-medium mt-1">Featured Boutique Creations</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:text-brand-gold transition-colors mt-2 md:mt-0 flex items-center space-x-1"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] bg-brand-surface animate-pulse border border-brand-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.productId}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Blouse Size Identifier Banner */}
      <section className="bg-brand-surface border-y border-brand-border py-16">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Fittings & Tailoring</span>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal font-medium">
              Confused About Your Blouse Fit?
            </h2>
            <p className="text-xs md:text-sm text-brand-muted leading-relaxed font-light">
              While our sarees are generous 5.5m handloom lengths, getting the blouse fit right ensures maximum grace. Try our interactive Blouse Size Identifier to calculate your optimal XS–3XL recommendation.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSizeModalOpen(true)}
                className="bg-brand-charcoal text-brand-base hover:bg-brand-gold hover:text-brand-charcoal px-8 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors shadow-md"
              >
                Launch Size Assistant
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/9] w-full bg-brand-border/20 border border-brand-border overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80"
              alt="Blouse Tailoring Guide"
              fill
              className="object-cover object-center"
            />
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
    </div>
  );
}
