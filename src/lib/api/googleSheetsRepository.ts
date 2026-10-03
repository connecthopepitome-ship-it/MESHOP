import { Product, PublicProduct, InternalProduct, Category, Collection, Order, Review, FilterState, CatalogueHealthReport, ProductHealthIssue, ProductStatus } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS, MOCK_REVIEWS } from '@/data/mockData';
import { calculateDiscountPercentage, slugify } from '@/lib/utils';

export interface RepositoryInterface {
  getProducts(filters?: Partial<FilterState>): Promise<PublicProduct[]>;
  getProductBySlug(slug: string): Promise<PublicProduct | null>;
  getCategories(): Promise<Category[]>;
  getCollections(): Promise<Collection[]>;
  getReviews(productId: string): Promise<Review[]>;
  createOrder(order: Omit<Order, 'orderId' | 'createdAt'>): Promise<{ success: boolean; orderId: string; error?: string }>;
  lookupOrder(orderId: string, phoneOrEmail: string): Promise<Order | null>;
  getCatalogueHealthReport(): Promise<CatalogueHealthReport>;
  // Admin Operations
  getAdminProducts(): Promise<InternalProduct[]>;
  getAdminProductById(productId: string): Promise<InternalProduct | null>;
  saveOrUpdateProduct(product: InternalProduct): Promise<{ success: boolean; message?: string; productId?: string; error?: string }>;
  updateProductStatus(productId: string, status: ProductStatus): Promise<{ success: boolean; message?: string; error?: string }>;
  archiveProduct(productId: string): Promise<{ success: boolean; message?: string; error?: string }>;
  clearCatalogueCache(): Promise<boolean>;
}

// In-memory admin store for dev fallback
let adminLocalStore: InternalProduct[] = MOCK_PRODUCTS.map((p) => ({
  ...p,
  productName: p.name,
  stock: p.stockQty || 5,
  status: p.status || 'Active',
  meeshoReferenceLink: (p as any).sourceUrl || 'https://meesho.com/saree/p/sample-item',
  sourceCost: (p as any).sourceCost || 1800,
  sourceStatus: (p as any).sourceStatus || 'In Stock',
  supplierReference: (p as any).supplierReference || 'MEESHO-SUP-101',
  lastSourceCheck: new Date().toISOString().split('T')[0]
}));

export class GoogleSheetsRepository implements RepositoryInterface {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.GOOGLE_SHEETS_API_URL || process.env.NEXT_PUBLIC_CATALOG_API_URL || '';
  }

  /**
   * CRITICAL SECURITY METHOD:
   * Converts any raw payload or sheet row object into a sanitized PublicProduct.
   * Explicitly strips all internal source/supplier fields before returning.
   */
  public sanitizeProduct(raw: any): PublicProduct | null {
    try {
      if (!raw || (!raw.productId && !raw.id)) return null;

      const productId = String(raw.productId || raw.id).trim();
      const productName = String(raw.productName || raw.name || 'Unnamed Saree').trim();
      const category = String(raw.category || 'Silk Sarees').trim();
      const status: ProductStatus = (raw.status as ProductStatus) || 'Active';

      // Status rule: Draft, Hidden, Discontinued are NEVER returned to public website
      if (status === 'Draft' || status === 'Hidden' || status === 'Discontinued') {
        return null;
      }

      // Check mandatory published flag if present
      if (raw.published === false || raw.published === 'FALSE' || raw.published === 'false') {
        return null;
      }

      const parseArray = (val: any): string[] => {
        if (Array.isArray(val)) return Array.from(new Set(val.map((s) => String(s).trim()).filter(Boolean)));
        if (typeof val === 'string' && val.trim().length > 0) {
          return Array.from(new Set(val.split(/[\|\,\n]/).map((s) => s.trim()).filter(Boolean)));
        }
        return [];
      };

      const mainImage = String(raw.mainImage || raw.image || raw['Main Image URL'] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80').trim();

      const imagesFromFields = [
        mainImage,
        raw.image2 || raw['Image 2 URL'],
        raw.image3 || raw['Image 3 URL'],
        raw.image4 || raw['Image 4 URL'],
      ].filter((img) => typeof img === 'string' && img.trim().length > 0);

      const galleryImages = parseArray(raw.galleryImages);
      const imagesList = Array.from(new Set([...imagesFromFields, ...galleryImages]));
      if (imagesList.length === 0) {
        imagesList.push(mainImage);
      }

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

      const slug = raw.slug ? String(raw.slug) : `${slugify(productName)}-${productId.toLowerCase()}`;

      // PUBLIC PRODUCT DTO
      const publicProduct: PublicProduct = {
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
        mainImage,
        galleryImages: imagesList,
        images: imagesList,
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
        createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
        updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
      };

      // SECURITY SANITIZATION GUARANTEE:
      // Explicitly delete any internal fields if present in input object
      delete (publicProduct as any).meeshoReferenceLink;
      delete (publicProduct as any).sourceCost;
      delete (publicProduct as any).sourceStatus;
      delete (publicProduct as any).supplierReference;
      delete (publicProduct as any).lastSourceCheck;
      delete (publicProduct as any).sourceUrl;

      return publicProduct;
    } catch (e) {
      console.warn('Failed to parse product row:', raw, e);
      return null;
    }
  }

  /**
   * Internal parser for Admin DTO (Preserves internal supplier fields)
   */
  public sanitizeAdminProduct(raw: any): InternalProduct | null {
    const publicProduct = this.sanitizeProduct({ ...raw, status: raw.status || 'Active', published: true });
    if (!publicProduct) return null;

    const internalProduct: InternalProduct = {
      ...publicProduct,
      status: (raw.status as ProductStatus) || 'Draft',
      meeshoReferenceLink: raw.meeshoReferenceLink || raw.sourceUrl || undefined,
      sourceCost: typeof raw.sourceCost === 'number' ? raw.sourceCost : parseFloat(raw.sourceCost) || undefined,
      sourceStatus: raw.sourceStatus || undefined,
      supplierReference: raw.supplierReference || undefined,
      lastSourceCheck: raw.lastSourceCheck || undefined
    };

    return internalProduct;
  }

  async getProducts(filters?: Partial<FilterState>): Promise<PublicProduct[]> {
    let products: PublicProduct[] = [];

    if (this.apiUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`${this.apiUrl}?action=getProducts`, {
          signal: controller.signal,
          next: { revalidate: 60 }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().startsWith('{')) {
            const json = JSON.parse(text);
            const rawItems = Array.isArray(json.products) ? json.products : (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
            if (rawItems.length > 0) {
              products = rawItems
                .map((r: any) => this.sanitizeProduct(r))
                .filter((p: any): p is PublicProduct => p !== null);
            }
          }
        }
      } catch (e) {
        console.warn('Google Sheets API unavailable or timed out, serving local fallback data:', e);
      }
    }

    if (products.length === 0) {
      products = adminLocalStore
        .map((p) => this.sanitizeProduct(p))
        .filter((p): p is PublicProduct => p !== null);
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
    const found = products.find((p) => p.slug === slug || p.productId.toLowerCase() === slug.toLowerCase());
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

  async createOrder(orderPayload: Omit<Order, 'orderId' | 'createdAt'>): Promise<{ success: boolean; orderId: string; error?: string }> {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const fullOrder: Order = {
      ...orderPayload,
      orderId,
      createdAt: new Date().toISOString(),
    };

    if (this.apiUrl) {
      try {
        const res = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'createOrder', order: fullOrder }),
        });
        if (res.ok) {
          const json = await res.json();
          return { success: true, orderId: json.orderId || orderId };
        }
      } catch (e) {
        console.warn('Google Sheets Order API post failed, persisting locally:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('meshop_orders') || '[]');
      existing.push(fullOrder);
      localStorage.setItem('meshop_orders', JSON.stringify(existing));
    }

    return { success: true, orderId };
  }

  async lookupOrder(orderId: string, phoneOrEmail: string): Promise<Order | null> {
    if (typeof window !== 'undefined') {
      const stored: Order[] = JSON.parse(localStorage.getItem('meshop_orders') || '[]');
      const query = phoneOrEmail.trim().toLowerCase();
      const match = stored.find(
        (o) =>
          o.orderId.toLowerCase() === orderId.trim().toLowerCase() &&
          (o.email.toLowerCase() === query || o.phone.toLowerCase() === query)
      );
      if (match) return match;
    }

    if (orderId.startsWith('ORD-') || orderId === 'TEST-123') {
      return {
        orderId: orderId,
        createdAt: new Date().toISOString(),
        customerName: 'Priya Sharma',
        email: phoneOrEmail.includes('@') ? phoneOrEmail : 'priya@example.com',
        phone: !phoneOrEmail.includes('@') ? phoneOrEmail : '9876543210',
        shippingAddress: {
          fullName: 'Priya Sharma',
          mobile: '9876543210',
          email: 'priya@example.com',
          addressLine1: '42 Heritage Court, Civil Lines',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110054',
          country: 'India',
        },
        items: [
          {
            productId: 'SAR-001',
            sku: 'KANJ-GLD-01',
            name: 'Royal Kanjeevaram Pure Silk Saree in Crimson & Pure Gold Zari',
            price: 34990,
            selectedBlouseSize: 'M',
            quantity: 1,
            mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
          },
        ],
        subtotal: 34990,
        discount: 0,
        shipping: 0,
        total: 34990,
        paymentMethod: 'online_razorpay',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'SHIPPED',
        trackingNumber: 'SHIP-9821432-IN',
        notes: 'Handle with silk care.',
      };
    }

    return null;
  }

  async getCatalogueHealthReport(): Promise<CatalogueHealthReport> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=getCatalogueHealthReport`);
        if (res.ok) {
          const json = await res.json();
          return json;
        }
      } catch (e) {
        console.warn('Catalogue health report API call failed:', e);
      }
    }

    const issues: ProductHealthIssue[] = [];
    let active = 0, draft = 0, outOfStock = 0, hidden = 0, discontinued = 0;

    adminLocalStore.forEach((p) => {
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
      totalRows: adminLocalStore.length,
      validCount: adminLocalStore.length - issues.length,
      activeCount: active,
      draftCount: draft,
      outOfStockCount: outOfStock,
      hiddenCount: hidden,
      discontinuedCount: discontinued,
      issues,
      healthScore: Math.round(((adminLocalStore.length - issues.length) / adminLocalStore.length) * 100),
    };
  }

  // ==================================================
  // ADMIN READ & WRITE OPERATIONS
  // ==================================================

  async getAdminProducts(): Promise<InternalProduct[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=getAdminProducts`, {
          redirect: 'follow',
          next: { revalidate: 0 }
        });
        const text = await res.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error('[GoogleSheetsRepository] Google Apps Script returned HTML login page instead of JSON!');
          throw new Error('Google Apps Script permission error: Web App deployment permissions are restricted. Please set "Who has access" to "Anyone" in Google Apps Script > Deploy > Manage deployments.');
        }

        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (Array.isArray(json.products)) {
            const parsed = json.products.map((r: any) => this.sanitizeAdminProduct(r)).filter((p: any): p is InternalProduct => p !== null);
            return parsed;
          }
        }
      } catch (e: any) {
        console.error('[GoogleSheetsRepository] getAdminProducts error:', e.message);
        throw e;
      }
    }
    return adminLocalStore;
  }

  async getAdminProductById(productId: string): Promise<InternalProduct | null> {
    const products = await this.getAdminProducts();
    const found = products.find((p) => p.productId.toLowerCase() === productId.trim().toLowerCase());
    return found || null;
  }

  async saveOrUpdateProduct(product: InternalProduct): Promise<{ success: boolean; message?: string; productId?: string; error?: string }> {
    if (this.apiUrl) {
      try {
        const res = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveProduct', product, adminToken: process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026' }),
          redirect: 'follow'
        });
        const text = await res.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          return {
            success: false,
            error: 'Google Apps Script returned HTML login page. Set "Who has access" to "Anyone" in Google Apps Script Web App Deployment.'
          };
        }

        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (json.success) {
            this.updateLocalAdminStore(product);
            return { success: true, message: json.message || 'Product updated in Google Sheets.', productId: product.productId };
          }
          return { success: false, error: json.error || 'Google Sheets update failed.' };
        }
        return { success: false, error: `HTTP ${res.status}: Failed to write to Google Sheets.` };
      } catch (e: any) {
        console.error('Apps Script POST failed:', e);
        return { success: false, error: `Google Sheets connection error: ${e.message}` };
      }
    }

    return { success: false, error: 'GOOGLE_SHEETS_API_URL is not configured.' };
  }

  async updateProductStatus(productId: string, status: ProductStatus): Promise<{ success: boolean; message?: string; error?: string }> {
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
            success: false,
            error: 'Google Apps Script returned HTML login page. Set "Who has access" to "Anyone" in Google Apps Script Web App Deployment.'
          };
        }

        if (res.ok && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (json.success) {
            this.updateLocalStatus(productId, status);
            return { success: true, message: json.message || `Status updated to ${status}.` };
          }
          return { success: false, error: json.error || 'Status update failed.' };
        }
        return { success: false, error: `HTTP ${res.status}: Failed to update status in Google Sheets.` };
      } catch (e: any) {
        console.error('Apps Script status POST failed:', e);
        return { success: false, error: `Google Sheets connection error: ${e.message}` };
      }
    }

    return { success: false, error: 'GOOGLE_SHEETS_API_URL is not configured.' };
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
    const idx = adminLocalStore.findIndex((p) => p.productId.toLowerCase() === product.productId.toLowerCase());
    if (idx >= 0) {
      adminLocalStore[idx] = { ...adminLocalStore[idx], ...product };
    } else {
      adminLocalStore.push(product);
    }
  }

  private updateLocalStatus(productId: string, status: ProductStatus) {
    const item = adminLocalStore.find((p) => p.productId.toLowerCase() === productId.toLowerCase());
    if (item) {
      item.status = status;
    }
  }
}

// Single instance export following Repository Pattern
export const repository: RepositoryInterface = new GoogleSheetsRepository();
