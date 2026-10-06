import { Product, FilterState } from '@/types';
import {
  PRICE_RANGES,
  RATING_OPTIONS,
  AVAILABILITY_OPTIONS,
  SORT_OPTIONS,
  COLOR_HEX_MAP,
} from '@/config/catalogueTaxonomy';

export interface DynamicFilterOptions {
  sareeTypes: { name: string; count: number }[];
  fabrics: { name: string; count: number }[];
  occasions: { name: string; count: number }[];
  patterns: { name: string; count: number }[];
  works: { name: string; count: number }[];
  borders: { name: string; count: number }[];
  blouseTypes: { name: string; count: number }[];
  blouseFabrics: { name: string; count: number }[];
  loomTypes: { name: string; count: number }[];
  colours: { name: string; count: number; hex?: string }[];
  colourFamilies: { name: string; count: number }[];
  priceRanges: { label: string; count: number; min: number; max: number }[];
  ratings: { label: string; count: number; minRating: number }[];
  availability: { label: string; count: number; value: string }[];
  hasSalesData: boolean;
  hasRatingsData: boolean;
}

/**
 * Derives ONLY populated filter options from active product catalogue.
 * Automatically hides 0-product options and calculates exact live product counts.
 */
export function getDynamicFilterOptions(products: Product[]): DynamicFilterOptions {
  const sareeTypeCounts = new Map<string, number>();
  const fabricCounts = new Map<string, number>();
  const occasionCounts = new Map<string, number>();
  const patternCounts = new Map<string, number>();
  const workCounts = new Map<string, number>();
  const borderCounts = new Map<string, number>();
  const blouseTypeCounts = new Map<string, number>();
  const blouseFabricCounts = new Map<string, number>();
  const loomTypeCounts = new Map<string, number>();
  const colourCounts = new Map<string, number>();
  const colourFamilyCounts = new Map<string, number>();
  const stockCounts = { in_stock: 0, low_stock: 0, out_of_stock: 0 };

  let hasRealSalesData = false;
  let hasRealRatingsData = false;

  products.forEach((prod) => {
    // Saree Type
    if (prod.sareeType || prod.subcategory) {
      const st = prod.sareeType || prod.subcategory!;
      sareeTypeCounts.set(st, (sareeTypeCounts.get(st) || 0) + 1);
    }

    // Fabric
    if (prod.fabric || prod.displayFabric) {
      const fab = prod.displayFabric || prod.fabric;
      fabricCounts.set(fab, (fabricCounts.get(fab) || 0) + 1);
    }

    // Occasion
    if (prod.occasion) {
      const occs = Array.isArray(prod.occasion) ? prod.occasion : [prod.occasion];
      occs.forEach((o) => {
        if (o) occasionCounts.set(o, (occasionCounts.get(o) || 0) + 1);
      });
    }

    // Pattern
    if (prod.pattern) {
      patternCounts.set(prod.pattern, (patternCounts.get(prod.pattern) || 0) + 1);
    }

    // Work / Embellishment
    if (prod.work || prod.workType) {
      const works = Array.isArray(prod.work) ? prod.work : [prod.work || prod.workType!];
      works.forEach((w) => {
        if (w) workCounts.set(w, (workCounts.get(w) || 0) + 1);
      });
    }

    // Border
    if (prod.border) {
      borderCounts.set(prod.border, (borderCounts.get(prod.border) || 0) + 1);
    }

    // Blouse Type
    if (prod.blouseType) {
      blouseTypeCounts.set(prod.blouseType, (blouseTypeCounts.get(prod.blouseType) || 0) + 1);
    }

    // Blouse Fabric
    if (prod.blouseFabric) {
      blouseFabricCounts.set(prod.blouseFabric, (blouseFabricCounts.get(prod.blouseFabric) || 0) + 1);
    }

    // Loom Type
    if (prod.loomType) {
      loomTypeCounts.set(prod.loomType, (loomTypeCounts.get(prod.loomType) || 0) + 1);
    }

    // Color & Color Family
    if (prod.colour) {
      colourCounts.set(prod.colour, (colourCounts.get(prod.colour) || 0) + 1);
    }
    if (prod.colourFamily) {
      colourFamilyCounts.set(prod.colourFamily, (colourFamilyCounts.get(prod.colourFamily) || 0) + 1);
    }

    // Stock
    const status = prod.stockStatus || (prod.stockQty > 5 ? 'in_stock' : prod.stockQty > 0 ? 'low_stock' : 'out_of_stock');
    if (status === 'in_stock') stockCounts.in_stock++;
    else if (status === 'low_stock') stockCounts.low_stock++;
    else stockCounts.out_of_stock++;

    // Ratings check
    if (prod.rating && prod.rating > 0 && prod.reviewCount && prod.reviewCount > 0) {
      hasRealRatingsData = true;
    }

    // Sales check
    if (prod.bestseller || (prod.sortOrder && prod.sortOrder > 0)) {
      hasRealSalesData = true;
    }
  });

  const toSortedCountArray = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  // Price Ranges
  const priceRanges = PRICE_RANGES.map((pr) => {
    const count = products.filter((p) => p.price >= pr.min && p.price <= pr.max).length;
    return { label: pr.label, min: pr.min, max: pr.max, count };
  }).filter((pr) => pr.count > 0);

  // Ratings
  const ratings = RATING_OPTIONS.map((ro) => {
    const count = products.filter((p) => p.rating >= ro.minRating).length;
    return { label: ro.label, minRating: ro.minRating, count };
  }).filter((ro) => ro.count > 0);

  // Colours with Hex
  const colours = toSortedCountArray(colourCounts).map((c) => ({
    ...c,
    hex: COLOR_HEX_MAP[c.name] || COLOR_HEX_MAP['Multicolor'],
  }));

  // Availability
  const availability = AVAILABILITY_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value,
    count: stockCounts[opt.value as keyof typeof stockCounts] || 0,
  })).filter((opt) => opt.count > 0);

  return {
    sareeTypes: toSortedCountArray(sareeTypeCounts),
    fabrics: toSortedCountArray(fabricCounts),
    occasions: toSortedCountArray(occasionCounts),
    patterns: toSortedCountArray(patternCounts),
    works: toSortedCountArray(workCounts),
    borders: toSortedCountArray(borderCounts),
    blouseTypes: toSortedCountArray(blouseTypeCounts),
    blouseFabrics: toSortedCountArray(blouseFabricCounts),
    loomTypes: toSortedCountArray(loomTypeCounts),
    colours,
    colourFamilies: toSortedCountArray(colourFamilyCounts),
    priceRanges,
    ratings,
    availability,
    hasSalesData: hasRealSalesData,
    hasRatingsData: hasRealRatingsData,
  };
}

/**
 * Filter matching engine
 */
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = product.name?.toLowerCase().includes(q);
      const matchFabric = product.fabric?.toLowerCase().includes(q) || product.displayFabric?.toLowerCase().includes(q);
      const matchCategory = product.category?.toLowerCase().includes(q) || product.subcategory?.toLowerCase().includes(q) || product.sareeType?.toLowerCase().includes(q);
      const matchPattern = product.pattern?.toLowerCase().includes(q);
      const matchColour = product.colour?.toLowerCase().includes(q) || product.colourFamily?.toLowerCase().includes(q);
      const matchTags = Array.isArray(product.tags) && product.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchName && !matchFabric && !matchCategory && !matchPattern && !matchColour && !matchTags) {
        return false;
      }
    }

    // Category
    if (filters.category && filters.category !== 'all' && filters.category !== 'Sarees') {
      const cat = filters.category.toLowerCase();
      const prodCat = (product.category || '').toLowerCase();
      const prodSubcat = (product.subcategory || '').toLowerCase();
      const prodSareeType = (product.sareeType || '').toLowerCase();
      if (!prodCat.includes(cat) && !prodSubcat.includes(cat) && !prodSareeType.includes(cat)) {
        return false;
      }
    }

    // Saree Types
    if (filters.sareeTypes && filters.sareeTypes.length > 0) {
      const prodType = (product.sareeType || product.subcategory || '').toLowerCase();
      if (!filters.sareeTypes.some((t) => prodType.includes(t.toLowerCase()))) {
        return false;
      }
    }

    // Fabrics
    if (filters.fabrics && filters.fabrics.length > 0) {
      const prodFab = (product.displayFabric || product.fabric || '').toLowerCase();
      if (!filters.fabrics.some((f) => prodFab.includes(f.toLowerCase()))) {
        return false;
      }
    }

    // Colours
    if (filters.colours && filters.colours.length > 0) {
      const prodCol = (product.colour || '').toLowerCase();
      const prodFam = (product.colourFamily || '').toLowerCase();
      if (!filters.colours.some((c) => prodCol.includes(c.toLowerCase()) || prodFam.includes(c.toLowerCase()))) {
        return false;
      }
    }

    // Occasions
    if (filters.occasions && filters.occasions.length > 0) {
      const prodOccs = Array.isArray(product.occasion) ? product.occasion.map((o) => o.toLowerCase()) : [(product.occasion || '').toLowerCase()];
      if (!filters.occasions.some((o) => prodOccs.some((po) => po.includes(o.toLowerCase())))) {
        return false;
      }
    }

    // Patterns
    if (filters.patterns && filters.patterns.length > 0) {
      const prodPat = (product.pattern || '').toLowerCase();
      if (!filters.patterns.some((p) => prodPat.includes(p.toLowerCase()))) {
        return false;
      }
    }

    // Work / Embellishment
    if (filters.works && filters.works.length > 0) {
      const prodWorks = Array.isArray(product.work) ? product.work.map((w) => w.toLowerCase()) : [(product.work || product.workType || '').toLowerCase()];
      if (!filters.works.some((w) => prodWorks.some((pw) => pw.includes(w.toLowerCase())))) {
        return false;
      }
    }

    // Borders
    if (filters.borders && filters.borders.length > 0) {
      const prodBorder = (product.border || '').toLowerCase();
      if (!filters.borders.some((b) => prodBorder.includes(b.toLowerCase()))) {
        return false;
      }
    }

    // Blouse Types
    if (filters.blouseTypes && filters.blouseTypes.length > 0) {
      const prodBt = (product.blouseType || '').toLowerCase();
      if (!filters.blouseTypes.some((bt) => prodBt.includes(bt.toLowerCase()))) {
        return false;
      }
    }

    // Price range
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }

    // Min Rating
    if (filters.minRating && product.rating < filters.minRating) {
      return false;
    }

    // Availability
    if (filters.inStockOnly && product.stockQty <= 0) {
      return false;
    }

    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'in_stock' && product.stockQty <= 0) return false;
      if (filters.availability === 'low_stock' && (product.stockQty <= 0 || product.stockQty > 5)) return false;
      if (filters.availability === 'out_of_stock' && product.stockQty > 0) return false;
    }

    // Featured / Bestseller / New Arrival
    if (filters.featuredOnly && !product.featured) return false;
    if (filters.bestsellersOnly && !product.bestseller) return false;
    if (filters.newArrivalsOnly && !product.newArrival) return false;

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      case 'price_low_high':
        return a.price - b.price;
      case 'price_high_low':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      case 'bestseller':
        return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      case 'recommended':
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });
}
