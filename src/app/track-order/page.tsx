'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Search, ExternalLink, MapPin } from 'lucide-react';
import { OrderService } from '@/lib/services/OrderService';
import { CustomerOrder, TrackingInfo } from '@/types/customer';
import { formatPrice } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || '';
  
  const [orderId, setOrderId] = useState(initialId);
  const [contactInfo, setContactInfo] = useState('');
  
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (idToSearch: string, contact: string) => {
    if (!idToSearch) return;
    
    setLoading(true);
    setSearched(true);
    
    const result = await OrderService.trackGuestOrder(idToSearch, contact);
    
    if (result) {
      setOrder(result.order);
      setTracking(result.tracking);
    } else {
      setOrder(null);
      setTracking(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (initialId) {
      // If accessed via link with ?id=, we might not have contact info yet,
      // but let the user fill it out, or try to lookup if backend supports it.
      // For this implementation, we require contact info for security.
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(orderId.trim(), contactInfo.trim());
  };

  return (
    <div className="w-full bg-warm-ivory min-h-screen py-12 md:py-20 px-4 pb-safe">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
          <span className="font-sans-fashion text-[0.65rem] tracking-[0.25em] text-terracotta uppercase block">
            SORAYVA LOGISTICS
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl text-deep-espresso">Track Order</h1>
          <p className="font-sans-body text-sm text-deep-espresso/70">
            Enter your order number and mobile to track your shipment.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="sorayva-glass-card p-6 sm:p-8 rounded-2xl border border-champagne/40 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                Order Number
              </label>
              <input
                type="text"
                placeholder="e.g. SR-2026-0012"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                Mobile or Email
              </label>
              <input
                type="text"
                placeholder="Used during checkout"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !orderId || !contactInfo}
            className="w-full h-12 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'SEARCHING...' : 'TRACK ORDER'}</span>
          </button>
        </form>

        {/* Lookup Result Display */}
        {searched && !loading && (
          <div className="animate-fadeIn">
            {order ? (
              <div className="sorayva-glass-card rounded-2xl p-6 sm:p-8 border border-champagne/40 space-y-8">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-champagne/30">
                  <div>
                    <h3 className="font-serif-display text-2xl text-deep-espresso">Order #{order.orderNumber}</h3>
                    <p className="font-sans-body text-xs text-deep-espresso/60 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-champagne/20 border border-champagne/40 text-[0.65rem] font-sans-fashion tracking-widest uppercase text-deep-espresso">
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div>
                  <h4 className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-deep-espresso/60 mb-6">
                    TRACKING TIMELINE
                  </h4>
                  
                  {!tracking ? (
                    <div className="py-10 text-center bg-white/30 rounded-xl border border-champagne/30">
                      <Package className="w-8 h-8 text-deep-espresso/30 mx-auto mb-3" />
                      <h3 className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase mb-1">
                        TRACKING WILL APPEAR HERE
                      </h3>
                      <p className="font-sans-body text-xs text-deep-espresso/60 max-w-sm mx-auto">
                        Your order status will update once dispatch information becomes available.
                      </p>
                    </div>
                  ) : (
                    <div className="py-2 px-2">
                      {tracking.events.map((event, index) => {
                        const isLast = index === tracking.events.length - 1;
                        const isActive = !event.completed && (index === 0 || tracking.events[index - 1]?.completed);
                        
                        return (
                          <div key={event.eventId} className="flex gap-4 relative">
                            {!isLast && (
                              <div className={`absolute left-[11px] top-6 bottom-[-8px] w-px ${event.completed ? 'bg-terracotta/50' : 'bg-champagne/50'}`} />
                            )}
                            
                            <div className="relative z-10 mt-1 flex-shrink-0">
                              {event.completed ? (
                                <div className="w-6 h-6 rounded-full bg-terracotta/10 border border-terracotta flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 bg-terracotta rounded-full" />
                                </div>
                              ) : isActive ? (
                                <div className="w-6 h-6 rounded-full bg-champagne/30 border-2 border-terracotta flex items-center justify-center">
                                  <div className="w-2 h-2 bg-terracotta rounded-full animate-pulse" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-white/50 border border-champagne" />
                              )}
                            </div>
                            
                            <div className={`pb-8 ${!event.completed && !isActive ? 'opacity-50' : ''}`}>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                                <h4 className="font-sans-fashion text-xs font-bold tracking-widest text-deep-espresso uppercase">
                                  {event.label}
                                </h4>
                                {event.timestamp && (
                                  <span className="font-sans-body text-[0.65rem] text-deep-espresso/60">
                                    {new Date(event.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p className="font-sans-body text-sm text-deep-espresso/80">
                                {event.description}
                              </p>
                              {event.location && (
                                <p className="font-sans-body text-xs text-deep-espresso/50 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {tracking.trackingNumber && (
                        <div className="mt-4 p-4 bg-white/50 border border-champagne/30 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-sans-fashion text-[0.65rem] tracking-[0.1em] text-deep-espresso/60 block mb-0.5 uppercase">Carrier / Tracking ID</span>
                            <span className="font-sans-body text-sm text-deep-espresso font-medium">{tracking.carrier} - {tracking.trackingNumber}</span>
                          </div>
                          <button className="p-2 text-terracotta hover:bg-terracotta/10 rounded-full transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Order Items Summary */}
                <div className="border-t border-champagne/30 pt-6">
                  <h4 className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-deep-espresso/60 mb-4">
                    ORDER ITEMS
                  </h4>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-12 h-16 bg-champagne/20 rounded-md overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-sans-body text-sm text-deep-espresso">{item.productName}</p>
                          <p className="font-sans-body text-xs text-deep-espresso/60">Qty {item.quantity}</p>
                        </div>
                        <div className="font-serif-editorial text-sm text-deep-espresso">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Promotion for Guests */}
                <div className="bg-gradient-to-r from-deep-espresso to-[#302622] rounded-xl p-6 text-center mt-8">
                  <h4 className="font-serif-display text-xl text-warm-ivory mb-2">Want easier tracking?</h4>
                  <p className="font-sans-body text-xs text-warm-ivory/70 mb-4 max-w-xs mx-auto">
                    Create an account using {contactInfo || 'your email'} to save your order details and track future purchases seamlessly.
                  </p>
                  <Link 
                    href={`/account/signup?email=${encodeURIComponent(contactInfo)}`}
                    className="inline-flex h-10 px-6 items-center justify-center bg-warm-ivory text-deep-espresso rounded-lg font-sans-fashion text-xs font-bold tracking-[0.1em] uppercase hover:bg-terracotta hover:text-white transition-colors"
                  >
                    CREATE ACCOUNT
                  </Link>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 sorayva-glass-card rounded-2xl border border-champagne/40 px-6">
                <Search className="w-8 h-8 text-deep-espresso/30 mx-auto mb-4" />
                <p className="font-serif-display text-2xl text-deep-espresso mb-2">Order Not Found</p>
                <p className="text-sm font-sans-body text-deep-espresso/70 max-w-sm mx-auto">
                  We couldn't find an order matching that ID and contact information. Please check your confirmation email.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-warm-ivory flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
