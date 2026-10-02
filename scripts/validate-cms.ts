import { GoogleSheetsRepository } from '../src/lib/api/googleSheetsRepository';
import { getDynamicCategories, getDynamicFilterOptions } from '../src/lib/utils';
import { PublicProduct, InternalProduct } from '../src/types';

console.log('=====================================================');
console.log('SORAYVA — GOOGLE SHEETS CATALOGUE CMS SECURITY & FUNCTIONAL TEST SUITE');
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

// TEST 1: Active product parsing
const activeRaw = {
  productId: 'SAR-TEST-01',
  productName: 'Active Silk Saree',
  category: 'Silk Sarees',
  price: 15000,
  status: 'Active',
  mainImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
  published: true
};
const activeProduct = repo.sanitizeProduct(activeRaw);
assert(activeProduct !== null && activeProduct.status === 'Active', '1. Active product is included in public catalogue DTO');

// TEST 2: Draft product filtering
const draftRaw = { ...activeRaw, productId: 'SAR-TEST-02', status: 'Draft' };
const draftProduct = repo.sanitizeProduct(draftRaw);
assert(draftProduct === null, '2. Draft product is strictly EXCLUDED from public catalogue');

// TEST 3: Hidden product filtering
const hiddenRaw = { ...activeRaw, productId: 'SAR-TEST-03', status: 'Hidden' };
const hiddenProduct = repo.sanitizeProduct(hiddenRaw);
assert(hiddenProduct === null, '3. Hidden product is strictly EXCLUDED from public catalogue');

// TEST 4: Discontinued product filtering
const discontinuedRaw = { ...activeRaw, productId: 'SAR-TEST-04', status: 'Discontinued' };
const discontinuedProduct = repo.sanitizeProduct(discontinuedRaw);
assert(discontinuedProduct === null, '4. Discontinued product is strictly EXCLUDED from public catalogue');

// TEST 5: Out of Stock product handling
const outOfStockRaw = { ...activeRaw, productId: 'SAR-TEST-05', status: 'Out of Stock', stock: 0 };
const outOfStockProduct = repo.sanitizeProduct(outOfStockRaw);
assert(
  outOfStockProduct !== null && outOfStockProduct.status === 'Out of Stock' && outOfStockProduct.stockStatus === 'out_of_stock',
  '5. Out of Stock product is included in public catalogue with clear unavailable stockStatus'
);

// TEST 6: Missing image handling
const missingImageRaw = { ...activeRaw, productId: 'SAR-TEST-06', mainImage: '', image: '' };
const missingImageProduct = repo.sanitizeProduct(missingImageRaw);
assert(
  missingImageProduct !== null && missingImageProduct.mainImage.length > 0,
  '6. Product with missing image uses resilient high-quality fallback image without breaking payload'
);

// TEST 7: Missing price handling
const missingPriceRaw = { ...activeRaw, productId: 'SAR-TEST-07', price: undefined };
const missingPriceProduct = repo.sanitizeProduct(missingPriceRaw);
assert(
  missingPriceProduct !== null && typeof missingPriceProduct.price === 'number',
  '7. Product with missing price defaults to 0 safely without runtimeNaN error'
);

// TEST 8: Multiple occasions multi-value normalization
const multiOccasionRaw = { ...activeRaw, productId: 'SAR-TEST-08', occasion: 'Festive, Party, Evening' };
const multiOccasionProduct = repo.sanitizeProduct(multiOccasionRaw);
assert(
  Array.isArray(multiOccasionProduct?.occasion) && multiOccasionProduct?.occasion.length === 3 && multiOccasionProduct?.occasion.includes('Festive'),
  '8. Comma-separated multi-value Occasions are normalized to trimmed arrays'
);

// TEST 9: Multiple styles multi-value normalization
const multiStyleRaw = { ...activeRaw, productId: 'SAR-TEST-09', style: 'Traditional, Statement, Elegant' };
const multiStyleProduct = repo.sanitizeProduct(multiStyleRaw);
assert(
  Array.isArray(multiStyleProduct?.style) && multiStyleProduct?.style.length === 3 && multiStyleProduct?.style.includes('Traditional'),
  '9. Comma-separated multi-value Styles are normalized to trimmed arrays'
);

// TEST 10: Multiple gallery images support
const multiImageRaw = {
  ...activeRaw,
  productId: 'SAR-TEST-10',
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

    // CRITICAL SECURITY TEST (TEST 14)
    console.log('\n-----------------------------------------------------');
    console.log('CRITICAL SECURITY AUDIT TEST: SOURCING DATA EXCLUSION');
    console.log('-----------------------------------------------------');

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
      // SOURCING FIELDS THAT MUST NEVER LEAK:
      meeshoReferenceLink: 'https://meesho.com/saree/p/supplier-secret-link-12345',
      sourceCost: 1800,
      sourceStatus: 'In Stock',
      supplierReference: 'MEESHO-VENDOR-773',
      lastSourceCheck: '2026-10-01'
    };

    const sanitizedPublicPayload = repo.sanitizeProduct(internalDataPayload);

    const check1 = (sanitizedPublicPayload as any).meeshoReferenceLink === undefined;
    const check2 = (sanitizedPublicPayload as any).sourceCost === undefined;
    const check3 = (sanitizedPublicPayload as any).sourceStatus === undefined;
    const check4 = (sanitizedPublicPayload as any).supplierReference === undefined;
    const check5 = (sanitizedPublicPayload as any).lastSourceCheck === undefined;
    const check6 = (sanitizedPublicPayload as any).sourceUrl === undefined;

    const keys = Object.keys(sanitizedPublicPayload || {});
    const forbiddenKeys = ['meeshoReferenceLink', 'sourceCost', 'sourceStatus', 'supplierReference', 'lastSourceCheck', 'sourceUrl'];
    const leakedKeys = keys.filter((k) => forbiddenKeys.includes(k));

    assert(
      check1 && check2 && check3 && check4 && check5 && check6 && leakedKeys.length === 0,
      '14. MOST IMPORTANT SECURITY TEST PASSED: Public product API payload contains ZERO supplier/source fields!',
      leakedKeys.length > 0 ? `Leaked keys found in public DTO: ${leakedKeys.join(', ')}` : undefined
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
