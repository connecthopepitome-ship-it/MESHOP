import { Customer, Address, CustomerOrder, TrackingInfo } from '@/types/customer';

// ============================================================================
// DEVELOPMENT ONLY MOCKS
// DO NOT USE IN PRODUCTION
// ============================================================================

export const MOCK_CUSTOMER: Customer = {
  customerId: 'cust_12345',
  name: 'Aanya Sharma',
  email: 'aanya.sharma@example.com',
  phone: '+919876543210',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_ADDRESSES: Address[] = [
  {
    addressId: 'addr_1',
    customerId: 'cust_12345',
    type: 'Home',
    name: 'Aanya Sharma',
    phone: '+919876543210',
    line1: 'A-402, Lotus Apartments',
    line2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    country: 'India',
    isDefault: true,
  },
];

export const MOCK_ORDERS: CustomerOrder[] = [
  {
    orderId: 'ord_1',
    customerId: 'cust_12345',
    orderNumber: 'SR-2026-0012',
    items: [
      {
        productId: 'prod_1',
        productName: 'Midnight Navy French Chiffon Sequin',
        image: '/images/fabrics/chiffon.jpg',
        quantity: 1,
        unitPrice: 4999,
        totalPrice: 4999,
      }
    ],
    subtotal: 4999,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 4999,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    shippingAddress: MOCK_ADDRESSES[0],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'ord_2',
    customerId: 'cust_12345',
    orderNumber: 'SR-2026-0008',
    items: [
      {
        productId: 'prod_2',
        productName: 'Ivory Indigo Linen Ajrakh',
        image: '/images/fabrics/chanderi.jpg',
        quantity: 1,
        unitPrice: 3499,
        totalPrice: 3499,
      }
    ],
    subtotal: 3499,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 3499,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    shippingAddress: MOCK_ADDRESSES[0],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_TRACKING: TrackingInfo = {
  carrier: 'BlueDart Express',
  trackingNumber: 'BD123456789IN',
  estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  events: [
    {
      eventId: 'ev_1',
      status: 'PLACED',
      label: 'Order Placed',
      description: 'We have received your order.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true,
    },
    {
      eventId: 'ev_2',
      status: 'CONFIRMED',
      label: 'Order Confirmed',
      description: 'Your order has been verified and confirmed.',
      timestamp: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
      completed: true,
    },
    {
      eventId: 'ev_3',
      status: 'PACKED',
      label: 'Packed',
      description: 'Your saree has been quality checked and packed securely.',
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      completed: true,
    },
    {
      eventId: 'ev_4',
      status: 'SHIPPED',
      label: 'Shipped',
      description: 'Your order has been handed over to our courier partner.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      location: 'Mumbai Facility',
      completed: true,
    },
    {
      eventId: 'ev_5',
      status: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      description: 'Your order is out for delivery today.',
      timestamp: new Date().toISOString(),
      completed: false,
    },
    {
      eventId: 'ev_6',
      status: 'DELIVERED',
      label: 'Delivered',
      description: 'Your order has been delivered.',
      timestamp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
    }
  ]
};
