# SORAYVA — Google Sheets Product Catalogue CMS & E-Commerce Storefront (`MESHOP`)

A production-quality, mobile-first saree-only e-commerce storefront for **SORAYVA**, powered by a **Google Sheets Catalogue Control Centre** as the source of truth. Built with **Next.js 14 (App Router), React 18, TypeScript 5, and Tailwind CSS**.

When the owner adds or edits a product in Google Sheets, the website automatically reflects customer-facing product information without requiring frontend code changes or redeployments.

---

## 1. Security Architecture: Public vs Internal Boundary

> [!IMPORTANT]
> **CRITICAL SECURITY RULE**
> The Meesho reference link and all supplier/source information are strictly **INTERNAL ONLY**.
> These fields must **NEVER** be returned by the public product API or exposed in client browser bundles.

```text
               GOOGLE SPREADSHEET (SORAYVA_PRODUCT_CATALOGUE)
                                  │
                                  ▼
                    GOOGLE APPS SCRIPT API LAYER
             (Validates rows & strips internal fields)
                                  │
                                  ▼
                       PUBLIC PRODUCT DTO Payload
             (Contains ONLY customer-approved fields)
                                  │
                                  ▼
               GoogleSheetsProductRepository (Next.js)
                                  │
                                  ▼
                        SORAYVA STOREFRONT UI
```

### TypeScript Type Separation
- **`PublicProduct`**: Customer-facing DTO containing only public fields.
- **`InternalProduct`**: Extends `PublicProduct` with `meeshoReferenceLink`, `sourceCost`, `sourceStatus`, `supplierReference`, `lastSourceCheck`.
- The Public API endpoint strictly returns `PublicProduct[]`.

---

## 2. Google Spreadsheet Schema (`SORAYVA_PRODUCT_CATALOGUE`)

- **Spreadsheet Name**: `SORAYVA_PRODUCT_CATALOGUE`
- **Primary Sheet**: `PRODUCTS`

### Column Structure (38 Columns in Exact Order)

| Col # | Header | Data Type | Customer Public? | Description & Recommended Values |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `Product ID` | String | **YES** | Unique ID (e.g. `SAR-001`) |
| 2 | `Product Name` | String | **YES** | Full saree title |
| 3 | `Short Description` | String | **YES** | Brief summary |
| 4 | `Category` | String | **YES** | Saree Category (e.g. `Silk Sarees`, `Organza & Tissue`) |
| 5 | `Subcategory` | String | **YES** | Sub-type (e.g. `Kanjeevaram`, `Banarasi`) |
| 6 | `Fabric` | String | **YES** | `Silk`, `Organza`, `Georgette`, `Chiffon`, `Cotton`, `Linen`, `Satin`, `Silk Blend`, `Other` |
| 7 | `Occasion` | Multi-CSV | **YES** | `Everyday`, `Festive`, `Party`, `Wedding Guest`, `Celebration`, `Evening` (e.g. `Festive, Party`) |
| 8 | `Style` | Multi-CSV | **YES** | `Elegant`, `Minimal`, `Traditional`, `Contemporary`, `Statement`, `Classic` |
| 9 | `Work` | Multi-CSV | **YES** | `Printed`, `Embroidered`, `Zari`, `Sequins`, `Woven`, `Stone Work`, `Plain`, `Other` |
| 10 | `Pattern` | String | **YES** | `Floral`, `Paisley`, `Geometric`, `Abstract`, `Traditional`, `Printed`, `Solid`, `Other` |
| 11 | `Colour` | String | **YES** | Specific color name (e.g. `Crimson Red`) |
| 12 | `Colour Family` | String | **YES** | Color group (`Red`, `Green`, `Blue`, `Pink`, `Yellow`, `Purple`) |
| 13 | `Collection` | Multi-CSV | **YES** | Collection title (e.g. `The Royal Heritage Edit`) |
| 14 | `Price` | Number | **YES** | Customer selling price in INR |
| 15 | `Compare At Price` | Number | **YES** | Original price (struck through) |
| 16 | `Stock` | Number | **YES** | Available inventory count |
| 17 | `Status` | Dropdown | **YES** | `Draft`, `Active`, `Out of Stock`, `Hidden`, `Discontinued` |
| 18 | `Featured` | Boolean | **YES** | `TRUE` / `FALSE` |
| 19 | `New Arrival` | Boolean | **YES** | `TRUE` / `FALSE` |
| 20 | `Trending` | Boolean | **YES** | `TRUE` / `FALSE` |
| 21 | `Publish Date` | Date | **YES** | Publication date (`YYYY-MM-DD`) |
| 22 | `Main Image URL` | URL | **YES** | Primary product photo |
| 23 | `Image 2 URL` | URL | **YES** | Secondary product photo |
| 24 | `Image 3 URL` | URL | **YES** | Gallery product photo |
| 25 | `Image 4 URL` | URL | **YES** | Gallery product photo |
| 26 | `Size Type` | String | **YES** | `Standard Saree (5.5m)` |
| 27 | `Blouse Size` | Multi-CSV | **YES** | `Unstitched`, `XS`, `S`, `M`, `L`, `XL`, `XXL` |
| 28 | `Size Chart` | String | **YES** | Dimensions reference |
| 29 | `Shipping Info` | String | **YES** | Shipping details |
| 30 | `Return Info` | String | **YES** | Return policy details |
| 31 | `Rating` | Number | **YES** | Rating score (e.g. `4.9`) |
| 32 | `Review Count` | Number | **YES** | Number of reviews (e.g. `28`) |
| 33 | `Meesho Reference Link`| URL | ❌ **INTERNAL ONLY** | Meesho sourcing URL |
| 34 | `Source Cost` | Number | ❌ **INTERNAL ONLY** | Supplier cost price |
| 35 | `Source Status` | String | ❌ **INTERNAL ONLY** | Supplier stock status |
| 36 | `Supplier Reference` | String | ❌ **INTERNAL ONLY** | Supplier code / SKU |
| 37 | `Last Source Check` | Date | ❌ **INTERNAL ONLY** | Last audit timestamp |

---

## 3. Product Status Rules

- **`Draft`**: Never publicly displayed. Internal work-in-progress.
- **`Active`**: Publicly displayed on customer storefront.
- **`Hidden`**: Never publicly displayed. Merchandising hold.
- **`Discontinued`**: Never publicly displayed. Archival product.
- **`Out of Stock`**: Displayed on customer storefront with clear "Out of Stock" badge & disabled cart button.

---

## 4. Google Apps Script Setup & Deployment Guide

1. Open your Google Spreadsheet `SORAYVA_PRODUCT_CATALOGUE`.
2. Click **Extensions > Apps Script**.
3. Paste the contents of [`google-apps-script/Code.gs`](file:///c:/Users/AU001AW7/OneDrive%20-%20WSA/Documents/Playwrite/MESHOP/google-apps-script/Code.gs).
4. Click **Deploy > New deployment**.
5. Select type **Web app**.
6. Set **Execute as**: *Me*.
7. Set **Who has access**: *Anyone*.
8. Copy the Web App URL (e.g. `https://script.google.com/macros/s/.../exec`).
9. Set the environment variable in `.env.local` or Cloudflare Pages settings:
   ```env
   NEXT_PUBLIC_CATALOG_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

---

## 5. Owner Publishing Workflow

1. Owner creates new row in Google Spreadsheet `PRODUCTS`.
2. Fills customer-facing fields (Product Name, Category, Fabric, Price, Main Image URL).
3. Fills internal supplier fields (Meesho Reference Link, Source Cost).
4. Sets **`Status = Draft`**.
5. Audits imagery and details.
6. Sets **`Status = Active`**.
7. Website automatically fetches active saree within revalidation window without code deployment.

---

## 6. Internal Catalogue Health Auditor

The Apps Script and repository provide an internal catalogue health report (`getCatalogueHealthReport`):
- Detects `MISSING_IMAGE`, `MISSING_PRICE`, `MISSING_CATEGORY`, `INVALID_STATUS`, `INVALID_PRODUCT_ID`, duplicate IDs.
- Calculates an overall catalogue health score (0-100%).

---

## 7. Security Verification Suite

Run the automated security and functional verification suite:

```bash
npx tsx scripts/validate-cms.ts
```

This test suite runs 14 automated assertion tests, including the **CRITICAL SECURITY AUDIT TEST** ensuring zero leakage of supplier/source fields in public API payloads.

---

## 8. Local Development Commands

```bash
# Install dependencies
npm install

# Run TypeScript type check
npx tsc --noEmit

# Run CMS security test suite
npx tsx scripts/validate-cms.ts

# Start local dev server
npm run dev

# Run production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
