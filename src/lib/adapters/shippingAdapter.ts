import { ShippingProvider } from '@/types';

export class MockShiprocketShippingAdapter implements ShippingProvider {
  async calculateShipping(pincode: string, subtotal: number): Promise<{ cost: number; estimatedDays: string; servicable: boolean }> {
    // Valid 6-digit Indian PIN code regex check
    const cleanPin = pincode.trim();
    const isPinValid = /^[1-9][0-9]{5}$/.test(cleanPin);

    if (!isPinValid) {
      return { cost: 0, estimatedDays: 'Invalid PIN Code', servicable: false };
    }

    // Complimentary express shipping for orders >= INR 10,000
    const cost = subtotal >= 10000 ? 0 : 250;
    const estimatedDays = '3 - 5 Express Business Days';

    return { cost, estimatedDays, servicable: true };
  }

  async trackShipment(trackingNumber: string): Promise<{ status: string; history: Array<{ location: string; timestamp: string; note: string }> }> {
    return {
      status: 'In Transit',
      history: [
        { location: 'Kanchipuram Hub', timestamp: new Date(Date.now() - 172800000).toISOString(), note: 'Shipment picked up from artisan hub' },
        { location: 'Chennai Sorting Facility', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'In transit to destination city' },
        { location: 'Destination Regional Hub', timestamp: new Date().toISOString(), note: 'Out for delivery' },
      ],
    };
  }
}

export const defaultShippingProvider: ShippingProvider = new MockShiprocketShippingAdapter();
