import { SizeRecommendationInput } from '@/types';

export interface SizeChartEntry {
  size: string; // e.g. "XS", "S", "M", "L", "XL", "2XL", "3XL"
  bustRangeInches: [number, number]; // [min, max]
  waistRangeInches: [number, number];
  shoulderInches: number;
  sleeveLengthInches: number;
  readyGarmentBustInches: number;
}

export const BLOUSE_SIZE_CHART: SizeChartEntry[] = [
  { size: 'XS', bustRangeInches: [30, 32], waistRangeInches: [24, 26], shoulderInches: 13.5, sleeveLengthInches: 10, readyGarmentBustInches: 34 },
  { size: 'S',  bustRangeInches: [33, 34], waistRangeInches: [27, 28], shoulderInches: 14.0, sleeveLengthInches: 10.5, readyGarmentBustInches: 36 },
  { size: 'M',  bustRangeInches: [35, 36], waistRangeInches: [29, 30], shoulderInches: 14.5, sleeveLengthInches: 11, readyGarmentBustInches: 38 },
  { size: 'L',  bustRangeInches: [37, 38], waistRangeInches: [31, 32], shoulderInches: 15.0, sleeveLengthInches: 11.5, readyGarmentBustInches: 40 },
  { size: 'XL', bustRangeInches: [39, 41], waistRangeInches: [33, 35], shoulderInches: 15.5, sleeveLengthInches: 12, readyGarmentBustInches: 43 },
  { size: '2XL', bustRangeInches: [42, 44], waistRangeInches: [36, 38], shoulderInches: 16.0, sleeveLengthInches: 12.5, readyGarmentBustInches: 46 },
  { size: '3XL', bustRangeInches: [45, 48], waistRangeInches: [39, 42], shoulderInches: 16.5, sleeveLengthInches: 13, readyGarmentBustInches: 50 },
];

export interface SizeRecommendationResult {
  recommendedSize: string;
  confidence: 'High' | 'Moderate' | 'Borderline';
  note: string;
  closestBustMatch: string;
  closestWaistMatch: string;
}

export function recommendBlouseSize(input: SizeRecommendationInput): SizeRecommendationResult {
  // Normalize cm to inches if unit is cm
  const bustInches = input.unit === 'cm' ? input.bustInches / 2.54 : input.bustInches;
  const waistInches = input.unit === 'cm' ? input.waistInches / 2.54 : input.waistInches;

  // Fit adjustment delta
  let targetBust = bustInches;
  if (input.preferredFit === 'snug') targetBust -= 0.5;
  if (input.preferredFit === 'relaxed') targetBust += 1.0;

  // Find size by target bust
  let matchedEntry = BLOUSE_SIZE_CHART.find(
    (e) => targetBust >= e.bustRangeInches[0] && targetBust <= e.bustRangeInches[1]
  );

  // Fallback for smaller/larger
  if (!matchedEntry) {
    if (targetBust < BLOUSE_SIZE_CHART[0].bustRangeInches[0]) {
      matchedEntry = BLOUSE_SIZE_CHART[0];
    } else {
      matchedEntry = BLOUSE_SIZE_CHART[BLOUSE_SIZE_CHART.length - 1];
    }
  }

  // Find waist match entry
  const waistEntry = BLOUSE_SIZE_CHART.find(
    (e) => waistInches >= e.waistRangeInches[0] && waistInches <= e.waistRangeInches[1]
  );

  const waistMatchSize = waistEntry ? waistEntry.size : matchedEntry.size;
  const confidence = matchedEntry.size === waistMatchSize ? 'High' : 'Moderate';

  let note = `Recommended size ${matchedEntry.size} based on a bust measurement of ${bustInches.toFixed(1)} inches with ${input.preferredFit} fit preference.`;
  if (confidence === 'Moderate') {
    note += ` Note: Your waist measurement suggests size ${waistMatchSize}. We recommend checking the detailed garment chart for alteration margins.`;
  }

  return {
    recommendedSize: matchedEntry.size,
    confidence,
    note,
    closestBustMatch: matchedEntry.size,
    closestWaistMatch: waistMatchSize,
  };
}
