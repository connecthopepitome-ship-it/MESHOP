'use client';

import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';
import { BLOUSE_SIZE_CHART, recommendBlouseSize, SizeRecommendationResult } from '@/data/sizeChart';
import { SizeRecommendationInput } from '@/types';
import { trackEvent } from '@/lib/analytics';

interface BlouseSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
  currentSize?: string;
}

export const BlouseSizeModal: React.FC<BlouseSizeModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  currentSize,
}) => {
  const [unit, setUnit] = useState<'inch' | 'cm'>('inch');
  const [bust, setBust] = useState<number>(36);
  const [waist, setWaist] = useState<number>(30);
  const [preferredFit, setPreferredFit] = useState<'regular' | 'snug' | 'relaxed'>('regular');
  const [recommendation, setRecommendation] = useState<SizeRecommendationResult | null>(null);

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const input: SizeRecommendationInput = {
      bustInches: bust,
      waistInches: waist,
      preferredFit,
      unit,
    };
    const result = recommendBlouseSize(input);
    setRecommendation(result);

    trackEvent('size_assistant_used', { recommendedSize: result.recommendedSize, unit, fit: preferredFit });
  };

  const handleApplySize = (size: string) => {
    if (onSelectSize) {
      onSelectSize(size);
    }
    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('meshop_user_blouse_size', size);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-brand-base border border-brand-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-brand-charcoal hover:text-brand-gold transition-colors"
          aria-label="Close Size Assistant"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-brand-border">
          <Ruler className="w-6 h-6 text-brand-gold" />
          <div>
            <h2 className="font-serif text-xl tracking-wider text-brand-charcoal uppercase font-semibold">
              Blouse Size Assistant
            </h2>
            <p className="text-xs text-brand-muted">
              Input your body measurements for personalized blouse fitting guidance.
            </p>
          </div>
        </div>

        {/* Form Inputs & Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Inputs Column */}
          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Unit Toggle */}
            <div className="flex items-center justify-between bg-brand-surface p-1 border border-brand-border rounded-none">
              <span className="text-xs text-brand-muted px-3">Unit System:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setUnit('inch')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    unit === 'inch' ? 'bg-brand-charcoal text-brand-base' : 'text-brand-charcoal hover:bg-brand-border'
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    unit === 'cm' ? 'bg-brand-charcoal text-brand-base' : 'text-brand-charcoal hover:bg-brand-border'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Bust Input */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                Full Bust Circumference ({unit}):
              </label>
              <input
                type="number"
                min={unit === 'inch' ? 28 : 70}
                max={unit === 'inch' ? 56 : 142}
                step="0.5"
                value={bust}
                onChange={(e) => setBust(parseFloat(e.target.value) || 36)}
                className="w-full bg-brand-surface border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold"
                required
              />
            </div>

            {/* Waist Input */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                Natural Waist Circumference ({unit}):
              </label>
              <input
                type="number"
                min={unit === 'inch' ? 22 : 55}
                max={unit === 'inch' ? 50 : 127}
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(parseFloat(e.target.value) || 30)}
                className="w-full bg-brand-surface border border-brand-border px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold"
                required
              />
            </div>

            {/* Fit Preference */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                Preferred Fit:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['snug', 'regular', 'relaxed'] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setPreferredFit(fit)}
                    className={`py-2 text-xs font-medium uppercase tracking-wider border capitalize transition-colors ${
                      preferredFit === fit
                        ? 'border-brand-gold bg-brand-gold/15 text-brand-charcoal font-semibold'
                        : 'border-brand-border bg-brand-surface text-brand-muted hover:border-brand-charcoal'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-charcoal text-brand-base hover:bg-brand-gold hover:text-brand-charcoal py-3 px-4 text-xs font-semibold uppercase tracking-widest transition-colors shadow-md"
            >
              Calculate Recommended Size
            </button>
          </form>

          {/* Result Column */}
          <div className="bg-brand-surface p-5 border border-brand-border/60 flex flex-col justify-between">
            {recommendation ? (
              <div>
                <span className="text-[10px] tracking-widest uppercase text-brand-gold font-semibold block">
                  Match Result
                </span>
                <div className="mt-2 flex items-baseline space-x-3">
                  <span className="font-serif text-4xl font-bold text-brand-charcoal">
                    {recommendation.recommendedSize}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-brand-gold/20 text-brand-charcoal font-medium border border-brand-gold/40">
                    Confidence: {recommendation.confidence}
                  </span>
                </div>
                <p className="text-xs text-brand-muted mt-3 leading-relaxed">
                  {recommendation.note}
                </p>

                <div className="mt-6 pt-4 border-t border-brand-border/60">
                  <button
                    onClick={() => handleApplySize(recommendation.recommendedSize)}
                    className="w-full bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover py-3 px-4 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Select Size {recommendation.recommendedSize}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center my-auto py-8">
                <Ruler className="w-10 h-10 text-brand-gold/60 mx-auto mb-2" />
                <p className="font-serif text-sm text-brand-charcoal font-medium">
                  Enter measurements to calculate match.
                </p>
                <p className="text-xs text-brand-muted mt-1">
                  Our algorithm cross-checks bust and waist ranges against traditional handloom tailoring standards.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Reference Size Chart Table */}
        <div className="mt-8 pt-6 border-t border-brand-border">
          <h3 className="font-serif text-sm font-semibold text-brand-charcoal uppercase tracking-wider mb-3">
            Garment Measurement Reference Chart (XS – 3XL)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-surface border-b border-brand-border text-brand-charcoal uppercase font-semibold">
                  <th className="p-2">Size</th>
                  <th className="p-2">Bust Range (in)</th>
                  <th className="p-2">Waist Range (in)</th>
                  <th className="p-2">Shoulder (in)</th>
                  <th className="p-2">Ready Garment Bust</th>
                  <th className="p-2">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {BLOUSE_SIZE_CHART.map((entry) => (
                  <tr
                    key={entry.size}
                    className={`hover:bg-brand-surface/60 transition-colors ${
                      currentSize === entry.size ? 'bg-brand-gold/10 font-semibold' : ''
                    }`}
                  >
                    <td className="p-2 font-bold text-brand-charcoal">{entry.size}</td>
                    <td className="p-2 text-brand-muted">
                      {entry.bustRangeInches[0]}" - {entry.bustRangeInches[1]}"
                    </td>
                    <td className="p-2 text-brand-muted">
                      {entry.waistRangeInches[0]}" - {entry.waistRangeInches[1]}"
                    </td>
                    <td className="p-2 text-brand-muted">{entry.shoulderInches}"</td>
                    <td className="p-2 text-brand-muted">{entry.readyGarmentBustInches}"</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleApplySize(entry.size)}
                        className="text-[11px] uppercase tracking-wider text-brand-gold hover:underline font-semibold"
                      >
                        Choose
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-brand-muted mt-2 italic">
            * All unstitched and stitched blouses come with 2-inch side margin seams for easy home alteration.
          </p>
        </div>
      </div>
    </div>
  );
};
