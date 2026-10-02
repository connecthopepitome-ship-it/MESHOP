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

## 6. Future Architecture Paths

- **Firebase/Firestore Migration**: `GoogleSheetsRepository` implements `RepositoryInterface`, allowing a drop-in `FirestoreProductRepository` swap in the future.
- **Fulfilment Automation**: Internal product mapping (`productId` -> `meeshoReferenceLink`, `sourceCost`, `supplierReference`) resides in backend/admin infrastructure for future automated ordering pipelines without exposing supplier details to customers.
