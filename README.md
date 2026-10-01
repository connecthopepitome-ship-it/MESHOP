# Royal Silks Boutique — Premium Saree E-Commerce Storefront (`MESHOP`)

A production-quality, mobile-first saree-only storefront designed for **Royal Silks Boutique**. Built with **Next.js (App Router), React, TypeScript, and Tailwind CSS**. 

The architecture features a clean repository layer (`GoogleSheetsRepository`) backed by Google Sheets & Google Apps Script for catalogue and order management, while maintaining pluggable provider interfaces (`PaymentProvider`, `ShippingProvider`, `FulfillmentProvider`) for seamless future migration to Firebase/Firestore, Razorpay, Shiprocket, and approved fulfilment connectors.

---

## 1. Customer Shopping Flow

```text
Instagram / Social / Direct Traffic
             ↓
Editorial Storefront (Warm Ivory & Champagne Gold Aesthetics)
             ↓
Category / Collection / Multi-Filter & Search
             ↓
Product Detail Page (Gallery, Pincode Checker, WhatsApp Stylist)
             ↓
Blouse Size Identifier (XS–3XL Tailoring Algorithm)
             ↓
Slide-over Cart & Wishlist Drawers
             ↓
Address-Validated Checkout (Promo Coupons, SSL Security)
             ↓
Order Confirmation & Live Shipment Tracking Timeline
```

---

## 2. Technology Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5
* **Styling**: Tailwind CSS (custom luxury design tokens: Warm Ivory `#FAF9F5`, Deep Charcoal `#1A1A1A`, Champagne Gold `#C5A059`, Burgundy `#671E2E`, Playfair Display & Plus Jakarta Sans typography)
* **Icons**: Lucide React
* **Data Abstraction**: Repository Pattern (`GoogleSheetsRepository` with local mock fallback)
* **Pluggable Adapters**:
  * `PaymentProvider` (`MockRazorpayPaymentAdapter` / COD)
  * `ShippingProvider` (`MockShiprocketShippingAdapter`)
  * `FulfillmentProvider` (`ManualFulfillmentAdapter` - Meesho Integration Boundary)
* **Persistence**: Browser `localStorage` for guest wishlist, cart items, promo coupons, order history, and saved blouse measurements.

---

## 3. Local Development Setup

### Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher

### Installation Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build & type validation
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Environment Configuration

Create a `.env.local` file at the root of the project:

```env
# Storefront Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Apps Script Web App Endpoint URL for Google Sheets Backend
NEXT_PUBLIC_CATALOG_API_URL=https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec

# WhatsApp Stylist Concierge Number
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Currency Configuration
NEXT_PUBLIC_CURRENCY=INR
NEXT_PUBLIC_ENABLE_COD=true
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=10000
```

> **Security Note**: Never expose private Google service account keys or supplier secrets in `NEXT_PUBLIC_` prefixed environment variables. Internal supplier metadata (`meeshoProductUrl`, `supplierReference`) is automatically sanitized and stripped by `GoogleSheetsRepository` before reaching client UI components.

---

## 5. Google Sheets MVP Backend Setup

Create a Google Spreadsheet containing the following 6 tabs:
1. `Products`
2. `Categories`
3. `Collections`
4. `Orders`
5. `Coupons`
6. `Reviews`

### Header Schema for `Products`

```text
productId | sku | name | slug | category | subcategory | collection | tags | shortDescription | description | price | compareAtPrice | currency | fabric | colour | pattern | occasion | workType | sareeLength | blousePieceLength | blouseIncluded | blouseSizesAvailable | careInstructions | fitNotes | stockQty | stockStatus | featured | bestseller | newArrival | rating | reviewCount | mainImage | galleryImages | videoUrl | meeshoProductUrl | published | sortOrder | createdAt | updatedAt
```

### Parsing & Publishing Rules
* **Published State**: Set `published = TRUE` for a row to render on the storefront.
* **Delimiters**: Pipe (`|`) or newline delimited strings for `galleryImages` and `tags`. Comma-delimited for `blouseSizesAvailable`.
* **Private Boundaries**: `meeshoProductUrl` is stored in the sheet for internal backend fulfilment reference only and is never served to client browsers.

---

## 6. Project Structure

```text
MESHOP/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Luxury Editorial Homepage
│   │   ├── shop/                        # Catalogue Page & Category Landing
│   │   ├── collections/[slug]/          # Collection Spotlight
│   │   ├── product/[slug]/              # Product Detail Page (PDP)
│   │   ├── search/                      # Instant Search & Filter Results
│   │   ├── wishlist/                    # Saved Items
│   │   ├── cart/                        # Shopping Bag
│   │   ├── checkout/                    # Address & Payment Checkout
│   │   ├── order-confirmation/[id]/     # Order Receipt
│   │   ├── track-order/                 # Live Order Status Timeline
│   │   ├── size-guide/                  # Blouse Size Assistant & Table
│   │   ├── shipping-and-returns/        # Delivery Policies
│   │   ├── contact/                     # WhatsApp & Concierge Contact
│   │   ├── about/                       # Brand Heritage Story
│   │   ├── privacy/                     # Privacy Policy
│   │   ├── terms/                       # Terms of Service
│   │   └── refund-policy/               # Refund Policy
│   ├── components/
│   │   ├── layout/                      # Header, Footer, AnnouncementBar
│   │   ├── catalog/                     # ProductCard, FilterSidebar, MobileFilterDrawer, CatalogView
│   │   ├── cart/                        # CartDrawer
│   │   ├── size/                        # BlouseSizeModal
│   │   └── shared/                      # QuickViewModal
│   ├── context/                         # CartContext, WishlistContext
│   ├── data/                            # sizeChart algorithm, fallback mockData
│   ├── lib/
│   │   ├── api/                         # GoogleSheetsRepository
│   │   ├── adapters/                    # Payment, Shipping, & Fulfilment Adapters
│   │   ├── analytics.ts                 # Privacy-focused Event Tracker
│   │   └── utils.ts                     # Currency & Slug Helpers
│   └── types/                           # TypeScript Domain Definitions
├── tailwind.config.js                   # Luxury Design Tokens
├── tsconfig.json                        # TypeScript Configuration
└── package.json
```

---

## 7. Verification & Production Quality

* **TypeScript Validation**: Passed cleanly (`tsc --noEmit`).
* **ESLint Validation**: Passed cleanly (`next lint`).
* **Next.js Production Build**: Built optimized static & dynamic pages cleanly (`next build`).
