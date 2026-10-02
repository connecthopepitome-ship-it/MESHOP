# SORAYVA — Implementation Status & Architectural Plan

## Project
**SORAYVA** — Haute Couture & Premium Saree E-Commerce Storefront

## Business Model & Objective
SORAYVA operates as an independent premium saree e-commerce brand. Product data is managed centrally via a Google Sheets catalogue and served dynamically to the storefront.

Customer-facing presentation is 100% independent and clean:
- Internal supplier details (`sourceUrl`, `sourceCost`, `sourceStatus`, `supplierReference`) are strictly isolated in internal data structures and never rendered to customers.
- Category buttons, navigation, and product filters adapt dynamically based on active products in the catalogue.

---

## 1. Information Architecture & Refactored Navigation

### Header Navigation
- **SHOP** (`/shop`)
- **NEW ARRIVALS** (`/shop?filter=newArrival`)
- **COLLECTIONS** (`#collections`)
- **SHOP BY OCCASION** (`#shop-by-occasion`)
- **SHOP BY FABRIC** (`#explore-by-fabric`)
- **SALE** (`/shop?filter=sale`)

Right side actions: Search Drawer, Wishlist Count, Cart Drawer, Currency (`INR ₹`).

---

## 2. Product Taxonomy & Data Schema

### Customer-Safe Fields
- `productId`: Unique SKU/ID string
- `name` / `productName`: Title of saree
- `slug`: URL slug
- `category`: Primary saree category
- `subcategory`: Optional sub-type
- `fabric`: Textile warp/weft material
- `occasion`: Occasion tags (`Everyday`, `Festive`, `Party`, `Wedding Guest`, `Celebration`)
- `style`: Style tags (`Elegant`, `Minimal`, `Traditional`, `Contemporary`, `Statement`)
- `work` / `workType`: Weave & embroidery craft
- `pattern`: Motifs / design patterns
- `colour` / `colourFamily`: Color name & family grouping
- `collection`: Collection name
- `price`: Customer selling price
- `compareAtPrice`: Struck-through original price
- `stockQty` & `stockStatus`: Inventory levels
- `status`: `Active`, `Draft`, `Out of Stock`, `Hidden`, `Discontinued`
- `featured`, `newArrival`, `trending`: Merchandising flags
- `mainImage` & `galleryImages`: Image URLs array (with `ProductImage` error fallback)
- `rating` & `reviewCount`: Customer ratings

### Internal Private Fields (Excluded from Customer APIs)
- `sourceUrl`: Supplier item page
- `sourceCost`: Supplier cost price
- `sourceStatus`: Supplier stock state
- `supplierReference`: Internal supplier SKU/code

---

## 3. Smart Category Logic & Dynamic Filters

### Smart Category Algorithm (`getDynamicCategories`)
1. **ACTIVE PRODUCTS ONLY**: Filter for products where `published == true` and `status == 'Active' | 'Out of Stock'`.
2. **COUNT VALUES**: Aggregate frequency of category values across active catalogue items.
3. **REMOVE EMPTY VALUES**: Automatically hide empty categories.
4. **MINIMUM THRESHOLD**: Apply `minimumCategoryDisplayCount` (default `1`).
5. **DISPLAY**: Render `NEW IN`, active categories, `SHOP ALL`.

### Dynamic Filters & Sorting
- Dynamic extraction via `getDynamicFilterOptions`.
- Multi-select filters: Price, Fabric, Colour, Occasion, Style, Work, Availability.
- Normalized search matching with alias expansion (`pink` -> `Blush`/`Rose`, `party` -> `Festive`/`Evening`).
- Sorting options: Featured, Newest First, Price Low-to-High, Price High-to-Low, Highest Rated.

---

## 4. Homepage Structure (10 Sections)

1. **SECTION 1 — HERO**: *SORAYVA | For Moments That Matter | "Discover your next signature drape."* | CTA: `SHOP SAREES`.
2. **SECTION 2 — DYNAMIC CATEGORY BAR**: Auto-generated dynamic pills.
3. **SECTION 3 — NEW ARRIVALS**: Newest active sarees.
4. **SECTION 4 — SHOP BY OCCASION**: Occasion cards (`Everyday`, `Festive`, `Party`, `Wedding Guest`).
5. **SECTION 5 — EXPLORE BY FABRIC**: Tactile fabric cards with image, description, active saree count.
6. **SECTION 6 — THE SORAYVA EDIT**: *Curated sarees for everyday elegance, celebrations and unforgettable moments.*
7. **SECTION 7 — BEST SELLERS**: Top rated/featured sarees.
8. **SECTION 8 — RECENTLY VIEWED**: LocalStorage-persisted recently viewed sarees.
9. **SECTION 9 — TRUST & VALUE PROPOSITION**: Shipping, Returns, COD / Payment security, WhatsApp Support, Order Tracking.
10. **SECTION 10 — FOOTER**: Luxury footer with newsletter dispatch.

---

## 5. Blouse Size Guide

- Title: **BLOUSE SIZE GUIDE**
- Sizes: `XS`, `S`, `M`, `L`, `XL`, `XXL`.
- Input measurements: `Bust`, `Underbust`, `Waist` (Inches / CM toggle).
- Size recommendation calculator & size chart reference.
- Unstitched blouse piece notice: *"Unstitched Blouse Piece Included — Fits All Sizes"*.
- Fit disclaimer: Standard tailoring reference without guaranteed fit claims.

---

## 6. Fulfilment Integration Boundary

```text
Storefront Order Created (Order Payload)
          ↓
Google Sheets / Database Repository (Order Recorded)
          ↓
[Internal Admin Mapping Layer]
SORAYVA Product ID → sourceUrl, sourceCost, supplierReference
          ↓
[Separated Fulfilment Process]
(Manual dispatch or future approved connector)
```

No automated login, CAPTCHA bypass, or automated payment submission is included on the customer storefront.
