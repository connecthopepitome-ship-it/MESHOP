import { CustomerOrder, TrackingInfo } from '@/types/customer';
import { MOCK_ORDERS, MOCK_TRACKING } from './mocks/devMocks';
import { AuthService } from './AuthService';

export class OrderService {
  private static async delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getCustomerOrders(): Promise<CustomerOrder[]> {
    await this.delay();
    const user = await AuthService.getCurrentUser();
    if (!user) return [];
    
    return MOCK_ORDERS;
  }

  static async getOrder(orderIdOrNumber: string): Promise<CustomerOrder | null> {
    await this.delay();
    
    // Find in mocks
    const order = MOCK_ORDERS.find(o => o.orderId === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
    return order || null;
  }

  static async getTracking(orderIdOrNumber: string): Promise<TrackingInfo | null> {
    await this.delay(1000);
    
    // For mock, return the mock tracking if it's the first order
    if (orderIdOrNumber === 'ord_1' || orderIdOrNumber === 'SR-2026-0012') {
      return MOCK_TRACKING;
    }
    
    // Delivered order mock
    if (orderIdOrNumber === 'ord_2' || orderIdOrNumber === 'SR-2026-0008') {
      return {
        ...MOCK_TRACKING,
        events: MOCK_TRACKING.events.map(e => ({ ...e, completed: true }))
      };
    }
    
    return null;
  }
  
  // Method for guests to track orders without logging in
  static async trackGuestOrder(orderNumber: string, phoneOrEmail: string): Promise<{ order: CustomerOrder; tracking: TrackingInfo } | null> {
    await this.delay(1200);
    
    // Allow mock pass for SR-2026-0012
    if (orderNumber === 'SR-2026-0012') {
      return {
        order: MOCK_ORDERS[0],
        tracking: MOCK_TRACKING
      };
    }
    
    return null;
  }
}
