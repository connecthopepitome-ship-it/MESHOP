import { PaymentProvider } from '@/types';

export class MockRazorpayPaymentAdapter implements PaymentProvider {
  async processPayment(orderId: string, amount: number, currency: string, method: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulated server-side payment verification step
    await new Promise((res) => setTimeout(res, 800));
    if (method === 'cod') {
      return { success: true, transactionId: `COD-${Date.now()}` };
    }
    return {
      success: true,
      transactionId: `PAY_RAZOR_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    };
  }

  async verifyPayment(orderId: string, paymentSignature: string): Promise<boolean> {
    return paymentSignature.length > 5;
  }
}

export const defaultPaymentProvider: PaymentProvider = new MockRazorpayPaymentAdapter();
