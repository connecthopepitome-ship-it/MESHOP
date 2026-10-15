'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured, formatFirebaseAuthError } from '@/lib/firebase/config';
import { CustomerService } from '@/lib/services/CustomerService';
import { Customer } from '@/types/customer';

export interface AuthContextType {
  currentUser: User | null;
  customerProfile: Customer | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseReady: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  refreshVerificationStatus: () => Promise<{ verified: boolean; error?: string }>;
  updateCustomerProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isListenerAttached = useRef(false);

  const isConfigured = isFirebaseConfigured();

  // Load customer profile when user changes
  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setCustomerProfile(null);
      return;
    }

    try {
      let profile = await CustomerService.getProfile(user.uid);
      if (!profile) {
        // First-time fallback synthesis
        profile = {
          customerId: user.uid,
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Valued Patron',
          displayName: user.displayName || user.email?.split('@')[0] || 'Valued Patron',
          email: user.email || '',
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await CustomerService.updateProfile(user.uid, profile);
      }
      setCustomerProfile(profile);
    } catch (err) {
      console.warn('Error loading customer profile:', err);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isConfigured) {
      // Firebase credentials are not yet provided in .env.local
      // Gracefully finish initial load so UI remains accessible
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth || isListenerAttached.current) {
      setLoading(false);
      return;
    }

    isListenerAttached.current = true;

    // Check for mobile redirect auth result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const u = result.user;
          await CustomerService.updateProfile(u.uid, {
            name: u.displayName || u.email?.split('@')[0] || 'Valued Patron',
            displayName: u.displayName || u.email?.split('@')[0] || 'Valued Patron',
            email: u.email || '',
            emailVerified: u.emailVerified,
          });
          await loadProfile(u);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth resolution notice:', err);
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        if (user) {
          await loadProfile(user);
        } else {
          setCustomerProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state listener error:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      isListenerAttached.current = false;
    };
  }, [isConfigured, loadProfile]);

  // Sign In with email and password
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Authentication is not yet configured on this server. Please add Firebase project keys to .env.local.',
      };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Firebase Auth is unavailable.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await loadProfile(userCredential.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  // Sign Up with email, password, full name, and optional phone
  const signUp = async (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Authentication is not yet configured on this server. Please add Firebase project keys to .env.local.',
      };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Firebase Auth is unavailable.' };
    }

    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      const user = userCredential.user;

      // Update Firebase Auth user display name
      if (trimmedName) {
        await updateFirebaseProfile(user, { displayName: trimmedName });
      }

      // Send Firebase Email Verification
      try {
        await sendEmailVerification(user);
      } catch (verifyErr) {
        console.warn('Initial email verification dispatch warning:', verifyErr);
      }

      // Persist customer profile in Firestore / local store
      const initialProfile: Customer = {
        customerId: user.uid,
        uid: user.uid,
        name: trimmedName || trimmedEmail.split('@')[0],
        displayName: trimmedName || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        phone: phone ? phone.trim() : undefined,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await CustomerService.updateProfile(user.uid, initialProfile);
      setCustomerProfile(initialProfile);

      return { success: true, requiresVerification: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }

    setCurrentUser(null);
    setCustomerProfile(null);

    // Clear any private customer session data (cart is retained for guest continuity)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('meshop_auth_mock');
      } catch (e) {
        // ignore
      }
    }
  };

  // Send Password Reset Email
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Authentication is not configured. Please add Firebase keys to .env.local.',
      };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Firebase Auth is unavailable.' };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      // Account enumeration resistance: If user not found, don't disclose existence
      if (err?.code === 'auth/user-not-found') {
        return { success: true };
      }
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  // Resend Email Verification
  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Please sign in first to request email verification.' };
    }

    try {
      await sendEmailVerification(currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  // Refresh Verification Status (reloads user token from Firebase)
  const refreshVerificationStatus = async (): Promise<{ verified: boolean; error?: string }> => {
    if (!currentUser) {
      return { verified: false, error: 'No active session' };
    }

    try {
      await currentUser.reload();
      const verified = currentUser.emailVerified;

      if (verified && customerProfile) {
        const updated = { ...customerProfile, emailVerified: true };
        setCustomerProfile(updated);
        await CustomerService.updateProfile(currentUser.uid, { emailVerified: true });
      }

      return { verified };
    } catch (err: any) {
      return { verified: false, error: formatFirebaseAuthError(err) };
    }
  };

  // Update Customer Profile
  const updateCustomerProfile = async (data: { name?: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Unauthorized: No active session.' };
    }

    try {
      if (data.name && currentUser) {
        await updateFirebaseProfile(currentUser, { displayName: data.name });
      }

      await CustomerService.updateProfile(currentUser.uid, {
        name: data.name,
        displayName: data.name,
        phone: data.phone,
      });

      if (customerProfile) {
        setCustomerProfile({
          ...customerProfile,
          name: data.name || customerProfile.name,
          displayName: data.name || customerProfile.displayName,
          phone: data.phone !== undefined ? data.phone : customerProfile.phone,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update profile.' };
    }
  };

  // Get current Firebase ID Token (for authenticated API requests)
  const getIdToken = async (forceRefresh: boolean = false): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      return await currentUser.getIdToken(forceRefresh);
    } catch (e) {
      console.warn('Failed to obtain Firebase ID token:', e);
      return null;
    }
  };

  // Sign In with Google
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Authentication is not yet configured on this server.',
      };
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return { success: false, error: 'Firebase Auth is unavailable.' };
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await CustomerService.updateProfile(user.uid, {
        name: user.displayName || user.email?.split('@')[0] || 'Valued Patron',
        displayName: user.displayName || user.email?.split('@')[0] || 'Valued Patron',
        email: user.email || '',
        emailVerified: user.emailVerified,
      });

      await loadProfile(user);
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectErr: any) {
          return { success: false, error: formatFirebaseAuthError(redirectErr) };
        }
      }
      if (err?.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in window was closed before completing.' };
      }
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        customerProfile,
        loading,
        isAuthenticated: Boolean(currentUser),
        isFirebaseReady: isConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        sendPasswordReset,
        resendVerificationEmail,
        refreshVerificationStatus,
        updateCustomerProfile,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
