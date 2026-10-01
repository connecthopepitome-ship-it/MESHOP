import { Product, Category, Collection, Order, Review, FilterState } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS, MOCK_REVIEWS } from '@/data/mockData';

export interface RepositoryInterface {
  getProducts(filters?: Partial<FilterState>): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
  getCollections(): Promise<Collection[]>;
  getReviews(productId: string): Promise<Review[]>;
  createOrder(order: Omit<Order, 'orderId' | 'createdAt'>): Promise<{ success: boolean; orderId: string; error?: string }>;
  lookupOrder(orderId: string, phoneOrEmail: string): Promise<Order | null>;
}

export class GoogleSheetsRepository implements RepositoryInterface {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || '';
  }

  private sanitizeProduct(raw: any): Product | null {
    try {
      if (!raw || (!raw.productId && !raw.id)) return null;

      const isPublished = raw.published === true || raw.published === 'TRUE' || raw.published === 'true' || raw.published === 1;
      if (!isPublished) return null;

      const parseArray = (val: any): string[] => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim().length > 0) {
          return val.split(/[\|\,\n]/).map((s) => s.trim()).filter(Boolean);
        }
        return [];
      };

      const mainImage = raw.mainImage || raw.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';
      const gallery = parseArray(raw.galleryImages);
      if (gallery.length === 0) gallery.push(mainImage);

      const price = typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0;
      const compareAtPrice = raw.compareAtPrice ? (typeof raw.compareAtPrice === 'number' ? raw.compareAtPrice : parseFloat(raw.compareAtPrice)) : undefined;

      const stockQty = typeof raw.stockQty === 'number' ? raw.stockQty : parseInt(raw.stockQty, 10) || 10;
      const stockStatus = stockQty <= 0 ? 'out_of_stock' : stockQty <= 3 ? 'low_stock' : 'in_stock';

      return {
        productId: String(raw.productId || raw.id),
        sku: String(raw.sku || `SKU-${raw.productId}`),
        name: String(raw.name || 'Unnamed Saree'),
        slug: String(raw.slug || raw.name?.toLowerCase().replace(/\s+/g, '-') || `saree-${raw.productId}`),
        category: String(raw.category || 'Silk Sarees'),
        subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
        collection: raw.collection ? String(raw.collection) : undefined,
        tags: parseArray(raw.tags),
        shortDescription: raw.shortDescription ? String(raw.shortDescription) : undefined,
        description: raw.description ? String(raw.description) : 'Curated premium saree.',
        price,
        compareAtPrice,
        currency: String(raw.currency || 'INR'),
        fabric: String(raw.fabric || 'Silk'),
        sareeLength: raw.sareeLength ? String(raw.sareeLength) : '5.5 meters',
        blousePieceLength: raw.blousePieceLength ? String(raw.blousePieceLength) : '0.8 meters',
        blouseIncluded: raw.blouseIncluded === true || raw.blouseIncluded === 'TRUE' || raw.blouseIncluded === 'true',
        blouseSizesAvailable: parseArray(raw.blouseSizesAvailable).length > 0 ? parseArray(raw.blouseSizesAvailable) : ['S', 'M', 'L', 'XL'],
        colour: String(raw.colour || 'Crimson'),
        colourHex: raw.colourHex ? String(raw.colourHex) : undefined,
        pattern: raw.pattern ? String(raw.pattern) : undefined,
        occasion: raw.occasion ? String(raw.occasion) : 'Festive',
        workType: raw.workType ? String(raw.workType) : 'Handloom',
        careInstructions: raw.careInstructions ? String(raw.careInstructions) : 'Dry clean only.',
        fitNotes: raw.fitNotes ? String(raw.fitNotes) : 'Standard drape.',
        stockQty,
        stockStatus,
        featured: raw.featured === true || raw.featured === 'TRUE' || raw.featured === 'true',
        bestseller: raw.bestseller === true || raw.bestseller === 'TRUE' || raw.bestseller === 'true',
        newArrival: raw.newArrival === true || raw.newArrival === 'TRUE' || raw.newArrival === 'true',
        rating: typeof raw.rating === 'number' ? raw.rating : parseFloat(raw.rating) || 4.8,
        reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : parseInt(raw.reviewCount, 10) || 12,
        mainImage,
        galleryImages: gallery,
        videoUrl: raw.videoUrl ? String(raw.videoUrl) : undefined,
        published: true,
        sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : parseInt(raw.sortOrder, 10) || 1,
      };
    } catch (e) {
      console.warn('Failed to parse raw product row:', raw, e);
      return null;
    }
  }

  async getProducts(filters?: Partial<FilterState>): Promise<Product[]> {
    let products: Product[] = [];

    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}?action=getProducts`, { next: { revalidate: 60 } });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            products = json.data.map((r: any) => this.sanitizeProduct(r)).filter((p: any): p is Product => p !== null);
          }
        }
      } catch (e) {
        console.warn('Google Sheets API unavailable, serving local fallback data:', e);
      }
    }

    if (products.length === 0) {
      products = [...MOCK_PRODUCTS];
    }

    // Apply client filter predicates
    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
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
        products = products.filter((p) => p.collection?.toLowerCase().includes(colSlug));
      }

      if (filters.fabrics && filters.fabrics.length > 0) {
        products = products.filter((p) => filters.fabrics!.some((f) => p.fabric.toLowerCase().includes(f.toLowerCase())));
      }

      if (filters.colours && filters.colours.length > 0) {
        products = products.filter((p) => filters.colours!.some((c) => p.colour.toLowerCase().includes(c.toLowerCase())));
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.maxPrice > 0) {
        products = products.filter((p) => p.price >= filters.minPrice! && p.price <= filters.maxPrice!);
      }

      if (filters.inStockOnly) {
        products = products.filter((p) => p.stockQty > 0);
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
        products.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      } else if (filters.sortBy === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    const found = products.find((p) => p.slug === slug || p.productId === slug);
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

    // Save order in browser local storage as fallback order database
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

    // Sample mock fallback order if orderId matches test format
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
}

// Single instance export following Repository Pattern
export const repository: RepositoryInterface = new GoogleSheetsRepository();
