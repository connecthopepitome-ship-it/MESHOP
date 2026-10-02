# SORAYVA — The Modern Saree House (`MESHOP`)

A production-quality, mobile-first saree-only e-commerce storefront for **SORAYVA**. Built with **Next.js 14 (App Router), React 18, TypeScript 5, and Tailwind CSS**.

The architecture features a clean repository abstraction layer (`GoogleSheetsRepository`) backed by Google Sheets for catalogue control, while maintaining pluggable provider interfaces (`PaymentProvider`, `ShippingProvider`, `FulfillmentProvider`) for future migration to Firebase/Firestore, Razorpay, and approved fulfilment connectors.

---

## 1. Customer Shopping Flow

```text
Direct / Organic / Social Traffic
             ↓
SORAYVA Haute Couture Storefront (Ivory, Champagne & Bronze Aesthetics)
             ↓
Header Navigation: SHOP | NEW ARRIVALS | COLLECTIONS | SHOP BY OCCASION | SHOP BY FABRIC | SALE
             ↓
Dynamic Category System & Multi-Attribute Filters (Price, Fabric, Color, Occasion, Style, Work)
             ↓
Product Detail Page (Gallery, Product Image Fallbacks, Pincode Delivery Checker, WhatsApp Stylist)
             ↓
BLOUSE SIZE GUIDE (XS–XXL Measurements & Tailoring Calculator)
             ↓
Slide-over Cart & Wishlist Drawers
             ↓
Address-Validated Checkout (COD & Online Payment)
             ↓
Order Confirmation & Live Order Tracking Timeline
```

---

## 2. Technology Stack

* **Framework**: Next.js 14 (App Router), React 18, TypeScript 5
* **Styling**: Tailwind CSS (custom luxury tokens: Ivory `#fbf9f5`, Secondary `#4a2e2b`, Bronze Taupe `#ede6dc`, Champagne Gold `#c89b67`, `Bodoni Moda`, `Cormorant Garamond`, `Jost`, `Manrope` fonts)
* **Icons**: Lucide React & Google Material Symbols
* **Data Abstraction**: Repository Pattern (`GoogleSheetsRepository` with local mock fallback)
* **Pluggable Adapters**:
  * `PaymentProvider` (Razorpay / COD)
  * `ShippingProvider` (Air Courier)
  * `FulfillmentProvider` (Internal Supplier Mapping Boundary)
* **Persistence**: Browser `localStorage` for wishlist, cart, recently viewed products, order history, and saved blouse size preferences.

---

## 3. Google Sheets Catalogue Schema

Create a Google Spreadsheet with the following column structure:

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `Product ID` | String | Unique product code (e.g. `SAR-001`) |
| `Product Name` | String | Saree title |
| `Description` | String | Product details |
| `Category` | String | Saree category (e.g. `Organza`, `Silk`, `Georgette`) |
| `Subcategory` | String | Sub-type |
| `Collection` | String | Collection name |
| `Fabric` | String | Textile fabric |
| `Occasion` | String / Array | Occasion tags (`Everyday`, `Festive`, `Party`, `Wedding Guest`, `Celebration`) |
| `Style` | String / Array | Style tags (`Elegant`, `Minimal`, `Traditional`, `Contemporary`, `Statement`) |
| `Work` | String / Array | Weave & embroidery craft |
| `Pattern` | String | Motifs / pattern |
| `Colour` | String | Color name |
| `Colour Family` | String | Color family |
| `Price` | Number | Customer selling price |
| `Compare At Price` | Number | Original price (struck through) |
| `Stock` | Number | Available stock quantity |
| `Status` | String | `Active`, `Draft`, `Out of Stock`, `Hidden`, `Discontinued` |
| `Featured` | Boolean | `TRUE` / `FALSE` |
| `New Arrival` | Boolean | `TRUE` / `FALSE` |
| `Trending` | Boolean | `TRUE` / `FALSE` |
| `Publish Date` | String | Date published |
| `Main Image` | String | Primary image URL |
| `Image 2` | String | Secondary image URL |
| `Image 3` | String | Gallery image URL |
| `Image 4` | String | Gallery image URL |
| **Internal Fields** | | *(Never rendered on customer storefront)* |
| `Source URL` | String | Internal supplier URL |
| `Source Cost` | Number | Internal cost price |
| `Source Status` | String | Internal supplier stock state |
| `Supplier Reference` | String | Internal supplier code |

> **Security Note**: `GoogleSheetsRepository` automatically sanitizes and strips internal supplier fields (`sourceUrl`, `sourceCost`, `sourceStatus`, `supplierReference`) before serving product payloads to client components.

---

## 4. Local Development Commands

```bash
# Install dependencies
npm install

# Run TypeScript type validation
npx tsc --noEmit

# Start local development server
npm run dev

# Run production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
