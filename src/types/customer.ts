export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  addressId: string;
  customerId: string;
  type: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = 
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'FAILED';

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerOrder {
  orderId: string;
  customerId?: string; // Optional for guest orders
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  eventId: string;
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}
