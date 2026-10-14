'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CustomerService } from '@/lib/services/CustomerService';
import { useAuth } from '@/context/AuthContext';
import { Address } from '@/types/customer';
import { MapPin, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function AddressesPage() {
  const { currentUser, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    type: 'Home' as 'Home' | 'Work' | 'Other',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  const loadAddresses = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await CustomerService.getAddresses(currentUser.uid);
      setAddresses(data);
    } catch (err) {
      console.warn('Error loading addresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loading) {
      loadAddresses();
    }
  }, [loading, loadAddresses]);

  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setForm({
      name: currentUser?.displayName || '',
      phone: '',
      type: 'Home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddressId(addr.addressId);
    setForm({
      name: addr.name,
      phone: addr.phone,
      type: addr.type,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to remove this delivery address?')) return;

    await CustomerService.deleteAddress(currentUser.uid, addressId);
    await loadAddresses();
  };

  const handleSetDefault = async (addressId: string) => {
    if (!currentUser) return;
    await CustomerService.updateAddress(currentUser.uid, addressId, { isDefault: true });
    await loadAddresses();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || formSubmitting) return;

    setFormSubmitting(true);
    try {
      if (editingAddressId) {
        await CustomerService.updateAddress(currentUser.uid, editingAddressId, form);
      } else {
        await CustomerService.addAddress(currentUser.uid, form);
      }
      await loadAddresses();
      setIsModalOpen(false);
    } catch (err) {
      console.warn('Failed to save address:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif-display text-3xl text-deep-espresso">Saved Addresses</h1>
          <p className="font-sans-body text-xs text-deep-espresso/60 mt-1">
            Addresses are securely saved to your account for effortless bespoke checkout.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-[0.65rem] font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> ADD NEW
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="sorayva-glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-champagne/40">
          <MapPin className="w-12 h-12 text-deep-espresso/30 mb-4" />
          <h2 className="font-serif-editorial text-2xl text-deep-espresso mb-2">NO SAVED ADDRESSES</h2>
          <p className="font-sans-body text-sm text-deep-espresso/70 mb-6 max-w-sm">
            Add a residential or atelier address to expedite your orders.
          </p>
          <button 
            onClick={handleOpenAdd}
            className="px-8 py-3 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors"
          >
            ADD ADDRESS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map((addr) => (
            <div key={addr.addressId} className="sorayva-glass-card rounded-2xl p-6 border border-champagne/40 relative group flex flex-col justify-between">
              {addr.isDefault && (
                <span className="absolute top-6 right-6 font-sans-fashion text-[0.6rem] font-bold tracking-[0.2em] uppercase text-terracotta bg-terracotta/10 border border-terracotta/20 px-2.5 py-1 rounded-full">
                  DEFAULT
                </span>
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-deep-espresso uppercase">
                    {addr.type}
                  </span>
                </div>
                
                <div className="space-y-1 mb-6">
                  <p className="font-sans-body text-sm font-semibold text-deep-espresso">{addr.name}</p>
                  <p className="font-sans-body text-sm text-deep-espresso/80">{addr.line1}</p>
                  {addr.line2 && <p className="font-sans-body text-sm text-deep-espresso/80">{addr.line2}</p>}
                  <p className="font-sans-body text-sm text-deep-espresso/80">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="font-sans-body text-xs text-deep-espresso/60 pt-2 font-mono">Mobile: {addr.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4 border-t border-champagne/30 text-xs font-sans-body">
                <button 
                  onClick={() => handleOpenEdit(addr)}
                  className="flex items-center gap-1.5 text-deep-espresso/70 hover:text-deep-espresso transition-colors font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(addr.addressId)}
                  className="flex items-center gap-1.5 text-deep-espresso/60 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr.addressId)}
                    className="ml-auto text-terracotta hover:underline font-medium"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-warm-ivory rounded-2xl p-6 sm:p-8 shadow-2xl border border-champagne/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-champagne/30 mb-6">
              <h2 className="font-serif-display text-2xl text-deep-espresso">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-deep-espresso/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  placeholder="House / Flat / Building, Street"
                  className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="space-y-1">
                <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  placeholder="Landmark, Area"
                  className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-4 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-3 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-3 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full h-11 bg-white/70 border border-champagne/40 rounded-xl px-3 text-sm text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase font-semibold">
                  Type:
                </label>
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans-fashion tracking-wider ${
                      form.type === t
                        ? 'bg-deep-espresso text-warm-ivory'
                        : 'bg-white/60 text-deep-espresso/70 border border-champagne/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans-body text-deep-espresso/80">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="rounded border-champagne text-terracotta focus:ring-terracotta"
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>

              <div className="pt-6 border-t border-champagne/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-champagne/50 text-xs font-sans-fashion tracking-wider uppercase text-deep-espresso/70 hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-deep-espresso text-warm-ivory text-xs font-sans-fashion tracking-widest uppercase hover:bg-terracotta transition-colors disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
