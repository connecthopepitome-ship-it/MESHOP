'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ShippingSettings, CourierPartnerConfig } from '@/types/orders';
import { ShipmentService } from '@/lib/services/shipmentService';
import {
  Truck,
  CheckCircle2,
  Sliders,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings>(ShipmentService.getShippingSettings());
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setSettings(ShipmentService.getShippingSettings());
  }, []);

  const handleSave = () => {
    const updated = ShipmentService.saveShippingSettings(settings);
    setSettings(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleTogglePartner = (id: string) => {
    const updatedPartners = settings.courierPartners.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    setSettings({ ...settings, courierPartners: updatedPartners });
  };

  const handleUpdateTemplate = (id: string, url: string) => {
    const updatedPartners = settings.courierPartners.map((p) =>
      p.id === id ? { ...p, trackingUrlTemplate: url } : p
    );
    setSettings({ ...settings, courierPartners: updatedPartners });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-fadeIn">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-brand-border/60 pb-3">
          <Link
            href="/admin/settings/shipping"
            className="px-4 py-2 rounded-lg text-xs font-sans font-semibold bg-deep-espresso text-warm-ivory shadow-sm"
          >
            Shipping & Courier Setup
          </Link>
          <Link
            href="/admin/settings/notifications"
            className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-brand-muted hover:text-deep-espresso hover:bg-white/40 transition-colors"
          >
            Notification Preferences
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl border border-brand-border shadow-subtle">
          <div>
            <h1 className="text-2xl font-serif-display font-medium text-deep-espresso flex items-center space-x-2.5">
              <Truck className="w-6 h-6 text-terracotta" />
              <span>Shipping & Logistics Settings</span>
            </h1>
            <p className="text-xs font-sans text-brand-muted mt-1.5">
              Configure supported courier integrations, automatic tracking URL patterns, package dimensions and shipping rates.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-5 py-2.5 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Shipping configuration successfully saved and persisted.</span>
          </div>
        )}

        {/* Courier Partner Settings */}
        <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border/40 pb-3">
            <h2 className="text-base font-serif-display font-medium text-deep-espresso">
              Integrated Courier Partners
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Staff can select from these carriers during order dispatch. Tracking URLs automatically interpolate <code className="text-terracotta font-mono font-bold">&#123;AWB&#125;</code>.
            </p>
          </div>

          <div className="space-y-3">
            {settings.courierPartners.map((partner) => (
              <div
                key={partner.id}
                className="p-4 rounded-xl bg-white/60 border border-brand-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-3">
                    <strong className="text-sm font-serif-display text-deep-espresso">{partner.name}</strong>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      partner.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {partner.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <label className="text-[10px] text-brand-muted uppercase font-semibold block">Tracking URL Pattern</label>
                    <input
                      type="text"
                      value={partner.trackingUrlTemplate}
                      onChange={(e) => handleUpdateTemplate(partner.id, e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-brand-border/60 rounded px-2.5 py-1 text-deep-espresso focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div className="sm:self-center">
                  <button
                    onClick={() => handleTogglePartner(partner.id)}
                    className={`px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors ${
                      partner.active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {partner.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Rates & Packaging Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rates */}
          <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
            <h2 className="text-base font-serif-display font-medium text-deep-espresso border-b border-brand-border/40 pb-2">
              Shipping Rates & Thresholds
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                  Complimentary Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                  Standard Surface Shipping Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                  className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                  Express Air Courier Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.expressShippingFee}
                  onChange={(e) => setSettings({ ...settings, expressShippingFee: Number(e.target.value) })}
                  className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>
          </div>

          {/* Packaging Presets */}
          <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
            <h2 className="text-base font-serif-display font-medium text-deep-espresso border-b border-brand-border/40 pb-2">
              Default Luxury Parcel Presets
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                  Default Weight per Saree Parcel
                </label>
                <input
                  type="text"
                  value={settings.defaultWeight}
                  onChange={(e) => setSettings({ ...settings, defaultWeight: e.target.value })}
                  placeholder="e.g. 1.2 kg"
                  className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                  Default Saree Box Dimensions (L x W x H)
                </label>
                <input
                  type="text"
                  value={settings.defaultDimensions}
                  onChange={(e) => setSettings({ ...settings, defaultDimensions: e.target.value })}
                  placeholder="e.g. 38 x 28 x 8 cm"
                  className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="p-3 bg-warm-ivory/60 rounded border border-brand-border/40 text-[11px] text-brand-muted mt-4">
                These defaults pre-fill the shipment creator modal to expedite atelier packing and label generation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
