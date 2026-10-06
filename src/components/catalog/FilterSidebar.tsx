'use client';

import React from 'react';
import { FilterState } from '@/types';
import { RotateCcw } from 'lucide-react';
import { DynamicFilterOptions } from '@/lib/utils/taxonomyUtils';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  dynamicOptions?: DynamicFilterOptions;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  dynamicOptions,
}) => {
  const toggleArrayFilter = (
    key:
      | 'sareeTypes'
      | 'fabrics'
      | 'colours'
      | 'occasions'
      | 'patterns'
      | 'works'
      | 'borders'
      | 'blouseTypes'
      | 'blouseFabrics'
      | 'loomTypes',
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
  const blouseTypes = dynamicOptions?.blouseTypes || [];
  const blouseFabrics = dynamicOptions?.blouseFabrics || [];
  const loomTypes = dynamicOptions?.loomTypes || [];
  const colours = dynamicOptions?.colours || [];
  const priceRanges = dynamicOptions?.priceRanges || [];
  const ratings = dynamicOptions?.ratings || [];
  const availability = dynamicOptions?.availability || [];

  return (
    <aside className="w-full space-y-6 text-deep-espresso font-sans-body text-xs sorayva-glass-card p-6 rounded-2xl border border-champagne/40 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
        <h3 className="font-serif-display text-lg font-semibold uppercase tracking-wider text-deep-espresso">
          REFINE SELECTION
        </h3>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-[11px] font-sans-fashion text-deep-espresso/60 hover:text-terracotta transition-colors uppercase tracking-wider font-bold"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET ALL</span>
        </button>
      </div>

      {/* Sort Selector */}
      <div className="space-y-2">
        <label className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] block text-terracotta">
          SORT BY
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full bg-warm-ivory/80 border border-champagne/60 px-3 py-2 text-xs font-sans-body text-deep-espresso focus:outline-none focus:border-terracotta uppercase tracking-wider rounded-xl cursor-pointer"
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

      {/* 1. Saree Type Filter */}
      {sareeTypes.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            SAREE TYPE
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {sareeTypes.map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.sareeTypes || []).includes(item.name)}
                    onChange={() => toggleArrayFilter('sareeTypes', item.name)}
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 2. Saree Fabric Filter */}
      {fabrics.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            SAREE FABRIC
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {fabrics.map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.fabrics || []).includes(item.name)}
                    onChange={() => toggleArrayFilter('fabrics', item.name)}
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 3. Occasion Filter */}
      {occasions.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            OCCASION
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {occasions.map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.occasions || []).includes(item.name)}
                    onChange={() => toggleArrayFilter('occasions', item.name)}
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 4. Pattern Filter */}
      {patterns.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            PATTERN
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {patterns.map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.patterns || []).includes(item.name)}
                    onChange={() => toggleArrayFilter('patterns', item.name)}
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 5. Work & Embellishment */}
      {works.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            WORK &amp; EMBELLISHMENT
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {works.map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.works || []).includes(item.name)}
                    onChange={() => toggleArrayFilter('works', item.name)}
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 6. Border Filter */}
      {borders.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            BORDER
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {borders.map((item) => (
              <label
                key={item.name}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(filters.borders || []).includes(item.name)}
                    onChange={() => toggleArrayFilter('borders', item.name)}
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 7. Color Swatches */}
      {colours.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-3 text-terracotta">
            COLOR PALETTE
          </h4>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => {
              const isSelected = (filters.colours || []).includes(c.name);
              return (
                <button
                  key={c.name}
                  onClick={() => toggleArrayFilter('colours', c.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans-fashion border transition-all ${
                    isSelected
                      ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-xs scale-105'
                      : 'bg-warm-ivory/60 border-champagne/50 text-deep-espresso hover:border-terracotta'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ background: c.hex }}
                  />
                  <span>{c.name}</span>
                  <span className="opacity-60 text-[9px]">({c.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. Price Slider */}
      <div className="pt-4 border-t border-champagne/30">
        <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta flex justify-between">
          <span>MAX PRICE</span>
          <span className="font-bold">
            ₹{filters.maxPrice ? filters.maxPrice.toLocaleString('en-IN') : '50,000+'}
          </span>
        </h4>
        <input
          type="range"
          min="499"
          max="50000"
          step="500"
          value={filters.maxPrice || 50000}
          onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
          className="w-full accent-terracotta bg-champagne/40 h-1.5 cursor-pointer rounded-lg"
        />
        <div className="flex justify-between text-[10px] font-sans-fashion text-deep-espresso/60 mt-1">
          <span>₹499</span>
          <span>₹50,000+</span>
        </div>
      </div>

      {/* 9. Customer Rating Filter (Only shown if real ratings exist) */}
      {dynamicOptions?.hasRatingsData && ratings.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            CUSTOMER RATING
          </h4>
          <div className="space-y-1.5">
            {ratings.map((r) => (
              <label
                key={r.label}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
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
                    className="border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{r.label}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {r.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 10. Availability Filter */}
      {availability.length > 0 && (
        <div className="pt-4 border-t border-champagne/30">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-terracotta">
            AVAILABILITY
          </h4>
          <div className="space-y-1.5">
            {availability.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center justify-between cursor-pointer hover:text-terracotta transition-colors text-xs"
              >
                <div className="flex items-center space-x-2">
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
                    className="rounded-xs border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[10px] text-deep-espresso/50 font-sans-fashion font-bold">
                  {opt.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
