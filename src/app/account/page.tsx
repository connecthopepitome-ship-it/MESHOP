'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Package, Heart } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('meshop_orders');
      if (saved) setOrders(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to read account orders:', e);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase flex items-center justify-center">
          <User className="w-4 h-4 mr-1.5" /> Customer Account
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Order History</h1>
        <p className="text-xs text-brand-muted">Guest and account order records stored on your device.</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface border border-brand-border p-6 space-y-3">
            <Package className="w-12 h-12 text-brand-border mx-auto" />
            <h3 className="font-serif text-lg font-medium text-brand-charcoal">No past orders found</h3>
            <p className="text-xs text-brand-muted">Orders placed during this session will automatically appear here.</p>
            <Link
              href="/shop"
              className="inline-block bg-brand-charcoal text-brand-base px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.orderId} className="bg-brand-surface border border-brand-border p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
                  <span className="font-serif font-bold text-brand-charcoal">Order #{ord.orderId}</span>
                  <span className="text-brand-muted">{new Date(ord.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Items: {ord.items.length} saree(s)</span>
                  <span className="font-semibold text-brand-charcoal">{formatPrice(ord.total)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] bg-brand-gold/20 text-brand-charcoal font-medium px-2 py-0.5 border border-brand-gold/40">
                    Status: {ord.fulfillmentStatus}
                  </span>
                  <Link href={`/track-order?id=${ord.orderId}`} className="text-brand-gold font-semibold hover:underline">
                    Track Shipment →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
