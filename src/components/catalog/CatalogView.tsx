'use client';

import React, { useState, useEffect } from 'react';
import { Product, FilterState } from '@/types';
import { repository } from '@/lib/api/googleSheetsRepository';
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
    minPrice: 0,
    maxPrice: 50000,
    inStockOnly: false,
    featuredOnly: false,
    bestsellersOnly: false,
    newArrivalsOnly: false,
    sortBy: 'featured',
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchCatalogue() {
      setLoading(true);
      try {
        const result = await repository.getProducts(filters);
        setProducts(result);
      } catch (e) {
        console.error('Error fetching catalogue:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogue();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const activeChipsCount =
    (filters.fabrics?.length || 0) +
    (filters.colours?.length || 0) +
    (filters.occasions?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.bestsellersOnly ? 1 : 0) +
    (filters.maxPrice < 50000 ? 1 : 0);

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Title & Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Handloom Catalogue</span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">{title}</h1>
        {subtitle && <p className="text-xs md:text-sm text-brand-muted font-light">{subtitle}</p>}
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Content Column (Right) */}
        <div className="flex-1 space-y-6">
          {/* Top Control Bar (Mobile filter toggle, results count, sorting) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-surface p-4 border border-brand-border text-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 bg-brand-charcoal text-brand-base px-3 py-2 uppercase font-semibold tracking-wider"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters ({activeChipsCount})</span>
              </button>

              <span className="text-brand-muted font-sans font-medium">
                Showing <strong className="text-brand-charcoal">{products.length}</strong> sarees
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-brand-muted uppercase tracking-wider text-[11px]">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="bg-brand-base border border-brand-border px-3 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold uppercase tracking-wider"
              >
                <option value="featured">Featured First</option>
                <option value="newest">New Arrivals</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeChipsCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-brand-muted text-[11px] uppercase tracking-wider">Active Filters:</span>
              {filters.fabrics?.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center space-x-1 bg-brand-gold/15 text-brand-charcoal border border-brand-gold/40 px-2.5 py-1 text-[11px]"
                >
                  <span>{f}</span>
                  <button onClick={() => setFilters({ ...filters, fabrics: filters.fabrics.filter((x) => x !== f) })}>
                    <X className="w-3 h-3 hover:text-brand-burgundy" />
                  </button>
                </span>
              ))}
              {filters.colours?.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center space-x-1 bg-brand-gold/15 text-brand-charcoal border border-brand-gold/40 px-2.5 py-1 text-[11px]"
                >
                  <span>{c}</span>
                  <button onClick={() => setFilters({ ...filters, colours: filters.colours.filter((x) => x !== c) })}>
                    <X className="w-3 h-3 hover:text-brand-burgundy" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-brand-burgundy font-semibold hover:underline text-[11px] ml-2 uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-brand-surface border border-brand-border animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-brand-surface border border-brand-border p-8 space-y-4">
              <h3 className="font-serif text-xl text-brand-charcoal font-medium">No sarees found matching your criteria</h3>
              <p className="text-xs text-brand-muted max-w-md mx-auto">
                Try widening your price range or clearing fabric/colour filters to explore our complete boutique inventory.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-brand-charcoal text-brand-base px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
