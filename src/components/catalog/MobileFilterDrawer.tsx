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
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  resultsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-xs bg-brand-base h-full flex flex-col justify-between shadow-drawer animate-slideLeft">
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
          <h2 className="font-serif text-base font-semibold uppercase tracking-wider text-brand-charcoal">
            Filters ({resultsCount})
          </h2>
          <button onClick={onClose} className="p-1 text-brand-charcoal" aria-label="Close Filters">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar filters={filters} onFilterChange={onFilterChange} onReset={onReset} />
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-surface">
          <button
            onClick={onClose}
            className="w-full bg-brand-gold text-brand-charcoal py-3 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold-hover transition-colors"
          >
            Show {resultsCount} Sarees
          </button>
        </div>
      </div>
    </div>
  );
};
