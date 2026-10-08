import { Customer, Address } from '@/types/customer';
import { MOCK_CUSTOMER, MOCK_ADDRESSES } from './mocks/devMocks';
import { AuthService } from './AuthService';

export class CustomerService {
  private static async delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getProfile(): Promise<Customer | null> {
    return AuthService.getCurrentUser();
  }

  static async updateProfile(data: Partial<Customer>): Promise<{ success: boolean; error?: string }> {
    await this.delay();
    return { success: true };
  }

  static async getAddresses(): Promise<Address[]> {
    await this.delay(600);
    const user = await AuthService.getCurrentUser();
    if (!user) return [];
    
    // For mock testing, return the mock array
    return MOCK_ADDRESSES;
  }

  static async addAddress(address: Omit<Address, 'addressId' | 'customerId'>): Promise<{ success: boolean; error?: string }> {
    await this.delay();
    return { success: true };
  }

  static async updateAddress(addressId: string, address: Partial<Address>): Promise<{ success: boolean; error?: string }> {
    await this.delay();
    return { success: true };
  }

  static async deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
    await this.delay();
    return { success: true };
  }
}
