export interface Product {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  collection?: string | string[];
  tags: string[];
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  fabric: string;
  sareeLength?: string;
  blousePieceLength?: string;
  blouseIncluded: boolean;
  blouseSizesAvailable: string[];
  colour: string;
  colourHex?: string;
  colourFamily?: string;
  pattern?: string;
  occasion?: string | string[];
  style?: string | string[];
  work?: string | string[];
  workType?: string;
  careInstructions?: string;
  fitNotes?: string;
  stockQty: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  status?: 'Active' | 'Draft' | 'Out of Stock' | 'Hidden' | 'Discontinued';
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  trending?: boolean;
  rating: number;
  reviewCount: number;
  mainImage: string;
  galleryImages: string[];
  videoUrl?: string;
  published: boolean;
  sortOrder: number;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Internal fields (never rendered on customer storefront)
  sourceUrl?: string;
  sourceCost?: number;
  sourceStatus?: string;
  supplierReference?: string;
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
