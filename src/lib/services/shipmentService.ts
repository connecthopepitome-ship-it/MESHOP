import {
  Shipment,
  OrderEvent,
  OrderStatus,
  ShipmentStatus,
  ShippingSettings,
  CourierPartnerConfig,
} from '@/types/orders';

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 2999,
  standardShippingFee: 150,
  expressShippingFee: 350,
  defaultWeight: '1.2 kg',
  defaultDimensions: '38 x 28 x 8 cm',
  courierPartners: [
    {
      id: 'bluedart',
      name: 'Blue Dart Express',
      trackingUrlTemplate: 'https://www.bluedart.com/tracking?track={AWB}',
      active: true,
      defaultService: 'Apex Air',
    },
    {
      id: 'delhivery',
      name: 'Delhivery',
      trackingUrlTemplate: 'https://www.delhivery.com/track/package/{AWB}',
      active: true,
      defaultService: 'Express Surface',
    },
    {
      id: 'dtdc',
      name: 'DTDC Courier',
      trackingUrlTemplate: 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno={AWB}',
      active: true,
      defaultService: 'Priority',
    },
    {
      id: 'shiprocket',
      name: 'Shiprocket',
      trackingUrlTemplate: 'https://shiprocket.co/tracking/{AWB}',
      active: true,
      defaultService: 'Standard',
    },
    {
      id: 'indiapost',
      name: 'Speed Post (India Post)',
      trackingUrlTemplate: 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx?consNo={AWB}',
      active: true,
      defaultService: 'Speed Post',
    },
  ],
};

const SETTINGS_STORAGE_KEY = 'sorayva_shipping_settings_v1';

let memorySettings: ShippingSettings = { ...DEFAULT_SHIPPING_SETTINGS };

export class ShipmentService {
  private static loadSettings(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          memorySettings = { ...DEFAULT_SHIPPING_SETTINGS, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn('Failed to load shipping settings:', e);
      }
    }
  }

  static getShippingSettings(): ShippingSettings {
    this.loadSettings();
    return { ...memorySettings };
  }

  static saveShippingSettings(settings: Partial<ShippingSettings>): ShippingSettings {
    this.loadSettings();
    memorySettings = { ...memorySettings, ...settings };
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(memorySettings));
    }
    return { ...memorySettings };
  }

  /**
   * Helper to resolve tracking URL based on carrier name and AWB
   */
  static buildTrackingUrl(carrier: string, awb: string, customUrl?: string): string {
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim();
    }
    const settings = this.getShippingSettings();
    const matchedPartner = settings.courierPartners.find(
      p => p.name.toLowerCase().includes(carrier.toLowerCase()) || carrier.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matchedPartner && matchedPartner.trackingUrlTemplate) {
      return matchedPartner.trackingUrlTemplate.replace('{AWB}', encodeURIComponent(awb.trim()));
    }
    return `https://sorayva.com/track-order?id=${encodeURIComponent(awb.trim())}`;
  }

  /**
   * Validates shipment payload before dispatch
   */
  static validateShipment(carrier: string, awbNumber: string): { valid: boolean; error?: string } {
    if (!carrier || carrier.trim().length === 0) {
      return { valid: false, error: 'Carrier partner is required for shipment dispatch.' };
    }
    if (!awbNumber || awbNumber.trim().length === 0) {
      return { valid: false, error: 'AWB / Tracking number is required for shipment dispatch.' };
    }
    return { valid: true };
  }
}
