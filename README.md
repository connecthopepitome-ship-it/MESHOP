# Premium Saree Store

A premium saree-only e-commerce storefront designed for a curated boutique brand. The MVP uses **Google Sheets + Google Apps Script** as the catalogue/order backend and is structured so the frontend can later migrate to Firebase/Firestore and connect to approved payment, shipping, and fulfilment providers.

## 1. Project Overview

### Customer flow

```text
Instagram / Facebook / Direct visit
            ↓
        Storefront
            ↓
 Search / Category / Filters
            ↓
       Product Page
            ↓
  Size Assistant (optional)
            ↓
     Wishlist / Cart
            ↓
        Checkout
            ↓
      Order Confirmation
            ↓
       Order Tracking
```

### MVP data flow

```text
Google Sheets
      ↓
Google Apps Script API
      ↓
Repository / Service Layer
      ↓
Website UI
```

## 2. Recommended Technology

Use the existing repository stack where practical.

For greenfield implementation, a recommended baseline is:

- Next.js / React
- TypeScript
- Tailwind CSS or an equivalent token-based styling system
- Google Apps Script for the initial REST API
- Google Sheets for catalogue/order operations
- Browser local storage for guest wishlist/cart/recent views
- Provider adapters for payment, shipping, and fulfilment

## 3. Local Development

Install dependencies using the repository's package manager.

Typical commands:

```bash
npm install
npm run dev
```

Open the local development URL shown by the terminal.

Run validation before deployment:

```bash
npm run lint
npm run build
```

Use the repository's actual scripts if they differ.

## 4. Environment Configuration

Create a local environment file using the project's expected format.

Typical values:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CATALOG_API_URL=<GOOGLE_APPS_SCRIPT_WEB_APP_URL>
NEXT_PUBLIC_WHATSAPP_NUMBER=<BUSINESS_NUMBER>
NEXT_PUBLIC_CURRENCY=INR
NEXT_PUBLIC_ENABLE_COD=true
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=<OPTIONAL>
```

Only values genuinely required by the application should be added.

Never place Google service account secrets or private API keys in variables prefixed with `NEXT_PUBLIC_` or equivalent client-exposed prefixes.

## 5. Google Sheet Setup

Create a Google Spreadsheet with these tabs:

- Products
- Categories
- Collections
- Orders
- Coupons
- Reviews

### Products

Create the header row exactly as documented in `implementation_plan.md`.

At minimum, a product should have:

```text
productId
sku
name
slug
category
price
fabric
colour
mainImage
published
```

For multiple images, populate `galleryImages` using the delimiter expected by the application.

Set `published` to TRUE only when the product is ready for the storefront.

## 6. Image Management

For the MVP, images can be hosted using a reliable image/CDN provider and referenced by URL in the Sheet.

Image requirements:

- High resolution.
- Consistent aspect ratio.
- Good compression.
- Descriptive alt text where available.
- Do not rely on temporary/private links that expire.

If using Google Drive, make sure the delivery URLs actually work for browser image rendering. Do not expose private documents or credentials.

## 7. Google Apps Script

Create an Apps Script project associated with the spreadsheet.

Responsibilities:

1. Read published products.
2. Read categories/collections.
3. Return product details.
4. Return reviews where appropriate.
5. Create/store orders through a restricted write path.
6. Support order lookup without exposing unrelated customer data.

### Recommended API shape

```text
GET  /products
GET  /products?slug=<slug>
GET  /categories
GET  /collections
GET  /reviews?productId=<id>
GET  /orders/lookup?orderId=<id>
POST /orders
```

Do not publish private supplier information through public GET endpoints.

## 8. Catalogue Publishing Workflow

To publish a new saree:

1. Add a new row to `Products`.
2. Add the product name, SKU, pricing, category, fabric, colour, description, and dimensions.
3. Add the main image URL.
4. Add gallery image URLs.
5. Set stock information.
6. Set `featured`, `bestseller`, or `newArrival` as required.
7. Set `published = TRUE`.
8. Wait for the configured cache/refresh interval or trigger a refresh mechanism if implemented.
9. Verify the product from the storefront.

No frontend code should need to change when adding a normal product.

## 9. Category Workflow

Add categories through the `Categories` sheet.

Recommended initial categories:

- New Arrivals
- Silk
- Organza
- Chiffon
- Georgette
- Printed
- Party Wear
- Festive
- Wedding

Only show published categories on the storefront.

## 10. Collection Workflow

Use `Collections` for curated merchandising, for example:

- The Signature Edit
- Festive Edit
- Evening Elegance
- Everyday Luxe
- Wedding Guest Edit

Collection presentation should remain premium and editorial rather than looking like a marketplace category list.

## 11. Blouse Size Identifier

The site treats the saree itself as generally one-size and provides size assistance primarily for the blouse.

The size logic should be maintained in a dedicated configuration/data file, not scattered through components.

Users should always be able to bypass the assistant and select a size directly.

The product-specific measurement chart is authoritative.

## 12. Orders

Orders created through checkout should be stored in `Orders` using a stable order ID.

Typical lifecycle:

```text
NEW
↓
PAYMENT_PENDING
↓
PAID / COD_CONFIRMED
↓
PROCESSING
↓
SHIPPED
↓
OUT_FOR_DELIVERY
↓
DELIVERED
```

Additional states may include:

```text
CANCELLED
RETURN_REQUESTED
RETURNED
REFUNDED
FAILED
```

The exact workflow should be configured in code rather than hardcoded into individual UI components.

## 13. Payments

Do not store card details in the application.

For development, use a mock/test provider.

For production, integrate an approved payment provider such as Razorpay through the provider adapter and perform payment verification on the server side.

Do not mark an order as paid based only on a client-side success message.

## 14. Shipping

Keep shipping calculation behind a service interface.

Initially this may use:

- Configured flat rate.
- Free-shipping threshold.
- Manual/test delivery calculation.

Later it can be replaced with a shipping provider such as Shiprocket without rewriting checkout UI.

## 15. Fulfilment / Meesho Integration Boundary

Product rows may contain a `meeshoProductUrl` for internal fulfilment reference.

The first website release must not implement unattended marketplace purchasing, credential scraping, CAPTCHA bypassing, payment automation, or automatic final purchase submission.

Instead, build an integration-ready abstraction:

```text
FulfillmentProvider
  createFulfillmentOrder(order)
  getFulfillmentStatus(orderId)
  getTracking(orderId)
```

The initial provider can be manual/mock and can later be replaced by an approved API or partner integration where available.

## 16. SEO Checklist

Before production:

- Set real site title and description.
- Add canonical URLs.
- Verify sitemap.
- Verify robots rules.
- Add Open Graph image.
- Validate Product structured data on product pages.
- Validate breadcrumb structured data.
- Use accurate product price and availability.
- Ensure no duplicate category URLs.

## 17. Analytics Checklist

Configure an analytics provider only after confirming the privacy requirements and consent model.

Track events such as:

- view_item
- search
- select_item
- add_to_wishlist
- add_to_cart
- begin_checkout
- purchase
- size_assistant_used
- whatsapp_clicked
- track_order_used

Avoid sending unnecessary personal information in analytics events.

## 18. Production Checklist

Before launch:

- Replace placeholder brand name.
- Add real logo/favicon.
- Add real policies.
- Add real support contact information.
- Add real shipping/return rules.
- Verify all product images.
- Verify all product prices.
- Verify stock.
- Verify Google Apps Script URL.
- Verify order writes.
- Configure production payment provider.
- Configure production shipping provider if required.
- Configure analytics.
- Test on multiple mobile devices.
- Test checkout end-to-end.
- Run `npm run build`.
- Review browser console for unexpected errors.
- Confirm no secrets are committed.

## 19. Troubleshooting

### Products do not appear

Check:

1. `published` is TRUE.
2. Product row has a valid product ID and slug.
3. API URL is correct.
4. Apps Script deployment is accessible to the intended client.
5. The response format matches the repository parser.
6. Browser network logs show a successful catalogue request.

### Product image is broken

Check the image URL directly in a browser and confirm that it permits browser rendering.

### Filters show incorrect results

Check field normalization for category, tags, colours, and numeric price values.

### Checkout creates duplicate orders

Ensure the UI disables the submit action during request processing and the server/order layer uses an idempotency strategy where appropriate.

### Google Sheet structure changed

Restore the required headers or update the parser and documented contract together.

## 20. Future Roadmap

After the storefront MVP is proven:

1. Firebase/Firestore migration if Google Sheets becomes a bottleneck.
2. Real payment integration.
3. Shipping provider integration.
4. Customer authentication/OTP.
5. Advanced promotions.
6. Product reviews with moderation.
7. Inventory synchronization.
8. Approved fulfilment-provider integration.
9. Operational dashboard.
10. Automated customer notifications.

The storefront should remain independent of these integrations through service interfaces and adapters.
