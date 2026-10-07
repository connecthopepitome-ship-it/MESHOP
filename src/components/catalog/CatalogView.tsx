'use client';

import React, { useState, useEffect } from 'react';
import { Product, FilterState } from '@/types';
import { repository } from '@/lib/api/googleSheetsRepository';
import { getDynamicFilterOptions } from '@/lib/utils';
import { ProductCard } from '@/components/catalog/ProductCard';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { MobileFilterDrawer } from '@/components/catalog/MobileFilterDrawer';
import { QuickViewModal } from '@/components/shared/QuickViewModal';
import { SlidersHorizontal, X } from 'lucide-react';

interface CatalogViewProps {
  title: string;
  subtitle?: string;
  initialCategory?: string;
  initialCollection?: string;
  initialSearchQuery?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  title,
  subtitle,
  initialCategory,
  initialCollection,
  initialSearchQuery,
}) => {
  const defaultFilters: FilterState = {
    searchQuery: initialSearchQuery || '',
    category: initialCategory || 'all',
    collection: initialCollection || 'all',
    fabrics: [],
    colours: [],
    occasions: [],
    styles: [],
    works: [],
    minPrice: 0,
    maxPrice: 100000,
    inStockOnly: false,
    featuredOnly: false,
    bestsellersOnly: false,
    newArrivalsOnly: false,
    sortBy: 'featured',
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchCatalogue() {
      setLoading(true);
      try {
        const fullCatalogue = await repository.getProducts();
        setAllProducts(fullCatalogue);
        const filtered = await repository.getProducts(filters);
        setProducts(filtered);
      } catch (e) {
        console.error('Error fetching catalogue:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogue();
  }, [filters]);

  const dynamicFilterOptions = getDynamicFilterOptions(allProducts);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const activeChipsCount =
    (filters.sareeTypes?.length || 0) +
    (filters.fabrics?.length || 0) +
    (filters.occasions?.length || 0) +
    (filters.patterns?.length || 0) +
    (filters.works?.length || 0) +
    (filters.borders?.length || 0) +
    (filters.blouseTypes?.length || 0) +
    (filters.colours?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.bestsellersOnly ? 1 : 0) +
    (filters.maxPrice < 50000 ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  return (
    <div className="max-w-7xl w-[94%] sm:w-[88%] lg:w-[85%] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title & Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 border-b border-champagne/30 pb-8">
        <span className="font-sans-fashion text-xs font-semibold tracking-[0.25em] text-terracotta uppercase block">
          SORAYVA CATALOGUE
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl md:text-5xl text-deep-espresso font-normal tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-serif-editorial italic text-lg sm:text-xl text-deep-espresso/70 font-light">
            {subtitle}
          </p>
        )}
      </div>

      {/* Sticky Mobile Filter Controls */}
      <div className="lg:hidden sticky top-16 z-30 sorayva-glass-card p-2.5 border border-champagne/40 rounded-2xl flex items-center justify-between shadow-lg">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center space-x-2 bg-deep-espresso text-warm-ivory py-2.5 px-4 rounded-xl font-sans-fashion uppercase text-xs tracking-wider font-semibold hover:bg-terracotta transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>FILTER {activeChipsCount > 0 ? `(${activeChipsCount})` : ''}</span>
        </button>
        <div className="w-px h-6 bg-champagne/40 mx-2" />
        <div className="flex-1 flex items-center justify-center">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="bg-transparent text-deep-espresso font-sans-fashion text-xs uppercase tracking-wider font-semibold focus:outline-none cursor-pointer text-center"
          >
            <option value="recommended">SORT ↕ Recommended</option>
            <option value="newest">SORT ↕ Newest</option>
            <option value="price_low_high">SORT ↕ Price: Low to High</option>
            <option value="price_high_low">SORT ↕ Price: High to Low</option>
            {dynamicFilterOptions.hasRatingsData && <option value="rating">SORT ↕ Rating</option>}
            <option value="discount">SORT ↕ Discount %</option>
            {dynamicFilterOptions.hasSalesData && <option value="bestseller">SORT ↕ Bestsellers</option>}
          </select>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            dynamicOptions={dynamicFilterOptions}
          />
        </div>

        {/* Content Column (Right) */}
        <div className="flex-1 space-y-6">
          {/* Top Control Bar (Desktop) */}
          <div className="hidden lg:flex items-center justify-between bg-warm-ivory/60 p-4 border border-champagne/30 text-xs rounded-2xl">
            <span className="text-deep-espresso/70 font-sans-body font-medium">
              Showing <strong className="text-deep-espresso">{products.length}</strong> active sarees
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-deep-espresso/60 uppercase font-sans-fashion tracking-wider text-[11px]">SORT BY:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="bg-warm-ivory border border-champagne/60 px-3 py-1.5 text-xs text-deep-espresso font-sans-body focus:outline-none focus:border-terracotta uppercase tracking-wider rounded-xl cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">New Arrivals</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                {dynamicFilterOptions.hasRatingsData && <option value="rating">Customer Rating</option>}
                <option value="discount">Discount %</option>
                {dynamicFilterOptions.hasSalesData && <option value="bestseller">Best Selling</option>}
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeChipsCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs bg-warm-ivory/40 p-3 rounded-2xl border border-champagne/20">
              <span className="text-terracotta text-[11px] font-sans-fashion uppercase tracking-wider font-semibold">ACTIVE FILTERS:</span>
              
              {filters.sareeTypes?.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{t}</span>
                  <button onClick={() => setFilters({ ...filters, sareeTypes: filters.sareeTypes?.filter((x) => x !== t) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.fabrics?.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{f}</span>
                  <button onClick={() => setFilters({ ...filters, fabrics: filters.fabrics?.filter((x) => x !== f) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.occasions?.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{o}</span>
                  <button onClick={() => setFilters({ ...filters, occasions: filters.occasions?.filter((x) => x !== o) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.patterns?.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{p}</span>
                  <button onClick={() => setFilters({ ...filters, patterns: filters.patterns?.filter((x) => x !== p) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.works?.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{w}</span>
                  <button onClick={() => setFilters({ ...filters, works: filters.works?.filter((x) => x !== w) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.borders?.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{b}</span>
                  <button onClick={() => setFilters({ ...filters, borders: filters.borders?.filter((x) => x !== b) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.colours?.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full"
                >
                  <span>{c}</span>
                  <button onClick={() => setFilters({ ...filters, colours: filters.colours?.filter((x) => x !== c) })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              ))}

              {filters.maxPrice < 50000 && (
                <span className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full">
                  <span>Under ₹{filters.maxPrice.toLocaleString('en-IN')}</span>
                  <button onClick={() => setFilters({ ...filters, maxPrice: 50000 })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              )}

              {filters.minRating && (
                <span className="inline-flex items-center space-x-1.5 bg-deep-espresso text-warm-ivory border border-deep-espresso px-3 py-1 text-[11px] font-sans-fashion rounded-full">
                  <span>{filters.minRating}★ &amp; above</span>
                  <button onClick={() => setFilters({ ...filters, minRating: undefined })}>
                    <X className="w-3.5 h-3.5 text-warm-ivory/80 hover:text-warm-ivory" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-terracotta font-sans-fashion font-bold hover:underline text-[11px] ml-2 uppercase tracking-wider"
              >
                CLEAR ALL
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-warm-ivory/40 border border-champagne/30 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-warm-ivory/50 border border-champagne/40 p-8 space-y-4 rounded-2xl shadow-xs">
              <h3 className="font-serif-display text-2xl text-deep-espresso font-medium">No sarees match your current selection</h3>
              <p className="font-sans-body text-xs text-deep-espresso/70 max-w-md mx-auto font-light leading-relaxed">
                Try clearing selected fabric, occasion, or color filters to explore our complete saree collection.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-deep-espresso text-warm-ivory px-8 py-3 rounded-xl text-xs font-sans-fashion tracking-widest uppercase hover:bg-terracotta transition-colors inline-flex items-center justify-center font-semibold shadow-md"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.productId}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        resultsCount={products.length}
        dynamicOptions={dynamicFilterOptions}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

