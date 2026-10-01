'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { trackEvent } from '@/lib/analytics';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('meshop_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load wishlist state:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('meshop_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist state:', e);
    }
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.productId === product.productId);
      if (exists) {
        return prev.filter((p) => p.productId !== product.productId);
      } else {
        trackEvent('add_to_wishlist', { productId: product.productId, name: product.name });
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
