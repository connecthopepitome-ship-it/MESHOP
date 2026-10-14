'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Heart, MapPin, User, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { CustomerService } from '@/lib/services/CustomerService';
import { OrderService } from '@/lib/services/OrderService';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { CustomerOrder, Address } from '@/types/customer';

export default function AccountDashboardPage() {
  const { currentUser, customerProfile, loading } = useAuth();
  const { wishlist } = useWishlist();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) {
        setIsDataLoading(false);
        return;
      }

      try {
        const [ordersData, addressesData] = await Promise.all([
          OrderService.getCustomerOrders(currentUser.email || undefined),
          CustomerService.getAddresses(currentUser.uid),
        ]);
        setOrders(ordersData);
        setAddresses(addressesData);
      } catch (err) {
        console.warn('Error loading dashboard data:', err);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (!loading) {
      loadData();
    }
  }, [currentUser, loading]);

  if (loading || isDataLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = customerProfile?.name || customerProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Valued Patron';

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="hidden sm:block mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif-display text-4xl text-deep-espresso">
            Welcome, {displayName.split(' ')[0]}
          </h1>
          {currentUser?.emailVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-sans-fashion tracking-wider uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          ) : (
            <Link
              href="/account/verify-email"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-sans-fashion tracking-wider uppercase font-bold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Verify Email
            </Link>
          )}
        </div>
        <p className="font-sans-body text-deep-espresso/70">
          Manage your bespoke saree orders, delivery addresses, and atelier preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <DashboardCard 
          title="MY ORDERS"
          count={orders.length}
          link="/account/orders"
          linkText="View order history"
          icon={Package}
        />
        <DashboardCard 
          title="SAVED WISHLIST"
          count={wishlist.length}
          link="/account/wishlist"
          linkText="View curated sarees"
          icon={Heart}
        />
        <DashboardCard 
          title="DELIVERY ADDRESSES"
          count={addresses.length}
          link="/account/addresses"
          linkText="Manage addresses"
          icon={MapPin}
        />
        <DashboardCard 
          title="CUSTOMER PROFILE"
          count={null}
          link="/account/profile"
          linkText="Edit personal details"
          icon={User}
        />
      </div>

      {/* Recent Order Preview */}
      {orders.length > 0 && orders[0].items && orders[0].items.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-display text-2xl text-deep-espresso">Latest Atelier Order</h2>
            <Link 
              href="/account/orders" 
              className="text-xs font-sans-fashion tracking-widest uppercase text-terracotta hover:text-deep-espresso transition-colors font-bold"
            >
              View all orders &rarr;
            </Link>
          </div>
          
          <div className="sorayva-glass-card rounded-2xl p-5 border border-champagne/40 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-champagne/30 rounded-xl overflow-hidden shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={orders[0].items[0].image || '/images/fabrics/chiffon.jpg'} 
                  alt={orders[0].items[0].productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[0.65rem] font-sans-fashion tracking-widest text-deep-espresso/60 uppercase mb-1 font-semibold">
                  ORDER {orders[0].orderNumber}
                </span>
                <span className="font-sans-body text-sm font-medium text-deep-espresso mb-1 line-clamp-1">
                  {orders[0].items[0].productName} {orders[0].items.length > 1 && `+ ${orders[0].items.length - 1} more`}
                </span>
                <span className="text-xs text-terracotta font-medium flex items-center gap-1.5 font-sans-fashion tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta" /> {orders[0].orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            
            <Link 
              href={`/account/orders`}
              className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2.5 rounded-xl border border-champagne/60 text-xs font-sans-fashion tracking-[0.15em] uppercase text-deep-espresso hover:bg-white/50 transition-colors text-center font-bold"
            >
              Track Order
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, count, link, linkText, icon: Icon }: any) {
  return (
    <div className="sorayva-glass-card rounded-2xl p-6 border border-champagne/40 group hover:border-terracotta/50 transition-colors">
      <div className="flex items-start justify-between mb-8">
        <Icon className="w-5 h-5 text-deep-espresso/60" />
        {count !== null && (
          <span className="font-serif-display text-3xl text-deep-espresso">{count}</span>
        )}
      </div>
      <div>
        <h3 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase mb-1">{title}</h3>
        <Link href={link} className="inline-flex items-center text-xs font-sans-body text-deep-espresso/70 hover:text-terracotta transition-colors group-hover:text-terracotta">
          {linkText} <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
