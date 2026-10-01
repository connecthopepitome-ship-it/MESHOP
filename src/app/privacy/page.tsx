import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl space-y-6 text-xs text-brand-muted leading-relaxed">
      <h1 className="font-serif text-3xl text-brand-charcoal font-medium border-b border-brand-border pb-4">Privacy Policy</h1>
      <p>Your privacy is paramount to Royal Silks Boutique. We do not sell or rent personal information to third parties.</p>
      <h2 className="font-serif text-base font-semibold text-brand-charcoal uppercase tracking-wider mt-4">Data We Collect</h2>
      <p>We collect necessary contact information (name, mobile, email, shipping address) solely for fulfilling orders and communicating delivery status.</p>
      <h2 className="font-serif text-base font-semibold text-brand-charcoal uppercase tracking-wider mt-4">Payment Security</h2>
      <p>All online payment transactions are processed through SSL-encrypted Razorpay servers. No credit or debit card data is ever stored on our servers.</p>
    </div>
  );
}
