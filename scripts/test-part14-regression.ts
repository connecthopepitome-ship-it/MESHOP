import { GoogleSheetsRepository } from '../src/lib/api/googleSheetsRepository';
import { InternalProduct, PublicProduct } from '../src/types';

async function runRegressionSuite() {
  console.log('========================================================');
  console.log('SORAYVA — PART 14 MANDATORY REGRESSION TEST SUITE');
  console.log('========================================================\n');

  const repo = new GoogleSheetsRepository();
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ ${testName}: PASSED`);
      passed++;
    } else {
      console.error(`❌ ${testName}: FAILED`);
      if (detail) console.error(`   ${detail}`);
      process.exitCode = 1;
    }
  }

  // ----------------------------------------------------
  // TEST A — MULTIPLE IMAGES ROUND-TRIP
  // ----------------------------------------------------
  console.log('--- TEST A: MULTIPLE IMAGES ROUND-TRIP ---');
  const imgA = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c';
  const imgB = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b';
  const imgC = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb';
  const imgD = 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e';

  const testProductA: InternalProduct = {
    productId: 'TEST-SAR-REG-A',
    productName: 'Royal Kanjeevaram Silk Regression Saree',
    name: 'Royal Kanjeevaram Silk Regression Saree',
    category: 'Silk Sarees',
    fabric: 'Silk',
    colour: 'Crimson',
    price: 28500,
    stock: 5,
    stockQty: 5,
    stockStatus: 'in_stock',
    status: 'Active',
    featured: true,
    newArrival: true,
    bestseller: true,
    slug: 'royal-kanjeevaram-silk-regression-saree-test-sar-reg-a',
    mainImage: imgA,
    image2: imgB,
    image3: imgC,
    image4: imgD,
    galleryImages: [imgA, imgB, imgC, imgD],
    images: [imgA, imgB, imgC, imgD],
    sizeType: 'Standard Saree (5.5m)',
    shippingInfo: 'Insured shipping',
    returnInfo: '7 days return',
    rating: 4.9,
    reviewCount: 15,
    currency: 'INR',
    published: true,
    sortOrder: 1,
    sku: 'SKU-REG-A',
    tags: ['Silk', 'Kanjeevaram'],
    meeshoReferenceLink: 'https://meesho.com/saree/p/test-reg-a',
    sourceCost: 3500,
    supplierReference: 'SUP-REG-01'
  };

  await repo.saveOrUpdateProduct(testProductA);
  const readBackAdminA = await repo.getAdminProductById('TEST-SAR-REG-A');
  
  assert(
    readBackAdminA !== null &&
    readBackAdminA.mainImage === imgA &&
    readBackAdminA.image2 === imgB &&
    readBackAdminA.image3 === imgC &&
    readBackAdminA.image4 === imgD &&
    readBackAdminA.galleryImages.length === 4 &&
    readBackAdminA.galleryImages.includes(imgB),
    'TEST A.1: Admin persistence round-trip preserves all 4 image URLs'
  );

  const publicProductA = repo.sanitizeProduct(readBackAdminA);
  assert(
    publicProductA !== null &&
    publicProductA.mainImage === imgA &&
    publicProductA.image2 === imgB &&
    publicProductA.image3 === imgC &&
    publicProductA.image4 === imgD &&
    publicProductA.galleryImages.length === 4,
    'TEST A.2: Public Product DTO includes all 4 gallery images and exact slots'
  );

  // ----------------------------------------------------
  // TEST B — PRICE UPDATE DOES NOT LOSE IMAGES
  // ----------------------------------------------------
  console.log('\n--- TEST B: PRICE UPDATE DOES NOT LOSE IMAGES ---');
  // Partial update passing only price (omitted image fields)
  const priceUpdatePayload: InternalProduct = {
    ...readBackAdminA!,
    price: 25990,
    // Simulate request where image2/3/4 might be omitted
    image2: undefined,
    image3: undefined,
    image4: undefined
  };

  await repo.saveOrUpdateProduct(priceUpdatePayload);
  const readBackAfterPrice = await repo.getAdminProductById('TEST-SAR-REG-A');

  assert(
    readBackAfterPrice !== null &&
    readBackAfterPrice.price === 25990 &&
    readBackAfterPrice.mainImage === imgA &&
    readBackAfterPrice.image2 === imgB &&
    readBackAfterPrice.image3 === imgC &&
    readBackAfterPrice.image4 === imgD &&
    readBackAfterPrice.galleryImages.length === 4,
    'TEST B: Updating price preserves all 4 image URLs without clearing them'
  );

  // ----------------------------------------------------
  // TEST C — SAVE DRAFT PERSISTENCE & VISIBILITY
  // ----------------------------------------------------
  console.log('\n--- TEST C: SAVE DRAFT PERSISTENCE & VISIBILITY ---');
  await repo.updateProductStatus('TEST-SAR-REG-A', 'Draft');
  const readBackDraft = await repo.getAdminProductById('TEST-SAR-REG-A');

  assert(
    readBackDraft !== null &&
    readBackDraft.status === 'Draft' &&
    readBackDraft.productId === 'TEST-SAR-REG-A' &&
    readBackDraft.price === 25990 &&
    readBackDraft.image2 === imgB,
    'TEST C.1: Product saved as Draft remains present, editable and intact in Admin'
  );

  const adminProductsList = await repo.getAdminProducts();
  const inAdminList = adminProductsList.some((p) => p.productId === 'TEST-SAR-REG-A' && p.status === 'Draft');
  assert(inAdminList, 'TEST C.2: Admin products list includes Draft product');

  const publicDraftCheck = repo.sanitizeProduct(readBackDraft);
  assert(publicDraftCheck === null, 'TEST C.3: Draft product is strictly excluded from public storefront');

  const publicSlugCheck = await repo.getProductBySlug('TEST-SAR-REG-A');
  assert(publicSlugCheck === null, 'TEST C.4: Draft product cannot be accessed via public storefront getProductBySlug');

  // ----------------------------------------------------
  // TEST D — PUBLISH AGAIN
  // ----------------------------------------------------
  console.log('\n--- TEST D: PUBLISH AGAIN (DRAFT -> ACTIVE) ---');
  await repo.updateProductStatus('TEST-SAR-REG-A', 'Active');
  const readBackActive = await repo.getAdminProductById('TEST-SAR-REG-A');

  assert(
    readBackActive !== null &&
    readBackActive.status === 'Active' &&
    readBackActive.productId === 'TEST-SAR-REG-A' &&
    readBackActive.mainImage === imgA &&
    readBackActive.image2 === imgB,
    'TEST D.1: Published product updates to Active without changing Product ID or losing images'
  );

  const publicActiveCheck = repo.sanitizeProduct(readBackActive);
  assert(
    publicActiveCheck !== null &&
    publicActiveCheck.status === 'Active' &&
    publicActiveCheck.galleryImages.length === 4,
    'TEST D.2: Re-published product is now available in Public Storefront catalogue'
  );

  // ----------------------------------------------------
  // TEST E — RELOAD / PERSISTENCE ROBUSTNESS
  // ----------------------------------------------------
  console.log('\n--- TEST E: RELOAD ROBUSTNESS ---');
  // Raw DTO parse simulation (as if received directly over HTTP or fresh API read)
  const rawPayload = {
    productId: 'TEST-SAR-REG-A',
    productName: 'Royal Kanjeevaram Silk Regression Saree',
    category: 'Silk Sarees',
    price: 25990,
    status: 'Active',
    'Main Image URL': imgA,
    'Image 2 URL': imgB,
    'Image 3 URL': imgC,
    'Image 4 URL': imgD
  };
  const parsedAdminReload = repo.sanitizeAdminProduct(rawPayload);
  assert(
    parsedAdminReload !== null &&
    parsedAdminReload.image2 === imgB &&
    parsedAdminReload.image3 === imgC &&
    parsedAdminReload.image4 === imgD &&
    parsedAdminReload.galleryImages.length === 4,
    'TEST E: Cold read / reload correctly maps column headers without memory dependency'
  );

  // ----------------------------------------------------
  // TEST F — EMPTY IMAGE SLOTS
  // ----------------------------------------------------
  console.log('\n--- TEST F: EMPTY OPTIONAL IMAGE SLOTS ---');
  const testSingleImgProduct: InternalProduct = {
    productId: 'TEST-SAR-SINGLE-IMG',
    productName: 'Single Image Saree',
    name: 'Single Image Saree',
    category: 'Silk Sarees',
    fabric: 'Silk',
    colour: 'Green',
    price: 15000,
    stock: 5,
    stockQty: 5,
    stockStatus: 'in_stock',
    status: 'Active',
    featured: false,
    newArrival: false,
    bestseller: false,
    slug: 'single-image-saree-test-sar-single-img',
    mainImage: imgA,
    galleryImages: [imgA],
    images: [imgA],
    sizeType: 'Standard Saree (5.5m)',
    shippingInfo: 'Free shipping',
    returnInfo: 'Easy return',
    rating: 4.8,
    reviewCount: 5,
    currency: 'INR',
    published: true,
    sortOrder: 2,
    sku: 'SKU-SINGLE-IMG',
    tags: ['Silk']
  };

  const parsedSingle = repo.sanitizeProduct(testSingleImgProduct);
  assert(
    parsedSingle !== null &&
    parsedSingle.galleryImages.length === 1 &&
    parsedSingle.mainImage === imgA &&
    parsedSingle.image2 === undefined &&
    parsedSingle.image3 === undefined &&
    parsedSingle.image4 === undefined,
    'TEST F: Product with only main image has a 1-item gallery without empty placeholder slots'
  );

  // ----------------------------------------------------
  // TEST G — EXISTING PRODUCT SAFETY
  // ----------------------------------------------------
  console.log('\n--- TEST G: EXISTING PRODUCT SAFETY DURING GENERAL UPDATES ---');
  const generalUpdate = {
    ...testProductA,
    productName: 'Updated Silk Saree Name',
    price: 26500,
    stock: 12
  };
  await repo.saveOrUpdateProduct(generalUpdate);
  const afterGeneralUpdate = await repo.getAdminProductById('TEST-SAR-REG-A');
  assert(
    afterGeneralUpdate !== null &&
    afterGeneralUpdate.productName === 'Updated Silk Saree Name' &&
    afterGeneralUpdate.price === 26500 &&
    afterGeneralUpdate.stock === 12 &&
    afterGeneralUpdate.image2 === imgB &&
    afterGeneralUpdate.image3 === imgC &&
    afterGeneralUpdate.image4 === imgD,
    'TEST G: Name, price, stock updates preserve all gallery image URLs intact'
  );

  // ----------------------------------------------------
  // TEST H — SECURITY (PRIVATE FIELD STRIPPING)
  // ----------------------------------------------------
  console.log('\n--- TEST H: SECURITY / SOURCING FIELD PROTECTION ---');
  const publicExposedCheck = repo.sanitizeProduct(afterGeneralUpdate);
  assert(
    publicExposedCheck !== null &&
    (publicExposedCheck as any).meeshoReferenceLink === undefined &&
    (publicExposedCheck as any).sourceCost === undefined &&
    (publicExposedCheck as any).sourceStatus === undefined &&
    (publicExposedCheck as any).supplierReference === undefined &&
    (publicExposedCheck as any).lastSourceCheck === undefined,
    'TEST H: Public API strictly strips all internal Meesho and supplier sourcing data'
  );

  console.log('\n========================================================');
  console.log(`REGRESSION RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================\n');
}

runRegressionSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
