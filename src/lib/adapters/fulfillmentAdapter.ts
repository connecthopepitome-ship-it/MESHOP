import { FulfillmentProvider, Order } from '@/types';

/**
 * Fulfillment Integration Boundary
 * Provider-agnostic abstraction ready for future approved fulfilment connectors.
 * Note: Automated marketplace web scraping, CAPTCHA solving, or credential bypass is strictly prohibited.
 */
export class ManualFulfillmentAdapter implements FulfillmentProvider {
  async createFulfillmentOrder(order: Order): Promise<{ fulfillmentId: string; status: string }> {
    const fulfillmentId = `FUL-MANUAL-${order.orderId}`;
    return {
      fulfillmentId,
      status: 'NEW',
    };
  }

  async getFulfillmentStatus(orderId: string): Promise<{ status: string; trackingNumber?: string }> {
    return {
      status: 'PROCESSING',
      trackingNumber: `TRACK-${orderId.slice(-6)}`,
    };
  }

  async getTracking(orderId: string): Promise<{ trackingUrl?: string; carrier?: string }> {
    return {
      trackingUrl: `https://track.shiprocket.in/${orderId}`,
      carrier: 'Shiprocket / Express Courier',
    };
  }
}

export const defaultFulfillmentProvider: FulfillmentProvider = new ManualFulfillmentAdapter();
