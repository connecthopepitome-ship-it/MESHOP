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
  availableStyles?: string[];
  availableWorks?: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableFabrics = ['Silk', 'Organza', 'Georgette', 'Chiffon', 'Chanderi', 'Cotton', 'Linen'],
  availableColours = ['Crimson', 'Emerald', 'Blush Pink', 'Midnight Navy', 'Indigo', 'Gold', 'Teal'],
  availableOccasions = ['Everyday', 'Festive', 'Party', 'Wedding Guest', 'Celebration'],
  availableStyles = ['Elegant', 'Minimal', 'Traditional', 'Contemporary', 'Statement'],
  availableWorks = ['Zari Weave', 'Kadwa', 'Hand Embroidered', 'Gota Patti', 'Hand Painted'],
}) => {
  const toggleArrayFilter = (key: 'fabrics' | 'colours' | 'occasions' | 'styles' | 'works', value: string) => {
    const existing = filters[key] || [];
    const updated = existing.includes(value)
      ? existing.filter((v) => v !== value)
      : [...existing, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  return (
    <aside className="w-full space-y-6 text-secondary font-sans-body text-xs bg-surface-bright p-5 fine-gold-border rounded-xs">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
        <h3 className="font-serif-display text-base font-semibold uppercase tracking-wider text-secondary">REFINE SELECTION</h3>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-[11px] font-sans-fashion text-outline hover:text-primary transition-colors uppercase tracking-wider"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET ALL</span>
        </button>
      </div>

      {/* Sort Selector */}
      <div className="space-y-2">
        <label className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] block text-secondary">
          SORT BY
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full bg-surface border border-outline-variant/70 px-3 py-2 text-xs font-sans-body text-secondary focus:outline-none focus:border-primary-container uppercase tracking-wider rounded-xs"
        >
          <option value="featured">Featured Curations</option>
          <option value="newest">New Arrivals First</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Fabric Filters */}
      {availableFabrics.length > 0 && (
        <div className="pt-4 border-t border-outline-variant/50">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-primary-container">
            FABRIC
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableFabrics.map((f) => (
              <label key={f} className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={(filters.fabrics || []).includes(f)}
                  onChange={() => toggleArrayFilter('fabrics', f)}
                  className="rounded-xs border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colour Filters */}
      {availableColours.length > 0 && (
        <div className="pt-4 border-t border-outline-variant/50">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-primary-container">
            COLOUR PALETTE
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableColours.map((c) => (
              <label key={c} className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={(filters.colours || []).includes(c)}
                  onChange={() => toggleArrayFilter('colours', c)}
                  className="rounded-xs border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Occasion Filters */}
      {availableOccasions.length > 0 && (
        <div className="pt-4 border-t border-outline-variant/50">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-primary-container">
            OCCASION
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableOccasions.map((o) => (
              <label key={o} className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={(filters.occasions || []).includes(o)}
                  onChange={() => toggleArrayFilter('occasions', o)}
                  className="rounded-xs border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Style Filters */}
      {availableStyles.length > 0 && (
        <div className="pt-4 border-t border-outline-variant/50">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-primary-container">
            STYLE
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableStyles.map((s) => (
              <label key={s} className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={(filters.styles || []).includes(s)}
                  onChange={() => toggleArrayFilter('styles', s)}
                  className="rounded-xs border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Work/Craft Filters */}
      {availableWorks.length > 0 && (
        <div className="pt-4 border-t border-outline-variant/50">
          <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-primary-container">
            WORK & EMBROIDERY
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableWorks.map((w) => (
              <label key={w} className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={(filters.works || []).includes(w)}
                  onChange={() => toggleArrayFilter('works', w)}
                  className="rounded-xs border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span>{w}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Slider */}
      <div className="pt-4 border-t border-outline-variant/50">
        <h4 className="font-sans-fashion font-semibold uppercase tracking-wider text-[11px] mb-2 text-primary-container">
          MAX PRICE: ₹{filters.maxPrice ? filters.maxPrice.toLocaleString('en-IN') : '50,000+'}
        </h4>
        <input
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={filters.maxPrice || 100000}
          onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
          className="w-full accent-primary-container bg-outline-variant h-1.5 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-sans-fashion text-outline mt-1">
          <span>₹1,000</span>
          <span>₹1,00000+</span>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-4 border-t border-outline-variant/50 space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded-xs border-outline-variant text-primary-container"
          />
          <span className="font-sans-fashion text-xs uppercase tracking-wider">IN STOCK READY TO SHIP</span>
        </label>
      </div>
    </aside>
  );
};

