'use client';

import React, { useState } from 'react';
import { MessageCircle, Mail, MapPin, Phone, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">At Your Service</span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Boutique Concierge</h1>
        <p className="text-xs text-brand-muted">Have a query about fabric weight, zari purity, or video call draping assistance?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-brand-surface p-6 border border-brand-border space-y-4">
          <h3 className="font-serif text-lg font-semibold text-brand-charcoal uppercase tracking-wider">
            Send an Inquiry
          </h3>

          {submitted ? (
            <div className="p-6 bg-brand-gold/15 text-brand-charcoal text-xs font-medium border border-brand-gold/40 text-center space-y-2">
              <p className="font-serif text-base font-semibold">Thank You for Reaching Out!</p>
              <p className="text-brand-muted">Our master draping stylist will respond within 4 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Your Name *</label>
                <input type="text" required placeholder="Ananya Roy" className="w-full bg-brand-base border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-gold" />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Email Address *</label>
                <input type="email" required placeholder="ananya@example.com" className="w-full bg-brand-base border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-gold" />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Message / Saree Query *</label>
                <textarea rows={4} required placeholder="Ask about Kanjeevaram silk weave or custom blouse tailoring..." className="w-full bg-brand-base border border-brand-border px-3 py-2 focus:outline-none focus:border-brand-gold" />
              </div>

              <button type="submit" className="w-full bg-brand-charcoal text-brand-base hover:bg-brand-gold hover:text-brand-charcoal py-3 px-4 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Information */}
        <div className="lg:col-span-5 space-y-6 text-xs text-brand-muted">
          <div className="p-6 bg-brand-surface border border-brand-border space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-charcoal uppercase tracking-wider">
              Direct Contact
            </h3>

            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-brand-gold mt-0.5" />
              <div>
                <span className="font-semibold text-brand-charcoal block uppercase">Boutique Concierge</span>
                <p>+91 98765 43210 (Mon - Sat, 10 AM - 7 PM IST)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MessageCircle className="w-4 h-4 text-green-700 mt-0.5" />
              <div>
                <span className="font-semibold text-brand-charcoal block uppercase">WhatsApp Video Concierge</span>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="text-brand-gold hover:underline font-medium">
                  Click to Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-brand-gold mt-0.5" />
              <div>
                <span className="font-semibold text-brand-charcoal block uppercase">Email Inquiries</span>
                <p>concierge@royalsilksboutique.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-brand-gold mt-0.5" />
              <div>
                <span className="font-semibold text-brand-charcoal block uppercase">Boutique Showroom</span>
                <p>42 Heritage Court, Civil Lines, New Delhi 110054</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
