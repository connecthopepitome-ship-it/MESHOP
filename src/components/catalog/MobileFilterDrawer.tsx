'use client';

import React, { useState } from 'react';
import { FilterState } from '@/types';
import { X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { DynamicFilterOptions } from '@/lib/utils/taxonomyUtils';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  resultsCount: number;
  dynamicOptions?: DynamicFilterOptions;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  resultsCount,
  dynamicOptions,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    types: true,
    fabrics: true,
    occasions: true,
    price: true,
    colours: false,
    patterns: false,
    works: false,
    borders: false,
    ratings: false,
    availability: false,
  });

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = (
    key:
      | 'sareeTypes'
      | 'fabrics'
      | 'colours'
      | 'occasions'
      | 'patterns'
      | 'works'
      | 'borders',
    value: string
  ) => {
    const existing = (filters[key] as string[]) || [];
    const updated = existing.includes(value)
      ? existing.filter((v) => v !== value)
      : [...existing, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const sareeTypes = dynamicOptions?.sareeTypes || [];
  const fabrics = dynamicOptions?.fabrics || [];
  const occasions = dynamicOptions?.occasions || [];
  const patterns = dynamicOptions?.patterns || [];
  const works = dynamicOptions?.works || [];
  const borders = dynamicOptions?.borders || [];
  const colours = dynamicOptions?.colours || [];
  const ratings = dynamicOptions?.ratings || [];
  const availability = dynamicOptions?.availability || [];

  // Determine dynamic max price bound from dynamic options or default to 25000
  const maxCatalogPrice = 25000;
  const currentMaxPrice = filters.maxPrice || maxCatalogPrice;

  // Pluralization
  const sareeLabel = resultsCount === 1 ? 'SAREE' : 'SAREES';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end transition-opacity animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Mobile Bottom Sheet Container */}
      <div className="w-full bg-warm-ivory rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl border-t border-champagne/40 animate-slideUp relative overflow-hidden">
        {/* Top Drag Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center bg-warm-ivory" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-deep-espresso/20" />
        </div>

        {/* Sticky Header */}
        <div className="px-5 py-3 border-b border-champagne/30 flex items-center justify-between bg-warm-ivory/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="font-serif-display text-lg font-semibold uppercase tracking-wider text-deep-espresso">
              FILTERS ({resultsCount})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-full text-xs font-sans-fashion font-bold text-deep-espresso/70 hover:text-terracotta transition-colors uppercase tracking-wider flex items-center gap-1 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET ALL</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] rounded-full text-deep-espresso hover:text-terracotta hover:bg-soft-sand/60 transition-colors flex items-center justify-center"
              aria-label="Close Filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Options Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-28">
          {/* SORT BY */}
          <div className="pb-4 border-b border-champagne/30">
            <label className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] block text-terracotta mb-2">
              SORT BY
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full bg-white/80 border border-champagne/60 px-4 py-3 rounded-xl text-xs font-sans-body text-deep-espresso focus:outline-none focus:border-terracotta uppercase tracking-wider cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">New Arrivals</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              {dynamicOptions?.hasRatingsData && <option value="rating">Customer Rating</option>}
              <option value="discount">Discount %</option>
              {dynamicOptions?.hasSalesData && <option value="bestseller">Best Selling</option>}
            </select>
          </div>

          {/* 1. SAREE TYPE ACCORDION */}
          {sareeTypes.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('types')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  SAREE TYPE ({sareeTypes.length})
                </span>
                {openSections.types ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.types && (
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {sareeTypes.map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1 min-h-[36px]"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters.sareeTypes || []).includes(item.name)}
                          onChange={() => toggleArrayFilter('sareeTypes', item.name)}
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span className="font-medium text-deep-espresso">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SAREE FABRIC ACCORDION */}
          {fabrics.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('fabrics')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  SAREE FABRIC ({fabrics.length})
                </span>
                {openSections.fabrics ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.fabrics && (
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {fabrics.map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1 min-h-[36px]"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters.fabrics || []).includes(item.name)}
                          onChange={() => toggleArrayFilter('fabrics', item.name)}
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span className="font-medium text-deep-espresso">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. OCCASION ACCORDION */}
          {occasions.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('occasions')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  OCCASION ({occasions.length})
                </span>
                {openSections.occasions ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.occasions && (
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {occasions.map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1 min-h-[36px]"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters.occasions || []).includes(item.name)}
                          onChange={() => toggleArrayFilter('occasions', item.name)}
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span className="font-medium text-deep-espresso">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. MAX PRICE SLIDER */}
          <div className="pb-4 border-b border-champagne/30">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between py-1 text-left"
            >
              <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                PRICE RANGE
              </span>
              <span className="font-sans-fashion font-bold text-xs text-deep-espresso">
                ₹{currentMaxPrice.toLocaleString('en-IN')}
              </span>
            </button>
            {openSections.price && (
              <div className="mt-3 space-y-2">
                <input
                  type="range"
                  min="499"
                  max={maxCatalogPrice}
                  step="500"
                  value={currentMaxPrice}
                  onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
                  className="w-full accent-terracotta bg-champagne/40 h-2 cursor-pointer rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-sans-fashion text-deep-espresso/60 font-semibold">
                  <span>₹499</span>
                  <span>₹{maxCatalogPrice.toLocaleString('en-IN')}+</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. COLOR PALETTE ACCORDION */}
          {colours.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('colours')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  COLOR PALETTE ({colours.length})
                </span>
                {openSections.colours ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.colours && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {colours.map((c) => {
                    const isSelected = (filters.colours || []).includes(c.name);
                    return (
                      <button
                        key={c.name}
                        onClick={() => toggleArrayFilter('colours', c.name)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-sans-fashion border transition-all min-h-[38px] ${
                          isSelected
                            ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-xs scale-105'
                            : 'bg-white/80 border-champagne/60 text-deep-espresso hover:border-terracotta'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ background: c.hex }}
                        />
                        <span>{c.name}</span>
                        <span className="opacity-60 text-[10px]">({c.count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 6. PATTERN ACCORDION */}
          {patterns.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('patterns')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  PATTERN ({patterns.length})
                </span>
                {openSections.patterns ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.patterns && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {patterns.map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters.patterns || []).includes(item.name)}
                          onChange={() => toggleArrayFilter('patterns', item.name)}
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. WORK ACCORDION */}
          {works.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('works')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  WORK & EMBELLISHMENT ({works.length})
                </span>
                {openSections.works ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.works && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {works.map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters.works || []).includes(item.name)}
                          onChange={() => toggleArrayFilter('works', item.name)}
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. BORDER ACCORDION */}
          {borders.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('borders')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  BORDER ({borders.length})
                </span>
                {openSections.borders ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.borders && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {borders.map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters.borders || []).includes(item.name)}
                          onChange={() => toggleArrayFilter('borders', item.name)}
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. RATING ACCORDION */}
          {dynamicOptions?.hasRatingsData && ratings.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('ratings')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  CUSTOMER RATING
                </span>
                {openSections.ratings ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.ratings && (
                <div className="mt-3 space-y-2">
                  {ratings.map((r) => (
                    <label
                      key={r.label}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="minRating"
                          checked={filters.minRating === r.minRating}
                          onChange={() =>
                            onFilterChange({
                              ...filters,
                              minRating: filters.minRating === r.minRating ? undefined : r.minRating,
                            })
                          }
                          className="w-4 h-4 border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span>{r.label}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {r.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 10. AVAILABILITY ACCORDION */}
          {availability.length > 0 && (
            <div className="pb-4 border-b border-champagne/30">
              <button
                onClick={() => toggleSection('availability')}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="font-sans-fashion font-bold uppercase tracking-wider text-[11px] text-terracotta">
                  AVAILABILITY
                </span>
                {openSections.availability ? <ChevronUp className="w-4 h-4 text-deep-espresso/60" /> : <ChevronDown className="w-4 h-4 text-deep-espresso/60" />}
              </button>
              {openSections.availability && (
                <div className="mt-3 space-y-2">
                  {availability.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs py-1"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={
                            filters.availability === opt.value ||
                            (opt.value === 'in_stock' && filters.inStockOnly)
                          }
                          onChange={(e) =>
                            onFilterChange({
                              ...filters,
                              availability: e.target.checked ? (opt.value as any) : 'all',
                              inStockOnly: opt.value === 'in_stock' ? e.target.checked : filters.inStockOnly,
                            })
                          }
                          className="w-4 h-4 rounded-xs border-champagne text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                        {opt.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Safe-Area Footer */}
        <div className="p-4 border-t border-champagne/30 bg-warm-ivory/95 backdrop-blur-md absolute bottom-0 inset-x-0 z-20 pb-safe flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-5 py-3.5 rounded-2xl sorayva-glass border border-champagne/50 text-xs font-sans-fashion font-bold uppercase tracking-widest text-deep-espresso hover:border-terracotta transition-colors flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <RotateCcw className="w-4 h-4 text-terracotta" />
            <span>RESET</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-deep-espresso text-warm-ivory py-3.5 rounded-2xl text-xs font-sans-fashion font-bold uppercase tracking-widest hover:bg-terracotta transition-colors shadow-lg min-h-[48px]"
          >
            SHOW {resultsCount} {sareeLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
