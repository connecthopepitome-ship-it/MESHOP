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
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            title="Back to products table"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>{isEdit ? `Edit Saree: ${formData.productId}` : 'Create New Saree'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Changes sync directly to the Google Sheets catalogue database.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>PREVIEW PRODUCT</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSubmit('Draft')}
            disabled={isSaving}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>SAVE DRAFT</span>
          </button>

          {/* Publish Active */}
          <button
            type="button"
            onClick={() => handleSubmit('Active')}
            disabled={isSaving}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded text-xs uppercase tracking-widest transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>PUBLISH ACTIVE</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-lg border text-xs font-sans flex items-start justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{feedbackMsg.msg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold hover:opacity-80">×</button>
        </div>
      )}

      {/* Form Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Product Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4" />
              <span>1. Basic Product Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.productId || ''}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-mono"
                  placeholder="e.g. SAR-001"
                />
                {errors.productId && <p className="text-[11px] text-rose-400 mt-1">{errors.productId}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category || 'Silk Sarees'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 uppercase tracking-wider"
                >
                  <option value="Silk Sarees">Silk Sarees</option>
                  <option value="Organza & Tissue">Organza & Tissue</option>
                  <option value="Chiffon & Georgette">Chiffon & Georgette</option>
                  <option value="Festive & Wedding">Festive & Wedding</option>
                  <option value="Block Print & Handloom">Block Print & Handloom</option>
                </select>
                {errors.category && <p className="text-[11px] text-rose-400 mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Product Title / Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.productName || ''}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-serif"
                placeholder="e.g. Royal Kanjeevaram Pure Silk Saree in Crimson & Pure Gold Zari"
              />
              {errors.productName && <p className="text-[11px] text-rose-400 mt-1">{errors.productName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={formData.subcategory || ''}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Kanjeevaram, Banarasi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Handwoven pure Mulberry silk saree with gold zari pallu."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MERCHANDISING & TAXONOMY */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Tag className="w-4 h-4" />
              <span>2. Merchandising & Taxonomy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Fabric</label>
                <select
                  value={formData.fabric || 'Silk'}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Colour Name</label>
                <input
                  type="text"
                  value={formData.colour || ''}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Crimson Red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Colour Family</label>
                <input
                  type="text"
                  value={formData.colourFamily || ''}
                  onChange={(e) => setFormData({ ...formData, colourFamily: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Red, Pink, Green"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Occasion (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.occasion)}
                  onChange={(e) => handleArrayInput('occasion', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Festive, Party, Wedding Guest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Style (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.style)}
                  onChange={(e) => handleArrayInput('style', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Traditional, Statement, Elegant"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Work / Weave Craft
                </label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.work)}
                  onChange={(e) => handleArrayInput('work', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Zari, Woven, Sequins"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Pattern</label>
                <input
                  type="text"
                  value={formData.pattern || ''}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. Paisley, Floral, Geometric"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Collection</label>
                <input
                  type="text"
                  value={formatArrayForInput(formData.collection)}
                  onChange={(e) => handleArrayInput('collection', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  placeholder="e.g. The Royal Heritage Edit"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PRICING & INVENTORY */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-4 h-4" />
              <span>3. Pricing & Inventory Control</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Selling Price (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-mono"
                  placeholder="e.g. 14990"
                />
                {errors.price && <p className="text-[11px] text-rose-400 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Compare At Price (Struck Through ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.compareAtPrice ?? ''}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-mono"
                  placeholder="e.g. 18000"
                />
                {errors.compareAtPrice && <p className="text-[11px] text-rose-400 mt-1">{errors.compareAtPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Calculated Discount %
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono font-bold text-emerald-400">
                  {computedDiscount ? `${computedDiscount}% OFF` : 'No Discount'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock ?? ''}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-mono"
                  placeholder="e.g. 5"
                />
                {errors.stock && <p className="text-[11px] text-rose-400 mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Publish Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.status || 'Draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 uppercase tracking-wider font-semibold"
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
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured ?? true}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span>Featured Product</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newArrival ?? true}
                  onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span>New Arrival</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trending ?? false}
                  onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span>Trending Badge</span>
              </label>
            </div>
          </div>

          {/* SECTION 4: IMAGES */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ImageIcon className="w-4 h-4" />
              <span>4. Product Imagery</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Main Image URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                value={formData.mainImage || ''}
                onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                placeholder="https://images.unsplash.com/..."
              />
              {errors.mainImage && <p className="text-[11px] text-rose-400 mt-1">{errors.mainImage}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Image 2 URL</label>
                <input
                  type="url"
                  value={image2}
                  onChange={(e) => setImage2(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Image 3 URL</label>
                <input
                  type="url"
                  value={image3}
                  onChange={(e) => setImage3(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Image 4 URL</label>
                <input
                  type="url"
                  value={image4}
                  onChange={(e) => setImage4(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Image Previews */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Image Previews:</span>
              <div className="grid grid-cols-4 gap-3">
                {[formData.mainImage, image2, image3, image4].map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] relative bg-slate-950 border border-slate-800 rounded overflow-hidden">
                    {img ? (
                      <ProductImage src={img} alt={`Preview ${idx + 1}`} fill sizes="150px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700 text-[10px] uppercase">Slot {idx + 1} Empty</div>
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
          <div className="bg-rose-950/20 border-2 border-rose-900/60 rounded-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Source / Internal Information</span>
              </h2>
              <span className="bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                ADMIN ONLY
              </span>
            </div>

            <p className="text-[11px] text-rose-300 font-light leading-relaxed">
              ⚠️ <strong>SECURITY BOUNDARY:</strong> These fields are saved to Google Sheets for backend inventory/fulfillment automation. They are <strong>NEVER</strong> returned by the public product API.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Meesho Reference Link
                </label>
                <input
                  type="url"
                  value={formData.meeshoReferenceLink || ''}
                  onChange={(e) => setFormData({ ...formData, meeshoReferenceLink: e.target.value })}
                  className="w-full bg-slate-950 border border-rose-900/60 rounded px-3 py-2 text-xs text-rose-200 focus:border-rose-500 font-mono"
                  placeholder="https://meesho.com/saree/p/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Source Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.sourceCost ?? ''}
                    onChange={(e) => setFormData({ ...formData, sourceCost: parseFloat(e.target.value) || undefined })}
                    className="w-full bg-slate-950 border border-rose-900/60 rounded px-3 py-2 text-xs text-rose-200 focus:border-rose-500 font-mono"
                    placeholder="e.g. 1850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Source Status
                  </label>
                  <input
                    type="text"
                    value={formData.sourceStatus || ''}
                    onChange={(e) => setFormData({ ...formData, sourceStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-rose-900/60 rounded px-3 py-2 text-xs text-rose-200 focus:border-rose-500"
                    placeholder="In Stock / Low"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Supplier Ref
                  </label>
                  <input
                    type="text"
                    value={formData.supplierReference || ''}
                    onChange={(e) => setFormData({ ...formData, supplierReference: e.target.value })}
                    className="w-full bg-slate-950 border border-rose-900/60 rounded px-3 py-2 text-xs text-rose-200 focus:border-rose-500 font-mono"
                    placeholder="MEESHO-8821"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Last Audit Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastSourceCheck || ''}
                    onChange={(e) => setFormData({ ...formData, lastSourceCheck: e.target.value })}
                    className="w-full bg-slate-950 border border-rose-900/60 rounded px-3 py-2 text-xs text-rose-200 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: SIZING & BLOUSE DETAILS */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Package className="w-4 h-4" />
              <span>5. Sizing & Blouse Details</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Size Type</label>
              <input
                type="text"
                value={formData.sizeType || ''}
                onChange={(e) => setFormData({ ...formData, sizeType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                placeholder="Standard Saree (5.5m)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Blouse Sizes Available (Comma Separated)
              </label>
              <input
                type="text"
                value={formatArrayForInput(formData.blouseSize)}
                onChange={(e) => handleArrayInput('blouseSize', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                placeholder="Unstitched, XS, S, M, L, XL, XXL"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Size Chart Notes</label>
              <input
                type="text"
                value={formData.sizeChart || ''}
                onChange={(e) => setFormData({ ...formData, sizeChart: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                placeholder="Saree Length: 5.5m | Blouse Piece: 0.8m"
              />
            </div>
          </div>

          {/* SECTION 7: CUSTOMER INFORMATION */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Info className="w-4 h-4" />
              <span>6. Shipping, Returns & Ratings</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Shipping Info</label>
              <input
                type="text"
                value={formData.shippingInfo || ''}
                onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Return Info</label>
              <input
                type="text"
                value={formData.returnInfo || ''}
                onChange={(e) => setFormData({ ...formData, returnInfo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating ?? 4.8}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Review Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reviewCount ?? 12}
                  onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:border-amber-500 font-mono"
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
