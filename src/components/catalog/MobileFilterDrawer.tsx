'use client';

import React from 'react';
import { FilterState } from '@/types';
import { X } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  resultsCount: number;
  dynamicOptions?: any;
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-xs bg-warm-ivory h-full flex flex-col justify-between shadow-2xl animate-slideLeft border-l border-champagne/40">
        <div className="p-4 border-b border-champagne/30 flex items-center justify-between bg-warm-ivory/90 backdrop-blur-md">
          <h2 className="font-serif-display text-base font-semibold uppercase tracking-wider text-deep-espresso">
            FILTERS ({resultsCount})
          </h2>
          <button onClick={onClose} className="p-1 text-deep-espresso hover:text-terracotta transition-colors" aria-label="Close Filters">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar filters={filters} onFilterChange={onFilterChange} onReset={onReset} dynamicOptions={dynamicOptions} />
        </div>

        <div className="p-4 border-t border-champagne/30 bg-warm-ivory/90 backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full bg-deep-espresso text-warm-ivory py-3 rounded-xl text-xs font-sans-fashion font-semibold uppercase tracking-widest hover:bg-terracotta transition-colors shadow-md"
          >
            Show {resultsCount} Sarees
          </button>
        </div>
      </div>
    </div>
  );
};
