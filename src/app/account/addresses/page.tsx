'use client';

import React, { useEffect, useState } from 'react';
import { CustomerService } from '@/lib/services/CustomerService';
import { Address } from '@/types/customer';
import { MapPin, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAddresses() {
      const data = await CustomerService.getAddresses();
      setAddresses(data);
      setIsLoading(false);
    }
    fetchAddresses();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif-display text-3xl text-deep-espresso">Saved Addresses</h1>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-deep-espresso text-warm-ivory rounded-lg font-sans-fashion text-[0.65rem] font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors">
          <Plus className="w-3 h-3" /> ADD NEW
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="sorayva-glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-champagne/40">
          <MapPin className="w-12 h-12 text-deep-espresso/30 mb-4" />
          <h2 className="font-serif-editorial text-2xl text-deep-espresso mb-2">NO SAVED ADDRESSES</h2>
          <p className="font-sans-body text-sm text-deep-espresso/70 mb-6">
            Add an address for faster checkout.
          </p>
          <button className="px-8 py-3 bg-transparent border border-deep-espresso text-deep-espresso rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-deep-espresso hover:text-warm-ivory transition-colors">
            ADD ADDRESS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map(addr => (
            <div key={addr.addressId} className="sorayva-glass-card rounded-2xl p-6 border border-champagne/40 relative group">
              {addr.isDefault && (
                <span className="absolute top-6 right-6 font-sans-fashion text-[0.6rem] font-bold tracking-[0.2em] uppercase text-terracotta bg-terracotta/10 px-2 py-1 rounded">
                  DEFAULT
                </span>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase">
                  {addr.type}
                </span>
              </div>
              
              <div className="space-y-1 mb-6">
                <p className="font-sans-body text-sm font-medium text-deep-espresso">{addr.name}</p>
                <p className="font-sans-body text-sm text-deep-espresso/70">{addr.line1}</p>
                {addr.line2 && <p className="font-sans-body text-sm text-deep-espresso/70">{addr.line2}</p>}
                <p className="font-sans-body text-sm text-deep-espresso/70">{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="font-sans-body text-sm text-deep-espresso/70 pt-2">{addr.phone}</p>
              </div>
              
              <div className="flex items-center gap-4 pt-4 border-t border-champagne/30">
                <button className="flex items-center gap-1.5 text-xs font-sans-body text-deep-espresso/60 hover:text-deep-espresso transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="flex items-center gap-1.5 text-xs font-sans-body text-deep-espresso/60 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
                {!addr.isDefault && (
                  <button className="ml-auto text-xs font-sans-body text-terracotta hover:underline">
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
