'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { MOCK_COUPONS } from '@/data/mockData';
import { trackEvent } from '@/lib/analytics';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedBlouseSize?: string) => void;
  removeFromCart: (productId: string, selectedBlouseSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedBlouseSize?: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meshop_cart');
      if (saved) setCart(JSON.parse(saved));
      const savedCoupon = localStorage.getItem('meshop_coupon');
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error('Failed to load cart state from localStorage:', e);
    }
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('meshop_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('meshop_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('meshop_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon to localStorage:', e);
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity: number = 1, selectedBlouseSize?: string) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (item) => item.product.productId === product.productId && item.selectedBlouseSize === selectedBlouseSize
      );

      if (index > -1) {
        const updated = [...prev];
        const newQty = updated[index].quantity + quantity;
        updated[index] = { ...updated[index], quantity: Math.min(newQty, product.stockQty) };
        return updated;
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stockQty), selectedBlouseSize }];
    });

    trackEvent('add_to_cart', { productId: product.productId, name: product.name, price: product.price, selectedBlouseSize });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedBlouseSize?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.productId === productId && item.selectedBlouseSize === selectedBlouseSize))
    );
    trackEvent('remove_from_cart', { productId, selectedBlouseSize });
  };

  const updateQuantity = (productId: string, quantity: number, selectedBlouseSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedBlouseSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.productId === productId && item.selectedBlouseSize === selectedBlouseSize) {
          return { ...item, quantity: Math.min(quantity, item.product.stockQty) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = MOCK_COUPONS.find((c) => c.code === cleanCode && c.active);

    if (!found) {
      return { success: false, message: 'Invalid or expired promo coupon code.' };
    }

    const currentSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    if (found.minimumOrder && currentSubtotal < found.minimumOrder) {
      return { success: false, message: `Coupon requires a minimum order of ₹${found.minimumOrder.toLocaleString('en-IN')}` };
    }

    setAppliedCoupon(found);
    trackEvent('coupon_applied', { code: cleanCode });
    return { success: true, message: `Coupon '${cleanCode}' applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.type === 'fixed') {
      discount = appliedCoupon.value;
    }
  }

  const shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 250;
  const total = Math.max(0, subtotal - discount + shipping);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shipping,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
