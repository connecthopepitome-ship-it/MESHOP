# implementation_plan.md

## Project
Premium Saree E-commerce Website for [BRAND_NAME]

## Objective

Build a production-quality, mobile-first saree-only storefront with a premium boutique visual system, Google Sheets-backed product catalogue, complete shopping UX, blouse size assistance, and an architecture that can later support Firebase, payments, shipping, and an approved fulfilment provider.

## 1. Existing Repository Inspection

Before implementation:

- Inspect package manager, framework, source folders, routing, styling system, test setup, lint configuration, deployment configuration, and environment files.
- Identify reusable components and do not replace working infrastructure without reason.
- Check whether an app router/pages router or equivalent routing model exists.
- Confirm image handling and hosting approach.
- Document current constraints in this plan.

## 2. Proposed Architecture

### Frontend

Prefer the repository's existing production framework. If greenfield, use a modern TypeScript React stack, preferably Next.js, with a utility-first styling system and a component architecture suitable for an e-commerce storefront.

### Data Flow

`UI → domain/service layer → repository interface → Google Apps Script REST API → Google Sheets`

### Future-ready adapters

`PaymentProvider`
`ShippingProvider`
`FulfillmentProvider`
`CustomerAuthProvider`

Initial implementations may be mock/manual adapters where external credentials or approved APIs are not available.

## 3. Core Modules

1. Design System
2. Header/Footer/Navigation
3. Homepage
4. Catalogue
5. Categories
6. Collections
7. Search
8. Filter/Sort
9. Product Details
10. Blouse Size Identifier
11. Wishlist
12. Cart
13. Checkout
14. Orders
15. Tracking
16. Customer Support/WhatsApp
17. SEO
18. Analytics hooks
19. Google Sheets repository
20. Error/loading/empty states

## 4. Suggested File Structure

Use the repository's conventions, but target a structure similar to:

```text
src/
  app/
    page.*
    shop/
    product/
    collections/
    search/
    wishlist/
    cart/
    checkout/
    order-confirmation/
    track-order/
    size-guide/
    about/
    contact/
    shipping-and-returns/
    privacy/
    terms/
    refund-policy/
  components/
    layout/
    navigation/
    home/
    catalog/
    product/
    cart/
    checkout/
    orders/
    size/
    reviews/
    shared/
  lib/
    api/
    repositories/
    services/
    validation/
    seo/
    analytics/
    utils/
  data/
    size-chart.*
    configuration.*
  types/
  styles/
public/
```

## 5. Phase Plan

### Phase 1 — Foundation and Design System

Deliver:

- Global typography.
- Colour tokens.
- Spacing and layout tokens.
- Button variants.
- Form controls.
- Badge/chip system.
- Modal/drawer/toast primitives.
- Responsive container/grid.
- Header and footer.

Acceptance:

- Layout is responsive at mobile/tablet/desktop widths.
- Visual system is consistent.
- No generic template appearance.

### Phase 2 — Google Sheets Product Layer

Deliver:

- Product TypeScript types/interfaces.
- Google Apps Script endpoint contract.
- Google Sheets repository.
- Product/category/collection mapping.
- Parsing and validation.
- Error and empty states.
- Caching strategy.

Acceptance:

- Products load from external sheet data.
- Invalid rows do not crash the entire catalogue.
- Private fields are never returned publicly.

### Phase 3 — Catalogue and Discovery

Deliver:

- Shop page.
- Category pages.
- Collection pages.
- Search.
- Filter chips.
- Desktop filter sidebar.
- Mobile filter drawer.
- Sort.
- URL-synced filters.
- Pagination/load more.
- Empty states.

Acceptance:

- User can reach any published product through search/category/filter routes.

### Phase 4 — Product Experience

Deliver:

- Product gallery.
- Fullscreen/lightbox.
- Product information sections.
- Variant handling.
- Reviews.
- Delivery/pincode UX.
- Related products.
- Recently viewed.
- WhatsApp action.
- Wishlist.

Acceptance:

- Product page is usable without hidden dependencies.
- Missing optional data is handled gracefully.

### Phase 5 — Blouse Size Identifier

Deliver:

- XS–3XL configurable size table.
- Measurement inputs.
- cm/in toggle.
- Recommendation algorithm.
- Product-specific size chart display.
- Manual override.
- Local persistence and reset.

Acceptance:

- Recommendation is deterministic and testable.
- Size chart remains the authoritative source.

### Phase 6 — Cart and Checkout

Deliver:

- Cart state.
- Local persistence.
- Stock checks.
- Coupon abstraction.
- Shipping abstraction.
- Checkout form.
- Order summary.
- Duplicate-submit protection.
- Payment abstraction.
- Order creation.

Acceptance:

- Guest user can complete a test order.
- Price is validated at order creation.

### Phase 7 — Order Confirmation and Tracking

Deliver:

- Confirmation route.
- Track-order route.
- Status timeline.
- Tracking link support.
- Support CTA.

Acceptance:

- Test order can be looked up and displayed safely.

### Phase 8 — SEO, Analytics, Accessibility, Performance

Deliver:

- Metadata.
- Sitemap/robots.
- Product/breadcrumb structured data.
- Analytics event hooks.
- Keyboard support.
- Focus management.
- Image optimization.
- Loading/error states.

Acceptance:

- Build/lint/type checks pass.
- No major accessibility or performance regressions identified.

### Phase 9 — Production Hardening

Deliver:

- Environment variable validation.
- API failure handling.
- Security review.
- Secret scan.
- Mobile QA.
- Deployment documentation.
- README.

## 6. Google Sheets Contract

### Products sheet

Required columns:

```text
productId
sku
name
slug
category
subcategory
collection
tags
shortDescription
description
price
compareAtPrice
currency
fabric
colour
pattern
occasion
workType
sareeLength
blousePieceLength
blouseIncluded
blouseSizesAvailable
careInstructions
fitNotes
stockQty
stockStatus
featured
bestseller
newArrival
rating
reviewCount
mainImage
galleryImages
videoUrl
meeshoProductUrl
published
sortOrder
createdAt
updatedAt
```

### Parsing rules

- Empty optional values become null/undefined.
- Boolean fields accept normalized TRUE/FALSE values.
- `galleryImages` may be pipe- or newline-delimited URLs; normalize consistently.
- `tags` may be comma-delimited.
- `blouseSizesAvailable` may be comma-delimited.
- Prices must parse as numeric values.
- Invalid product IDs or slugs should be logged and skipped.

## 7. Google Apps Script API Contract

Expose read endpoints similar to:

```text
GET /products
GET /products?slug=<slug>
GET /categories
GET /collections
GET /reviews?productId=<id>
GET /orders/lookup?orderId=<id>
```

Write endpoints should be authenticated/restricted and may include:

```text
POST /orders
POST /reviews
```

Do not make assumptions about final deployment URLs. Store endpoint URLs in environment/configuration.

## 8. Quality Strategy

### Unit tests

Cover:

- Filter functions.
- Search normalization.
- Price calculations.
- Coupon rules.
- Cart totals.
- Size recommendation logic.
- Product parsing.

### Integration tests

Cover:

- Product fetch → catalogue.
- Product → cart.
- Cart → checkout.
- Checkout → test order.
- Order → tracking.

### Manual QA

Test at:

- 360px–430px mobile.
- Tablet.
- Desktop.
- Large desktop.

Test:

- Slow network.
- API failure.
- Empty catalogue.
- Out-of-stock product.
- Broken image.
- Invalid coupon.
- Invalid address.
- Duplicate checkout click.

## 9. Security Rules

- No credentials in client-side code.
- No private Google credentials committed.
- Never trust browser-submitted prices.
- Recalculate totals server-side.
- Do not store card details.
- Restrict write API access.
- Avoid exposing customer data via public endpoints.
- Sanitize text and validate expected schemas.

## 10. Future Integrations

Design interfaces now for:

- Razorpay/payment provider.
- Shiprocket/shipping provider.
- Firebase/Firestore.
- Customer authentication.
- Approved fulfilment provider.
- Email/SMS/WhatsApp notifications.

The future fulfilment provider must be an adapter. Do not implement unattended marketplace purchasing or credential automation as part of this site build.

## 11. Definition of Done

The phase is complete when:

- Premium UI is implemented.
- All essential shopping pages exist.
- Google Sheets data renders correctly.
- Search/filter/category flows work.
- Product details and size identifier work.
- Wishlist/cart/checkout work.
- Test order flow works.
- Tracking page works with test data.
- Mobile/desktop QA is complete.
- Type/lint/build checks pass.
- README is complete.
- Remaining production credentials/configuration are explicitly documented.
