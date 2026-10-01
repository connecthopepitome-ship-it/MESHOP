'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, CheckCircle, Clock, Truck, Home } from 'lucide-react';
import { repository } from '@/lib/api/googleSheetsRepository';
import { defaultShippingProvider } from '@/lib/adapters/shippingAdapter';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [contactInfo, setContactInfo] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLookup = React.useCallback(async (idToSearch: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const found = await repository.lookupOrder(idToSearch, contactInfo);
      setOrder(found);

      if (found && found.trackingNumber) {
        const trackRes = await defaultShippingProvider.trackShipment(found.trackingNumber);
        setTrackingHistory(trackRes.history);
      }
    } catch (e) {
      console.error('Tracking lookup error:', e);
    } finally {
      setLoading(false);
    }
  }, [contactInfo]);

  useEffect(() => {
    if (searchParams.get('id')) {
      handleLookup(searchParams.get('id')!);
    }
  }, [searchParams, handleLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      handleLookup(orderId.trim());
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'NEW': return 0;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase flex items-center justify-center">
          <Package className="w-4 h-4 mr-1.5" /> Order Fulfillment Status
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Track Order</h1>
        <p className="text-xs text-brand-muted">
          Enter your Order ID (e.g. ORD-XYZ) and Email or Mobile number to view live shipment timeline.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="bg-brand-surface p-6 border border-brand-border space-y-4 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
              Order ID *
            </label>
            <input
              type="text"
              placeholder="e.g. ORD-123"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs uppercase focus:outline-none focus:border-brand-gold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
              Mobile Number or Email
            </label>
            <input
              type="text"
              placeholder="e.g. 9876543210 or email"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-charcoal text-brand-base hover:bg-brand-gold hover:text-brand-charcoal py-3 px-4 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : 'Lookup Order'}</span>
        </button>
      </form>

      {/* Lookup Result Display */}
      {searched && (
        <div>
          {order ? (
            <div className="bg-brand-surface border border-brand-border p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-brand-border pb-4 gap-2">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-brand-charcoal">Order #{order.orderId}</h3>
                  <p className="text-xs text-brand-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="bg-brand-gold/20 text-brand-charcoal text-xs font-semibold uppercase tracking-wider px-3 py-1 border border-brand-gold/40">
                    Status: {order.fulfillmentStatus}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="py-4 border-b border-brand-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal block mb-4">
                  Shipment Progress Timeline
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-semibold uppercase">
                  {['Received', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'].map((step, idx) => {
                    const currentIdx = getStepIndex(order.fulfillmentStatus);
                    const isCompleted = idx <= currentIdx;
                    return (
                      <div key={step} className="flex flex-col items-center space-y-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isCompleted ? 'bg-brand-gold text-brand-charcoal font-bold' : 'bg-brand-border text-brand-muted'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className={isCompleted ? 'text-brand-charcoal' : 'text-brand-muted'}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrier Details */}
              {order.trackingNumber && (
                <div className="p-4 bg-brand-base border border-brand-border text-xs space-y-2">
                  <span className="font-semibold text-brand-charcoal block uppercase">Courier Tracking Information</span>
                  <p>Tracking Number: <strong>{order.trackingNumber}</strong></p>
                  <p>Carrier: <strong>Shiprocket Express Air</strong></p>
                </div>
              )}

              {/* Tracking Log History */}
              {trackingHistory.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal block">Transit Log</span>
                  <div className="space-y-2 text-xs text-brand-muted">
                    {trackingHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-start border-l-2 border-brand-gold pl-3 py-1">
                        <div>
                          <p className="font-medium text-brand-charcoal">{h.note}</p>
                          <p className="text-[10px]">{h.location}</p>
                        </div>
                        <span className="text-[10px]">{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-surface border border-brand-border p-6 space-y-2">
              <p className="font-serif text-lg text-brand-charcoal">No order found with ID "{orderId}".</p>
              <p className="text-xs text-brand-muted">
                Please double check your Order ID from your confirmation email. For assistance, contact our WhatsApp Concierge at +91 98765 43210.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-xs">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
