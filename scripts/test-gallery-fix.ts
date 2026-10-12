import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGalleryFix() {
  const { repository } = await import('../src/lib/api/googleSheetsRepository');
  console.log('Testing Product Gallery Fix...');

  // 1. Test getProducts()
  const products = await repository.getProducts();
  console.log(`Fetched ${products.length} public products:`, products.map(p => p.productId));

  const sar44 = products.find((p) => p.productId.toLowerCase() === 'sar-mv44ponj');
  if (!sar44) {
    console.error('FAIL: SAR-MV44PONJ not found in public products!');
    process.exit(1);
  }

  console.log('SAR-MV44PONJ found:');
  console.log('Main Image:', sar44.mainImage);
  console.log('Image 2:', (sar44 as any).image2);
  console.log('Image 3:', (sar44 as any).image3);
  console.log('Image 4:', (sar44 as any).image4);
  console.log('Gallery Images Count:', sar44.galleryImages?.length);
  console.log('Gallery Images:', sar44.galleryImages);

  if (!sar44.galleryImages || sar44.galleryImages.length < 3) {
    console.error('FAIL: Expected at least 3 gallery images for SAR-MV44PONJ, got', sar44.galleryImages?.length);
    process.exit(1);
  }

  // 2. Test getProductBySlug
  const bySlug = await repository.getProductBySlug(sar44.slug);
  if (!bySlug) {
    console.error('FAIL: getProductBySlug failed for', sar44.slug);
    process.exit(1);
  }

  console.log('Product by slug gallery count:', bySlug.galleryImages?.length);
  if (!bySlug.galleryImages || bySlug.galleryImages.length < 3) {
    console.error('FAIL: bySlug galleryImages count < 3');
    process.exit(1);
  }

  // 3. Test applyClientOverrides
  const overridden = repository.applyClientOverrides([sar44])[0];
  console.log('Overridden gallery count:', overridden.galleryImages?.length);
  if (!overridden.galleryImages || overridden.galleryImages.length < 3) {
    console.error('FAIL: applyClientOverrides dropped images');
    process.exit(1);
  }

  console.log('ALL GALLERY TESTS PASSED SUCCESSFULLY! ✅');
}

testGalleryFix().catch((e) => {
  console.error('Unhandled test error:', e);
  process.exit(1);
});
