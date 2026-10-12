import {
  NotificationRecord,
  Order,
  Shipment,
  OrderEventType,
  NotificationPreferences,
  EmailTemplatePreview,
} from '@/types/orders';
import { emailProvider } from './emailProvider';
import {
  generateOrderPlacedEmail,
  generatePaymentConfirmedEmail,
  generateOrderPackedEmail,
  generateOrderDispatchedEmail,
  generateOutForDeliveryEmail,
  generateOrderDeliveredEmail,
  generateOrderCancelledEmail,
} from './emailTemplates';

const NOTIFICATIONS_STORAGE_KEY = 'sorayva_notifications_outbox_v1';
const PREFERENCES_STORAGE_KEY = 'sorayva_notification_preferences_v1';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  senderName: 'SORAYVA Concierge',
  senderEmail: 'orders@sorayva.com',
  supportEmail: 'concierge@sorayva.com',
  notifyOrderPlaced: true,
  notifyPaymentConfirmed: true,
  notifyOrderPacked: true,
  notifyShipmentDispatched: true,
  notifyShipmentMovement: true,
  notifyOutForDelivery: true,
  notifyDelivered: true,
  notifyCancelled: true,
};

// In-memory cache for server & edge runtimes
let memoryOutbox: NotificationRecord[] = [];
let memoryPreferences: NotificationPreferences = { ...DEFAULT_PREFERENCES };

export class NotificationService {
  private static loadStoredData(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedOutbox = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedOutbox) {
          memoryOutbox = JSON.parse(storedOutbox);
        }
        const storedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (storedPrefs) {
          memoryPreferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(storedPrefs) };
        }
      } catch (e) {
        console.warn('Failed to load notification storage:', e);
      }
    }
  }

  private static persistOutbox(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(memoryOutbox));
      } catch (e) {
        console.warn('Failed to persist outbox to localStorage:', e);
      }
    }
  }

  static getPreferences(): NotificationPreferences {
    this.loadStoredData();
    return { ...memoryPreferences };
  }

  static savePreferences(prefs: Partial<NotificationPreferences>): NotificationPreferences {
    this.loadStoredData();
    memoryPreferences = { ...memoryPreferences, ...prefs };
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(memoryPreferences));
    }
    return { ...memoryPreferences };
  }

  static getNotifications(orderId?: string): NotificationRecord[] {
    this.loadStoredData();
    if (orderId) {
      return memoryOutbox.filter(n => n.orderId === orderId);
    }
    return [...memoryOutbox].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getNotificationById(id: string): NotificationRecord | undefined {
    this.loadStoredData();
    return memoryOutbox.find(n => n.notificationId === id);
  }

  /**
   * Render template preview for any supported event type
   */
  static renderTemplatePreview(eventType: OrderEventType, order: Order, shipment?: Shipment): EmailTemplatePreview {
    switch (eventType) {
      case 'ORDER_PLACED':
        return generateOrderPlacedEmail(order);
      case 'PAYMENT_CONFIRMED':
        return generatePaymentConfirmedEmail(order);
      case 'ORDER_PACKED':
      case 'QUALITY_CHECK_COMPLETE':
        return generateOrderPackedEmail(order);
      case 'SHIPMENT_DISPATCHED':
      case 'IN_TRANSIT':
        return generateOrderDispatchedEmail(order, shipment || order.shipment);
      case 'OUT_FOR_DELIVERY':
        return generateOutForDeliveryEmail(order, shipment || order.shipment);
      case 'DELIVERED':
        return generateOrderDeliveredEmail(order, shipment || order.shipment);
      case 'ORDER_CANCELLED':
        return generateOrderCancelledEmail(order);
      default:
        return generateOrderPlacedEmail(order);
    }
  }

  /**
   * Alias helper for previewing notification template
   */
  static previewNotificationTemplate(eventType: OrderEventType, order: Order, shipment?: Shipment): EmailTemplatePreview & { html: string; text: string } {
    const preview = this.renderTemplatePreview(eventType, order, shipment);
    return {
      ...preview,
      html: preview.htmlContent,
      text: preview.plainText,
    };
  }

  /**
   * Primary entry point for transactional notifications with idempotency protection.
   */
  static async triggerNotification(
    eventType: OrderEventType,
    order: Order,
    metadata?: { shipment?: Shipment; reason?: string }
  ): Promise<{ queued: boolean; notification: NotificationRecord; duplicate?: boolean }> {
    this.loadStoredData();
    const prefs = this.getPreferences();

    // Check configuration preferences
    if (eventType === 'ORDER_PLACED' && !prefs.notifyOrderPlaced) {
      return { queued: false, notification: null as any };
    }
    if (eventType === 'PAYMENT_CONFIRMED' && !prefs.notifyPaymentConfirmed) {
      return { queued: false, notification: null as any };
    }
    if (eventType === 'ORDER_PACKED' && !prefs.notifyOrderPacked) {
      return { queued: false, notification: null as any };
    }
    if (eventType === 'SHIPMENT_DISPATCHED' && !prefs.notifyShipmentDispatched) {
      return { queued: false, notification: null as any };
    }
    if (eventType === 'OUT_FOR_DELIVERY' && !prefs.notifyOutForDelivery) {
      return { queued: false, notification: null as any };
    }
    if (eventType === 'DELIVERED' && !prefs.notifyDelivered) {
      return { queued: false, notification: null as any };
    }
    if (eventType === 'ORDER_CANCELLED' && !prefs.notifyCancelled) {
      return { queued: false, notification: null as any };
    }

    // Build unique idempotency key
    const idempotencyKey = `${order.orderId}:${eventType}${metadata?.shipment?.awbNumber ? ':' + metadata.shipment.awbNumber : ''}`;

    // Check for existing notification with this idempotency key
    const existing = memoryOutbox.find(n => n.idempotencyKey === idempotencyKey);
    if (existing) {
      return { queued: false, notification: existing, duplicate: true };
    }

    const template = this.renderTemplatePreview(eventType, order, metadata?.shipment);
    const notificationId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const newRecord: NotificationRecord = {
      notificationId,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      recipient: order.email,
      eventType,
      templateId: template.templateId,
      subject: template.subject,
      deliveryStatus: 'QUEUED',
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    memoryOutbox.unshift(newRecord);
    this.persistOutbox();

    // Attempt delivery via configured provider
    const sendResult = await emailProvider.sendEmail({
      to: order.email,
      subject: template.subject,
      html: template.htmlContent,
      text: template.plainText,
      idempotencyKey,
    });

    newRecord.attempts += 1;
    newRecord.lastAttemptAt = new Date().toISOString();

    if (sendResult.success) {
      newRecord.deliveryStatus = 'SENT';
      newRecord.sentAt = new Date().toISOString();
      newRecord.providerReference = sendResult.messageId;
      newRecord.errorDetails = undefined;
    } else {
      newRecord.deliveryStatus = 'FAILED';
      newRecord.errorDetails = sendResult.error || 'Provider rejected notification';
    }

    this.persistOutbox();
    return { queued: true, notification: newRecord };
  }

  /**
   * Retry a failed notification from Admin centre.
   */
  static async retryNotification(notificationId: string): Promise<{ success: boolean; notification?: NotificationRecord; error?: string }> {
    this.loadStoredData();
    const record = memoryOutbox.find(n => n.notificationId === notificationId);
    if (!record) {
      return { success: false, error: 'Notification record not found' };
    }

    record.deliveryStatus = 'SENDING';
    record.attempts += 1;
    record.lastAttemptAt = new Date().toISOString();
    this.persistOutbox();

    const sendResult = await emailProvider.sendEmail({
      to: record.recipient,
      subject: record.subject,
      html: `<p>Notification retry for ${record.subject}</p>`,
      text: `Notification retry for ${record.subject}`,
      idempotencyKey: `${record.idempotencyKey}:retry-${record.attempts}`,
    });

    if (sendResult.success) {
      record.deliveryStatus = 'SENT';
      record.sentAt = new Date().toISOString();
      record.providerReference = sendResult.messageId;
      record.errorDetails = undefined;
      this.persistOutbox();
      return { success: true, notification: record };
    } else {
      record.deliveryStatus = 'FAILED';
      record.errorDetails = sendResult.error || 'Retry attempt rejected by provider';
      this.persistOutbox();
      return { success: false, notification: record, error: record.errorDetails };
    }
  }

  /**
   * Send a test email to an authorized staff recipient
   */
  static async sendTestEmail(toEmail: string, templateId: OrderEventType): Promise<{ success: boolean; error?: string }> {
    const dummyOrder: Order = {
      orderId: 'TEST-ORDER-001',
      orderNumber: 'SR-TEST-2026',
      customerName: 'SORAYVA Test Recipient',
      email: toEmail,
      phone: '+91 98765 43210',
      shippingAddress: {
        fullName: 'SORAYVA Test Recipient',
        mobile: '+91 98765 43210',
        email: toEmail,
        addressLine1: '42 Heritage Atelier Boulevard',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
      },
      items: [
        {
          productId: 'SAR-TEST-1',
          sku: 'KANJ-TEST-GLD',
          name: 'Handcrafted Kanjeevaram Royal Silk Saree',
          price: 28500,
          quantity: 1,
          selectedBlouseSize: 'M (38)',
          mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        },
      ],
      subtotal: 28500,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 28500,
      paymentMethod: 'online_razorpay',
      paymentStatus: 'PAID',
      orderStatus: 'PLACED',
      packingChecklist: {
        productColorVerified: true,
        quantityVerified: true,
        qualityInspectionPassed: true,
        packagingCompleted: true,
        shippingLabelAttached: true,
      },
      internalNotes: [],
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const template = this.renderTemplatePreview(templateId, dummyOrder, {
      shipmentId: 'SHIP-TEST',
      orderId: dummyOrder.orderId,
      carrier: 'Blue Dart Express',
      awbNumber: 'BD-982341204',
      trackingUrl: 'https://sorayva.com/track-order?id=SR-TEST-2026',
      status: 'DISPATCHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const sendResult = await emailProvider.sendEmail({
      to: toEmail,
      subject: `[TEST PREVIEW] ${template.subject}`,
      html: template.htmlContent,
      text: template.plainText,
    });

    const testRecord: NotificationRecord = {
      notificationId: `NOTIF-TEST-${Date.now().toString(36).toUpperCase()}`,
      orderId: 'TEST-ORDER-001',
      orderNumber: 'SR-TEST-2026',
      recipient: toEmail,
      eventType: templateId,
      templateId: template.templateId,
      subject: `[TEST PREVIEW] ${template.subject}`,
      deliveryStatus: sendResult.success ? 'SENT' : 'FAILED',
      attempts: 1,
      maxAttempts: 1,
      idempotencyKey: `test:${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
      sentAt: sendResult.success ? new Date().toISOString() : undefined,
      errorDetails: sendResult.error,
      isTest: true,
    };

    memoryOutbox.unshift(testRecord);
    this.persistOutbox();

    return sendResult;
  }
}
