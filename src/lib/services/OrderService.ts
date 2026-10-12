import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Shipment,
  OrderEvent,
  PackingChecklist,
  InternalNote,
} from '@/types/orders';
import { NotificationService } from './notificationService';
import { ShipmentService } from './shipmentService';

const ORDERS_STORAGE_KEY = 'meshop_orders_v2';

export interface OrderFilterParams {
  searchQuery?: string;
  orderStatus?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  courierPartner?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'total_desc' | 'total_asc' | 'order_number';
  page?: number;
  limit?: number;
}

// Initial realistic baseline orders for SORAYVA Atelier
const SEED_ORDERS: Order[] = [
  {
    orderId: 'ORD-2026-1001',
    orderNumber: 'SR-2026-0041',
    customerId: 'cust_01',
    customerName: 'Aanya Sharma',
    email: 'aanya.sharma@example.com',
    phone: '+91 98765 43210',
    shippingAddress: {
      fullName: 'Aanya Sharma',
      mobile: '+91 98765 43210',
      email: 'aanya.sharma@example.com',
      addressLine1: 'A-402, Lotus Apartments',
      addressLine2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India',
    },
    items: [
      {
        productId: 'SAR-001',
        sku: 'KANJ-GLD-01',
        name: 'Royal Kanjeevaram Pure Silk Saree in Crimson & Pure Gold Zari',
        price: 34990,
        selectedBlouseSize: 'M (38)',
        quantity: 1,
        quantityPacked: 1,
        mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 34990,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 34990,
    paymentMethod: 'online_razorpay',
    paymentStatus: 'PAID',
    paymentReference: 'pay_rzp_89412948',
    orderStatus: 'SHIPPED',
    shipment: {
      shipmentId: 'SHIP-8921',
      orderId: 'ORD-2026-1001',
      carrier: 'Blue Dart Express',
      shippingService: 'Apex Air Luxury',
      awbNumber: 'BD-892138402',
      trackingUrl: 'https://www.bluedart.com/tracking?track=BD-892138402',
      weight: '1.4 kg',
      dimensions: '40 x 30 x 10 cm',
      parcelsCount: 1,
      shippingFee: 0,
      dispatchDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'DISPATCHED',
      fulfilmentNotes: 'Inspected by Master Weaver Rajan. Kept in heirloom velvet trunk box.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    packingChecklist: {
      productColorVerified: true,
      quantityVerified: true,
      qualityInspectionPassed: true,
      packagingCompleted: true,
      shippingLabelAttached: true,
      packedBy: 'Senior Inspector Meenakshi',
      packedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    internalNotes: [
      {
        id: 'note_1',
        author: 'concierge@sorayva.com',
        note: 'Customer requested gift card message: Wishing you joyous wedding celebrations.',
        createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
      },
    ],
    events: [
      {
        eventId: 'evt_1',
        orderId: 'ORD-2026-1001',
        eventType: 'ORDER_PLACED',
        title: 'Order Placed',
        description: 'Customer completed order on SORAYVA boutique website.',
        source: 'customer',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_2',
        orderId: 'ORD-2026-1001',
        eventType: 'PAYMENT_CONFIRMED',
        title: 'Payment Confirmed',
        description: 'Razorpay payment capture verified (₹34,990).',
        source: 'system',
        timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_3',
        orderId: 'ORD-2026-1001',
        eventType: 'ORDER_PACKED',
        title: 'Artisan Inspection & Packing Complete',
        description: '5-point quality checks verified and gift boxed.',
        source: 'admin',
        actor: 'Senior Inspector Meenakshi',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_4',
        orderId: 'ORD-2026-1001',
        eventType: 'SHIPMENT_DISPATCHED',
        title: 'Dispatched via Blue Dart Express',
        description: 'Parcel scanned at Mumbai Central Hub. AWB: BD-892138402',
        location: 'Mumbai Central Hub',
        source: 'admin',
        actor: 'Logistics Supervisor',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'ORD-2026-1002',
    orderNumber: 'SR-2026-0042',
    customerName: 'Pooja Hegde',
    email: 'pooja.hegde@example.com',
    phone: '+91 98450 11223',
    shippingAddress: {
      fullName: 'Pooja Hegde',
      mobile: '+91 98450 11223',
      email: 'pooja.hegde@example.com',
      addressLine1: 'Villa 14, Prestige Golfshire',
      addressLine2: 'Nandi Hills Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '562164',
      country: 'India',
    },
    items: [
      {
        productId: 'SAR-002',
        sku: 'BAN-ORG-02',
        name: 'Heritage Banarasi Katan Silk with Antique Floral Jaal in Emerald',
        price: 24500,
        selectedBlouseSize: 'S (36)',
        quantity: 1,
        quantityPacked: 0,
        mainImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 24500,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 24500,
    paymentMethod: 'online_razorpay',
    paymentStatus: 'PAID',
    paymentReference: 'pay_rzp_99014110',
    orderStatus: 'PROCESSING',
    packingChecklist: {
      productColorVerified: true,
      quantityVerified: true,
      qualityInspectionPassed: false,
      packagingCompleted: false,
      shippingLabelAttached: false,
    },
    internalNotes: [],
    events: [
      {
        eventId: 'evt_201',
        orderId: 'ORD-2026-1002',
        eventType: 'ORDER_PLACED',
        title: 'Order Placed',
        description: 'Order placed by customer.',
        source: 'customer',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_202',
        orderId: 'ORD-2026-1002',
        eventType: 'ORDER_CONFIRMED',
        title: 'Order Confirmed & Preparing',
        description: 'Allocated to master draping atelier.',
        source: 'system',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'ORD-2026-1003',
    orderNumber: 'SR-2026-0043',
    customerName: 'Sunita Reddy',
    email: 'sunita.reddy@example.com',
    phone: '+91 97110 33445',
    shippingAddress: {
      fullName: 'Sunita Reddy',
      mobile: '+91 97110 33445',
      email: 'sunita.reddy@example.com',
      addressLine1: 'Road No 36, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      country: 'India',
    },
    items: [
      {
        productId: 'SAR-003',
        sku: 'PAITH-GLD-03',
        name: 'Authentic Yeola Paithani Silk with Peacock Pallu in Royal Violet',
        price: 38000,
        selectedBlouseSize: 'L (40)',
        quantity: 1,
        quantityPacked: 1,
        mainImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 38000,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 38000,
    paymentMethod: 'cod',
    paymentStatus: 'COD_PENDING',
    orderStatus: 'PACKED',
    packingChecklist: {
      productColorVerified: true,
      quantityVerified: true,
      qualityInspectionPassed: true,
      packagingCompleted: true,
      shippingLabelAttached: true,
      packedBy: 'Atelier Head Shalini',
      packedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    internalNotes: [
      {
        id: 'note_301',
        author: 'admin@sorayva.com',
        note: 'Customer confirmed via phone call for Cash on Delivery delivery.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
    events: [
      {
        eventId: 'evt_301',
        orderId: 'ORD-2026-1003',
        eventType: 'ORDER_PLACED',
        title: 'Order Placed (COD)',
        description: 'Order placed with Cash on Delivery mode.',
        source: 'customer',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_302',
        orderId: 'ORD-2026-1003',
        eventType: 'ORDER_PACKED',
        title: 'Packed & Awaiting Dispatch',
        description: 'Parcel sealed in signature SORAYVA gold box.',
        source: 'admin',
        actor: 'Atelier Head Shalini',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'ORD-2026-1004',
    orderNumber: 'SR-2026-0044',
    customerName: 'Kavita Chawla',
    email: 'kavita.c@example.com',
    phone: '+91 99887 76655',
    shippingAddress: {
      fullName: 'Kavita Chawla',
      mobile: '+91 99887 76655',
      email: 'kavita.c@example.com',
      addressLine1: 'Flat 501, Defence Colony',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      country: 'India',
    },
    items: [
      {
        productId: 'SAR-004',
        sku: 'CHIK-IVR-04',
        name: 'Handcrafted Lucknowi Chikankari Organza Saree in Warm Pearl',
        price: 18990,
        selectedBlouseSize: 'M (38)',
        quantity: 1,
        quantityPacked: 1,
        mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 18990,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 18990,
    paymentMethod: 'online_razorpay',
    paymentStatus: 'PAID',
    paymentReference: 'pay_rzp_77812903',
    orderStatus: 'DELIVERED',
    shipment: {
      shipmentId: 'SHIP-8802',
      orderId: 'ORD-2026-1004',
      carrier: 'Delhivery',
      shippingService: 'Express Surface',
      awbNumber: 'DEL-9901847291',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL-9901847291',
      weight: '1.1 kg',
      dimensions: '35 x 25 x 8 cm',
      parcelsCount: 1,
      dispatchDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    packingChecklist: {
      productColorVerified: true,
      quantityVerified: true,
      qualityInspectionPassed: true,
      packagingCompleted: true,
      shippingLabelAttached: true,
      packedBy: 'Staff Rajesh',
      packedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    internalNotes: [],
    events: [
      {
        eventId: 'evt_401',
        orderId: 'ORD-2026-1004',
        eventType: 'ORDER_PLACED',
        title: 'Order Placed',
        description: 'Order placed by customer.',
        source: 'customer',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_402',
        orderId: 'ORD-2026-1004',
        eventType: 'SHIPMENT_DISPATCHED',
        title: 'Dispatched via Delhivery',
        description: 'AWB: DEL-9901847291',
        source: 'admin',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_403',
        orderId: 'ORD-2026-1004',
        eventType: 'OUT_FOR_DELIVERY',
        title: 'Out For Delivery',
        description: 'Courier agent en route in Defence Colony area.',
        source: 'courier_webhook',
        timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      },
      {
        eventId: 'evt_404',
        orderId: 'ORD-2026-1004',
        eventType: 'DELIVERED',
        title: 'Package Handed Over',
        description: 'Signed by recipient.',
        location: 'New Delhi',
        source: 'courier_webhook',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'ORD-2026-1005',
    orderNumber: 'SR-2026-0045',
    customerName: 'Divya Nair',
    email: 'divya.nair@example.com',
    phone: '+91 94470 88990',
    shippingAddress: {
      fullName: 'Divya Nair',
      mobile: '+91 94470 88990',
      email: 'divya.nair@example.com',
      addressLine1: 'Panampilly Nagar',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682036',
      country: 'India',
    },
    items: [
      {
        productId: 'SAR-005',
        sku: 'KAS-GLD-05',
        name: 'Handwoven Kasavu Tissue Saree in Natural Gold & Ecru',
        price: 15400,
        selectedBlouseSize: 'M (38)',
        quantity: 1,
        quantityPacked: 0,
        mainImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 15400,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 15400,
    paymentMethod: 'online_razorpay',
    paymentStatus: 'PAID',
    paymentReference: 'pay_rzp_66190123',
    orderStatus: 'PLACED',
    packingChecklist: {
      productColorVerified: false,
      quantityVerified: false,
      qualityInspectionPassed: false,
      packagingCompleted: false,
      shippingLabelAttached: false,
    },
    internalNotes: [],
    events: [
      {
        eventId: 'evt_501',
        orderId: 'ORD-2026-1005',
        eventType: 'ORDER_PLACED',
        title: 'Order Placed',
        description: 'New order received from client.',
        source: 'customer',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

let memoryOrders: Order[] = [...SEED_ORDERS];

export class OrderService {
  private static loadStoredOrders(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (stored) {
          const parsed: Order[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryOrders = parsed;
            return;
          }
        }
        // First run initialization
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
        memoryOrders = [...SEED_ORDERS];
      } catch (e) {
        console.warn('Failed to load orders from storage:', e);
      }
    }
  }

  private static persistOrders(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(memoryOrders));
      } catch (e) {
        console.warn('Failed to save orders to storage:', e);
      }
    }
  }

  /**
   * Get filtered orders with search, pagination, and summary counts
   */
  static getOrders(params: OrderFilterParams = {}): {
    orders: Order[];
    totalCount: number;
    counts: {
      all: number;
      placed: number;
      awaitingFulfilment: number;
      readyToDispatch: number;
      inTransit: number;
      delivered: number;
      exceptions: number;
    };
  } {
    this.loadStoredOrders();

    const counts = {
      all: memoryOrders.length,
      placed: memoryOrders.filter(o => o.orderStatus === 'PLACED').length,
      awaitingFulfilment: memoryOrders.filter(o => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING').length,
      readyToDispatch: memoryOrders.filter(o => o.orderStatus === 'PACKED').length,
      inTransit: memoryOrders.filter(o => o.orderStatus === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY').length,
      delivered: memoryOrders.filter(o => o.orderStatus === 'DELIVERED').length,
      exceptions: memoryOrders.filter(o => o.orderStatus === 'CANCELLED' || o.orderStatus === 'RETURNED' || o.orderStatus === 'FAILED').length,
    };

    let filtered = [...memoryOrders];

    // Search filter
    if (params.searchQuery && params.searchQuery.trim().length > 0) {
      const q = params.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.shipment?.awbNumber && o.shipment.awbNumber.toLowerCase().includes(q)) ||
          o.items.some(i => i.name.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q)))
      );
    }

    // Status filter
    if (params.orderStatus && params.orderStatus !== 'ALL') {
      filtered = filtered.filter(o => o.orderStatus === params.orderStatus);
    }

    // Payment Status filter
    if (params.paymentStatus && params.paymentStatus !== 'ALL') {
      filtered = filtered.filter(o => o.paymentStatus === params.paymentStatus);
    }

    // Courier partner filter
    if (params.courierPartner && params.courierPartner !== 'ALL') {
      filtered = filtered.filter(o => o.shipment?.carrier === params.courierPartner);
    }

    // Date range filter
    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= start);
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt).getTime() <= end);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (params.sortBy) {
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'total_desc':
          return b.total - a.total;
        case 'total_asc':
          return a.total - b.total;
        case 'order_number':
          return a.orderNumber.localeCompare(b.orderNumber);
        case 'date_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const totalCount = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 50;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return { orders: paginated, totalCount, counts };
  }

  /**
   * Get single order by orderId or orderNumber
   */
  static getOrder(orderIdOrNumber: string): Order | null {
    this.loadStoredOrders();
    const clean = orderIdOrNumber.trim().toLowerCase();
    const match = memoryOrders.find(
      o => o.orderId.toLowerCase() === clean || o.orderNumber.toLowerCase() === clean
    );
    if (!match) return null;

    // Return normalized order with compatibility aliases
    const normalizedItems = match.items.map(i => ({
      ...i,
      productName: (i as any).productName || i.name,
      image: (i as any).image || i.mainImage,
      unitPrice: (i as any).unitPrice || i.price,
      totalPrice: (i as any).totalPrice || (i.price * i.quantity),
      size: (i as any).size || i.selectedBlouseSize,
    }));

    return {
      ...match,
      items: normalizedItems as any,
      timeline: match.events,
    };
  }


  /**
   * Create new order (e.g. from checkout)
   */
  static async createOrder(payload: {
    orderId?: string;
    orderNumber?: string;
    customerName: string;
    email?: string;
    customerEmail?: string;
    phone?: string;
    customerPhone?: string;
    shippingAddress: any;
    items: any[];
    subtotal: number;
    discount?: number;
    shipping?: number;
    shippingCost?: number;
    tax?: number;
    total: number;
    paymentMethod: string;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
    notes?: string;
  }): Promise<{ success: boolean; orderId: string; orderNumber: string; order: Order; error?: string }> {
    this.loadStoredOrders();

    // Idempotency check: if orderId or orderNumber already exists, return existing order
    if (payload.orderId || payload.orderNumber) {
      const existing = memoryOrders.find(
        o => (payload.orderId && o.orderId === payload.orderId) ||
             (payload.orderNumber && o.orderNumber === payload.orderNumber)
      );
      if (existing) {
        return {
          success: true,
          orderId: existing.orderId,
          orderNumber: existing.orderNumber,
          order: existing,
        };
      }
    }

    const timestamp = Date.now();
    const orderId = payload.orderId || `ORD-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`;
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = payload.orderNumber || `SR-${new Date().getFullYear()}-${randomSeq}`;

    const email = payload.email || payload.customerEmail || '';
    const phone = payload.phone || payload.customerPhone || '';
    const shipping = payload.shipping ?? payload.shippingCost ?? 0;

    // Normalize address structure
    const addr = payload.shippingAddress || {};
    const normalizedAddress: Order['shippingAddress'] = {
      fullName: addr.fullName || payload.customerName,
      mobile: addr.mobile || addr.phone || phone,
      email: addr.email || email,
      addressLine1: addr.addressLine1 || addr.line1 || '',
      addressLine2: addr.addressLine2 || addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || addr.postalCode || addr.zip || '',
      country: addr.country || 'India',
    };

    // Normalize items
    const normalizedItems: OrderItem[] = (payload.items || []).map((item, idx) => ({
      productId: item.productId || `item-${idx + 1}`,
      sku: item.sku || `SKU-${idx + 1}`,
      name: item.name || item.productName || 'Handcrafted Luxury Saree',
      price: item.price ?? item.unitPrice ?? 0,
      selectedBlouseSize: item.selectedBlouseSize || item.size || 'Unstitched',
      quantity: item.quantity || 1,
      quantityPacked: 0,
      mainImage: item.mainImage || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    }));

    const newOrder: Order = {
      orderId,
      orderNumber,
      customerName: payload.customerName,
      email,
      phone,
      shippingAddress: normalizedAddress,
      items: normalizedItems,
      subtotal: payload.subtotal,
      discount: payload.discount || 0,
      shipping,
      tax: payload.tax || 0,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus || (payload.paymentMethod === 'cod' ? 'COD_PENDING' : 'PENDING'),
      orderStatus: payload.orderStatus || 'PLACED',
      packingChecklist: {
        productColorVerified: false,
        quantityVerified: false,
        qualityInspectionPassed: false,
        packagingCompleted: false,
        shippingLabelAttached: false,
      },
      notes: payload.notes,
      internalNotes: [],
      events: [
        {
          eventId: `evt_${Date.now()}_1`,
          orderId,
          eventType: 'ORDER_PLACED',
          title: 'Order Placed',
          description: `Order #${orderNumber} placed for ${payload.customerName}.`,
          source: 'customer',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryOrders.unshift(newOrder);
    this.persistOrders();

    // Trigger Order Placed Transactional Notification
    await NotificationService.triggerNotification('ORDER_PLACED', newOrder);

    return { success: true, orderId, orderNumber, order: newOrder };
  }

  /**
   * Helper: confirm payment transition
   */
  static async confirmPayment(
    orderId: string,
    transactionId: string,
    gateway: string = 'Payment Gateway',
    actor: string = 'Payment Webhook'
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.paymentStatus = 'PAID';
    order.paymentReference = transactionId;
    order.paidAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    // Advance to CONFIRMED if placed
    if (order.orderStatus === 'PLACED') {
      order.orderStatus = 'CONFIRMED';
    }

    const payEvent: OrderEvent = {
      eventId: `evt_${Date.now()}_pay_conf`,
      orderId: order.orderId,
      eventType: 'PAYMENT_CONFIRMED',
      title: 'Payment Confirmed',
      description: `Payment of ${order.currency || 'INR'} ${order.total} confirmed via ${gateway}. Reference: ${transactionId}`,
      source: 'system',
      actor,
      timestamp: new Date().toISOString(),
    };
    order.events.push(payEvent);
    this.persistOrders();

    await NotificationService.triggerNotification('PAYMENT_CONFIRMED', order);
    return { success: true, order };
  }

  /**
   * Helper: mark order packed with checklist validation
   */
  static async markOrderPacked(params: {
    orderId: string;
    checklistProgress: {
      verifyProductAndColor: boolean;
      verifyQuantity: boolean;
      qualityInspection: boolean;
      packagingCompleted: boolean;
      labelAttached: boolean;
    };
    overrideReason?: string;
    packedBy?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    return this.updatePackingChecklist(
      params.orderId,
      {
        productColorVerified: params.checklistProgress.verifyProductAndColor,
        quantityVerified: params.checklistProgress.verifyQuantity,
        qualityInspectionPassed: params.checklistProgress.qualityInspection,
        packagingCompleted: params.checklistProgress.packagingCompleted,
        shippingLabelAttached: params.checklistProgress.labelAttached,
        overrideReason: params.overrideReason,
      },
      true,
      params.packedBy || 'Fulfilment Staff'
    );
  }

  /**
   * Helper: record tracking / timeline event
   */
  static async addTimelineEvent(
    orderId: string,
    eventData: {
      eventType: any;
      title: string;
      description: string;
      location?: string;
      actor?: string;
      source?: 'admin' | 'carrier_webhook' | 'system';
    }
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    return this.recordTrackingEvent(orderId, eventData);
  }

  /**
   * Helper: verify and track order securely
   */
  static verifyAndTrackOrder(orderNumber: string, phoneOrEmail: string): {
    success: boolean;
    order?: Order;
    tracking?: any;
    error?: string;
  } {
    const order = this.lookupOrderSecurely(orderNumber, phoneOrEmail);
    if (!order) {
      return { success: false, error: 'Order not found or contact verification failed.' };
    }
    return {
      success: true,
      order,
      tracking: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        courierPartner: order.shipment?.carrier,
        awbNumber: order.shipment?.awbNumber,
        trackingUrl: order.shipment?.trackingUrl,
        estimatedDelivery: order.shipment?.estimatedDelivery,
        events: order.events,
      },
    };
  }

  /**
   * State Machine Transition Validator
   */
  static isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
    if (current === next) return true;

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PLACED: ['CONFIRMED', 'CANCELLED', 'FAILED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['PACKED', 'CANCELLED'],
      PACKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
      DELIVERED: ['RETURN_REQUESTED'],
      RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
      RETURNED: [],
      CANCELLED: [],
      FAILED: ['PLACED'],
    };

    const allowed = allowedTransitions[current] || [];
    return allowed.includes(next);
  }

  /**
   * Update Order Status with strict validation and audit event
   */
  static async updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    actor: string = 'Admin Staff',
    reason?: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    if (!this.isValidTransition(order.orderStatus, nextStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${order.orderStatus} to ${nextStatus}.`,
      };
    }

    // Require valid shipment before dispatching
    if (nextStatus === 'SHIPPED') {
      if (!order.shipment || !order.shipment.carrier || !order.shipment.awbNumber) {
        return {
          success: false,
          error: 'Cannot mark as Shipped: Carrier and AWB tracking details must be saved first.',
        };
      }
    }

    order.orderStatus = nextStatus;
    order.updatedAt = new Date().toISOString();

    let eventType: any = 'MANUAL_UPDATE';
    let title = `Status Updated to ${nextStatus}`;
    let desc = `Order status transitioned from ${order.orderStatus} to ${nextStatus}. ${reason ? 'Reason: ' + reason : ''}`;

    if (nextStatus === 'CONFIRMED') {
      eventType = 'ORDER_CONFIRMED';
      title = 'Order Confirmed';
    } else if (nextStatus === 'PACKED') {
      eventType = 'ORDER_PACKED';
      title = 'Order Packed';
    } else if (nextStatus === 'SHIPPED') {
      eventType = 'SHIPMENT_DISPATCHED';
      title = `Dispatched via ${order.shipment?.carrier}`;
      desc = `Parcel in transit. AWB: ${order.shipment?.awbNumber}`;
    } else if (nextStatus === 'OUT_FOR_DELIVERY') {
      eventType = 'OUT_FOR_DELIVERY';
      title = 'Out For Delivery';
    } else if (nextStatus === 'DELIVERED') {
      eventType = 'DELIVERED';
      title = 'Order Delivered';
      order.deliveredAt = new Date().toISOString();
    } else if (nextStatus === 'CANCELLED') {
      eventType = 'ORDER_CANCELLED';
      title = 'Order Cancelled';
    }

    const newEvent: OrderEvent = {
      eventId: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: order.orderId,
      shipmentId: order.shipment?.shipmentId,
      eventType,
      title,
      description: desc,
      source: 'admin',
      actor,
      timestamp: new Date().toISOString(),
    };

    order.events.push(newEvent);
    this.persistOrders();

    // Trigger matching email notification
    if (eventType !== 'MANUAL_UPDATE') {
      await NotificationService.triggerNotification(eventType, order, { shipment: order.shipment, reason });
    }

    return { success: true, order };
  }

  /**
   * Update Payment Status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    reference?: string,
    actor: string = 'Admin Staff'
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.paymentStatus = paymentStatus;
    if (reference) order.paymentReference = reference;
    order.updatedAt = new Date().toISOString();

    const newEvent: OrderEvent = {
      eventId: `evt_${Date.now()}_pay`,
      orderId: order.orderId,
      eventType: paymentStatus === 'PAID' ? 'PAYMENT_CONFIRMED' : 'MANUAL_UPDATE',
      title: `Payment ${paymentStatus}`,
      description: `Payment status set to ${paymentStatus}. ${reference ? 'Reference: ' + reference : ''}`,
      source: 'admin',
      actor,
      timestamp: new Date().toISOString(),
    };

    order.events.push(newEvent);
    this.persistOrders();

    if (paymentStatus === 'PAID') {
      await NotificationService.triggerNotification('PAYMENT_CONFIRMED', order);
    }

    return { success: true, order };
  }

  /**
   * Update Packing Checklist and optionally transition to PACKED
   */
  static async updatePackingChecklist(
    orderId: string,
    checklistData: Partial<PackingChecklist>,
    markAsPacked: boolean = false,
    actor: string = 'Admin Staff'
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.packingChecklist = { ...order.packingChecklist, ...checklistData };
    order.updatedAt = new Date().toISOString();

    if (markAsPacked) {
      const chk = order.packingChecklist;
      const allPassed =
        chk.productColorVerified &&
        chk.quantityVerified &&
        chk.qualityInspectionPassed &&
        chk.packagingCompleted &&
        chk.shippingLabelAttached;

      if (!allPassed && (!chk.overrideReason || chk.overrideReason.trim().length === 0)) {
        return {
          success: false,
          error: 'All 5 packing checks must pass, or an authorized override reason must be provided.',
        };
      }

      order.packingChecklist.packedBy = actor;
      order.packingChecklist.packedAt = new Date().toISOString();
      order.items = order.items.map(i => ({ ...i, quantityPacked: i.quantity }));
      order.orderStatus = 'PACKED';

      const event: OrderEvent = {
        eventId: `evt_${Date.now()}_pack`,
        orderId: order.orderId,
        eventType: 'ORDER_PACKED',
        title: 'Packing Checklist Complete',
        description: chk.overrideReason
          ? `Marked packed with supervisor override. Reason: ${chk.overrideReason}`
          : 'All 5 quality checks passed and luxury packaging sealed.',
        source: 'admin',
        actor,
        timestamp: new Date().toISOString(),
      };
      order.events.push(event);

      await NotificationService.triggerNotification('ORDER_PACKED', order);
    }

    this.persistOrders();
    return { success: true, order };
  }

  /**
   * Create or update Shipment & optionally dispatch
   */
  static async createOrUpdateShipment(
    orderId: string,
    shipmentInput: {
      carrier: string;
      shippingService?: string;
      awbNumber: string;
      trackingUrl?: string;
      weight?: string;
      dimensions?: string;
      parcelsCount?: number;
      shippingFee?: number;
      estimatedDelivery?: string;
      fulfilmentNotes?: string;
      dispatchNow?: boolean;
    },
    actor: string = 'Admin Staff'
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const validation = ShipmentService.validateShipment(shipmentInput.carrier, shipmentInput.awbNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const trackingUrl = ShipmentService.buildTrackingUrl(
      shipmentInput.carrier,
      shipmentInput.awbNumber,
      shipmentInput.trackingUrl
    );

    const nowIso = new Date().toISOString();
    const isDispatch = shipmentInput.dispatchNow || order.orderStatus === 'PACKED';

    const shipment: Shipment = {
      shipmentId: order.shipment?.shipmentId || `SHIP-${Date.now().toString().slice(-4)}`,
      orderId: order.orderId,
      carrier: shipmentInput.carrier.trim(),
      shippingService: shipmentInput.shippingService?.trim() || 'Express',
      awbNumber: shipmentInput.awbNumber.trim(),
      trackingUrl,
      weight: shipmentInput.weight || '1.2 kg',
      dimensions: shipmentInput.dimensions || '38 x 28 x 8 cm',
      parcelsCount: shipmentInput.parcelsCount || 1,
      shippingFee: shipmentInput.shippingFee || 0,
      dispatchDate: isDispatch ? nowIso : undefined,
      estimatedDelivery: shipmentInput.estimatedDelivery,
      status: isDispatch ? 'DISPATCHED' : 'READY_TO_DISPATCH',
      fulfilmentNotes: shipmentInput.fulfilmentNotes,
      createdAt: order.shipment?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    order.shipment = shipment;
    order.updatedAt = nowIso;

    if (isDispatch) {
      order.orderStatus = 'SHIPPED';
      const event: OrderEvent = {
        eventId: `evt_${Date.now()}_disp`,
        orderId: order.orderId,
        shipmentId: shipment.shipmentId,
        eventType: 'SHIPMENT_DISPATCHED',
        title: `Dispatched with ${shipment.carrier}`,
        description: `AWB: ${shipment.awbNumber}. Parcel handed over to courier partner.`,
        source: 'admin',
        actor,
        timestamp: nowIso,
      };
      order.events.push(event);

      // Trigger high-priority Dispatch Email Notification
      await NotificationService.triggerNotification('SHIPMENT_DISPATCHED', order, { shipment });
    }

    this.persistOrders();
    return { success: true, order };
  }

  /**
   * Record manual shipment tracking event
   */
  static async recordTrackingEvent(
    orderId: string,
    eventData: {
      eventType: any;
      title: string;
      description: string;
      location?: string;
      actor?: string;
    }
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const event: OrderEvent = {
      eventId: `evt_${Date.now()}_trk`,
      orderId: order.orderId,
      shipmentId: order.shipment?.shipmentId,
      eventType: eventData.eventType,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      source: 'admin',
      actor: eventData.actor || 'Logistics Admin',
      timestamp: new Date().toISOString(),
    };

    order.events.push(event);

    // If event corresponds to lifecycle progression
    if (eventData.eventType === 'OUT_FOR_DELIVERY') {
      order.orderStatus = 'OUT_FOR_DELIVERY';
      if (order.shipment) order.shipment.status = 'OUT_FOR_DELIVERY';
      await NotificationService.triggerNotification('OUT_FOR_DELIVERY', order, { shipment: order.shipment });
    } else if (eventData.eventType === 'DELIVERED') {
      order.orderStatus = 'DELIVERED';
      if (order.shipment) order.shipment.status = 'DELIVERED';
      await NotificationService.triggerNotification('DELIVERED', order, { shipment: order.shipment });
    }

    order.updatedAt = new Date().toISOString();
    this.persistOrders();
    return { success: true, order };
  }

  /**
   * Add internal staff note
   */
  static addInternalNote(orderId: string, noteText: string, author: string): { success: boolean; order?: Order; error?: string } {
    this.loadStoredOrders();
    const order = memoryOrders.find(o => o.orderId === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const newNote: InternalNote = {
      id: `note_${Date.now()}`,
      author,
      note: noteText.trim(),
      createdAt: new Date().toISOString(),
    };

    order.internalNotes.unshift(newNote);
    order.updatedAt = new Date().toISOString();
    this.persistOrders();
    return { success: true, order };
  }

  /**
   * Secure Guest / Customer Tracking Lookup
   * Prevents leaking order details to unauthorized parties:
   * Requires matching orderNumber AND either phone or email.
   */
  static lookupOrderSecurely(orderNumber: string, phoneOrEmail: string): Order | null {
    this.loadStoredOrders();
    if (!orderNumber || !phoneOrEmail) return null;

    const cleanNum = orderNumber.trim().toLowerCase();
    const cleanContact = phoneOrEmail.trim().toLowerCase().replace(/[\s\-\+]/g, '');

    const match = memoryOrders.find(o => {
      const matchNum = o.orderNumber.toLowerCase() === cleanNum || o.orderId.toLowerCase() === cleanNum;
      if (!matchNum) return false;

      const normPhone = o.phone.replace(/[\s\-\+]/g, '');
      const normAddressPhone = o.shippingAddress.mobile.replace(/[\s\-\+]/g, '');
      const matchEmail = o.email.toLowerCase() === cleanContact || o.shippingAddress.email.toLowerCase() === cleanContact;
      const matchPhone = normPhone.includes(cleanContact) || normAddressPhone.includes(cleanContact);

      return matchEmail || matchPhone;
    });

    if (!match) return null;

    // Strict boundary: Never return internal staff notes in public lookup
    const sanitized: Order = {
      ...match,
      internalNotes: [],
    };

    return sanitized;
  }

  /**
   * Export orders to CSV string
   */
  static exportOrdersCSV(ordersToExport?: Order[]): string {
    const list = ordersToExport || memoryOrders;
    const headers = [
      'Order Number',
      'Order ID',
      'Order Date',
      'Customer Name',
      'Email',
      'Mobile',
      'Items Count',
      'Subtotal',
      'Discount',
      'Total (INR)',
      'Payment Method',
      'Payment Status',
      'Fulfilment Status',
      'Courier Partner',
      'AWB Number',
      'City',
      'State',
      'Pincode',
    ];

    const rows = list.map(o => [
      `"${o.orderNumber}"`,
      `"${o.orderId}"`,
      `"${new Date(o.createdAt).toLocaleDateString('en-IN')}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.email}"`,
      `"${o.phone}"`,
      o.items.length,
      o.subtotal,
      o.discount,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.shipment?.carrier || 'Unassigned'}"`,
      `"${o.shipment?.awbNumber || 'None'}"`,
      `"${o.shippingAddress.city}"`,
      `"${o.shippingAddress.state}"`,
      `"${o.shippingAddress.pincode}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Customer account orders list adapter
   */
  static async getCustomerOrders(email?: string): Promise<any[]> {
    this.loadStoredOrders();
    let orders = [...memoryOrders];
    if (email) {
      orders = orders.filter(o => o.email.toLowerCase() === email.toLowerCase());
    }
    // Return sanitized CustomerOrder shape
    return orders.map(o => ({
      orderId: o.orderId,
      customerId: o.customerId,
      orderNumber: o.orderNumber,
      items: o.items.map(i => ({
        productId: i.productId,
        productName: i.name,
        image: i.mainImage,
        size: i.selectedBlouseSize,
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: i.price * i.quantity,
      })),
      subtotal: o.subtotal,
      shipping: o.shipping,
      discount: o.discount,
      tax: o.tax,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      shippingAddress: {
        addressId: 'addr_' + o.orderId,
        customerId: o.customerId || 'guest',
        type: 'Home' as const,
        name: o.shippingAddress.fullName,
        phone: o.shippingAddress.mobile,
        line1: o.shippingAddress.addressLine1,
        line2: o.shippingAddress.addressLine2,
        city: o.shippingAddress.city,
        state: o.shippingAddress.state,
        pincode: o.shippingAddress.pincode,
        country: o.shippingAddress.country,
        isDefault: true,
      },
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  /**
   * Real tracking info adapter mapped directly from order events & shipment
   */
  static async getTracking(orderIdOrNumber: string): Promise<any | null> {
    const order = this.getOrder(orderIdOrNumber);
    if (!order) return null;

    const carrier = order.shipment?.carrier || 'Express Courier';
    const trackingNumber = order.shipment?.awbNumber || 'Assigned';
    const estimatedDelivery = order.shipment?.estimatedDelivery;

    // Convert chronological order events into TrackingEvent format
    const events = (order.events || []).map((e) => ({
      eventId: e.eventId,
      status: order.orderStatus,
      label: e.title,
      description: e.description,
      timestamp: e.timestamp,
      location: e.location || (e.source === 'admin' ? 'Atelier Dispatch Hub' : undefined),
      completed: true,
    }));

    return {
      carrier,
      trackingNumber,
      estimatedDelivery,
      events,
    };
  }

  /**
   * Secure guest tracking adapter
   */
  static async trackGuestOrder(
    orderNumber: string,
    phoneOrEmail: string
  ): Promise<{ order: any; tracking: any } | null> {
    const order = this.lookupOrderSecurely(orderNumber, phoneOrEmail);
    if (!order) return null;

    const tracking = await this.getTracking(order.orderNumber);

    const customerOrder = {
      orderId: order.orderId,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      items: order.items.map(i => ({
        productId: i.productId,
        productName: i.name,
        image: i.mainImage,
        size: i.selectedBlouseSize,
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: i.price * i.quantity,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      shippingAddress: {
        addressId: 'addr_' + order.orderId,
        customerId: order.customerId || 'guest',
        type: 'Home' as const,
        name: order.shippingAddress.fullName,
        phone: order.shippingAddress.mobile,
        line1: order.shippingAddress.addressLine1,
        line2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        country: order.shippingAddress.country,
        isDefault: true,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return {
      order: customerOrder,
      tracking: tracking || {
        carrier: 'Express Courier',
        trackingNumber: 'Pending Assignment',
        events: [],
      },
    };
  }
}

