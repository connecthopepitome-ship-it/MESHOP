export type ProductStatus = 'Draft' | 'Active' | 'Out of Stock' | 'Hidden' | 'Discontinued';

export type ProductValidationState =
  | 'VALID'
  | 'MISSING_IMAGE'
  | 'MISSING_PRICE'
  | 'MISSING_CATEGORY'
  | 'INVALID_STATUS'
  | 'INVALID_PRODUCT_ID'
  | 'INVALID_PRICE';

/**
 * PUBLIC PRODUCT DTO
 * STRICT SECURITY BOUNDARY:
 * This interface contains ONLY customer-facing product information.
 * Internal source details (Meesho URL, source cost, supplier reference, etc.)
 * MUST NEVER BE ADDED TO THIS TYPE.
 */
export interface PublicProduct {
  productId: string;
  productName?: string;
  name: string; // Compatibility alias for productName
  slug: string;
  shortDescription?: string;
  description?: string;
  category: string;
  subcategory?: string;
  fabric: string;
  occasion?: string | string[];
  style?: string | string[];
  work?: string | string[];
  pattern?: string;
  colour: string;
  colourHex?: string;
  colourFamily?: string;
  collection?: string | string[];
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  stock?: number;
  stockQty: number; // Compatibility alias for stock
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  status?: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  trending?: boolean;
  bestseller: boolean;
  publishDate?: string;
  mainImage: string;
  galleryImages: string[];
  images?: string[]; // Standardized images array [mainImage, image2, image3, image4]
  sizeType?: string;
  blouseSize?: string | string[];
  blouseIncluded?: boolean;
  blouseSizesAvailable?: string[];
  sizeChart?: string;
  shippingInfo?: string;
  returnInfo?: string;
  rating: number;
  reviewCount: number;
  currency: string;
  published: boolean;
  sortOrder?: number;
  sku?: string;
  tags: string[];
  sareeLength?: string;
  blousePieceLength?: string;
  careInstructions?: string;
  fitNotes?: string;
  workType?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * INTERNAL PRODUCT DTO
 * Strictly for backend/admin internal inventory and fulfillment operations.
 * NEVER return this type from public APIs or expose to browser client.
 */
export interface InternalProduct extends PublicProduct {
  meeshoReferenceLink?: string;
  sourceCost?: number;
  sourceStatus?: string;
  supplierReference?: string;
  lastSourceCheck?: string;
}

/**
 * Legacy Product Alias maps strictly to PublicProduct for safety
 */
export type Product = PublicProduct;

export interface ProductHealthIssue {
  productId: string;
  productName: string;
  issueType: ProductValidationState;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface CatalogueHealthReport {
  totalRows: number;
  validCount: number;
  activeCount: number;
  draftCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  discontinuedCount: number;
  issues: ProductHealthIssue[];
  healthScore: number;
}

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  published: boolean;
}

export interface Collection {
  collectionId: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  sortOrder: number;
  published: boolean;
}

export interface CartItem {
  product: Product;
  selectedBlouseSize?: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  selectedBlouseSize?: string;
  quantity: number;
  mainImage: string;
}

export interface Order {
  orderId: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'cod' | 'online_razorpay' | 'mock_payment';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  fulfillmentStatus: 'NEW' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  notes?: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrder?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
}

export interface Review {
  reviewId: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  review: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface SizeRecommendationInput {
  bustInches: number;
  waistInches: number;
  preferredFit: 'regular' | 'snug' | 'relaxed';
  unit: 'inch' | 'cm';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  collection: string;
  fabrics: string[];
  colours: string[];
  occasions: string[];
  styles?: string[];
  works?: string[];
  patterns?: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  featuredOnly: boolean;
  bestsellersOnly: boolean;
  newArrivalsOnly: boolean;
  sortBy: 'featured' | 'newest' | 'price_low_high' | 'price_high_low' | 'rating';
}

// Pluggable Provider Interfaces
export interface PaymentProvider {
  processPayment(orderId: string, amount: number, currency: string, method: string): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  verifyPayment(orderId: string, paymentSignature: string): Promise<boolean>;
}

export interface ShippingProvider {
  calculateShipping(pincode: string, subtotal: number): Promise<{ cost: number; estimatedDays: string; servicable: boolean }>;
  trackShipment(trackingNumber: string): Promise<{ status: string; history: Array<{ location: string; timestamp: string; note: string }> }>;
}

export interface FulfillmentProvider {
  createFulfillmentOrder(order: Order): Promise<{ fulfillmentId: string; status: string }>;
  getFulfillmentStatus(orderId: string): Promise<{ status: string; trackingNumber?: string }>;
  getTracking(orderId: string): Promise<{ trackingUrl?: string; carrier?: string }>;
}
