# SORAYVA — Implementation Status & Architectural Plan

## Project
**SORAYVA** — Haute Couture & Premium Saree E-Commerce Storefront

## Business Model & Objective
SORAYVA operates as an independent premium saree e-commerce brand. Product data is managed centrally via a Google Sheets catalogue control centre (`SORAYVA_PRODUCT_CATALOGUE`) and served dynamically to the storefront via Google Apps Script.

Customer-facing presentation is 100% independent, clean, and secure:
- Internal supplier details (`meeshoReferenceLink`, `sourceCost`, `sourceStatus`, `supplierReference`, `lastSourceCheck`) are strictly isolated in internal data structures and **NEVER** returned by the public product API.
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

### Public Product DTO (`PublicProduct`)
- `productId`: Unique SKU/ID string
- `productName` / `name`: Title of saree
- `slug`: URL slug
- `category`: Primary saree category
- `subcategory`: Optional sub-type
- `fabric`: Textile warp/weft material (`Silk`, `Organza`, `Georgette`, `Chiffon`, `Cotton`, `Linen`, `Satin`, `Silk Blend`, `Other`)
- `occasion`: Multi-value Occasion tags (`Everyday`, `Festive`, `Party`, `Wedding Guest`, `Celebration`, `Evening`)
- `style`: Multi-value Style tags (`Elegant`, `Minimal`, `Traditional`, `Contemporary`, `Statement`, `Classic`)
- `work`: Multi-value Weave & craft (`Printed`, `Embroidered`, `Zari`, `Sequins`, `Woven`, `Stone Work`, `Plain`, `Other`)
- `pattern`: Motifs / design patterns (`Floral`, `Paisley`, `Geometric`, `Abstract`, `Traditional`, `Printed`, `Solid`, `Other`)
- `colour` / `colourFamily`: Color name & family grouping
- `collection`: Collection name
- `price`: Customer selling price
- `compareAtPrice`: Struck-through original price
- `discountPercentage`: Safely computed positive discount %
- `stock` / `stockQty` & `stockStatus`: Inventory levels (`in_stock`, `low_stock`, `out_of_stock`)
- `status`: `Draft`, `Active`, `Out of Stock`, `Hidden`, `Discontinued`
- `featured`, `newArrival`, `trending`: Merchandising flags
- `mainImage`, `galleryImages`, `images[]`: Image URLs array
- `sizeType`, `blouseSize`: Saree & blouse sizing info
- `rating` & `reviewCount`: Customer ratings

### Internal Private Fields (`InternalProduct` — Excluded from Customer APIs)
- `meeshoReferenceLink`: Internal supplier URL
- `sourceCost`: Internal cost price
- `sourceStatus`: Internal supplier stock state
- `supplierReference`: Internal supplier SKU/code
- `lastSourceCheck`: Internal last audit timestamp

---

## 3. Smart Category Logic & Dynamic Filters

### Smart Category Algorithm (`getDynamicCategories`)
1. **ACTIVE PRODUCTS ONLY**: Filter for products where `status == 'Active' | 'Out of Stock'`.
2. **COUNT VALUES**: Aggregate frequency of category values across active catalogue items.
3. **REMOVE EMPTY VALUES**: Automatically hide empty categories.
4. **MINIMUM THRESHOLD**: Apply `minimumCategoryDisplayCount` (default `1`).
5. **DISPLAY**: Render dynamic category pills on storefront.

### Dynamic Filters & Sorting
- Dynamic extraction via `getDynamicFilterOptions`.
- Multi-select filters: Price, Fabric, Colour, Occasion, Style, Work, Pattern, Collection, Availability.
- Normalized search matching with alias expansion (`pink` -> `Blush`/`Rose`, `party` -> `Festive`/`Evening`).
- Sorting options: Featured, Newest First, Price Low-to-High, Price High-to-Low, Highest Rated.

---

## 4. Google Apps Script CMS API Architecture

- File: [`google-apps-script/Code.gs`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/google-apps-script/Code.gs)
- Reads `PRODUCTS` sheet.
- Validates rows (`VALID`, `MISSING_IMAGE`, `MISSING_PRICE`, `MISSING_CATEGORY`, `INVALID_STATUS`, `INVALID_PRODUCT_ID`).
- Converts rows to normalized public product objects.
- Strips internal source fields completely before returning JSON.
- Ignores invalid rows without crashing catalogue.
- Implements `getCatalogueHealthReport` for internal store health audits.

---

## 5. Security & Verification Suite

- Verification script: [`scripts/validate-cms.ts`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/scripts/validate-cms.ts)
- Executes 14 automated tests covering active/draft/hidden/out of stock status filtering, multi-value field parsing, gallery image aggregation, and explicit verification that public product payloads contain ZERO supplier/source fields.

---

## 7. Admin Catalogue Dashboard & Two-Way Sync Implementation

### Completed Components & Routes
1. **Authentication & Access Control**:
   - [`src/context/AdminAuthContext.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/context/AdminAuthContext.tsx): Admin authentication state management with persistent session storage.
   - [`src/components/admin/AdminGuard.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/components/admin/AdminGuard.tsx): Access control guard for all `/admin/*` routes.
   - [`src/app/admin/login/page.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/app/admin/login/page.tsx): Professional SaaS admin login screen.
2. **Admin UI Layout**:
   - [`src/components/admin/AdminHeader.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/components/admin/AdminHeader.tsx) & [`AdminLayout.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/components/admin/AdminLayout.tsx): Dark-themed SaaS admin layout with live storefront link and instant cache refresh.
   - Isolated from customer storefront header/footer via [`AppShell.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/components/layout/AppShell.tsx).
3. **Dashboard Overview & Health Auditor**:
   - [`src/app/admin/page.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/app/admin/page.tsx): Stat cards (Total, Active, Draft, Out of Stock, Low Stock, New Arrivals, Featured, Health Score) and direct audit issue resolution panel.
4. **Product Table & Management**:
   - [`src/app/admin/products/page.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/app/admin/products/page.tsx): Data table with search, status/fabric/category filters, sorting, bulk actions, and live customer preview modal.
5. **Product Editor & Form**:
   - [`src/components/admin/ProductForm.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/components/admin/ProductForm.tsx): Tabbed product editor covering all customer-facing product attributes + **🔒 Source / Internal Information** section.
   - Routes: [`src/app/admin/products/new/page.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/app/admin/products/new/page.tsx) & [`src/app/admin/products/[productId]/edit/page.tsx`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/app/admin/products/%5BproductId%5D/edit/page.tsx).
6. **Backend & Apps Script Two-Way Write API**:
   - [`google-apps-script/Code.gs`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/google-apps-script/Code.gs): Added `doPost` handler for `saveProduct`, `createProduct`, `updateProduct`, `updateStatus`, `archiveProduct`, and `clearCache`. Matches rows by exact `Product ID` and preserves unedited columns and other products.
   - [`src/lib/api/googleSheetsRepository.ts`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/src/lib/api/googleSheetsRepository.ts): Repository method extensions for mutations and cache invalidation.

