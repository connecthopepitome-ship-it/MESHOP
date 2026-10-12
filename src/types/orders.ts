/**
 * SORAYVA Orders, Fulfilment, Shipment & Notification Domain Models
 * Strictly typed, upgrade-safe and production-ready interfaces.
 */

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

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'COD_PENDING';

export type ShipmentStatus =
  | 'PENDING'
  | 'READY_TO_DISPATCH'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION'
  | 'RETURNED';

export type NotificationStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED';

export type OrderEventSource = 'admin' | 'courier_webhook' | 'system' | 'customer';

export type OrderEventType =
  | 'ORDER_PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PROCESSING'
  | 'QUALITY_CHECK_COMPLETE'
  | 'ORDER_PACKED'
  | 'SHIPMENT_DISPATCHED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_EXCEPTION'
  | 'ORDER_CANCELLED'
  | 'REFUND_CONFIRMED'
  | 'NOTE_ADDED'
  | 'MANUAL_UPDATE';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  selectedBlouseSize?: string;
  quantity: number;
  quantityPacked?: number;
  mainImage: string;
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

export interface PackingChecklist {
  productColorVerified: boolean;
  quantityVerified: boolean;
  qualityInspectionPassed: boolean;
  packagingCompleted: boolean;
  shippingLabelAttached: boolean;
  overrideReason?: string;
  packedBy?: string;
  packedAt?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  note: string;
  createdAt: string;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  carrier: string;
  shippingService?: string;
  awbNumber: string;
  trackingUrl?: string;
  weight?: string;
  dimensions?: string;
  parcelsCount?: number;
  shippingFee?: number;
  shipmentReference?: string;
  dispatchDate?: string;
  estimatedDelivery?: string;
  status: ShipmentStatus;
  fulfilmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  eventId: string;
  orderId: string;
  shipmentId?: string;
  eventType: OrderEventType;
  title: string;
  description: string;
  location?: string;
  source: OrderEventSource;
  actor?: string;
  note?: string;
  timestamp: string;
}

export interface NotificationRecord {
  notificationId: string;
  orderId: string;
  orderNumber: string;
  recipient: string;
  eventType: OrderEventType;
  templateId: string;
  subject: string;
  deliveryStatus: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey: string;
  providerReference?: string;
  errorDetails?: string;
  createdAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  isTest?: boolean;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  currency?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  orderStatus: OrderStatus;
  fulfillmentStatus?: string;
  trackingNumber?: string;
  shipment?: Shipment;
  packingChecklist: PackingChecklist;
  notes?: string;
  internalNotes: InternalNote[];
  events: OrderEvent[];
  timeline?: OrderEvent[];
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}


export interface CourierPartnerConfig {
  id: string;
  name: string;
  trackingUrlTemplate: string;
  active: boolean;
  defaultService?: string;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  defaultWeight: string;
  defaultDimensions: string;
  courierPartners: CourierPartnerConfig[];
}

export interface NotificationPreferences {
  senderName: string;
  senderEmail: string;
  supportEmail: string;
  notifyOrderPlaced: boolean;
  notifyPaymentConfirmed: boolean;
  notifyOrderPacked: boolean;
  notifyShipmentDispatched: boolean;
  notifyShipmentMovement: boolean;
  notifyOutForDelivery: boolean;
  notifyDelivered: boolean;
  notifyCancelled: boolean;
}

export interface EmailTemplatePreview {
  templateId: string;
  subject: string;
  htmlContent: string;
  plainText: string;
}
