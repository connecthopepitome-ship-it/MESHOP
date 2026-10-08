'use client';

import React, { useEffect, useState } from 'react';
import { CustomerService } from '@/lib/services/CustomerService';
import { Customer } from '@/types/customer';

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await CustomerService.getProfile();
      if (data) {
        setCustomer(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || ''
        });
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    
    await CustomerService.updateProfile(formData);
    
    setIsSaving(false);
    setSuccessMsg('Profile updated successfully');
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <h1 className="font-serif-display text-3xl text-deep-espresso mb-6">Profile Details</h1>

      {successMsg && (
        <div className="p-3 bg-sage/10 border border-sage/30 rounded-lg text-sage text-sm font-sans-body">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="sorayva-glass-card rounded-2xl p-6 sm:p-8 border border-champagne/40 space-y-6">
        <div className="space-y-1">
          <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
            Full Name
          </label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
            className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all text-deep-espresso/60"
              disabled
            />
            <p className="text-[0.65rem] font-sans-body text-deep-espresso/50 pl-1 pt-1">Email cannot be changed.</p>
          </div>
          
          <div className="space-y-1">
            <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
              Mobile Number
            </label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
              className="w-full h-12 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-champagne/30 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="h-11 px-8 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors disabled:opacity-70"
          >
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}
