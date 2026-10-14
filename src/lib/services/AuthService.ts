import { Customer } from '@/types/customer';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured, formatFirebaseAuthError } from '@/lib/firebase/config';
import { CustomerService } from './CustomerService';

/**
 * Authentication Service Abstraction
 * Directly interfaces with Firebase Authentication.
 * Replaces development mocks with production-ready Firebase Auth operations.
 */
export class AuthService {
  /**
   * Check currently signed in customer
   */
  static async getCurrentUser(): Promise<Customer | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }

    const auth = getFirebaseAuth();
    if (!auth || !auth.currentUser) {
      return null;
    }

    const user = auth.currentUser;
    return CustomerService.getProfile(user.uid);
  }

  /**
   * Authenticate customer with email and password
   */
  static async login(email: string, password?: string): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        error: 'Authentication is not yet configured. Please configure Firebase project credentials.',
      };
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Authentication service unavailable.' };
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  }

  /**
   * Terminate active customer session
   */
  static async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
  }

  /**
   * Trigger Firebase Password Reset Email
   */
  static async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        error: 'Authentication is not configured.',
      };
    }

    if (!email) {
      return { success: false, error: 'Please enter your email address.' };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Authentication service unavailable.' };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      // Account enumeration resistance
      if (err?.code === 'auth/user-not-found') {
        return { success: true };
      }
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  }

  /**
   * Register a new customer
   */
  static async signup(data: {
    name: string;
    email: string;
    password: string;
    mobile?: string;
  }): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        error: 'Authentication is not yet configured. Please configure Firebase project credentials.',
      };
    }

    const { name, email, password, mobile } = data;
    if (!email || !password || !name) {
      return { success: false, error: 'Full name, email, and password are required.' };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Authentication service unavailable.' };
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = res.user;

      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
      }

      try {
        await sendEmailVerification(user);
      } catch (verifyErr) {
        console.warn('Failed to send verification email:', verifyErr);
      }

      await CustomerService.updateProfile(user.uid, {
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim(),
        phone: mobile?.trim(),
        emailVerified: false,
      });

      return { success: true, requiresVerification: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  }
}
