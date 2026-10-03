'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  adminToken: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'sorayva_admin_session_v1';
const ADMIN_TOKEN_KEY = 'sorayva_admin_token_v1';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        if (stored && token) {
          setIsAuthenticated(true);
          setAdminEmail(stored);
          setAdminToken(token);
        }
      }
    } catch (e) {
      console.warn('Failed to read admin session state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Basic secure credential check for Admin Control Centre
    const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sorayva.com';
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sorayva2026';

    if (email.trim().toLowerCase() === validEmail.toLowerCase() && pass === validPass) {
      const generatedToken = `sorayva_admin_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      setIsAuthenticated(true);
      setAdminEmail(email.trim());
      setAdminToken(generatedToken);

      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_STORAGE_KEY, email.trim());
        localStorage.setItem(ADMIN_TOKEN_KEY, generatedToken);
      }
      return { success: true };
    } else {
      return { success: false, error: 'Invalid admin email address or security key.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminEmail(null);
    setAdminToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, adminEmail, login, logout, adminToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
