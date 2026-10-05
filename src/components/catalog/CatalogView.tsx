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
    (filters.fabrics?.length || 0) +
    (filters.colours?.length || 0) +
    (filters.occasions?.length || 0) +
    (filters.styles?.length || 0) +
    (filters.works?.length || 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.bestsellersOnly ? 1 : 0) +
    (filters.maxPrice < 100000 ? 1 : 0);

  return (
    <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Title & Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 border-b border-outline-variant/60 pb-8">
        <span className="font-sans-fashion text-xs font-semibold tracking-[0.25em] text-primary-container uppercase block">
          THE SORAYVA COLLECTION
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl md:text-5xl text-secondary font-normal tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-serif-editorial italic text-lg sm:text-xl text-on-surface-variant font-light">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            availableFabrics={dynamicFilterOptions.fabrics}
            availableColours={dynamicFilterOptions.colours}
            availableOccasions={dynamicFilterOptions.occasions}
            availableStyles={dynamicFilterOptions.styles}
            availableWorks={dynamicFilterOptions.works}
          />
        </div>

        {/* Content Column (Right) */}
        <div className="flex-1 space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-bright p-4 fine-gold-border text-xs rounded-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 bg-secondary text-white px-4 py-2 font-sans-fashion uppercase font-semibold tracking-wider rounded-full"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters ({activeChipsCount})</span>
              </button>

              <span className="text-on-surface-variant font-sans-body font-medium">
                Showing <strong className="text-secondary">{products.length}</strong> active sarees
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-outline uppercase font-sans-fashion tracking-wider text-[11px]">SORT BY:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="bg-surface border border-outline-variant px-3 py-1.5 text-xs text-secondary font-sans-body focus:outline-none focus:border-primary-container uppercase tracking-wider rounded-xs"
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
              <span className="text-outline text-[11px] font-sans-fashion uppercase tracking-wider">ACTIVE FILTERS:</span>
              {filters.fabrics?.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center space-x-1.5 bg-surface-container text-secondary border border-outline-variant/60 px-3 py-1 text-[11px] font-sans-body rounded-full"
                >
                  <span>{f}</span>
                  <button onClick={() => setFilters({ ...filters, fabrics: filters.fabrics.filter((x) => x !== f) })}>
                    <X className="w-3.5 h-3.5 text-outline hover:text-secondary" />
                  </button>
                </span>
              ))}
              {filters.colours?.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center space-x-1.5 bg-surface-container text-secondary border border-outline-variant/60 px-3 py-1 text-[11px] font-sans-body rounded-full"
                >
                  <span>{c}</span>
                  <button onClick={() => setFilters({ ...filters, colours: filters.colours.filter((x) => x !== c) })}>
                    <X className="w-3.5 h-3.5 text-outline hover:text-secondary" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-primary-container font-sans-fashion font-semibold hover:underline text-[11px] ml-2 uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-surface-bright fine-gold-border animate-pulse rounded-xs" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-surface-bright fine-gold-border p-8 space-y-4 rounded-xs">
              <h3 className="font-serif-display text-2xl text-secondary font-medium">No sarees match your current selection</h3>
              <p className="font-sans-body text-xs text-on-surface-variant max-w-md mx-auto font-light leading-relaxed">
                Try clearing selected fabric or color filters to explore our complete curated saree repertoire.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-secondary text-white px-8 py-3 rounded-full text-xs font-sans-fashion tracking-widest uppercase hover:bg-primary transition-colors inline-flex items-center justify-center font-medium"
              >
                RESET ALL FILTERS
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

