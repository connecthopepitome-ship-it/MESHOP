import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscountPercentage(price: number, compareAtPrice?: number): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Normalizes image URLs, automatically converting Google Drive view links
 * (e.g. drive.google.com/file/d/ID/view) into high-res direct image URLs.
 */
export function formatImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();

  // Match Google Drive file ID from /file/d/FILE_ID or /d/FILE_ID
  const driveFileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=s1600`;
  }

  // Match Google Drive id query param ?id=FILE_ID
  const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=s1600`;
  }

  return url;
}

/**
 * Requirement 14: Smart Category Logic
 * Active Products -> Count Values -> Remove Empty -> Minimum Threshold -> Priority -> Display
 */
export function getDynamicCategories(products: Product[], minCount = 1): Array<{ name: string; count: number; slug: string }> {
  const activeProducts = products.filter((p) => p.published && (p.status === undefined || p.status === 'Active' || p.status === 'Out of Stock'));
  const counts: Record<string, number> = {};

  activeProducts.forEach((p) => {
    if (p.category) {
      const cat = p.category.trim();
      counts[cat] = (counts[cat] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .filter(([_, count]) => count >= minCount)
    .map(([name, count]) => ({
      name,
      count,
      slug: slugify(name),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getDynamicFilterOptions(products: Product[]) {
  const activeProducts = products.filter((p) => p.published && (p.status === undefined || p.status === 'Active' || p.status === 'Out of Stock'));
  
  const fabrics = new Set<string>();
  const colours = new Set<string>();
  const occasions = new Set<string>();
  const styles = new Set<string>();
  const works = new Set<string>();
  const collections = new Set<string>();

  activeProducts.forEach((p) => {
    if (p.fabric) fabrics.add(p.fabric.trim());
    if (p.colour) colours.add(p.colour.trim());

    if (p.occasion) {
      if (Array.isArray(p.occasion)) p.occasion.forEach((o) => occasions.add(o.trim()));
      else occasions.add(p.occasion.trim());
    }

    if (p.style) {
      if (Array.isArray(p.style)) p.style.forEach((s) => styles.add(s.trim()));
      else styles.add(p.style.trim());
    }

    if (p.work) {
      if (Array.isArray(p.work)) p.work.forEach((w) => works.add(w.trim()));
      else works.add(p.work.trim());
    } else if (p.workType) {
      works.add(p.workType.trim());
    }

    if (p.collection) {
      if (Array.isArray(p.collection)) p.collection.forEach((c) => collections.add(c.trim()));
      else collections.add(p.collection.trim());
    }
  });

  return {
    fabrics: Array.from(fabrics).sort(),
    colours: Array.from(colours).sort(),
    occasions: Array.from(occasions).sort(),
    styles: Array.from(styles).sort(),
    works: Array.from(works).sort(),
    collections: Array.from(collections).sort(),
  };
}

/**
 * Requirement 20: Normalized Search with Aliases
 */
const SEARCH_ALIASES: Record<string, string[]> = {
  pink: ['pink', 'blush', 'rose', 'magenta', 'peach'],
  red: ['red', 'crimson', 'scarlet', 'vermillion', 'ruby'],
  green: ['green', 'emerald', 'olive', 'mint', 'sage'],
  blue: ['blue', 'indigo', 'royal blue', 'navy', 'sky'],
  party: ['party', 'festive', 'evening', 'cocktail', 'celebration'],
  wedding: ['wedding', 'bridal', 'trousseau', 'marriage', 'reception'],
  everyday: ['everyday', 'casual', 'daily', 'office', 'workwear'],
};

export function normalizedSearchMatches(product: Product, query: string): boolean {
  if (!query || !query.trim()) return true;

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);

  const searchableText = [
    product.name,
    product.category,
    product.subcategory,
    product.fabric,
    product.colour,
    product.colourFamily,
    Array.isArray(product.occasion) ? product.occasion.join(' ') : product.occasion,
    Array.isArray(product.style) ? product.style.join(' ') : product.style,
    Array.isArray(product.work) ? product.work.join(' ') : product.work,
    product.workType,
    product.tags.join(' '),
    product.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => {
    if (searchableText.includes(token)) return true;

    // Check alias expansion
    for (const [aliasGroup, synonyms] of Object.entries(SEARCH_ALIASES)) {
      if (token === aliasGroup || synonyms.includes(token)) {
        if (synonyms.some((syn) => searchableText.includes(syn))) {
          return true;
        }
      }
    }

    return false;
  });
}

