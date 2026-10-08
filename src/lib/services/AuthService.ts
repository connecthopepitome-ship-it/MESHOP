import { Customer } from '@/types/customer';
import { MOCK_CUSTOMER } from './mocks/devMocks';

// ============================================================================
// AUTHENTICATION SERVICE ABSTRACTION
// Connects to Firebase Auth or similar in the future.
// ============================================================================

export class AuthService {
  // Simulate delay for realism
  private static async delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getCurrentUser(): Promise<Customer | null> {
    await this.delay(500);
    
    // For development UI testing, check local storage
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('meshop_auth_mock') === 'true';
      if (isAuth) {
        return MOCK_CUSTOMER;
      }
    }
    
    return null;
  }

  static async login(emailOrPhone: string, password?: string): Promise<{ success: boolean; error?: string }> {
    await this.delay(1200);
    
    // Accept any for mock
    if (emailOrPhone && typeof window !== 'undefined') {
      localStorage.setItem('meshop_auth_mock', 'true');
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  static async logout(): Promise<void> {
    await this.delay(500);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('meshop_auth_mock');
    }
  }

  static async sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    await this.delay(1000);
    return { success: true };
  }

  static async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
    await this.delay(1000);
    if (otp.length === 6) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('meshop_auth_mock', 'true');
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid OTP' };
  }

  static async sendPasswordReset(emailOrPhone: string): Promise<{ success: boolean; error?: string }> {
    await this.delay(1000);
    return { success: true };
  }

  static async signup(data: any): Promise<{ success: boolean; error?: string }> {
    await this.delay(1500);
    if (typeof window !== 'undefined') {
      localStorage.setItem('meshop_auth_mock', 'true');
    }
    return { success: true };
  }
}
