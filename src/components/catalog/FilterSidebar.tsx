'use client';

import React from 'react';
import { FilterState } from '@/types';
import { RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  availableFabrics?: string[];
  availableColours?: string[];
  availableOccasions?: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableFabrics = ['Silk', 'Kanjeevaram', 'Banarasi', 'Organza', 'Chiffon', 'Linen'],
  availableColours = ['Crimson', 'Emerald', 'Blush Pink', 'Midnight Navy', 'Indigo'],
  availableOccasions = ['Wedding / Festive', 'Cocktail / Mehendi', 'Workwear / Casual Elegance'],
}) => {
  const toggleFabric = (fabric: string) => {
    const existing = filters.fabrics || [];
    const updated = existing.includes(fabric)
      ? existing.filter((f) => f !== fabric)
      : [...existing, fabric];
    onFilterChange({ ...filters, fabrics: updated });
  };

  const toggleColour = (colour: string) => {
    const existing = filters.colours || [];
    const updated = existing.includes(colour)
      ? existing.filter((c) => c !== colour)
      : [...existing, colour];
    onFilterChange({ ...filters, colours: updated });
  };

  const toggleOccasion = (occasion: string) => {
    const existing = filters.occasions || [];
    const updated = existing.includes(occasion)
      ? existing.filter((o) => o !== occasion)
      : [...existing, occasion];
    onFilterChange({ ...filters, occasions: updated });
  };

  return (
    <aside className="w-full space-y-6 text-brand-charcoal font-sans text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Refine Selection</h3>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-[11px] text-brand-muted hover:text-brand-burgundy transition-colors uppercase tracking-wider"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Sort By Selector */}
      <div className="space-y-2">
        <label className="font-semibold uppercase tracking-wider text-[11px] block">Sort By:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full bg-brand-surface border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold uppercase tracking-wider"
        >
          <option value="featured">Featured Curations</option>
          <option value="newest">New Arrivals First</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Fabric Filters */}
      <div className="pt-4 border-t border-brand-border/60">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-2">Weave & Fabric</h4>
        <div className="space-y-1.5">
          {availableFabrics.map((f) => (
            <label key={f} className="flex items-center space-x-2 cursor-pointer hover:text-brand-gold">
              <input
                type="checkbox"
                checked={(filters.fabrics || []).includes(f)}
                onChange={() => toggleFabric(f)}
                className="rounded-none border-brand-border text-brand-gold focus:ring-brand-gold"
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colour Filters */}
      <div className="pt-4 border-t border-brand-border/60">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-2">Palette</h4>
        <div className="space-y-1.5">
          {availableColours.map((c) => (
            <label key={c} className="flex items-center space-x-2 cursor-pointer hover:text-brand-gold">
              <input
                type="checkbox"
                checked={(filters.colours || []).includes(c)}
                onChange={() => toggleColour(c)}
                className="rounded-none border-brand-border text-brand-gold focus:ring-brand-gold"
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion Filters */}
      <div className="pt-4 border-t border-brand-border/60">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-2">Occasion</h4>
        <div className="space-y-1.5">
          {availableOccasions.map((o) => (
            <label key={o} className="flex items-center space-x-2 cursor-pointer hover:text-brand-gold">
              <input
                type="checkbox"
                checked={(filters.occasions || []).includes(o)}
                onChange={() => toggleOccasion(o)}
                className="rounded-none border-brand-border text-brand-gold focus:ring-brand-gold"
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-brand-border/60">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-2">
          Max Price: ₹{filters.maxPrice.toLocaleString('en-IN')}
        </h4>
        <input
          type="range"
          min="5000"
          max="50000"
          step="1000"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
          className="w-full accent-brand-gold bg-brand-border h-1.5"
        />
        <div className="flex justify-between text-[10px] text-brand-muted mt-1">
          <span>₹5,000</span>
          <span>₹50,000+</span>
        </div>
      </div>

      {/* Flags */}
      <div className="pt-4 border-t border-brand-border/60 space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer hover:text-brand-gold">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded-none border-brand-border text-brand-gold"
          />
          <span>In Stock Ready to Ship</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer hover:text-brand-gold">
          <input
            type="checkbox"
            checked={filters.bestsellersOnly}
            onChange={(e) => onFilterChange({ ...filters, bestsellersOnly: e.target.checked })}
            className="rounded-none border-brand-border text-brand-gold"
          />
          <span>Bestseller Edits Only</span>
        </label>
      </div>
    </aside>
  );
};
