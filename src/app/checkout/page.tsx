'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Lock, Check, ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, CreditCard, Truck, Edit2, AlertCircle, ChevronRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { repository } from '@/lib/api/googleSheetsRepository';
import { defaultPaymentProvider } from '@/lib/adapters/paymentAdapter';
import { trackEvent } from '@/lib/analytics';

const CheckoutHeader = () => (
  <header className="w-full sorayva-glass-bar sticky top-0 z-40 border-b border-brand-border/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <Link href="/cart" className="flex items-center text-xs font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-charcoal transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Back to Bag</span>
      </Link>
      <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
        <span className="font-serif-display text-xl tracking-widest text-brand-charcoal">SORAYVA</span>
        <span className="text-[9px] font-semibold tracking-widest uppercase text-brand-muted mt-0.5">Secure Checkout</span>
      </div>
      <div className="flex items-center text-xs font-semibold tracking-widest uppercase text-brand-gold">
        <Lock className="w-3.5 h-3.5" />
      </div>
    </div>
  </header>
);

const InputField = ({ label, required, className = "", ...props }: any) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-[10px] font-semibold uppercase tracking-widest text-brand-charcoal mb-1.5">
      {label} {required && <span className="text-brand-terracotta">*</span>}
    </label>
    <input 
      className="h-12 px-4 bg-white/50 border border-brand-border/60 rounded-xl focus:outline-none focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/10 transition-all text-sm placeholder:text-brand-muted/40 font-medium"
      required={required}
      {...props}
    />
  </div>
);

export default function CheckoutPage() {
  const { cart, subtotal, discount, shipping, total, clearCart, appliedCoupon } = useCart();
  
  const [step, setStep] = useState(1);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'online_razorpay' as 'online_razorpay' | 'cod',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Autofill support via useEffect or just relying on browser
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-brand-base flex flex-col">
        <CheckoutHeader />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center">
            <Lock className="w-6 h-6 text-brand-muted" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif-editorial text-3xl text-brand-charcoal">Your Bag is Empty</h1>
            <p className="text-sm text-brand-muted max-w-md mx-auto">There are no items in your bag to checkout. Discover our latest collections.</p>
          </div>
          <Link href="/shop" className="inline-flex items-center justify-center h-12 px-8 bg-brand-espresso text-brand-ivory text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand-charcoal transition-all">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(null);
  };

  const validateDelivery = () => {
    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setErrorMsg('Please complete all required delivery fields.');
      return false;
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return false;
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateDelivery()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateDelivery()) {
      setStep(1);
      return;
    }
    
    setErrorMsg(null);
    setIsSubmitting(true);
    trackEvent('begin_checkout', { itemCount: cart.length, total });

    try {
      const paymentRes = await defaultPaymentProvider.processPayment(
        `TEMP-${Date.now()}`,
        total,
        'INR',
        formData.paymentMethod
      );

      if (!paymentRes.success) {
        setErrorMsg(paymentRes.error || 'Payment authorization failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const orderPayload = {
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        shippingAddress: {
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        items: cart.map((c) => ({
          productId: c.product.productId,
          sku: c.product.sku || c.product.productId,
          name: c.product.name,
          price: c.product.price,
          selectedBlouseSize: c.selectedBlouseSize,
          quantity: c.quantity,
          mainImage: c.product.mainImage,
        })),
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: (formData.paymentMethod === 'cod' ? 'PENDING' : 'PAID') as any,
        fulfillmentStatus: 'NEW' as any,
        notes: formData.notes,
      };

      const result = await repository.createOrder(orderPayload);

      if (result.success) {
        trackEvent('purchase', { orderId: result.orderId, total });
        clearCart();
        window.location.href = `/order-confirmation/${result.orderId}`;
      } else {
        setErrorMsg(result.error || 'Order creation failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('An unexpected network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const SummaryContent = () => (
    <div className="space-y-6">
      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 no-scrollbar">
        {cart.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            <div className="relative w-16 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 border border-brand-border/40">
              <Image src={item.product.mainImage} alt={item.product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 pt-1">
              <p className="font-serif-editorial text-sm font-medium text-brand-charcoal line-clamp-2 leading-tight mb-1">{item.product.name}</p>
              <div className="text-[11px] text-brand-muted space-y-0.5">
                <p>Qty: {item.quantity}</p>
                {item.selectedBlouseSize && <p>Size: {item.selectedBlouseSize}</p>}
              </div>
            </div>
            <div className="pt-1 text-right">
              <span className="font-sans font-semibold text-sm text-brand-charcoal">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-brand-border/50 pt-4 space-y-3">
        <div className="flex justify-between text-sm text-brand-muted">
          <span>Subtotal</span>
          <span className="font-medium text-brand-charcoal">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-brand-terracotta font-medium">
            <span>Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-brand-muted">
          <span>Shipping</span>
          <span className="font-medium text-brand-charcoal">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
      </div>

      <div className="border-t border-brand-border pt-4 flex justify-between items-end">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-widest text-brand-muted mb-1">Total</span>
          <span className="text-[10px] text-brand-muted">Inclusive of taxes</span>
        </div>
        <span className="font-serif-display text-2xl font-medium text-brand-espresso">{formatPrice(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-base flex flex-col relative pb-safe">
      <CheckoutHeader />
      
      {/* Step Indicator */}
      <div className="pt-8 pb-4">
        <div className="flex items-center justify-center space-x-3">
          <button onClick={() => setStep(1)} className={`flex items-center space-x-2 transition-colors ${step === 1 ? 'text-brand-charcoal' : 'text-brand-muted hover:text-brand-charcoal'}`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${step === 1 ? 'bg-brand-charcoal text-white' : step === 2 ? 'bg-brand-terracotta text-white' : 'bg-brand-surface border border-brand-border'}`}>
              {step === 2 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest">Delivery</span>
          </button>
          <div className={`w-8 h-[1px] ${step === 2 ? 'bg-brand-terracotta' : 'bg-brand-border'}`} />
          <div className={`flex items-center space-x-2 ${step === 2 ? 'text-brand-charcoal' : 'text-brand-muted'}`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${step === 2 ? 'bg-brand-charcoal text-white' : 'bg-brand-surface border border-brand-border'}`}>
              2
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest">Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:pb-12 pt-4">
        
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
          
          {/* LEFT: FORM (60%) */}
          <div className="w-full lg:w-3/5 space-y-6">
            
            {/* STEP 1: DELIVERY */}
            <div className={`transition-all duration-300 ${step === 2 ? 'opacity-60 grayscale-[0.2]' : 'opacity-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-terracotta mb-1 block">Step 01</span>
                  <h2 className="font-serif-editorial text-2xl text-brand-charcoal">Delivery Details</h2>
                </div>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-[10px] font-semibold uppercase tracking-widest text-brand-charcoal flex items-center border border-brand-border px-3 py-1.5 rounded-full hover:bg-brand-surface transition-colors">
                    <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                  </button>
                )}
              </div>
              
              <div className="sorayva-glass-card rounded-2xl p-5 sm:p-8 relative overflow-hidden">
                {step === 2 && <div className="absolute inset-0 bg-white/40 z-10" />}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                  <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Ananya Sharma" required autoComplete="name" />
                  <InputField label="Mobile Number" name="mobile" type="tel" inputMode="tel" value={formData.mobile} onChange={handleChange} placeholder="+91" required autoComplete="tel" />
                  <InputField label="Email Address" name="email" type="email" inputMode="email" value={formData.email} onChange={handleChange} placeholder="For receipt & tracking" required autoComplete="email" className="sm:col-span-2" />
                  
                  <div className="sm:col-span-2 pt-2">
                    <div className="h-px w-full bg-brand-border/40" />
                  </div>

                  <InputField label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="House/Flat No., Building, Street" required autoComplete="address-line1" className="sm:col-span-2" />
                  <InputField label="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Landmark, Area" autoComplete="address-line2" className="sm:col-span-2" />
                  
                  <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" required autoComplete="address-level2" />
                  <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" required autoComplete="address-level1" />
                  <InputField label="Pincode" name="pincode" inputMode="numeric" maxLength={6} value={formData.pincode} onChange={handleChange} placeholder="400001" required autoComplete="postal-code" />
                  <InputField label="Country" name="country" value={formData.country} readOnly className="opacity-70 pointer-events-none" />
                </div>

                {step === 1 && (
                  <div className="mt-8">
                    <button onClick={handleNextStep} className="w-full sm:w-auto px-8 h-14 bg-brand-espresso text-brand-ivory font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-charcoal transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                      Continue to Payment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: PAYMENT */}
            <div className={`transition-all duration-300 ${step === 1 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-terracotta mb-1 block">Step 02</span>
                <h2 className="font-serif-editorial text-2xl text-brand-charcoal">Secure Payment</h2>
              </div>
              
              <div className="sorayva-glass-card rounded-2xl p-5 sm:p-8 space-y-4">
                {/* Online Payment Option */}
                <label className={`relative block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.paymentMethod === 'online_razorpay' ? 'border-brand-terracotta bg-brand-terracotta/5 shadow-sm' : 'border-brand-border bg-white/50 hover:bg-white/80'
                }`}>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input type="radio" name="paymentMethod" value="online_razorpay" checked={formData.paymentMethod === 'online_razorpay'} onChange={handleChange} className="w-4 h-4 text-brand-terracotta focus:ring-brand-terracotta border-brand-border" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-semibold text-brand-charcoal">Online Payment</span>
                        <div className="flex space-x-1.5 opacity-80">
                          <CreditCard className="w-4 h-4 text-brand-charcoal" />
                        </div>
                      </div>
                      <span className="block text-xs text-brand-muted mt-1 leading-relaxed">UPI, Credit/Debit Cards, Net Banking.<br/>Secure payment processed by our gateway partner.</span>
                    </div>
                  </div>
                </label>

                {/* COD Option */}
                <label className={`relative block p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.paymentMethod === 'cod' ? 'border-brand-terracotta bg-brand-terracotta/5 shadow-sm' : 'border-brand-border bg-white/50 hover:bg-white/80'
                }`}>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-4 h-4 text-brand-terracotta focus:ring-brand-terracotta border-brand-border" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-semibold text-brand-charcoal">Cash on Delivery</span>
                      </div>
                      <span className="block text-xs text-brand-muted mt-1 leading-relaxed">Pay with cash when your order arrives.</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Desktop Place Order Button */}
              {step === 2 && (
                <div className="hidden lg:block mt-8">
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full h-16 bg-brand-espresso text-brand-ivory font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-charcoal transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-between px-8 group"
                  >
                    <span>{isSubmitting ? 'Processing Securely...' : 'Place Order'}</span>
                    {!isSubmitting && (
                      <span className="flex items-center">
                        {formatPrice(total)} <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                  <div className="mt-4 flex items-center justify-center space-x-6 text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                    <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Secure</span>
                    <span className="flex items-center"><Truck className="w-3.5 h-3.5 mr-1.5" /> Insured</span>
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1.5" /> Authentic</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DESKTOP ORDER SUMMARY (40%) */}
          <div className="hidden lg:block lg:w-2/5">
            <div className="sticky top-24">
              <div className="mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-terracotta mb-1 block">Your Order</span>
                <h2 className="font-serif-editorial text-2xl text-brand-charcoal">{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</h2>
              </div>
              <div className="sorayva-glass-card rounded-2xl p-6 shadow-sm">
                <SummaryContent />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE COLLAPSIBLE SUMMARY */}
      <div className="lg:hidden fixed bottom-[72px] sm:bottom-[80px] left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-xl border-t border-brand-border shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pb-safe transition-all duration-300">
        <button 
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full h-12 flex items-center justify-between px-4 sm:px-6"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-charcoal flex items-center">
            Order Summary {isMobileSummaryOpen ? <ChevronDown className="w-3.5 h-3.5 ml-1.5" /> : <ChevronUp className="w-3.5 h-3.5 ml-1.5" />}
          </span>
          <span className="font-serif-editorial font-medium text-lg text-brand-charcoal">{formatPrice(total)}</span>
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out px-4 sm:px-6 ${isMobileSummaryOpen ? 'max-h-[60vh] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-2">
            <SummaryContent />
          </div>
        </div>
      </div>

      {/* MOBILE STICKY CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-base border-t border-brand-border p-3 sm:p-4 pb-safe flex items-center">
        {step === 1 ? (
          <button 
            onClick={handleNextStep}
            className="w-full h-12 sm:h-14 bg-brand-espresso text-brand-ivory font-semibold text-[11px] sm:text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center"
          >
            Continue to Payment
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 sm:h-14 bg-brand-espresso text-brand-ivory font-semibold text-[11px] sm:text-xs uppercase tracking-widest rounded-xl shadow-md disabled:opacity-70 flex items-center justify-between px-6"
          >
            <span>{isSubmitting ? 'Processing...' : 'Place Order'}</span>
            {!isSubmitting && <span>{formatPrice(total)}</span>}
          </button>
        )}
      </div>

    </div>
  );
}
