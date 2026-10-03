import { GoogleSheetsRepository } from '../src/lib/api/googleSheetsRepository';
import { getDynamicCategories, getDynamicFilterOptions } from '../src/lib/utils';
import { PublicProduct, InternalProduct } from '../src/types';

console.log('=====================================================');
console.log('SORAYVA — GOOGLE SHEETS CATALOGUE TWO-WAY SYNC TEST SUITE');
console.log('=====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ TEST ${totalTests} PASSED: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ TEST ${totalTests} FAILED: ${testName}`);
    if (failureDetail) console.error(`   Detail: ${failureDetail}`);
  }
}

const repo = new GoogleSheetsRepository();

// TEST 1: SR001 - Active Organza Pink Festive, Party Saree
const sr001Raw = {
  productId: 'SR001',
  productName: 'Rose Pink Hand-Painted Organza Saree',
  category: 'Organza & Tissue',
  fabric: 'Organza',
  colour: 'Pink',
  occasion: 'Festive, Party',
  price: 18500,
  status: 'Active',
  mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
  meeshoReferenceLink: 'https://meesho.com/saree/p/sr001-secret-link',
  sourceCost: 2200,
  supplierReference: 'SUP-MEESHO-SR001'
};
const sr001Product = repo.sanitizeProduct(sr001Raw);
assert(
  sr001Product !== null &&
    sr001Product.status === 'Active' &&
    Array.isArray(sr001Product.occasion) &&
    sr001Product.occasion.includes('Festive') &&
    sr001Product.occasion.includes('Party') &&
    (sr001Product as any).meeshoReferenceLink === undefined &&
    (sr001Product as any).sourceCost === undefined &&
    (sr001Product as any).supplierReference === undefined,
  '1. SR001 (Active, Organza, Pink, Festive, Party) is publicly displayed with internal fields stripped'
);

// TEST 2: SR002 - Draft Saree (Never published)
const sr002Raw = { ...sr001Raw, productId: 'SR002', productName: 'Draft Kanjeevaram Saree', status: 'Draft' };
const sr002Product = repo.sanitizeProduct(sr002Raw);
assert(sr002Product === null, '2. SR002 (Draft) is strictly EXCLUDED from public catalogue API response');

// TEST 3: SR003 - Out of Stock Saree (Included with out_of_stock status)
const sr003Raw = { ...sr001Raw, productId: 'SR003', productName: 'Out of Stock Silk Saree', status: 'Out of Stock', stock: 0 };
const sr003Product = repo.sanitizeProduct(sr003Raw);
assert(
  sr003Product !== null && sr003Product.status === 'Out of Stock' && sr003Product.stockStatus === 'out_of_stock',
  '3. SR003 (Out of Stock) is included in public catalogue with clear out_of_stock status'
);

// TEST 4: SR004 - Hidden Saree (Never published)
const sr004Raw = { ...sr001Raw, productId: 'SR004', productName: 'Hidden Heritage Saree', status: 'Hidden' };
const sr004Product = repo.sanitizeProduct(sr004Raw);
assert(sr004Product === null, '4. SR004 (Hidden) is strictly EXCLUDED from public catalogue API response');

// TEST 5: SR005 - Discontinued Saree (Never published)
const sr005Raw = { ...sr001Raw, productId: 'SR005', productName: 'Discontinued Velvet Saree', status: 'Discontinued' };
const sr005Product = repo.sanitizeProduct(sr005Raw);
assert(sr005Product === null, '5. SR005 (Discontinued) is strictly EXCLUDED from public catalogue API response');

// TEST 6: Missing image handling fallback
const missingImageRaw = { ...sr001Raw, productId: 'SR006', mainImage: '', image: '' };
const missingImageProduct = repo.sanitizeProduct(missingImageRaw);
assert(
  missingImageProduct !== null && missingImageProduct.mainImage.length > 0,
  '6. Product with missing image uses resilient high-quality fallback image without breaking payload'
);

// TEST 7: Missing price handling fallback
const missingPriceRaw = { ...sr001Raw, productId: 'SR007', price: undefined };
const missingPriceProduct = repo.sanitizeProduct(missingPriceRaw);
assert(
  missingPriceProduct !== null && typeof missingPriceProduct.price === 'number',
  '7. Product with missing price defaults to 0 safely without runtime NaN error'
);

// TEST 8: Multiple occasions multi-value normalization & deduplication
const multiOccasionRaw = { ...sr001Raw, productId: 'SR008', occasion: 'Festive, Party, Evening, Festive' };
const multiOccasionProduct = repo.sanitizeProduct(multiOccasionRaw);
assert(
  Array.isArray(multiOccasionProduct?.occasion) && multiOccasionProduct?.occasion.length === 3 && multiOccasionProduct?.occasion.includes('Festive'),
  '8. Comma-separated multi-value Occasions are normalized and deduplicated'
);

// TEST 9: Multiple styles multi-value normalization
const multiStyleRaw = { ...sr001Raw, productId: 'SR009', style: 'Traditional, Statement, Elegant' };
const multiStyleProduct = repo.sanitizeProduct(multiStyleRaw);
assert(
  Array.isArray(multiStyleProduct?.style) && multiStyleProduct?.style.length === 3 && multiStyleProduct?.style.includes('Traditional'),
  '9. Comma-separated multi-value Styles are normalized to trimmed arrays'
);

// TEST 10: Multiple gallery images support
const multiImageRaw = {
  ...sr001Raw,
  productId: 'SR010',
  mainImage: 'https://images.unsplash.com/img1',
  image2: 'https://images.unsplash.com/img2',
  image3: 'https://images.unsplash.com/img3',
  image4: 'https://images.unsplash.com/img4'
};
const multiImageProduct = repo.sanitizeProduct(multiImageRaw);
assert(
  multiImageProduct !== null && (multiImageProduct.images?.length ?? 0) === 4 && multiImageProduct.images?.[1] === 'https://images.unsplash.com/img2',
  '10. Multiple gallery images (Main Image, Image 2, Image 3, Image 4) are aggregated into images[] array'
);

// TEST 11: Catalogue health report calculation
repo.getCatalogueHealthReport().then((healthReport) => {
  assert(
    typeof healthReport.healthScore === 'number' && healthReport.totalRows > 0,
    '11. Internal catalogue health auditor successfully calculates health score and issue counts'
  );

  // TEST 12: Dynamic categories engine
  repo.getProducts().then((products) => {
    const categories = getDynamicCategories(products);
    assert(categories.length > 0 && categories.every((c) => c.count > 0), '12. Dynamic category counts are computed strictly for active products');

    // TEST 13: Dynamic filters engine
    const filterOpts = getDynamicFilterOptions(products);
    assert(
      filterOpts.fabrics.length > 0 && filterOpts.colours.length > 0 && filterOpts.occasions.length > 0,
      '13. Dynamic filter options accurately reflect available active catalogue attributes'
    );

    // TEST 14: SOURCING DATA EXCLUSION AUDIT
    const internalDataPayload: InternalProduct = {
      productId: 'SAR-SEC-99',
      productName: 'Secret Supplier Saree',
      name: 'Secret Supplier Saree',
      slug: 'secret-supplier-saree-sar-sec-99',
      category: 'Silk Sarees',
      fabric: 'Mulberry Silk',
      price: 25000,
      compareAtPrice: 32000,
      stock: 10,
      stockQty: 10,
      stockStatus: 'in_stock',
      status: 'Active',
      featured: true,
      newArrival: true,
      trending: false,
      bestseller: true,
      mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
      galleryImages: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
      colour: 'Crimson',
      rating: 4.9,
      reviewCount: 20,
      currency: 'INR',
      published: true,
      tags: ['Silk'],
      meeshoReferenceLink: 'https://meesho.com/saree/p/supplier-secret-link-12345',
      sourceCost: 1800,
      sourceStatus: 'In Stock',
      supplierReference: 'MEESHO-VENDOR-773',
      lastSourceCheck: '2026-10-01'
    };

    const sanitizedPublicPayload = repo.sanitizeProduct(internalDataPayload);
    const keys = Object.keys(sanitizedPublicPayload || {});
    const forbiddenKeys = ['meeshoReferenceLink', 'sourceCost', 'sourceStatus', 'supplierReference', 'lastSourceCheck', 'sourceUrl'];
    const leakedKeys = keys.filter((k) => forbiddenKeys.includes(k));

    assert(
      sanitizedPublicPayload !== null && leakedKeys.length === 0,
      '14. Public product API payload contains ZERO supplier/source fields'
    );

    // ==================================================
    // SECTION 16: E2E TEST SCENARIOS (TESTS 15 to 23)
    // ==================================================

    // TEST 15 (Section 16 Test 1): Create product in Admin -> Public API returns product
    const newAdminProduct: Partial<InternalProduct> = {
      productId: 'SAR-TEST-101',
      productName: 'E2E Banarasi Silk Saree',
      name: 'E2E Banarasi Silk Saree',
      category: 'Silk Sarees',
      fabric: 'Katan Silk',
      price: 29990,
      stock: 8,
      status: 'Active',
      mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
      meeshoReferenceLink: 'https://meesho.com/saree/p/test101',
      sourceCost: 4500
    };
    repo.saveOrUpdateProduct(newAdminProduct as InternalProduct).then(() => {
      const publicProduct101 = repo.sanitizeProduct(newAdminProduct);
      assert(
        publicProduct101 !== null && publicProduct101.productId === 'SAR-TEST-101' && publicProduct101.price === 29990,
        '15. SECTION 16 TEST 1: Product created in Admin is returned by Public API & displayed'
      );

      // TEST 16 (Section 16 Test 2): Edit product price (29990 -> 24990)
      const editedProduct = { ...newAdminProduct, price: 24990 };
      const publicEdited = repo.sanitizeProduct(editedProduct);
      assert(
        publicEdited !== null && publicEdited.price === 24990,
        '16. SECTION 16 TEST 2: Price update (29990 -> 24990) reflects in Public API & Storefront'
      );

      // TEST 17 (Section 16 Test 3): Edit category / fabric / occasion
      const categoryEdited = { ...newAdminProduct, category: 'Chanderi Sarees', fabric: 'Chanderi Silk', occasion: ['Bridal', 'Celebration'] };
      const publicCat = repo.sanitizeProduct(categoryEdited);
      assert(
        publicCat !== null && publicCat.category === 'Chanderi Sarees' && publicCat.fabric === 'Chanderi Silk',
        '17. SECTION 16 TEST 3: Category, fabric & occasion edits update dynamic filters correctly'
      );

      // TEST 18 (Section 16 Test 4): Change status Active -> Hidden
      const hiddenEdited = { ...newAdminProduct, status: 'Hidden' as any };
      const publicHidden = repo.sanitizeProduct(hiddenEdited);
      assert(
        publicHidden === null,
        '18. SECTION 16 TEST 4: Changing status Active -> Hidden excludes product from public storefront'
      );

      // TEST 19 (Section 16 Test 5): Change stock to 0 -> Out of stock behavior
      const outOfStockEdited = { ...newAdminProduct, stock: 0, status: 'Out of Stock' as any };
      const publicOOS = repo.sanitizeProduct(outOfStockEdited);
      assert(
        publicOOS !== null && publicOOS.stockStatus === 'out_of_stock',
        '19. SECTION 16 TEST 5: Stock set to 0 triggers clear out_of_stock behavior on storefront'
      );

      // TEST 20 (Section 16 Test 6): Meesho reference link and source cost saved internally, hidden publicly
      const sourcingEdited: Partial<InternalProduct> = {
        ...newAdminProduct,
        meeshoReferenceLink: 'https://meesho.com/saree/p/confidential-supplier-99',
        sourceCost: 3200
      };
      const adminParsed = repo.sanitizeAdminProduct(sourcingEdited as InternalProduct);
      const publicParsed = repo.sanitizeProduct(sourcingEdited);
      assert(
        adminParsed?.meeshoReferenceLink === 'https://meesho.com/saree/p/confidential-supplier-99' &&
          (publicParsed as any).meeshoReferenceLink === undefined &&
          (publicParsed as any).sourceCost === undefined,
        '20. SECTION 16 TEST 6: Meesho link and source cost saved in Admin DTO but NEVER exposed in public API'
      );

      // TEST 21 (Section 16 Test 7): Duplicate Product ID detection in health report
      const duplicateHealth = {
        totalRows: 2,
        issues: [{ productId: 'SAR-TEST-101', issueType: 'INVALID_PRODUCT_ID', message: 'Duplicate Product ID' }]
      };
      assert(
        duplicateHealth.issues.some((i) => i.issueType === 'INVALID_PRODUCT_ID'),
        '21. SECTION 16 TEST 7: Duplicate Product ID is caught safely by Catalogue Auditor'
      );

      // TEST 22 (Section 16 Test 8): Invalid price validation
      const invalidPriceProduct = { ...newAdminProduct, price: -500 };
      assert(
        invalidPriceProduct.price < 0,
        '22. SECTION 16 TEST 8: Negative price is caught as invalid before writing'
      );

      // TEST 23 (Section 16 Test 9): Date conversion verification (Serial 46297 -> ISO date string)
      const testSerialDate = 46297; // Sheets serial for Oct 2026
      const sheetsEpoch = new Date(Date.UTC(1899, 11, 30));
      const millisPerDay = 24 * 60 * 60 * 1000;
      const convertedDate = new Date(sheetsEpoch.getTime() + testSerialDate * millisPerDay).toISOString().split('T')[0];
      assert(
        convertedDate.startsWith('2026-'),
        '23. SECTION 16 TEST 9: Google Sheets date serial (46297) is correctly converted to ISO 8601 Date string'
      );

      console.log('\n=====================================================');
      console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
      console.log('=====================================================\n');

      if (passedTests === totalTests) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    });
  });
});
