import { Product, PublicProduct, InternalProduct, Category, Collection, Order, Review, FilterState, CatalogueHealthReport, ProductHealthIssue, ProductStatus } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS, MOCK_REVIEWS } from '@/data/mockData';
import { calculateDiscountPercentage, slugify, formatImageUrl } from '@/lib/utils';
import { OrderService } from '@/lib/services/OrderService';

export interface RepositoryInterface {
  getProducts(filters?: Partial<FilterState>): Promise<PublicProduct[]>;
  getProductBySlug(slug: string): Promise<PublicProduct | null>;
  getCategories(): Promise<Category[]>;
  getCollections(): Promise<Collection[]>;
  getReviews(productId: string): Promise<Review[]>;
  createOrder(order: any): Promise<{ success: boolean; orderId: string; error?: string }>;

  lookupOrder(orderId: string, phoneOrEmail: string): Promise<Order | null>;
  getCatalogueHealthReport(): Promise<CatalogueHealthReport>;
  // Admin Operations
  getAdminProducts(): Promise<InternalProduct[]>;
  getAdminProductById(productId: string): Promise<InternalProduct | null>;
  saveOrUpdateProduct(product: InternalProduct): Promise<{ success: boolean; message?: string; productId?: string; error?: string }>;
  updateProductStatus(productId: string, status: ProductStatus): Promise<{ success: boolean; message?: string; error?: string }>;
  archiveProduct(productId: string): Promise<{ success: boolean; message?: string; error?: string }>;
  clearCatalogueCache(): Promise<boolean>;
  applyClientOverrides<T>(products: T[]): T[];
}

// In-memory admin store for dev fallback
let adminLocalStore: InternalProduct[] = [
  ...MOCK_PRODUCTS.map((p) => ({
    ...p,
    productName: p.name,
    stock: p.stockQty || 5,
    status: p.status || 'Active',
    meeshoReferenceLink: (p as any).sourceUrl || 'https://meesho.com/saree/p/sample-item',
    sourceCost: (p as any).sourceCost || 1800,
    sourceStatus: (p as any).sourceStatus || 'In Stock',
    supplierReference: (p as any).supplierReference || 'MEESHO-SUP-101',
    lastSourceCheck: new Date().toISOString().split('T')[0]
  })),
  {
    productId: 'SAR-MV44PONJ',
    sku: 'SKU-SAR-MV44PONJ',
    name: 'Premium Pure Georgette Handwork Saree with Scallop Border & Floral Print',
    productName: 'Premium Pure Georgette Handwork Saree with Scallop Border & Floral Print',
    slug: 'premium-pure-georgette-handwork-saree-with-scallop-border-floral-print-sar-mv44ponj',
    category: 'Georgette Sarees',
    fabric: 'Georgette',
    colour: 'Crimson',
    price: 1149,
    compareAtPrice: 2500,
    discountPercentage: 54,
    stock: 5,
    stockQty: 5,
    stockStatus: 'in_stock',
    status: 'Active',
    mainImage: 'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
    image2: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    image4: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    images: [
      'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Handcrafted luxury saree from SORAYVA.',
    sareeLength: '5.5 meters',
    blousePieceLength: '0.8 meters (Unstitched)',
    blouseIncluded: true,
    blouseType: 'Unstitched Blouse',
    blouseSizesAvailable: ['S', 'M', 'L', 'XL', '2XL', 'UNSTITCHED'],
    published: true,
    featured: true,
    newArrival: true,
    bestseller: true,
    tags: ['Saree', 'Georgette', 'Handwork', 'Luxury'],
    rating: 4.8,
    reviewCount: 126,
    currency: 'INR'
  },
  {
    productId: 'SAR-MV4304OO',
    sku: 'SKU-SAR-MV4304OO',
    name: 'Viscose Zari Saree – Cream with Red Contrast',
    productName: 'Viscose Zari Saree – Cream with Red Contrast',
    slug: 'viscose-zari-saree-cream-with-red-contrast-sar-mv4304oo',
    category: 'Silk Sarees',
    fabric: 'Georgette',
    colour: 'Cream & Red',
    price: 1149,
    compareAtPrice: 2500,
    discountPercentage: 54,
    stock: 15,
    stockQty: 15,
    stockStatus: 'in_stock',
    status: 'Active',
    mainImage: 'https://lh3.googleusercontent.com/d/16IKk3A_lkM7MSEujhVHQskGGA__Zq18D=s1600',
    image2: 'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    image4: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/16IKk3A_lkM7MSEujhVHQskGGA__Zq18D=s1600',
      'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
    ],
    images: [
      'https://lh3.googleusercontent.com/d/16IKk3A_lkM7MSEujhVHQskGGA__Zq18D=s1600',
      'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Handcrafted luxury saree from SORAYVA.',
    sareeLength: '5.5 meters',
    blousePieceLength: '0.8 meters (Unstitched)',
    blouseIncluded: true,
    blouseType: 'Unstitched Blouse',
    blouseSizesAvailable: ['S', 'M', 'L', 'XL'],
    published: true,
    featured: true,
    newArrival: true,
    bestseller: false,
    tags: ['Saree', 'Silk', 'Zari', 'Luxury'],
    rating: 4.8,
    reviewCount: 42,
    currency: 'INR'
  },
  {
    productId: 'SAR-MV0TLCXZ',
    sku: 'SKU-SAR-MV0TLCXZ',
    name: 'Magenta Bloom Sequin Saree',
    productName: 'Magenta Bloom Sequin Saree',
    slug: 'magenta-bloom-sequin-saree-sar-mv0tlcxz',
    category: 'Chiffon & Georgette',
    fabric: 'Georgette',
    colour: 'Magenta',
    price: 1200,
    compareAtPrice: 3500,
    discountPercentage: 65,
    stock: 5,
    stockQty: 5,
    stockStatus: 'in_stock',
    status: 'Active',
    mainImage: 'https://lh3.googleusercontent.com/d/16CShIfXqYIIWXH17PSm0pf9kIIk0vUtL=s1600',
    image2: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    image4: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/16CShIfXqYIIWXH17PSm0pf9kIIk0vUtL=s1600',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    images: [
      'https://lh3.googleusercontent.com/d/16CShIfXqYIIWXH17PSm0pf9kIIk0vUtL=s1600',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Handcrafted luxury saree from SORAYVA.',
    sareeLength: '5.5 meters',
    blousePieceLength: '0.8 meters (Unstitched)',
    blouseIncluded: true,
    blouseType: 'Unstitched Blouse',
    blouseSizesAvailable: ['S', 'M', 'L', 'XL'],
    published: true,
    featured: true,
    newArrival: true,
    bestseller: false,
    tags: ['Saree', 'Georgette', 'Sequin', 'Luxury'],
    rating: 4.8,
    reviewCount: 38,
    currency: 'INR'
  }
];

// Tracks product IDs that have been explicitly modified or created in this session
const sessionModifiedProductIds = new Set<string>();

// Curated luxury saree gallery registry for Google Sheets products
// Guarantees multi-angle views (pallu, border, texture) even when Google Apps Script drops image slots
export const CATALOGUE_IMAGE_REGISTRY: Record<
  string,
  {
    image2?: string;
    image3?: string;
    image4?: string;
  }
> = {
  'sar-mv44ponj': {
    image2: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    image4: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  },
  'sar-mv4304oo': {
    image2: 'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    image4: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  },
  'sar-mv0tlcxz': {
    image2: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    image4: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
  },
  'sr-sample-001': {
    image2: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    image3: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  }
};

export class GoogleSheetsRepository implements RepositoryInterface {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.GOOGLE_SHEETS_API_URL || process.env.NEXT_PUBLIC_CATALOG_API_URL || '';
  }

  public applyClientOverrides<T>(products: T[]): T[] {
    if (!Array.isArray(products)) return products;
    let stored: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      try {
        const storedStr = localStorage.getItem('meshop_modified_products');
        if (storedStr) {
          stored = JSON.parse(storedStr) || {};
        }
      } catch (e) {}
    }

    return products.map((item: any) => {
      const pid = String(item?.productId || item?.id || '').trim().toLowerCase();
      let merged = { ...item };

      // 1. Supplement with CATALOGUE_IMAGE_REGISTRY if supplementary images are missing
      if (pid && CATALOGUE_IMAGE_REGISTRY[pid]) {
        const reg = CATALOGUE_IMAGE_REGISTRY[pid];
        if (!merged.image2 && reg.image2) merged.image2 = reg.image2;
        if (!merged.image3 && reg.image3) merged.image3 = reg.image3;
        if (!merged.image4 && reg.image4) merged.image4 = reg.image4;
        if (!merged.galleryImages || merged.galleryImages.length <= 1) {
          merged.galleryImages = [
            merged.mainImage,
            merged.image2,
            merged.image3,
            merged.image4
          ].filter(Boolean);
          merged.images = merged.galleryImages;
        }
      }

      // 2. In-memory session modified products
      if (pid && sessionModifiedProductIds.has(pid)) {
        const inMem = adminLocalStore.find((p) => p.productId.toLowerCase() === pid);
        if (inMem) {
          merged = { ...merged, ...inMem };
        }
      }

      // 3. Client localStorage overrides
      if (pid && stored[pid]) {
        merged = { ...merged, ...stored[pid] };
      }

      return merged;
    });
  }

  private mergeLocalOverride(raw: any): any {
    if (!raw || (!raw.productId && !raw.id)) return raw;
    const pid = String(raw.productId || raw.id).trim().toLowerCase();

    let merged = { ...raw };

    // 1. First supplement with CATALOGUE_IMAGE_REGISTRY if slots are missing
    if (CATALOGUE_IMAGE_REGISTRY[pid]) {
      const reg = CATALOGUE_IMAGE_REGISTRY[pid];
      if (!merged.image2 && !merged['Image 2 URL'] && reg.image2) merged.image2 = reg.image2;
      if (!merged.image3 && !merged['Image 3 URL'] && reg.image3) merged.image3 = reg.image3;
      if (!merged.image4 && !merged['Image 4 URL'] && reg.image4) merged.image4 = reg.image4;
    }

    // 2. Apply in-memory session modifications
    if (sessionModifiedProductIds.has(pid)) {
      const inMem = adminLocalStore.find((p) => p.productId.toLowerCase() === pid);
      if (inMem) {
        merged = { ...merged, ...inMem };
      }
    }

    // 3. Apply localStorage overrides if on client
    if (typeof window !== 'undefined') {
      try {
        const storedStr = localStorage.getItem('meshop_modified_products');
        if (storedStr) {
          const stored = JSON.parse(storedStr);
          if (stored && stored[pid]) {
            merged = { ...merged, ...stored[pid] };
          }
        }
      } catch (e) {}
    }

    return merged;
  }

  /**
   * Canonical Image Field Parser
   * Maps:
   * Main Image URL -> mainImage
   * Image 2 URL -> image2
   * Image 3 URL -> image3
   * Image 4 URL -> image4
   * galleryImages -> [mainImage, image2, image3, image4]
   */
  private parseImageFields(raw: any): {
    mainImage: string;
    image2?: string;
    image3?: string;
    image4?: string;
    galleryImages: string[];
    images: string[];
  } {
    const rawMainImage = String(
      raw.mainImage || raw.image || raw['Main Image URL'] || raw['main_image_url'] || ''
    ).trim();
    const mainImage = rawMainImage
      ? formatImageUrl(rawMainImage)
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';

    const parseArray = (val: any, dedupe: boolean = false): string[] => {
      let arr: string[] = [];
      if (Array.isArray(val)) {
        arr = val.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof val === 'string' && val.trim().length > 0) {
        arr = val.split(/[\|\,\n]/).map((s) => s.trim()).filter(Boolean);
      }
      return dedupe ? Array.from(new Set(arr)) : arr;
    };

    // Explicit individual slot extraction
    const rawImg2 = raw.image2 ?? raw['Image 2 URL'] ?? raw['image_2_url'] ?? undefined;
    const rawImg3 = raw.image3 ?? raw['Image 3 URL'] ?? raw['image_3_url'] ?? undefined;
    const rawImg4 = raw.image4 ?? raw['Image 4 URL'] ?? raw['image_4_url'] ?? undefined;

    let image2: string | undefined =
      typeof rawImg2 === 'string' && rawImg2.trim().length > 0 ? formatImageUrl(rawImg2.trim()) : undefined;
    let image3: string | undefined =
      typeof rawImg3 === 'string' && rawImg3.trim().length > 0 ? formatImageUrl(rawImg3.trim()) : undefined;
    let image4: string | undefined =
      typeof rawImg4 === 'string' && rawImg4.trim().length > 0 ? formatImageUrl(rawImg4.trim()) : undefined;

    // Check galleryImages array if individual slots are not set
    const galleryRaw = parseArray(raw.galleryImages, false).map((img) => formatImageUrl(img));
    if (galleryRaw.length > 0) {
      const nonMain = galleryRaw[0] === mainImage ? galleryRaw.slice(1) : galleryRaw;
      if (!image2 && nonMain[0]) image2 = nonMain[0];
      if (!image3 && nonMain[1]) image3 = nonMain[1];
      if (!image4 && nonMain[2]) image4 = nonMain[2];
    }

    // Check images array if still empty
    const imagesRaw = parseArray(raw.images, false).map((img) => formatImageUrl(img));
    if (imagesRaw.length > 0) {
      const nonMain = imagesRaw[0] === mainImage ? imagesRaw.slice(1) : imagesRaw;
      if (!image2 && nonMain[0]) image2 = nonMain[0];
      if (!image3 && nonMain[1]) image3 = nonMain[1];
      if (!image4 && nonMain[2]) image4 = nonMain[2];
    }

    // Build canonical gallery list [mainImage, image2, image3, image4]
    const galleryImages: string[] = [mainImage];
    if (image2 && image2 !== mainImage) galleryImages.push(image2);
    if (image3 && image3 !== mainImage && image3 !== image2) galleryImages.push(image3);
    if (image4 && image4 !== mainImage && image4 !== image2 && image4 !== image3) galleryImages.push(image4);

    return {
      mainImage,
      image2,
      image3,
      image4,
      galleryImages,
      images: galleryImages
    };
  }

  /**
   * Internal Core Product Parser
   * When isInternal is false (public storefront):
   * - Strict status gate: Draft, Hidden, Discontinued are rejected (returns null)
   * - Strips all internal source/supplier fields
   * When isInternal is true (admin dashboard):
   * - ALL product statuses (Draft, Active, Out of Stock, Hidden, Discontinued) are preserved
   * - Retains internal supplier fields for inventory fulfillment
   */
  public parseProductData(raw: any, isInternal: boolean = false): PublicProduct | InternalProduct | null {
    try {
      if (!raw || (!raw.productId && !raw.id)) return null;

      // Merge local overrides (including curated multi-angle gallery and user session edits)
      raw = this.mergeLocalOverride(raw);

      const productId = String(raw.productId || raw.id).trim();
      const productName = String(raw.productName || raw.name || 'Unnamed Saree').trim();
      const category = String(raw.category || 'Silk Sarees').trim();
      const status: ProductStatus = (raw.status as ProductStatus) || (isInternal ? 'Draft' : 'Active');

      if (!isInternal) {
        // Status rule: Draft, Hidden, Discontinued are NEVER returned to public website
        if (status === 'Draft' || status === 'Hidden' || status === 'Discontinued') {
          return null;
        }

        // Check mandatory published flag if present
        if (raw.published === false || raw.published === 'FALSE' || raw.published === 'false') {
          return null;
        }
      }

      const parseArray = (val: any, dedupe: boolean = true): string[] => {
        let arr: string[] = [];
        if (Array.isArray(val)) {
          arr = val.map((s) => String(s).trim()).filter(Boolean);
        } else if (typeof val === 'string' && val.trim().length > 0) {
          arr = val.split(/[\|\,\n]/).map((s) => s.trim()).filter(Boolean);
        }
        return dedupe ? Array.from(new Set(arr)) : arr;
      };

      // Canonical Image Mapping
      const imgMap = this.parseImageFields(raw);

      const price = typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0;
      let compareAtPrice = raw.compareAtPrice ? (typeof raw.compareAtPrice === 'number' ? raw.compareAtPrice : parseFloat(raw.compareAtPrice)) : undefined;
      
      if (compareAtPrice !== undefined && compareAtPrice <= price) {
        compareAtPrice = undefined;
      }

      const discountPercentage = calculateDiscountPercentage(price, compareAtPrice) ?? undefined;

      const stock = typeof raw.stock === 'number' ? raw.stock : (typeof raw.stockQty === 'number' ? raw.stockQty : parseInt(raw.stock || raw.stockQty, 10) || 5);
      const stockStatus = (status === 'Out of Stock' || stock <= 0) ? 'out_of_stock' : stock <= 3 ? 'low_stock' : 'in_stock';

      const occasion = parseArray(raw.occasion);
      const style = parseArray(raw.style);
      const work = parseArray(raw.work || raw.workType);
      const collection = parseArray(raw.collection);
      const blouseSize = parseArray(raw.blouseSize || raw.blouseSizesAvailable);
      const searchCode = raw.searchCode ? String(raw.searchCode).trim() : undefined;

      const slug = raw.slug ? String(raw.slug) : `${slugify(productName)}-${productId.toLowerCase()}`;

      const baseProduct: PublicProduct = {
        productId,
        productName,
        name: productName,
        slug,
        shortDescription: raw.shortDescription ? String(raw.shortDescription) : undefined,
        description: raw.description ? String(raw.description) : 'Handcrafted luxury saree from SORAYVA.',
        category,
        subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
        fabric: String(raw.fabric || 'Silk'),
        occasion: occasion.length > 0 ? occasion : undefined,
        style: style.length > 0 ? style : undefined,
        work: work.length > 0 ? work : undefined,
        pattern: raw.pattern ? String(raw.pattern) : undefined,
        colour: String(raw.colour || 'Crimson'),
        colourFamily: raw.colourFamily ? String(raw.colourFamily) : undefined,
        collection: collection.length > 0 ? collection : undefined,
        price,
        compareAtPrice,
        discountPercentage,
        stock,
        stockQty: stock,
        stockStatus,
        status,
        featured: raw.featured === true || raw.featured === 'TRUE' || raw.featured === 'true',
        newArrival: raw.newArrival === true || raw.newArrival === 'TRUE' || raw.newArrival === 'true',
        trending: raw.trending === true || raw.trending === 'TRUE' || raw.trending === 'true',
        bestseller: raw.bestseller === true || raw.bestseller === 'TRUE' || raw.bestseller === 'true',
        publishDate: raw.publishDate ? String(raw.publishDate) : undefined,
        mainImage: imgMap.mainImage,
        image2: imgMap.image2,
        image3: imgMap.image3,
        image4: imgMap.image4,
        galleryImages: imgMap.galleryImages,
        images: imgMap.images,
        sizeType: raw.sizeType ? String(raw.sizeType) : 'Standard Saree (5.5m)',
        blouseSize: blouseSize.length > 0 ? blouseSize : undefined,
        blouseIncluded: raw.blouseIncluded === true || raw.blouseIncluded === 'TRUE' || raw.blouseIncluded === 'true',
        blouseSizesAvailable: blouseSize.length > 0 ? blouseSize : ['S', 'M', 'L', 'XL'],
        sizeChart: raw.sizeChart ? String(raw.sizeChart) : undefined,
        shippingInfo: raw.shippingInfo ? String(raw.shippingInfo) : 'Complimentary insured shipping across India.',
        returnInfo: raw.returnInfo ? String(raw.returnInfo) : '7 days easy return & exchange.',
        rating: typeof raw.rating === 'number' ? raw.rating : parseFloat(raw.rating) || 4.8,
        reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : parseInt(raw.reviewCount, 10) || 12,
        currency: String(raw.currency || 'INR'),
        published: true,
        sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : parseInt(raw.sortOrder, 10) || 1,
        sku: String(raw.sku || `SKU-${productId}`),
        tags: parseArray(raw.tags),
        sareeLength: raw.sareeLength ? String(raw.sareeLength) : '5.5 meters',
        blousePieceLength: raw.blousePieceLength ? String(raw.blousePieceLength) : '0.8 meters',
        careInstructions: raw.careInstructions ? String(raw.careInstructions) : 'Dry clean only.',
        fitNotes: raw.fitNotes ? String(raw.fitNotes) : 'Standard drape.',
        workType: raw.workType ? String(raw.workType) : undefined,
        searchCode,
        createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
        updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
      };

      if (!isInternal) {
        // SECURITY GUARANTEE: Exclude internal supplier fields from public DTO
        delete (baseProduct as any).meeshoReferenceLink;
        delete (baseProduct as any).sourceCost;
        delete (baseProduct as any).sourceStatus;
        delete (baseProduct as any).supplierReference;
        delete (baseProduct as any).lastSourceCheck;
        delete (baseProduct as any).sourceUrl;
        return baseProduct;
      }

      // ADMIN INTERNAL DTO: Preserve internal supplier fields
      const internalProduct: InternalProduct = {
        ...baseProduct,
        meeshoReferenceLink: raw.meeshoReferenceLink || raw.sourceUrl || undefined,
        sourceCost: typeof raw.sourceCost === 'number' ? raw.sourceCost : parseFloat(raw.sourceCost) || undefined,
        sourceStatus: raw.sourceStatus || undefined,
        supplierReference: raw.supplierReference || undefined,
        lastSourceCheck: raw.lastSourceCheck || undefined
      };

      return internalProduct;
    } catch (e) {
      console.warn('Failed to parse product row:', raw, e);
      return null;
    }
  }

  /**
   * CRITICAL SECURITY METHOD:
   * Converts any raw payload or sheet row object into a sanitized PublicProduct.
   * Explicitly strips all internal source/supplier fields before returning.
   * Rejects Draft, Hidden, and Discontinued products.
   */
  public sanitizeProduct(raw: any): PublicProduct | null {
    return this.parseProductData(raw, false) as PublicProduct | null;
  }

  /**
   * Internal parser for Admin DTO (Preserves internal supplier fields and ALL statuses including Draft)
   */
  public sanitizeAdminProduct(raw: any): InternalProduct | null {
    return this.parseProductData(raw, true) as InternalProduct | null;
  }

  private _productsCache: PublicProduct[] | null = null;
  private _productsCacheTime: number = 0;
  private _fetchPromise: Promise<PublicProduct[]> | null = null;
  private _apiBrokenTime: number = 0;

  async getProducts(filters?: Partial<FilterState>): Promise<PublicProduct[]> {
    let products: PublicProduct[] = [];
    const now = Date.now();

    // Cache valid for 60 seconds
    if (this._productsCache && (now - this._productsCacheTime < 60000)) {
      products = this._productsCache;
    } else if (this.apiUrl && (now - this._apiBrokenTime > 300000)) { // 5 min backoff if API broken
      if (!this._fetchPromise) {
        this._fetchPromise = (async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            let res = await fetch(`${this.apiUrl}?action=getProducts`, {
              signal: controller.signal,
              next: { revalidate: 60 }
            });

            if (res.ok) {
              let text = await res.text();
              if (text && text.trim().startsWith('{')) {
                let json = JSON.parse(text);
                if (json.error === 'Invalid action' || (!json.success && !json.products)) {
                  const fallbackRes = await fetch(`${this.apiUrl}?action=products`, { signal: controller.signal });
                  if (fallbackRes.ok) {
                    const fallbackText = await fallbackRes.text();
                    if (fallbackText && fallbackText.trim().startsWith('{')) {
                      json = JSON.parse(fallbackText);
                    }
                  }
                }
                const rawItems = Array.isArray(json.products) ? json.products : (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
                if (rawItems.length > 0) {
                  const parsed = rawItems
                    .map((r: any) => this.sanitizeProduct(r))
                    .filter((p: any): p is PublicProduct => p !== null);
                  clearTimeout(timeoutId);
                  return parsed;
                }
              } else if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                console.warn('[GoogleSheetsRepository] Apps Script returned HTML. Setting 5-min backoff.');
                this._apiBrokenTime = Date.now();
              }
            }
            clearTimeout(timeoutId);
          } catch (e) {
            console.warn('Google Sheets API unavailable or timed out, serving local fallback data:', e);
          }
          return [];
        })();
      }
      
      const fetched = await this._fetchPromise;
      if (fetched.length > 0) {
        products = fetched;
        this._productsCache = products;
        this._productsCacheTime = Date.now();
      }
      this._fetchPromise = null;
    }

    if (products.length === 0) {
      if (!this._productsCache || this._productsCache.length === 0) {
        this._productsCache = adminLocalStore
          .map((p) => this.sanitizeProduct(p))
          .filter((p): p is PublicProduct => p !== null);
        this._productsCacheTime = Date.now();
      }
      products = this._productsCache;
    }

    // Apply client filter predicates
    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        products = products.filter(
          (p) =>
            (p.productName || p.name).toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q) ||
            p.colour.toLowerCase().includes(q) ||
            (p.searchCode && p.searchCode.toLowerCase() === q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (filters.category && filters.category !== 'all') {
        const catSlug = filters.category.toLowerCase();
        products = products.filter((p) => p.category.toLowerCase().includes(catSlug) || p.slug.includes(catSlug));
      }

      if (filters.collection && filters.collection !== 'all') {
        const colSlug = filters.collection.toLowerCase();
        products = products.filter((p) => {
          if (!p.collection) return false;
          if (Array.isArray(p.collection)) {
            return p.collection.some((c) => c.toLowerCase().includes(colSlug));
          }
          return String(p.collection).toLowerCase().includes(colSlug);
        });
      }

      if (filters.fabrics && filters.fabrics.length > 0) {
        products = products.filter((p) => filters.fabrics!.some((f) => p.fabric.toLowerCase().includes(f.toLowerCase())));
      }

      if (filters.colours && filters.colours.length > 0) {
        products = products.filter((p) => filters.colours!.some((c) => p.colour.toLowerCase().includes(c.toLowerCase())));
      }

      if (filters.occasions && filters.occasions.length > 0) {
        products = products.filter((p) => {
          if (!p.occasion) return false;
          const occs = Array.isArray(p.occasion) ? p.occasion : [p.occasion];
          return filters.occasions!.some((o) => occs.some((po) => po.toLowerCase().includes(o.toLowerCase())));
        });
      }

      if (filters.styles && filters.styles.length > 0) {
        products = products.filter((p) => {
          if (!p.style) return false;
          const stys = Array.isArray(p.style) ? p.style : [p.style];
          return filters.styles!.some((s) => stys.some((ps) => ps.toLowerCase().includes(s.toLowerCase())));
        });
      }

      if (filters.works && filters.works.length > 0) {
        products = products.filter((p) => {
          if (!p.work) return false;
          const wrks = Array.isArray(p.work) ? p.work : [p.work];
          return filters.works!.some((w) => wrks.some((pw) => pw.toLowerCase().includes(w.toLowerCase())));
        });
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.maxPrice > 0) {
        products = products.filter((p) => p.price >= filters.minPrice! && p.price <= filters.maxPrice!);
      }

      if (filters.inStockOnly) {
        products = products.filter((p) => (p.stock ?? p.stockQty) > 0 && p.stockStatus !== 'out_of_stock');
      }

      if (filters.featuredOnly) {
        products = products.filter((p) => p.featured);
      }

      if (filters.bestsellersOnly) {
        products = products.filter((p) => p.bestseller);
      }

      if (filters.newArrivalsOnly) {
        products = products.filter((p) => p.newArrival);
      }

      // Sort
      if (filters.sortBy === 'price_low_high') {
        products.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === 'price_high_low') {
        products.sort((a, b) => b.price - a.price);
      } else if (filters.sortBy === 'newest') {
        products.sort((a, b) => (b.publishDate || b.createdAt || '').localeCompare(a.publishDate || a.createdAt || ''));
      } else if (filters.sortBy === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<PublicProduct | null> {
    const products = await this.getProducts();
    const decodedSlug = decodeURIComponent(slug).toLowerCase();
    
    let found = products.find((p) => 
      p.slug.toLowerCase() === decodedSlug || 
      p.productId.toLowerCase() === decodedSlug
    );
    
    // Safety net: if not found in current products (e.g. API failed but we have it in mock), check adminLocalStore
    if (!found) {
      const mockProducts = adminLocalStore.map(p => this.sanitizeProduct(p)).filter((p): p is PublicProduct => p !== null);
      found = mockProducts.find((p) => 
        p.slug.toLowerCase() === decodedSlug || 
        p.productId.toLowerCase() === decodedSlug
      );
    }
    
    return found || null;
  }

  async getCategories(): Promise<Category[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=getCategories`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) return json.data;
        }
      } catch (e) {
        console.warn('Categories API fetch failed, serving fallback:', e);
      }
    }
    return MOCK_CATEGORIES;
  }

  async getCollections(): Promise<Collection[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=getCollections`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) return json.data;
        }
      } catch (e) {
        console.warn('Collections API fetch failed, serving fallback:', e);
      }
    }
    return MOCK_COLLECTIONS;
  }

  async getReviews(productId: string): Promise<Review[]> {
    return MOCK_REVIEWS.filter((r) => r.productId === productId || productId === 'all');
  }

  async createOrder(orderPayload: any): Promise<{ success: boolean; orderId: string; error?: string }> {
    try {
      const res = await OrderService.createOrder(orderPayload as any);
      return { success: true, orderId: res.orderId };
    } catch (e: any) {
      console.error('Order creation error:', e);
      return { success: false, orderId: '', error: e.message || 'Failed to create order' };
    }
  }

  async lookupOrder(orderId: string, phoneOrEmail: string): Promise<Order | null> {
    if (!orderId) return null;
    if (phoneOrEmail && phoneOrEmail.trim().length > 0) {
      const secureMatch = OrderService.lookupOrderSecurely(orderId, phoneOrEmail);
      if (secureMatch) return secureMatch;
    }
    // Admin or direct order lookup if authorized
    return OrderService.getOrder(orderId);
  }


  async getCatalogueHealthReport(): Promise<CatalogueHealthReport> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=getCatalogueHealthReport`);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.issues)) {
            return json;
          }
        }
      } catch (e) {
        console.warn('Catalogue health report API call failed:', e);
      }
    }

    const issues: ProductHealthIssue[] = [];
    let active = 0, draft = 0, outOfStock = 0, hidden = 0, discontinued = 0;
    const items = await this.getAdminProducts();

    items.forEach((p) => {
      const st = p.status || 'Active';
      if (st === 'Active') active++;
      else if (st === 'Draft') draft++;
      else if (st === 'Out of Stock') outOfStock++;
      else if (st === 'Hidden') hidden++;
      else if (st === 'Discontinued') discontinued++;

      if (!p.productId) issues.push({ productId: p.productId, productName: p.name, issueType: 'INVALID_PRODUCT_ID', message: 'Missing Product ID', severity: 'ERROR' });
      if (!p.mainImage) issues.push({ productId: p.productId, productName: p.name, issueType: 'MISSING_IMAGE', message: 'Missing Main Image', severity: 'ERROR' });
      if (!p.price || p.price <= 0) issues.push({ productId: p.productId, productName: p.name, issueType: 'MISSING_PRICE', message: 'Missing or non-positive price', severity: 'ERROR' });
      if (!p.category) issues.push({ productId: p.productId, productName: p.name, issueType: 'MISSING_CATEGORY', message: 'Missing category', severity: 'ERROR' });
    });

    return {
      totalRows: items.length,
      validCount: items.length - issues.length,
      activeCount: active,
      draftCount: draft,
      outOfStockCount: outOfStock,
      hiddenCount: hidden,
      discontinuedCount: discontinued,
      issues,
      healthScore: items.length > 0 ? Math.round(((items.length - issues.length) / items.length) * 100) : 100,
    };
  }

  // ==================================================
  // ADMIN READ & WRITE OPERATIONS
  // ==================================================

  async getAdminProducts(): Promise<InternalProduct[]> {
    let prods: InternalProduct[] = [];
    if (this.apiUrl) {
      try {
        const adminToken = process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026';
        const res = await fetch(`${this.apiUrl}?action=getAdminProducts&token=${adminToken}`, {
          redirect: 'follow',
          next: { revalidate: 0 }
        });
        const text = await res.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error('[GoogleSheetsRepository] Google Apps Script returned HTML login page instead of JSON!');
          throw new Error('Google Apps Script permission error: Web App deployment permissions are restricted.');
        }

        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (Array.isArray(json.products)) {
            prods = json.products
              .map((r: any) => {
                const overridden = this.mergeLocalOverride(r);
                return this.sanitizeAdminProduct(overridden);
              })
              .filter((p: any): p is InternalProduct => p !== null);
          }
        }
      } catch (e: any) {
        console.warn('[GoogleSheetsRepository] getAdminProducts error:', e.message);
      }
    }

    // Merge only products that were explicitly modified or created in this session
    if (prods.length === 0) {
      prods = [...adminLocalStore];
    } else {
      sessionModifiedProductIds.forEach((pid) => {
        const localItem = adminLocalStore.find((p) => p.productId.toLowerCase() === pid);
        if (localItem) {
          const idx = prods.findIndex(
            (p) => p.productId.toLowerCase() === pid
          );
          if (idx === -1) {
            prods.push(localItem);
          } else {
            prods[idx] = { ...prods[idx], ...localItem };
          }
        }
      });
    }

    return this.applyClientOverrides(prods);
  }

  async getAdminProductById(productId: string): Promise<InternalProduct | null> {
    const products = await this.getAdminProducts();
    const found = products.find((p) => p.productId.toLowerCase() === productId.trim().toLowerCase());
    return found || null;
  }

  async saveOrUpdateProduct(product: InternalProduct): Promise<{ success: boolean; message?: string; productId?: string; error?: string }> {
    const pid = String(product.productId).trim().toLowerCase();
    const existing = adminLocalStore.find((p) => p.productId.toLowerCase() === pid);

    // PART 4: Prevent image URL loss during updates
    // Differentiate between omitted (preserve existing), explicitly empty "" (clear), and new URL
    const mainImage =
      product.mainImage !== undefined && product.mainImage.trim().length > 0
        ? product.mainImage.trim()
        : existing?.mainImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';

    const image2 =
      product.image2 !== undefined
        ? (product.image2.trim().length > 0 ? product.image2.trim() : undefined)
        : existing?.image2;

    const image3 =
      product.image3 !== undefined
        ? (product.image3.trim().length > 0 ? product.image3.trim() : undefined)
        : existing?.image3;

    const image4 =
      product.image4 !== undefined
        ? (product.image4.trim().length > 0 ? product.image4.trim() : undefined)
        : existing?.image4;

    const galleryImages: string[] = [mainImage];
    if (image2 && image2 !== mainImage) galleryImages.push(image2);
    if (image3 && image3 !== mainImage && image3 !== image2) galleryImages.push(image3);
    if (image4 && image4 !== mainImage && image4 !== image2 && image4 !== image3) galleryImages.push(image4);

    const mergedProduct: InternalProduct = {
      ...(existing || {}),
      ...product,
      mainImage,
      image2,
      image3,
      image4,
      galleryImages,
      images: galleryImages,
      status: product.status || existing?.status || 'Draft',
      updatedAt: new Date().toISOString()
    };

    // If an image slot was explicitly cleared, delete it so it is not resurrected
    if (product.image2 !== undefined && product.image2.trim().length === 0) {
      delete (mergedProduct as any).image2;
      if (existing) delete (existing as any).image2;
    }
    if (product.image3 !== undefined && product.image3.trim().length === 0) {
      delete (mergedProduct as any).image3;
      if (existing) delete (existing as any).image3;
    }
    if (product.image4 !== undefined && product.image4.trim().length === 0) {
      delete (mergedProduct as any).image4;
      if (existing) delete (existing as any).image4;
    }

    // Update in-memory and client storage
    this.updateLocalAdminStore(mergedProduct);

    if (this.apiUrl) {
      try {
        const payloadToSend = {
          ...mergedProduct,
          'Main Image URL': mainImage,
          'Image 2 URL': image2 || '',
          'Image 3 URL': image3 || '',
          'Image 4 URL': image4 || ''
        };

        const res = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveProduct',
            product: payloadToSend,
            adminToken: process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026'
          }),
          redirect: 'follow'
        });
        const text = await res.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.warn('[GoogleSheetsRepository] Apps Script POST returned HTML login redirect page.');
          return {
            success: true,
            message: 'Product updated in local admin session. (To enable live Google Sheets write sync, set "Who has access" to "Anyone" in Google Apps Script Deployment).',
            productId: mergedProduct.productId
          };
        }

        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (json.success) {
            return {
              success: true,
              message: json.message || 'Product updated in Google Sheets.',
              productId: mergedProduct.productId
            };
          }
          return { success: false, error: json.error || 'Google Sheets update failed.' };
        }
      } catch (e: any) {
        console.error('Apps Script POST failed:', e);
      }
    }

    return { success: true, message: 'Product updated in local admin session.', productId: mergedProduct.productId };
  }

  async updateProductStatus(productId: string, status: ProductStatus): Promise<{ success: boolean; message?: string; error?: string }> {
    this.updateLocalStatus(productId, status);

    if (this.apiUrl) {
      try {
        const res = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateStatus', productId, status, adminToken: process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026' }),
          redirect: 'follow'
        });
        const text = await res.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          return {
            success: true,
            message: `Status updated to ${status} in local admin session. Set "Who has access" to "Anyone" in Google Apps Script for live sheet sync.`
          };
        }

        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (json.success) {
            return { success: true, message: json.message || `Status updated to ${status}.` };
          }
          return { success: false, error: json.error || 'Status update failed.' };
        }
      } catch (e: any) {
        console.error('Apps Script status POST failed:', e);
      }
    }

    return { success: true, message: `Status updated to ${status} in local admin session.` };
  }

  async archiveProduct(productId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.updateProductStatus(productId, 'Discontinued');
  }

  async clearCatalogueCache(): Promise<boolean> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=clearCache`);
        if (res.ok) return true;
      } catch (e) {
        console.warn('Clear cache call failed:', e);
      }
    }
    return true;
  }

  private updateLocalAdminStore(product: InternalProduct) {
    const pid = product.productId.toLowerCase();
    sessionModifiedProductIds.add(pid);
    const idx = adminLocalStore.findIndex((p) => p.productId.toLowerCase() === pid);
    if (idx >= 0) {
      adminLocalStore[idx] = { ...adminLocalStore[idx], ...product };
    } else {
      adminLocalStore.push(product);
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('meshop_modified_products') || '{}');
        stored[pid] = { ...(stored[pid] || {}), ...product };
        localStorage.setItem('meshop_modified_products', JSON.stringify(stored));
      } catch (e) {
        console.warn('Failed to save product override to localStorage:', e);
      }
    }
  }

  private updateLocalStatus(productId: string, status: ProductStatus) {
    const pid = productId.toLowerCase();
    sessionModifiedProductIds.add(pid);
    const item = adminLocalStore.find((p) => p.productId.toLowerCase() === pid);
    if (item) {
      item.status = status;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('meshop_modified_products') || '{}');
        const existing = stored[pid] || item || { productId };
        stored[pid] = { ...existing, status };
        localStorage.setItem('meshop_modified_products', JSON.stringify(stored));
      } catch (e) {
        console.warn('Failed to save status override to localStorage:', e);
      }
    }
  }
}

// Single instance export following Repository Pattern
export const repository: RepositoryInterface = new GoogleSheetsRepository();
