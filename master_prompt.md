# Master Prompt / Requirements Document — Premium Saree E-commerce Website

## 0. Agent Instruction

Build a production-quality, premium saree-only e-commerce website for **[BRAND_NAME]**. Treat this as a real commercial storefront, not a demo, template, or generic fashion landing page.

The visual and UX standard must feel comparable to a high-end Indian fashion boutique and modern luxury D2C brand: editorial photography, restrained typography, generous whitespace, refined micro-interactions, fast navigation, excellent mobile UX, and strong trust signals.

Do not start coding immediately. First inspect the repository, identify the existing stack, create `implementation_plan.md`, and present a clear implementation approach. Preserve useful existing code and configuration unless there is a strong technical reason to replace it.

After implementation, generate/update `README.md` with complete setup, configuration, data, deployment, and troubleshooting instructions.

## 1. Product Goal

Create a complete shopping experience for sarees where:

- Customers discover products through categories, collections, search, filters, sorting, recommendations, and editorial content.
- Customers can view detailed product information, images, blouse details, fabric, dimensions, care instructions, delivery information, and return information.
- Customers can add products to cart, manage quantity, save wishlist items, enter an address, choose delivery/payment options, and place an order.
- The website is designed around a Google Sheets + Google Apps Script product catalogue for the MVP, while keeping a clean service layer so it can later migrate to Firebase/Firestore or another backend without rebuilding the UI.
- Product photos and metadata entered/maintained in the Google Sheet are reflected on the storefront through the API layer.
- The architecture is ready for a future order-fulfilment/Meesho integration, but **do not automate Meesho login, payment, CAPTCHA solving, or final order submission in this phase**. Create a clean integration boundary for a future approved fulfilment connector.

## 2. Brand and Visual Direction

Brand placeholder: **[BRAND_NAME]**

Positioning: curated premium saree boutique.

Suggested tagline direction: **Timeless drapes. Modern elegance.**

Visual language:

- Luxury editorial, not marketplace-style.
- Warm ivory/off-white base.
- Deep charcoal/black typography.
- Very restrained champagne/gold accent.
- Optional muted deep burgundy accent for selected CTAs or labels.
- Premium serif display type paired with a clean modern sans-serif body font.
- Large product photography with consistent aspect ratios.
- Subtle borders, soft shadows, delicate dividers.
- No excessive gradients, glowing UI, loud badges, oversized discount stickers, or clutter.
- Motion should be subtle and intentional.

Create a reusable design system with tokens for typography, spacing, radii, shadows, buttons, cards, forms, badges, and responsive breakpoints.

## 3. Pages and Routes

Build at minimum:

1. `/` — Homepage
2. `/shop` — All sarees
3. `/shop/[category]` — Category landing/catalogue
4. `/collections/[slug]` — Curated collections
5. `/product/[slug]` — Product detail
6. `/search` — Search results
7. `/wishlist` — Wishlist
8. `/cart` — Cart
9. `/checkout` — Checkout
10. `/order-confirmation/[id]` — Confirmation
11. `/account` — Customer account/order history (guest flow must also work)
12. `/track-order` — Order tracking
13. `/size-guide` — Size and blouse-size guide
14. `/shipping-and-returns` — Delivery/returns
15. `/contact` — Contact/WhatsApp assistance
16. `/about` — Brand story
17. `/privacy` — Privacy policy
18. `/terms` — Terms and conditions
19. `/refund-policy` — Refund policy

Create appropriate 404 and error states.

## 4. Homepage Requirements

Homepage must feel premium within the first 3 seconds.

Sections:

- Announcement bar with shipping/offer message.
- Minimal luxury header with logo, Shop, Collections, search, account, wishlist, cart.
- Full-width hero/editorial section with strong product photography and one primary CTA.
- New Arrivals.
- Shop by Category.
- Featured / Bestsellers.
- Curated collection spotlight.
- Saree editorial/story section.
- Why shop with us: verified quality, secure payments, curated collections, support, delivery.
- Instagram/social proof section.
- Customer reviews/testimonials.
- Newsletter/WhatsApp signup area.
- Premium footer with policies, customer care, social links, contact details.

Homepage must avoid looking like a generic SaaS dashboard or standard template.

## 5. Product Catalogue Data Model

The frontend must consume product data through a service/repository abstraction, not import Google Sheets directly into UI components.

Minimum product fields:

- productId
- sku
- name
- slug
- shortDescription
- description
- category
- subcategory
- collection
- tags
- price
- compareAtPrice
- currency
- fabric
- sareeLength
- blousePieceLength
- blouseIncluded
- blouseSizesAvailable
- colour
- colourHex (optional)
- pattern
- occasion
- workType
- careInstructions
- fitNotes
- stockQty
- stockStatus
- featured
- bestseller
- newArrival
- rating
- reviewCount
- mainImage
- galleryImages
- videoUrl (optional)
- meeshоProductUrl (optional)
- supplierReference (optional/private; never expose publicly)
- published
- sortOrder
- createdAt
- updatedAt

Use clean validation and graceful handling for missing optional fields.

## 6. Google Sheets MVP Backend

Use Google Sheets as the initial catalogue/content backend.

Suggested sheets:

### Products

Columns:
`productId, sku, name, slug, category, subcategory, collection, tags, shortDescription, description, price, compareAtPrice, currency, fabric, colour, pattern, occasion, workType, sareeLength, blousePieceLength, blouseIncluded, blouseSizesAvailable, careInstructions, fitNotes, stockQty, stockStatus, featured, bestseller, newArrival, rating, reviewCount, mainImage, galleryImages, videoUrl, meeshоProductUrl, published, sortOrder, createdAt, updatedAt`

### Categories

`categoryId, name, slug, description, image, sortOrder, published`

### Collections

`collectionId, name, slug, description, heroImage, sortOrder, published`

### Orders

`orderId, createdAt, customerName, email, phone, addressLine1, addressLine2, city, state, pincode, country, itemsJson, subtotal, discount, shipping, total, paymentMethod, paymentStatus, fulfillmentStatus, trackingNumber, notes`

### Coupons

`code, type, value, minimumOrder, maxDiscount, startDate, endDate, usageLimit, active`

### Reviews

`reviewId, productId, customerName, rating, title, review, verifiedPurchase, status, createdAt`

Google Apps Script should expose safe read/write endpoints for the application. Never expose private supplier references or sensitive customer data through public catalogue endpoints.

The application must handle API failure, timeouts, empty catalogues, malformed rows, and stale product data gracefully.

## 7. Catalogue UX

The shopping catalogue must support:

- Search by product name, category, colour, fabric, collection, and tags.
- Category navigation.
- Multi-select filters.
- Price range filter.
- Colour filter.
- Fabric filter.
- Occasion filter.
- Pattern/work filter.
- Collection filter.
- Availability filter.
- New arrivals/bestsellers/featured filter.
- Sort by newest, price low-high, price high-low, popularity, featured.
- Clear-all filters.
- Active filter chips.
- Product count.
- Responsive mobile filter drawer.
- Desktop sidebar filters.
- URL query-state persistence so filtered views are shareable.
- Pagination or performant load-more/infinite loading depending on catalogue size.
- Skeleton loading states.
- Empty state with useful reset/filter guidance.

Product cards must show:

- Product image.
- Product name.
- Price.
- Compare-at price where appropriate.
- Small elegant label for New/Bestseller/Featured.
- Wishlist button.
- Quick View or Quick Add where appropriate.
- Hover image swap on desktop if a second image exists.

## 8. Search

Implement a fast client/server-assisted search experience with:

- Search input in header.
- Search suggestions.
- Recent searches saved locally.
- Popular categories/products.
- No-results state with related categories/products.
- Keyboard-friendly operation.
- Mobile search screen.

Avoid exposing implementation details or raw API responses to users.

## 9. Product Detail Page

The product page is a major conversion page.

Include:

- Large image gallery.
- Fullscreen image viewer.
- Pinch/zoom support on mobile if supported by the framework.
- Product name, rating, and review count.
- Current price and compare-at price.
- Stock status.
- Colour and other variants where applicable.
- Blouse size selector where blouse sizing applies.
- Size-guide link next to the size selector.
- Quantity stepper.
- Add to Cart.
- Buy Now.
- Wishlist.
- WhatsApp assistance.
- Delivery/pincode check.
- Estimated delivery message.
- Product details accordion.
- Fabric and care details.
- Saree/blouse dimensions.
- Shipping/return information.
- Reviews and ratings.
- Related products.
- Recently viewed products.
- Trust strip.

Implement a sticky mobile purchase bar with price and primary CTA when appropriate.

## 10. Size Identifier / Blouse Size Assistant

Sarees are generally one-size garments, so the size experience should focus on the blouse and any size-dependent variants.

Build a user-friendly **Blouse Size Identifier**:

- Standard sizes from XS through XXL/3XL as configurable data.
- Inputs such as bust, waist, and preferred fit.
- Unit toggle for cm/inches.
- Optional age/height only if genuinely useful; do not collect unnecessary personal data.
- Recommendation shown as a suggested blouse size plus a confidence note such as “closest match — confirm with the size chart”.
- Clear disclaimer that actual garment measurements can vary and the product-specific size chart is authoritative.
- Manual size selection must always remain available.
- Save the last used size locally for convenience, with a clear reset option.
- Never block purchase because a customer does not use the identifier.

Size logic must be configurable in a data file rather than hardcoded throughout the UI.

## 11. Cart

Cart must include:

- Add/remove/update quantity.
- Thumbnail and product name.
- Variant/blouse size.
- Price calculation.
- Subtotal.
- Discount/coupon support.
- Estimated shipping.
- Total.
- Free-shipping threshold messaging if configured.
- Continue shopping.
- Checkout CTA.
- Stock validation before checkout.
- Local persistence for guest users.
- Graceful recovery when a product becomes unavailable.

## 12. Checkout

Create a clean, low-friction checkout.

Customer fields:

- Full name
- Mobile number
- Email
- Address line 1
- Address line 2 (optional)
- City
- State
- PIN code
- Country

Features:

- Address validation.
- Pincode validation format.
- Order summary.
- Coupon application.
- Shipping calculation abstraction.
- Payment method abstraction.
- COD option if enabled.
- Online payment provider placeholder/integration boundary.
- Privacy/terms consent.
- Prevent duplicate submission.
- Clear error messages.
- Order confirmation page.

Do not store raw card data.

For MVP, make payment providers pluggable. The initial build can support a placeholder/mock payment flow for development, then connect Razorpay or another approved provider through server-side verification before production.

## 13. Customer Account

Support both guest checkout and account-based shopping.

Account features:

- Login/OTP-ready abstraction.
- Order history.
- Order detail.
- Address book.
- Wishlist.
- Basic profile.

Do not create unnecessary authentication complexity in the first iteration if it would delay the storefront. Guest checkout must work well.

## 14. Order Tracking

Build `/track-order` with:

- Order number + mobile/email verification.
- Order status.
- Payment status.
- Fulfillment status.
- Tracking number when available.
- Shipping carrier link when configured.
- Support/WhatsApp CTA.

Keep fulfillment status provider-agnostic so a future Shiprocket/Meesho/other connector can update the order.

## 15. Admin / Data Operations

The first version should use Google Sheets as the operational admin panel.

The website should not require a custom admin dashboard unless it materially improves operations. Build a lightweight internal documentation section explaining:

1. How to add a saree row.
2. How to add image URLs.
3. How to set stock and pricing.
4. How to publish/unpublish.
5. How to create collections/categories.
6. How orders appear.
7. How tracking numbers are updated.
8. How featured/new/bestseller flags work.

Future admin dashboard must be able to replace Google Sheets without changing storefront components.

## 16. Premium Commerce Features

Include carefully selected high-value functionality:

- Wishlist.
- Recently viewed products.
- Quick view.
- Quick add where no mandatory variant is missing.
- Product recommendations.
- Related products.
- “Complete the look” section if blouse/accessory data exists later.
- Sticky CTA on mobile.
- Pincode/delivery checker interface.
- Coupon support.
- Low-stock messaging based on configured threshold.
- Back-in-stock state/design, with notification capture only if enabled.
- Share product action using Web Share API where supported.
- WhatsApp assistance.
- Reviews/ratings.
- Trust badges.
- Newsletter/lead capture.
- Recently searched terms.
- Breadcrumbs.
- SEO-friendly collection/category pages.

Do not overload the UI. Premium means selective functionality with excellent presentation.

## 17. Mobile-First Requirements

The site must work exceptionally well on mobile because social media traffic is expected to be significant.

Required:

- Thumb-friendly controls.
- Fast image loading.
- Sticky mobile cart/buy controls where appropriate.
- Bottom-sheet filter UI.
- Mobile-friendly size assistant.
- Swipeable image gallery.
- Checkout optimized for one-hand use.
- No horizontal overflow.
- Test at common phone widths.

## 18. Performance

Target production-grade performance.

Requirements:

- Responsive images and modern image formats.
- Lazy-load non-critical images.
- Avoid unnecessary client-side JavaScript.
- Cache catalogue responses appropriately.
- Debounce search/filter operations where required.
- Use skeletons instead of layout jumps.
- Avoid blocking fonts where possible.
- Optimize largest contentful images.
- Do not render huge catalogue payloads unnecessarily.

## 19. SEO

Implement:

- Metadata per page.
- Dynamic product/category/collection metadata.
- Canonical URLs.
- Open Graph/social metadata.
- Sitemap generation.
- Robots configuration.
- JSON-LD structured data for products, breadcrumbs, organization, and website where appropriate.
- Clean semantic URLs.
- Product availability/price structured data where supported by the actual data.

Do not generate fake ratings, reviews, availability, or product claims for SEO.

## 20. Accessibility

Target WCAG 2.2 AA-minded implementation.

Include:

- Keyboard navigation.
- Visible focus states.
- Proper labels for forms.
- Semantic HTML.
- Accessible dialogs/drawers.
- Alt text from product data or sensible fallback.
- Sufficient contrast.
- Screen-reader-friendly button states.
- Reduced-motion consideration.

## 21. Security and Privacy

- Never put Google service credentials in frontend code.
- Never expose private supplier references.
- Validate and sanitize data at API boundaries.
- Validate order totals server-side.
- Never trust prices sent from the browser.
- Do not store payment card data.
- Protect write endpoints.
- Restrict Google Apps Script write operations.
- Rate-limit or otherwise guard sensitive endpoints where possible.
- Do not expose customer/order data publicly.

## 22. Analytics

Make analytics provider-agnostic but provide event hooks for:

- view_item_list
- select_item
- search
- view_item
- add_to_wishlist
- add_to_cart
- remove_from_cart
- begin_checkout
- add_shipping_info
- add_payment_info
- purchase
- coupon_applied
- size_assistant_used
- whatsapp_clicked
- track_order_used

Do not collect unnecessary personal information in analytics events.

## 23. Error, Loading and Edge States

Design polished states for:

- API unavailable.
- Slow network.
- Empty catalogue.
- Product missing.
- Product unpublished.
- Out of stock.
- Product price changed before checkout.
- Cart item removed.
- Invalid coupon.
- Payment failure.
- Duplicate order attempt.
- Invalid address/pincode.
- No search results.
- Broken/missing image.

Errors should be human-readable and provide the next action.

## 24. Data and Service Architecture

Use clear separation:

`UI components → domain/services → data repository → Google Apps Script API`

Create interfaces so future sources can include:

- Google Sheets API service.
- Firebase/Firestore service.
- Approved fulfilment connector.
- Payment provider.
- Shipping provider.

Do not couple product cards or checkout components directly to Google Sheets implementation details.

## 25. Future Fulfilment Integration Boundary

Add a documented interface such as:

`FulfillmentProvider.createFulfillmentOrder(order)`
`FulfillmentProvider.getFulfillmentStatus(orderId)`
`FulfillmentProvider.getTracking(orderId)`

The first implementation can be a mock/manual provider.

Do not implement credential scraping, CAPTCHA bypassing, payment bypasses, or unattended Meesho purchase automation.

## 26. Content and Product Copy

Use premium but factual copy.

Avoid:

- Fake scarcity.
- Fake reviews.
- Unsupported fabric claims.
- False “handcrafted” or “pure silk” claims.
- Fake discount percentages.
- Misleading AI-generated product appearance.

Product copy should emphasize actual fabric, work, colour, drape, occasion, and care information from the data source.

## 27. Design Details

Create:

- Elegant hover states.
- Smooth but restrained page transitions.
- Image zoom/lightbox.
- Animated cart count.
- Filter drawer animation.
- Sticky header transition on scroll.
- Toasts for add-to-cart/wishlist.
- Button loading states.
- Skeleton loaders.

Do not use excessive animation.

## 28. Quality Gates

Before declaring the project complete, verify:

### Functional
- Catalogue loads from Google Sheets API.
- Categories work.
- Search works.
- Filters work.
- Sorting works.
- Product detail works.
- Wishlist works.
- Cart works.
- Size assistant works.
- Checkout validation works.
- Order creation works using the configured MVP flow.
- Order confirmation works.
- Tracking screen works with sample/test data.

### Responsive
- Mobile.
- Tablet.
- Desktop.
- Large desktop.

### Technical
- No TypeScript/build errors.
- No console errors in normal flows.
- Lint/format checks pass.
- Broken routes handled.
- API failure states tested.
- No secrets committed.

### UX
- Consistent typography.
- Consistent spacing.
- Clear primary actions.
- No clipped text.
- No broken images.
- No accidental horizontal scrolling.

## 29. Required Development Sequence

Follow this order:

1. Inspect existing repository.
2. Create `implementation_plan.md` with architecture, phases, file structure, data model, risks, and acceptance criteria.
3. Establish design system and global layout.
4. Implement product data/service layer and Google Sheets API integration.
5. Implement catalogue/category/search/filter/sort.
6. Implement product detail and size assistant.
7. Implement wishlist/cart.
8. Implement checkout/order creation.
9. Implement order tracking and customer-support surfaces.
10. Add SEO, accessibility, analytics hooks, performance optimizations, and error states.
11. Add representative sample product data and verify end-to-end flow.
12. Run tests/build/lint and fix issues.
13. Generate/update `README.md`.
14. Provide a concise final build summary and list any remaining production configuration items.

## 30. Definition of Done

The result should look and behave like a real premium saree boutique ready for user testing.

A new product entered into the Google Sheet, with a valid image URL and `published = TRUE`, must become visible on the website after the configured cache/refresh interval without manually editing frontend product components.

A customer must be able to discover a saree, filter/search it, view product details, select a blouse size where applicable, add it to the cart, complete checkout, and reach an order confirmation screen.

The system must be architected so Google Sheets can later be replaced by Firebase/Firestore and the fulfilment provider can later be replaced or extended without rewriting the storefront.

## 31. Antigravity Working Rules

- Prefer clean, maintainable, typed code over shortcuts.
- Keep components small and reusable.
- Do not duplicate business logic.
- Keep constants/configuration separate from UI.
- Add concise comments only where the reasoning is non-obvious.
- Avoid speculative dependencies.
- Reuse existing project conventions when safe.
- Do not introduce a database if Google Sheets is sufficient for this MVP.
- Do not hardcode product records into components.
- Do not fake production integrations; use explicit adapters/mocks where credentials are not configured.
- Do not expose credentials in the client.
- Before completion, verify actual behavior rather than assuming generated code is correct.
