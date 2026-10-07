'use client';

import React, { useState } from 'react';
import { InternalProduct, ProductStatus } from '@/types';
import { ProductImage } from '@/components/shared/ProductImage';
import { LiveProductPreviewModal } from '@/components/admin/LiveProductPreviewModal';
import { calculateDiscountPercentage } from '@/lib/utils';
import {
  Save,
  Eye,
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Package,
  Layers,
  Info,
  ArrowLeft,
  X
} from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: Partial<InternalProduct>;
  isEdit?: boolean;
  onSave: (product: InternalProduct) => Promise<{ success: boolean; error?: string }>;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false, onSave }) => {
  const [formData, setFormData] = useState<Partial<InternalProduct>>({
    productId: initialData?.productId || `SAR-${Date.now().toString(36).toUpperCase()}`,
    productName: initialData?.productName || initialData?.name || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || 'Silk Sarees',
    subcategory: initialData?.subcategory || '',
    fabric: initialData?.fabric || 'Silk',
    occasion: initialData?.occasion || ['Festive', 'Party'],
    style: initialData?.style || ['Traditional'],
    work: initialData?.work || ['Zari'],
    pattern: initialData?.pattern || 'Traditional',
    colour: initialData?.colour || 'Crimson Red',
    colourFamily: initialData?.colourFamily || 'Red',
    collection: initialData?.collection || ['The Royal Heritage Edit'],
    price: initialData?.price ?? 14990,
    compareAtPrice: initialData?.compareAtPrice ?? 18000,
    stock: initialData?.stock ?? initialData?.stockQty ?? 5,
    status: initialData?.status || 'Draft',
    featured: initialData?.featured ?? true,
    newArrival: initialData?.newArrival ?? true,
    trending: initialData?.trending ?? false,
    bestseller: initialData?.bestseller ?? true,
    publishDate: initialData?.publishDate || new Date().toISOString().split('T')[0],
    mainImage: initialData?.mainImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    galleryImages: initialData?.galleryImages || initialData?.images || [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    images: initialData?.images || initialData?.galleryImages || [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
    ],
    sizeType: initialData?.sizeType || 'Standard Saree (5.5m)',
    blouseSize: initialData?.blouseSize || ['Unstitched', 'S', 'M', 'L', 'XL'],
    sizeChart: initialData?.sizeChart || 'Saree Length: 5.5 meters | Blouse Piece: 0.8 meters',
    shippingInfo: initialData?.shippingInfo || 'Complimentary insured shipping across India.',
    returnInfo: initialData?.returnInfo || '7 days easy returns & exchange policy.',
    rating: initialData?.rating ?? 4.8,
    reviewCount: initialData?.reviewCount ?? 12,
    currency: 'INR',
    // INTERNAL PRIVATE FIELDS
    meeshoReferenceLink: initialData?.meeshoReferenceLink || '',
    sourceCost: initialData?.sourceCost ?? undefined,
    sourceStatus: initialData?.sourceStatus || 'In Stock',
    supplierReference: initialData?.supplierReference || '',
    lastSourceCheck: initialData?.lastSourceCheck || new Date().toISOString().split('T')[0]
  });

  const [image2, setImage2] = useState<string>(formData.galleryImages?.[1] || '');
  const [image3, setImage3] = useState<string>(formData.galleryImages?.[2] || '');
  const [image4, setImage4] = useState<string>(formData.galleryImages?.[3] || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Live discount % calculation
  const computedDiscount = calculateDiscountPercentage(formData.price || 0, formData.compareAtPrice);

  const handleArrayInput = (field: keyof InternalProduct, valueStr: string) => {
    const items = valueStr.split(',').map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  const formatArrayForInput = (val: any): string => {
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') return val;
    return '';
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.productId?.trim()) errs.productId = 'Product ID is required.';
    if (!formData.productName?.trim()) errs.productName = 'Product Name is required.';
    if (!formData.category?.trim()) errs.category = 'Category is required.';

    if (formData.price === undefined || formData.price < 0) {
      errs.price = 'Price must be 0 or greater.';
    }

    if (formData.compareAtPrice !== undefined && formData.compareAtPrice <= (formData.price || 0)) {
      errs.compareAtPrice = 'Compare At Price must be strictly greater than selling Price.';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      errs.stock = 'Stock quantity cannot be negative.';
    }

    if (formData.rating !== undefined && (formData.rating < 0 || formData.rating > 5)) {
      errs.rating = 'Rating must be between 0 and 5.';
    }

    if (formData.status === 'Active') {
      if (!formData.mainImage?.trim()) {
        errs.mainImage = 'Main Image URL is required to publish Active product.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (targetStatus?: ProductStatus) => {
    setFeedbackMsg(null);
    const statusToSet = targetStatus || formData.status || 'Draft';
    
    const updatedData: Partial<InternalProduct> = {
      ...formData,
      status: statusToSet,
      name: formData.productName || formData.name,
      stockQty: formData.stock ?? 5,
      images: [formData.mainImage || '', image2, image3, image4].filter(Boolean),
      galleryImages: [formData.mainImage || '', image2, image3, image4].filter(Boolean)
    };

    if (!validate()) {
      setFeedbackMsg({ type: 'error', msg: 'Please resolve form validation errors before saving.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await onSave(updatedData as InternalProduct);
      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          msg: `Product updated successfully. Google Sheet: Updated • Catalogue: Refreshing...`
        });
      } else {
        setFeedbackMsg({ type: 'error', msg: res.error || 'Failed to save product to Google Sheets.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', msg: 'An unexpected error occurred while communicating with the Apps Script API.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl shadow-subtle">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="p-2.5 bg-white hover:bg-brand-surface border border-brand-border text-brand-muted hover:text-deep-espresso rounded-lg transition-colors shadow-sm"
            title="Back to Saree Catalogue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
              <span>{isEdit ? `Edit Saree: ${formData.productId}` : 'Create New Saree'}</span>
            </h1>
            <p className="text-sm text-brand-muted font-sans mt-1">
              Changes sync directly to the Google Sheets catalogue database.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center space-x-2 bg-white hover:bg-brand-surface text-brand-muted hover:text-deep-espresso border border-brand-border px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSubmit('Draft')}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          {/* Publish Active */}
          <button
            type="button"
            onClick={() => handleSubmit('Active')}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-sm font-sans flex items-start justify-between shadow-sm animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-3 font-medium">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedbackMsg.msg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-lg leading-none font-medium hover:opacity-60">&times;</button>
        </div>
      )}

      {/* Form Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Product Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="sorayva-glass-card rounded-xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-serif-editorial font-medium text-deep-espresso flex items-center space-x-2.5 border-b border-brand-border pb-4">
              <Layers className="w-5 h-5 text-terracotta" />
              <span>1. Basic Product Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Product ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.productId || ''}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow font-mono"
                  placeholder="e.g. SAR-001"
                />
                {errors.productId && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.productId}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.category || 'Silk Sarees'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow appearance-none cursor-pointer"
                >
                  <option value="Silk Sarees">Silk Sarees</option>
                  <option value="Organza & Tissue">Organza & Tissue</option>
                  <option value="Chiffon & Georgette">Chiffon & Georgette</option>
                  <option value="Festive & Wedding">Festive & Wedding</option>
                  <option value="Block Print & Handloom">Block Print & Handloom</option>
                </select>
                {errors.category && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                Product Title / Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.productName || ''}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value, name: e.target.value })}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-base font-serif-editorial text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                placeholder="e.g. Royal Kanjeevaram Pure Silk Saree in Crimson & Pure Gold Zari"
              />
              {errors.productName && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.productName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={formData.subcategory || ''}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Kanjeevaram, Banarasi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value, description: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Handwoven pure Mulberry silk saree with gold zari pallu."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MERCHANDISING & TAXONOMY */}
          <div className="sorayva-glass-card rounded-xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-serif-editorial font-medium text-deep-espresso flex items-center space-x-2.5 border-b border-brand-border pb-4">
              <Tag className="w-5 h-5 text-terracotta" />
              <span>2. Merchandising & Taxonomy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Fabric</label>
                <select
                  value={formData.fabric || 'Silk'}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow appearance-none cursor-pointer"
                >
                  <option value="Silk">Silk</option>
                  <option value="Organza">Organza</option>
                  <option value="Georgette">Georgette</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Linen">Linen</option>
                  <option value="Satin">Satin</option>
                  <option value="Silk Blend">Silk Blend</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Colour Name</label>
                <input
                  type="text"
                  value={formData.colour || ''}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Crimson Red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Colour Family</label>
                <input
                  type="text"
                  value={formData.colourFamily || ''}
                  onChange={(e) => setFormData({ ...formData, colourFamily: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Red, Pink, Green"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Occasion (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.occasion)}
                  onChange={(e) => handleArrayInput('occasion', e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Festive, Party, Wedding Guest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Style (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.style)}
                  onChange={(e) => handleArrayInput('style', e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Traditional, Statement, Elegant"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Work / Weave Craft
                </label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.work)}
                  onChange={(e) => handleArrayInput('work', e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Zari, Woven, Sequins"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Pattern</label>
                <input
                  type="text"
                  value={formData.pattern || ''}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. Paisley, Floral, Geometric"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Collection</label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.collection)}
                  onChange={(e) => handleArrayInput('collection', e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                  placeholder="e.g. The Royal Heritage Edit"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PRICING & INVENTORY */}
          <div className="sorayva-glass-card rounded-xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-serif-editorial font-medium text-deep-espresso flex items-center space-x-2.5 border-b border-brand-border pb-4">
              <DollarSign className="w-5 h-5 text-terracotta" />
              <span>3. Pricing & Inventory Control</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Selling Price (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow font-mono"
                  placeholder="e.g. 14990"
                />
                {errors.price && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Compare At Price (Struck Through ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.compareAtPrice ?? ''}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow font-mono"
                  placeholder="e.g. 18000"
                />
                {errors.compareAtPrice && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.compareAtPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                  Calculated Discount %
                </label>
                <div className="w-full bg-brand-surface border border-brand-border/60 rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-emerald-700 flex items-center shadow-inner h-[42px]">
                  {computedDiscount ? `${computedDiscount}% OFF` : <span className="text-brand-muted font-normal">No Discount</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock ?? ''}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow font-mono"
                  placeholder="e.g. 5"
                />
                {errors.stock && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                  Publish Status <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.status || 'Draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm font-medium text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow appearance-none cursor-pointer"
                >
                  <option value="Draft">Draft (Private Work in Progress)</option>
                  <option value="Active">Active (Publicly Visible)</option>
                  <option value="Out of Stock">Out of Stock (Visible with Badge)</option>
                  <option value="Hidden">Hidden (Private Hold)</option>
                  <option value="Discontinued">Discontinued (Archived)</option>
                </select>
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-brand-border/60">
              <label className="flex items-center space-x-2 text-sm font-medium text-deep-espresso cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.featured ?? true}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-brand-border/80 bg-white text-terracotta focus:ring-terracotta w-4 h-4"
                />
                <span className="group-hover:text-terracotta transition-colors">Featured Product</span>
              </label>

              <label className="flex items-center space-x-2 text-sm font-medium text-deep-espresso cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.newArrival ?? true}
                  onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                  className="rounded border-brand-border/80 bg-white text-terracotta focus:ring-terracotta w-4 h-4"
                />
                <span className="group-hover:text-terracotta transition-colors">New Arrival</span>
              </label>

              <label className="flex items-center space-x-2 text-sm font-medium text-deep-espresso cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.trending ?? false}
                  onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                  className="rounded border-brand-border/80 bg-white text-terracotta focus:ring-terracotta w-4 h-4"
                />
                <span className="group-hover:text-terracotta transition-colors">Trending Badge</span>
              </label>
            </div>
          </div>

          {/* SECTION 4: IMAGES */}
          <div className="sorayva-glass-card rounded-xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-serif-editorial font-medium text-deep-espresso flex items-center space-x-2.5 border-b border-brand-border pb-4">
              <ImageIcon className="w-5 h-5 text-terracotta" />
              <span>4. Product Imagery</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                Main Image URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                value={formData.mainImage || ''}
                onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                placeholder="https://images.unsplash.com/..."
              />
              {errors.mainImage && <p className="text-xs font-medium text-rose-600 mt-1.5">{errors.mainImage}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Image 2 URL</label>
                <input
                  type="url"
                  value={image2}
                  onChange={(e) => setImage2(e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Image 3 URL</label>
                <input
                  type="url"
                  value={image3}
                  onChange={(e) => setImage3(e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Image 4 URL</label>
                <input
                  type="url"
                  value={image4}
                  onChange={(e) => setImage4(e.target.value)}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                />
              </div>
            </div>

            {/* Image Previews */}
            <div className="pt-4 border-t border-brand-border/60">
              <span className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">Live Image Previews</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[formData.mainImage, image2, image3, image4].map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] relative bg-brand-surface border border-brand-border/80 rounded-lg overflow-hidden shadow-sm">
                    {img ? (
                      <ProductImage src={img} alt={`Preview ${idx + 1}`} fill sizes="200px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted font-sans text-xs font-medium uppercase bg-warm-ivory">Slot {idx + 1} Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sizing, Customer Info & 🔒 INTERNAL SOURCING SECTION */}
        <div className="space-y-8">
          {/* SECTION 5: 🔒 INTERNAL SOURCING INFORMATION (ADMIN ONLY) */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-rose-200/80 pb-4">
              <h2 className="text-lg font-serif-editorial font-medium text-rose-800 flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Internal Sourcing</span>
              </h2>
              <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
                ADMIN ONLY
              </span>
            </div>

            <p className="text-[11px] text-rose-700 font-sans leading-relaxed">
              ⚠️ <strong>SECURITY BOUNDARY:</strong> These fields are saved to Google Sheets for backend inventory/fulfillment automation. They are <strong>NEVER</strong> returned by the public product API.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-rose-900 uppercase tracking-wider mb-2">
                  Meesho Reference Link
                </label>
                <input
                  type="url"
                  value={formData.meeshoReferenceLink || ''}
                  onChange={(e) => setFormData({ ...formData, meeshoReferenceLink: e.target.value })}
                  className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-rose-300 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-mono shadow-sm"
                  placeholder="https://meesho.com/saree/p/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 uppercase tracking-wider mb-2">
                    Source Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.sourceCost ?? ''}
                    onChange={(e) => setFormData({ ...formData, sourceCost: parseFloat(e.target.value) || undefined })}
                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-rose-300 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-mono shadow-sm"
                    placeholder="e.g. 1850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 uppercase tracking-wider mb-2">
                    Source Status
                  </label>
                  <input
                    type="text"
                    value={formData.sourceStatus || ''}
                    onChange={(e) => setFormData({ ...formData, sourceStatus: e.target.value })}
                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-rose-300 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 shadow-sm"
                    placeholder="In Stock / Low"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 uppercase tracking-wider mb-2">
                    Supplier Ref
                  </label>
                  <input
                    type="text"
                    value={formData.supplierReference || ''}
                    onChange={(e) => setFormData({ ...formData, supplierReference: e.target.value })}
                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-rose-300 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-mono shadow-sm"
                    placeholder="MEESHO-8821"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 uppercase tracking-wider mb-2">
                    Last Audit Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastSourceCheck || ''}
                    onChange={(e) => setFormData({ ...formData, lastSourceCheck: e.target.value })}
                    className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-rose-300 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: SIZING & BLOUSE DETAILS */}
          <div className="sorayva-glass-card rounded-xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-serif-editorial font-medium text-deep-espresso flex items-center space-x-2.5 border-b border-brand-border pb-4">
              <Package className="w-5 h-5 text-terracotta" />
              <span>5. Sizing & Blouse Details</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Size Type</label>
              <input
                type="text"
                value={formData.sizeType || ''}
                onChange={(e) => setFormData({ ...formData, sizeType: e.target.value })}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                placeholder="Standard Saree (5.5m)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">
                Blouse Sizes Available (Comma Separated)
              </label>
              <input
                type="text"
                value={formatArrayForInput(formData.blouseSize)}
                onChange={(e) => handleArrayInput('blouseSize', e.target.value)}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                placeholder="Unstitched, XS, S, M, L, XL, XXL"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Size Chart Notes</label>
              <input
                type="text"
                value={formData.sizeChart || ''}
                onChange={(e) => setFormData({ ...formData, sizeChart: e.target.value })}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
                placeholder="Saree Length: 5.5m | Blouse Piece: 0.8m"
              />
            </div>
          </div>

          {/* SECTION 7: CUSTOMER INFORMATION */}
          <div className="sorayva-glass-card rounded-xl p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-serif-editorial font-medium text-deep-espresso flex items-center space-x-2.5 border-b border-brand-border pb-4">
              <Info className="w-5 h-5 text-terracotta" />
              <span>6. Shipping, Returns & Ratings</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Shipping Info</label>
              <input
                type="text"
                value={formData.shippingInfo || ''}
                onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Return Info</label>
              <input
                type="text"
                value={formData.returnInfo || ''}
                onChange={(e) => setFormData({ ...formData, returnInfo: e.target.value })}
                className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating ?? 4.8}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-deep-espresso uppercase tracking-wider mb-2">Review Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reviewCount ?? 12}
                  onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-white/60 border border-brand-border rounded-lg px-4 py-2.5 text-sm text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <LiveProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        product={formData as InternalProduct}
      />
    </div>
  );
};
