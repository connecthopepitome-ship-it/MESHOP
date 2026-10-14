import { Customer, Address } from '@/types/customer';
import { getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Customer Profile and Address Service
 * Integrates with Cloud Firestore (collection: 'customers/{uid}') when configured.
 * Provides resilient, secure local persistence fallback keyed strictly by customer UID.
 * Supports both browser environments (localStorage) and server/test environments (memory store).
 * 
 * Never stores plaintext passwords, secret keys or payment details.
 */

const LOCAL_PROFILE_PREFIX = 'sorayva_cust_profile_';
const LOCAL_ADDRESSES_PREFIX = 'sorayva_cust_addresses_';

// In-memory fallback cache for server runtime and test environments
const memoryProfileStore = new Map<string, Customer>();
const memoryAddressStore = new Map<string, Address[]>();

export class CustomerService {
  /**
   * Fetch customer profile document by Firebase UID
   */
  static async getProfile(uid?: string): Promise<Customer | null> {
    if (!uid) return null;

    const db = getFirebaseFirestore();

    // 1. Try Firestore if configured
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, 'customers', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const profile: Customer = {
            customerId: uid,
            uid,
            name: data.displayName || data.name || '',
            displayName: data.displayName || data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            emailVerified: Boolean(data.emailVerified),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          memoryProfileStore.set(uid, profile);
          return profile;
        }
      } catch (err) {
        console.warn('Firestore read failed, falling back to local storage:', err);
      }
    }

    // 2. Fallback to resilient storage keyed strictly by UID
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${LOCAL_PROFILE_PREFIX}${uid}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const profile = {
            ...parsed,
            customerId: uid,
            uid,
          };
          memoryProfileStore.set(uid, profile);
          return profile;
        }
      } catch (e) {
        console.warn('Failed to parse local customer profile:', e);
      }
    }

    // 3. Fallback to in-memory store
    const inMem = memoryProfileStore.get(uid);
    if (inMem) {
      return { ...inMem, customerId: uid, uid };
    }

    return null;
  }

  /**
   * Create or update customer profile document in Firestore
   */
  static async updateProfile(
    uid: string,
    data: { name?: string; displayName?: string; phone?: string; email?: string; emailVerified?: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    if (!uid) return { success: false, error: 'Unauthorized: User ID required.' };

    const db = getFirebaseFirestore();
    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      updatedAt: now,
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.displayName !== undefined) updatePayload.displayName = data.displayName;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.emailVerified !== undefined) updatePayload.emailVerified = data.emailVerified;

    // 1. Persist to Firestore if available
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, 'customers', uid);
        await setDoc(ref, updatePayload, { merge: true });
      } catch (err: any) {
        console.warn('Firestore update error:', err);
      }
    }

    // 2. Synthesize merged profile
    const existing = await this.getProfile(uid) || {
      customerId: uid,
      uid,
      name: data.displayName || data.name || '',
      displayName: data.displayName || data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      emailVerified: Boolean(data.emailVerified),
      createdAt: now,
      updatedAt: now,
    };

    const merged: Customer = {
      ...existing,
      ...data,
      name: data.name || data.displayName || existing.name,
      displayName: data.displayName || data.name || existing.displayName,
      updatedAt: now,
    };

    // Save in memory store
    memoryProfileStore.set(uid, merged);

    // Save in local storage if in browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${LOCAL_PROFILE_PREFIX}${uid}`, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to save customer profile to storage:', e);
      }
    }

    return { success: true };
  }

  /**
   * Fetch customer saved addresses
   */
  static async getAddresses(uid?: string): Promise<Address[]> {
    if (!uid) return [];

    const db = getFirebaseFirestore();

    // 1. Try Firestore
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, 'customers', uid);
        const snap = await getDoc(ref);
        if (snap.exists() && Array.isArray(snap.data()?.addresses)) {
          const list = snap.data()?.addresses as Address[];
          memoryAddressStore.set(uid, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore address fetch error:', err);
      }
    }

    // 2. Fallback to local storage keyed by UID
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${LOCAL_ADDRESSES_PREFIX}${uid}`);
        if (raw) {
          const list: Address[] = JSON.parse(raw);
          const filtered = list.filter(a => a.customerId === uid);
          memoryAddressStore.set(uid, filtered);
          return filtered;
        }
      } catch (e) {
        console.warn('Failed to read local addresses:', e);
      }
    }

    // 3. Fallback to memory store
    const memList = memoryAddressStore.get(uid);
    if (memList) {
      return memList;
    }

    return [];
  }

  /**
   * Add a new saved address for the customer
   */
  static async addAddress(
    uid: string,
    address: Omit<Address, 'addressId' | 'customerId'>
  ): Promise<{ success: boolean; address?: Address; error?: string }> {
    if (!uid) return { success: false, error: 'Unauthorized' };

    const newAddress: Address = {
      ...address,
      addressId: `addr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      customerId: uid,
    };

    const currentAddresses = await this.getAddresses(uid);
    let updatedList = [...currentAddresses];

    if (newAddress.isDefault) {
      updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
    } else if (updatedList.length === 0) {
      newAddress.isDefault = true;
    }

    updatedList.push(newAddress);

    // Update memory store
    memoryAddressStore.set(uid, updatedList);

    // Save to Firestore
    const db = getFirebaseFirestore();
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, 'customers', uid);
        await setDoc(ref, { addresses: updatedList, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Failed to persist address to Firestore:', err);
      }
    }

    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_ADDRESSES_PREFIX}${uid}`, JSON.stringify(updatedList));
    }

    return { success: true, address: newAddress };
  }

  /**
   * Update an existing address
   */
  static async updateAddress(
    uid: string,
    addressId: string,
    data: Partial<Address>
  ): Promise<{ success: boolean; error?: string }> {
    if (!uid) return { success: false, error: 'Unauthorized' };

    const currentAddresses = await this.getAddresses(uid);
    let updatedList = currentAddresses.map(addr => {
      if (addr.addressId === addressId) {
        return { ...addr, ...data };
      }
      if (data.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    memoryAddressStore.set(uid, updatedList);

    const db = getFirebaseFirestore();
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, 'customers', uid);
        await setDoc(ref, { addresses: updatedList, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Failed to update address in Firestore:', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_ADDRESSES_PREFIX}${uid}`, JSON.stringify(updatedList));
    }

    return { success: true };
  }

  /**
   * Delete an address
   */
  static async deleteAddress(
    uid: string,
    addressId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!uid) return { success: false, error: 'Unauthorized' };

    const currentAddresses = await this.getAddresses(uid);
    const updatedList = currentAddresses.filter(a => a.addressId !== addressId);

    // If deleted address was default, set first remaining as default
    if (updatedList.length > 0 && !updatedList.some(a => a.isDefault)) {
      updatedList[0].isDefault = true;
    }

    memoryAddressStore.set(uid, updatedList);

    const db = getFirebaseFirestore();
    if (db && isFirebaseConfigured()) {
      try {
        const ref = doc(db, 'customers', uid);
        await setDoc(ref, { addresses: updatedList, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Failed to delete address from Firestore:', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_ADDRESSES_PREFIX}${uid}`, JSON.stringify(updatedList));
    }

    return { success: true };
  }
}
