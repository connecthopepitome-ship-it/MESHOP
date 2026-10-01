'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Package, ArrowRight, Printer } from 'lucide-react';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      // Lookup by orderId
      const found = await repository.lookupOrder(params.id, '');
      if (found) {
        setOrder(found);
      } else {
        // Fallback sample order representation for immediate UI display if lookup fails
        setOrder({
          orderId: params.id,
          createdAt: new Date().toISOString(),
          customerName: 'Valued Guest',
          email: 'customer@example.com',
          phone: '+91 98765 43210',
          shippingAddress: {
            fullName: 'Valued Customer',
            mobile: '9876543210',
            email: 'customer@example.com',
            addressLine1: '42 Heritage Lane',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110054',
            country: 'India',
          },
          items: [],
          subtotal: 0,
          discount: 0,
          shipping: 0,
          total: 0,
          paymentMethod: 'online_razorpay',
          paymentStatus: 'PAID',
          fulfillmentStatus: 'NEW',
        });
      }
    }
    fetchOrder();
  }, [params.id]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-3xl space-y-8">
      {/* Top Banner */}
      <div className="bg-brand-surface border border-brand-border p-8 text-center space-y-4 shadow-subtle">
        <CheckCircle2 className="w-16 h-16 text-brand-gold mx-auto" />
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold block">Order Placed Successfully</span>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-charcoal font-medium">Thank You For Your Order!</h1>
        <p className="text-xs md:text-sm text-brand-muted max-w-lg mx-auto font-light">
          Your order ID is <strong className="text-brand-charcoal font-bold">{params.id}</strong>. We have dispatched a confirmation email and WhatsApp receipt.
        </p>

        <div className="pt-4 flex justify-center space-x-4">
          <Link
            href={`/track-order?id=${params.id}`}
            className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Progress</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="border border-brand-border text-brand-charcoal hover:bg-brand-base px-5 py-3 text-xs uppercase font-semibold tracking-wider flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Summary Details Card */}
      {order && (
        <div className="bg-brand-surface border border-brand-border p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-brand-charcoal">
              Order Receipt Summary
            </h3>
            <span className="text-xs text-brand-muted font-sans">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-muted">
            <div>
              <span className="font-semibold text-brand-charcoal block uppercase mb-1">Shipping Address</span>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>Mobile: {order.shippingAddress.mobile}</p>
            </div>

            <div>
              <span className="font-semibold text-brand-charcoal block uppercase mb-1">Payment & Fulfillment</span>
              <p>Payment Method: <strong className="uppercase">{order.paymentMethod}</strong></p>
              <p>Payment Status: <strong className="text-green-800">{order.paymentStatus}</strong></p>
              <p>Fulfillment Status: <strong>{order.fulfillmentStatus}</strong></p>
            </div>
          </div>

          {order.items.length > 0 && (
            <div className="border-t border-brand-border pt-4 space-y-3">
              <span className="font-semibold text-brand-charcoal text-xs uppercase tracking-wider block">Items Purchased</span>
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 aspect-[3/4] bg-brand-border/20 flex-shrink-0">
                      <Image src={it.mainImage} alt={it.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-serif font-medium text-brand-charcoal">{it.name}</p>
                      <p className="text-[10px] text-brand-muted">Qty: {it.quantity} {it.selectedBlouseSize && `• Size ${it.selectedBlouseSize}`}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 text-xs uppercase font-semibold tracking-widest text-brand-charcoal hover:text-brand-gold"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
