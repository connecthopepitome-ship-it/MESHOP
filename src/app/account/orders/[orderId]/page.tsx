'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OrderService } from '@/lib/services/OrderService';
import { CustomerOrder, TrackingInfo, OrderStatus } from '@/types/customer';
import { formatPrice } from '@/lib/utils';
import { ChevronLeft, Package, MapPin, CreditCard, ExternalLink, HelpCircle } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderData() {
      if (!orderId) return;
      const [orderData, trackingData] = await Promise.all([
        OrderService.getOrder(orderId),
        OrderService.getTracking(orderId)
      ]);
      setOrder(orderData);
      setTracking(trackingData);
      setIsLoading(false);
    }
    fetchOrderData();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif-display text-2xl text-deep-espresso mb-2">Order Not Found</h2>
        <p className="font-sans-body text-sm text-deep-espresso/60 mb-6">We could not find the details for this order.</p>
        <Link href="/account/orders" className="text-xs font-sans-fashion tracking-widest text-terracotta uppercase underline hover:text-deep-espresso">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/account/orders" className="p-1 rounded-full hover:bg-black/5 text-deep-espresso/60 hover:text-deep-espresso transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif-display text-2xl sm:text-3xl text-deep-espresso">Order #{order.orderNumber}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: TRACKING TIMELINE */}
        <div className="lg:w-7/12 space-y-6">
          <div className="sorayva-glass-card rounded-2xl p-6 border border-champagne/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-champagne/30">
              <div>
                <h2 className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-deep-espresso/60 mb-1">
                  ORDER STATUS
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                  <span className="font-serif-editorial text-xl text-deep-espresso">{order.orderStatus.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <span className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-deep-espresso/60 block mb-1">
                  EXPECTED DELIVERY
                </span>
                <span className="font-sans-body text-sm text-deep-espresso font-medium">
                  {tracking?.estimatedDelivery 
                    ? new Date(tracking.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
                    : 'Awaiting tracking details'}
                </span>
              </div>
            </div>

            {!tracking ? (
              <div className="py-10 text-center">
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
                      {/* Timeline line */}
                      {!isLast && (
                        <div className={`absolute left-[11px] top-6 bottom-[-8px] w-px ${event.completed ? 'bg-terracotta/50' : 'bg-champagne/50'}`} />
                      )}
                      
                      {/* Dot */}
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
                      
                      {/* Content */}
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
        </div>

        {/* RIGHT COLUMN: ORDER DETAILS */}
        <div className="lg:w-5/12 space-y-6">
          {/* Items */}
          <div className="sorayva-glass-card rounded-2xl p-6 border border-champagne/40">
            <h3 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase mb-4">
              Items in this Order
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-champagne/30 last:border-0 last:pb-0">
                  <div className="w-16 h-20 bg-champagne/20 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-sans-body text-sm font-medium text-deep-espresso leading-snug mb-1">
                      {item.productName}
                    </h4>
                    {item.size && (
                      <p className="font-sans-body text-xs text-deep-espresso/60 mb-2">Size: {item.size}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-sans-body text-xs text-deep-espresso/60">Qty {item.quantity}</span>
                      <span className="font-serif-editorial text-sm text-deep-espresso">{formatPrice(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-champagne/30 space-y-2">
              <div className="flex justify-between font-sans-body text-sm text-deep-espresso/70">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans-body text-sm text-deep-espresso/70">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between font-sans-body text-sm text-sage">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-sans-body text-base font-medium text-deep-espresso pt-2 border-t border-champagne/30 mt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="sorayva-glass-card rounded-2xl p-6 border border-champagne/40">
            <h3 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase mb-4">
              Order Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-deep-espresso/50 mt-0.5 shrink-0" />
                <div>
                  <span className="block font-sans-body text-xs font-medium text-deep-espresso mb-1">Delivery Address</span>
                  <p className="font-sans-body text-xs text-deep-espresso/70 leading-relaxed">
                    {order.shippingAddress.name}<br/>
                    {order.shippingAddress.line1}<br/>
                    {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br/></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br/>
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-deep-espresso/50 mt-0.5 shrink-0" />
                <div>
                  <span className="block font-sans-body text-xs font-medium text-deep-espresso mb-1">Payment Method</span>
                  <p className="font-sans-body text-xs text-deep-espresso/70">
                    {order.paymentMethod} — <span className="text-sage">{order.paymentStatus}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-champagne/30 flex justify-between items-center">
              <span className="font-sans-fashion text-[0.65rem] tracking-widest uppercase text-deep-espresso/60 flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3" /> Need help?
              </span>
              <a href="mailto:support@sorayva.com" className="text-xs font-sans-body font-medium text-terracotta hover:underline">
                Contact Support
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
