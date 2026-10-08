'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { OrderService } from '@/lib/services/OrderService';
import { CustomerOrder } from '@/types/customer';
import { formatPrice } from '@/lib/utils';
import { Search, Package, ChevronRight } from 'lucide-react';

const FILTERS = ['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CustomerOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const data = await OrderService.getCustomerOrders();
      setOrders(data);
      setFilteredOrders(data);
      setIsLoading(false);
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    
    if (activeFilter !== 'ALL') {
      result = result.filter(o => o.orderStatus === activeFilter);
    }
    
    if (searchQuery) {
      result = result.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    setFilteredOrders(result);
  }, [activeFilter, searchQuery, orders]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="font-serif-display text-3xl text-deep-espresso mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="sorayva-glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-champagne/40">
          <Package className="w-12 h-12 text-deep-espresso/30 mb-4" />
          <h2 className="font-serif-editorial text-2xl text-deep-espresso mb-2">NO ORDERS YET</h2>
          <p className="font-sans-body text-sm text-deep-espresso/70 mb-6">
            Your SORAYVA journey starts here.
          </p>
          <Link 
            href="/shop"
            className="px-8 py-3 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors"
          >
            EXPLORE SAREES
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full font-sans-fashion text-[0.65rem] font-bold tracking-widest whitespace-nowrap transition-colors ${
                    activeFilter === f 
                      ? 'bg-deep-espresso text-warm-ivory'
                      : 'bg-white/50 text-deep-espresso border border-champagne/40 hover:border-terracotta'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order number"
                className="w-full h-10 bg-white/50 border border-champagne/40 rounded-full pl-10 pr-4 font-sans-body text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              />
              <Search className="w-4 h-4 text-deep-espresso/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-sm font-sans-body text-deep-espresso/60">
                No orders match your filter.
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.orderId} className="sorayva-glass-card rounded-2xl p-5 border border-champagne/40 flex flex-col sm:flex-row gap-5 sm:items-center justify-between group hover:border-terracotta/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-champagne/30 rounded-xl overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={order.items[0].image} 
                        alt={order.items[0].productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso font-bold uppercase">
                          ORDER {order.orderNumber}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-champagne" />
                        <span className="text-[0.65rem] font-sans-body text-deep-espresso/60 uppercase">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <span className="font-sans-body text-sm text-deep-espresso/80 mb-1">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="font-serif-editorial text-sm text-deep-espresso">
                          {formatPrice(order.total)}
                        </span>
                        <span className="text-[0.65rem] font-sans-fashion tracking-widest uppercase text-terracotta flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-terracotta" /> {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/account/orders/${order.orderId}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-1 px-6 py-2.5 rounded-xl border border-champagne/60 text-xs font-sans-fashion tracking-[0.15em] uppercase text-deep-espresso hover:bg-terracotta hover:text-white transition-colors"
                  >
                    VIEW ORDER <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
