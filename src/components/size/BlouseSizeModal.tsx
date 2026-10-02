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
  const [underbust, setUnderbust] = useState<number>(32);
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('meshop_user_blouse_size', size);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface-bright fine-gold-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative rounded-xs text-secondary">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-secondary hover:text-primary transition-colors"
          aria-label="Close Blouse Size Guide"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-outline-variant/60">
          <Ruler className="w-6 h-6 text-primary-container" />
          <div>
            <h2 className="font-serif-display text-xl tracking-wider text-secondary uppercase font-semibold">
              BLOUSE SIZE GUIDE
            </h2>
            <p className="font-sans-body text-xs text-on-surface-variant font-light">
              Tailoring reference guide for stitched blouses and unstitched blouse piece tailoring.
            </p>
          </div>
        </div>

        {/* Free-size Unstitched Blouse Banner */}
        <div className="mt-4 p-3 bg-surface-container border border-outline-variant/50 rounded-xs text-xs font-sans-body text-on-surface-variant flex items-start gap-2">
          <span className="text-primary-container text-sm">✦</span>
          <div>
            <strong className="text-secondary font-sans-fashion uppercase block tracking-wider">Unstitched Blouse Piece Included — Fits All Sizes</strong>
            <p className="font-light mt-0.5">Sarees include a matching 0.8m–0.9m unstitched fabric piece. Selecting a size below is optional and serves as a custom stitching reference.</p>
          </div>
        </div>

        {/* Form Inputs & Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Inputs Column */}
          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Unit Toggle */}
            <div className="flex items-center justify-between bg-surface p-1 border border-outline-variant/60 rounded-xs">
              <span className="text-xs font-sans-fashion text-outline px-3 uppercase tracking-wider">Unit:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setUnit('inch')}
                  className={`px-3 py-1 text-xs font-sans-fashion uppercase tracking-wider transition-colors ${
                    unit === 'inch' ? 'bg-secondary text-white' : 'text-secondary hover:bg-surface-container'
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 text-xs font-sans-fashion uppercase tracking-wider transition-colors ${
                    unit === 'cm' ? 'bg-secondary text-white' : 'text-secondary hover:bg-surface-container'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Bust Input */}
            <div>
              <label className="block text-xs font-sans-fashion font-semibold text-secondary uppercase tracking-wider mb-1">
                Full Bust Circumference ({unit}):
              </label>
              <input
                type="number"
                min={unit === 'inch' ? 28 : 70}
                max={unit === 'inch' ? 56 : 142}
                step="0.5"
                value={bust}
                onChange={(e) => setBust(parseFloat(e.target.value) || 36)}
                className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm font-sans-body text-secondary focus:outline-none focus:border-primary-container"
                required
              />
            </div>

            {/* Underbust Input */}
            <div>
              <label className="block text-xs font-sans-fashion font-semibold text-secondary uppercase tracking-wider mb-1">
                Underbust ({unit}):
              </label>
              <input
                type="number"
                min={unit === 'inch' ? 24 : 60}
                max={unit === 'inch' ? 52 : 130}
                step="0.5"
                value={underbust}
                onChange={(e) => setUnderbust(parseFloat(e.target.value) || 32)}
                className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm font-sans-body text-secondary focus:outline-none focus:border-primary-container"
              />
            </div>

            {/* Waist Input */}
            <div>
              <label className="block text-xs font-sans-fashion font-semibold text-secondary uppercase tracking-wider mb-1">
                Waist ({unit}):
              </label>
              <input
                type="number"
                min={unit === 'inch' ? 22 : 55}
                max={unit === 'inch' ? 50 : 127}
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(parseFloat(e.target.value) || 30)}
                className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm font-sans-body text-secondary focus:outline-none focus:border-primary-container"
                required
              />
            </div>

            {/* Fit Preference */}
            <div>
              <label className="block text-xs font-sans-fashion font-semibold text-secondary uppercase tracking-wider mb-1">
                Preferred Fit:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['snug', 'regular', 'relaxed'] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setPreferredFit(fit)}
                    className={`py-2 text-xs font-sans-fashion uppercase tracking-wider border capitalize transition-colors ${
                      preferredFit === fit
                        ? 'border-primary-container bg-primary-container/10 text-secondary font-semibold'
                        : 'border-outline-variant/60 bg-surface text-outline hover:border-secondary'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-secondary text-white hover:bg-primary py-3 px-4 text-xs font-sans-fashion font-semibold uppercase tracking-widest transition-colors rounded-full shadow-md"
            >
              CALCULATE RECOMMENDED SIZE
            </button>
          </form>

          {/* Result Column */}
          <div className="bg-surface p-5 border border-outline-variant/60 flex flex-col justify-between rounded-xs">
            {recommendation ? (
              <div>
                <span className="text-[10px] font-sans-fashion tracking-widest uppercase text-primary-container font-semibold block">
                  RECOMMENDED SIZE
                </span>
                <div className="mt-2 flex items-baseline space-x-3">
                  <span className="font-serif-display text-4xl font-bold text-secondary">
                    {recommendation.recommendedSize}
                  </span>
                  <span className="text-xs font-sans-fashion px-2.5 py-0.5 bg-primary-container/15 text-primary-container font-medium border border-primary-container/30 rounded-full">
                    Match: {recommendation.confidence}
                  </span>
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant mt-3 leading-relaxed font-light">
                  {recommendation.note}
                </p>

                <div className="mt-6 pt-4 border-t border-outline-variant/50">
                  <button
                    onClick={() => handleApplySize(recommendation.recommendedSize)}
                    className="w-full bg-primary-container text-white hover:bg-primary py-3 px-4 text-xs font-sans-fashion font-semibold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 rounded-full shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Select Size {recommendation.recommendedSize}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center my-auto py-8">
                <Ruler className="w-10 h-10 text-primary-container/60 mx-auto mb-2" />
                <p className="font-serif-display text-base text-secondary font-medium">
                  Enter measurements to calculate match.
                </p>
                <p className="font-sans-body text-xs text-on-surface-variant mt-1 font-light leading-relaxed">
                  Cross-checks bust and waist ranges against traditional handloom tailoring standards.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reference Size Chart Table */}
        <div className="mt-8 pt-6 border-t border-outline-variant/60">
          <h3 className="font-serif-display text-base font-semibold text-secondary uppercase tracking-wider mb-3">
            GARMENT MEASUREMENT REFERENCE CHART (XS – XXL)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans-body">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-secondary font-sans-fashion uppercase font-semibold">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Bust Range (in)</th>
                  <th className="p-2.5">Waist Range (in)</th>
                  <th className="p-2.5">Shoulder (in)</th>
                  <th className="p-2.5">Ready Bust</th>
                  <th className="p-2.5">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {BLOUSE_SIZE_CHART.map((entry) => (
                  <tr
                    key={entry.size}
                    className={`hover:bg-surface-container/60 transition-colors ${
                      currentSize === entry.size ? 'bg-primary-container/10 font-semibold' : ''
                    }`}
                  >
                    <td className="p-2.5 font-bold text-secondary font-sans-fashion">{entry.size}</td>
                    <td className="p-2.5 text-on-surface-variant font-light">
                      {entry.bustRangeInches[0]}" - {entry.bustRangeInches[1]}"
                    </td>
                    <td className="p-2.5 text-on-surface-variant font-light">
                      {entry.waistRangeInches[0]}" - {entry.waistRangeInches[1]}"
                    </td>
                    <td className="p-2.5 text-on-surface-variant font-light">{entry.shoulderInches}"</td>
                    <td className="p-2.5 text-on-surface-variant font-light">{entry.readyGarmentBustInches}"</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => handleApplySize(entry.size)}
                        className="text-[11px] font-sans-fashion uppercase tracking-wider text-primary-container hover:underline font-semibold"
                      >
                        Choose
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-sans-body text-outline mt-3 italic font-light">
            * Note: Measurements are provided as standard tailoring reference. We do not claim guaranteed fit as handloom fabrics drape uniquely. Unstitched blouse pieces include side margin seams for easy alteration.
          </p>
        </div>
      </div>
    </div>
  );
};

