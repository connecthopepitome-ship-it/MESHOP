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

---

## 9. SORAYVA Admin Catalogue Dashboard Architecture

The Admin Catalogue Dashboard is an authenticated management interface accessible at `/admin`.

### Admin Routes & Protection
- `/admin/login`: Admin authentication portal (Passcode protected).
- `/admin`: Dashboard overview with KPI stats, stock alerts, and Catalogue Health Auditor.
- `/admin/products`: Product Management table with search, filters, pagination, bulk actions, and live customer preview modal.
- `/admin/products/new`: Product Creation interface with validation, image previews, and private sourcing fields.
- `/admin/products/[productId]/edit`: Product Editor pre-filled with existing data.

All `/admin` routes (except `/admin/login`) are wrapped in `AdminGuard` which checks `AdminAuthContext` session state. Unauthorized users or customers are redirected immediately to `/admin/login`.

### Two-Way Google Sheets Sync Data Flow
```text
  ┌───────────────────────────┐
  │   Admin UI (React Form)   │
  └─────────────┬─────────────┘
                │
                ▼ (Action: createProduct / updateProduct / updateStatus / archiveProduct)
  ┌───────────────────────────┐
  │    Admin API / Repo       │
  └─────────────┬─────────────┘
                │
                ▼ POST Payload (JSON / x-www-form-urlencoded)
  ┌───────────────────────────┐
  │ Google Apps Script doPost │
  └─────────────┬─────────────┘
                │
                ▼ Row Match by Product ID (Preserves unedited columns & other rows)
  ┌───────────────────────────┐
  │      Google Sheets        │
  │ (SORAYVA_PRODUCT_CATALOGUE)│
  └─────────────┬─────────────┘
                │
                ▼ doGet (Cache Invalidation & Fresh Fetch)
  ┌───────────────────────────┐
  │   Public Catalogue API    │
  └─────────────┬─────────────┘
                │
                ▼ (Sanitized DTO: Strips internal source fields)
  ┌───────────────────────────┐
  │  SORAYVA Storefront UI    │
  └───────────────────────────┘
```

### Internal / Private Sourcing Fields Isolation
The Admin Dashboard allows viewing and editing private sourcing fields:
- `Meesho Reference Link` (`meeshoReferenceLink`)
- `Source Cost` (`sourceCost`)
- `Source Status` (`sourceStatus`)
- `Supplier Reference` (`supplierReference`)
- `Last Source Check` (`lastSourceCheck`)

These fields are strictly confined to the Admin UI & Google Sheets. `sanitizeProduct()` strips these fields before returning any public payload, ensuring zero exposure to customers, browser bundles, JSON-LD, or search indexing.

---

## 7. Customer Authentication & Account System (Firebase Auth & Firestore)

SORAYVA uses **Firebase Authentication** for patron registration, secure login, email verification, and password resets, with **Cloud Firestore** for customer profiles and saved delivery addresses.

### Architecture Highlights
- **Client Authentication**: Modular Firebase Web SDK v13 (`firebase/auth`, `firebase/firestore`).
- **Edge / Cloudflare Compatibility**: Cryptographic server-side verification using standard Web Crypto (`crypto.subtle`) via `jose` to verify Google JWKS. Zero dependency on heavy Node.js `firebase-admin` modules in Cloudflare Workers.
- **Strict Role Separation**: Customer credentials NEVER grant Admin dashboard or catalogue editing privileges. Admin authentication remains isolated via `AdminAuthContext` and secure server tokens.
- **Optional Guest Flow**: Guest shopping and guest checkout remain 100% accessible. Customers may register or sign in at any time.

### Required Environment Variables (`.env.local`)

Add your Firebase Web App credentials to `.env.local`:

```bash
# Firebase Client SDK Credentials (Web App)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="sorayva-atelier.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="sorayva-atelier"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="sorayva-atelier.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-ABCDEF1234" # Optional
```

> [!CAUTION]
> **NEVER EXPOSE SECRETS**: Service account private keys, admin credentials, payment gateway secrets, or Google Sheets tokens must NEVER be prefixed with `NEXT_PUBLIC_` or added to client configs.

### Firebase Console Setup Checklist
1. **Enable Email/Password Provider**:
   - Go to **Firebase Console** &rarr; **Authentication** &rarr; **Sign-in method**.
   - Enable **Email/Password**. Leave "Email link (passwordless sign-in)" disabled unless separately configured.
2. **Authorized Domains**:
   - Under **Authentication** &rarr; **Settings** &rarr; **Authorized domains**, add:
     - `localhost`
     - `127.0.0.1`
     - `meshop.connect-hopepitome.workers.dev` (Production Cloudflare Worker)
3. **Deploy Firestore Security Rules**:
   - Deploy `firestore.rules` provided in the repository root:
     - Enforces customer ownership (`request.auth.uid == uid`).
     - Rejects client modification of `uid`, `isAdmin`, or `role`.
     - Denies public access to administrative or sourcing data.


