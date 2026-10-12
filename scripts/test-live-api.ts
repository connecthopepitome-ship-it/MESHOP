import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const LIVE_API_URL = process.env.GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/AKfycby5hikFkv1__CQlkwSLoAFhnHM3SGesvHI84uIl9hlExn-6WX7WPVRe0nOD_kjbeoQOtw/exec';
const ADMIN_TOKEN = process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026';

async function testLiveApi() {
  console.log('Testing live Google Apps Script endpoints:');
  const adminUrl = `${LIVE_API_URL}?action=getAdminProducts&token=${ADMIN_TOKEN}`;
  const publicUrl = `${LIVE_API_URL}?action=getProducts`;
  const defaultUrl = `${LIVE_API_URL}`;
  console.log('Admin URL:', adminUrl);
  console.log('Public URL:', publicUrl);

  try {
    console.log('\n>>> TESTING action=test:');
    let res = await fetch(`${LIVE_API_URL}?action=test&token=${ADMIN_TOKEN}`, { redirect: 'follow' });
    console.log('Status:', res.status);
    console.log('testReadWrite Body:', await res.text());

    console.log('\n>>> TESTING action=health:');
    let res2 = await fetch(`${LIVE_API_URL}?action=health&token=${ADMIN_TOKEN}`, { redirect: 'follow' });
    console.log('Status:', res2.status);
    console.log('health Body:', await res2.text());

    const text = await res.text();
    console.log('Response Length:', text.length);

    try {
      const json = JSON.parse(text);
      console.log('\n--- JSON RESPONSE STRUCTURE RECEIVED ---');
      console.log('Success:', json.success);
      if (json.meta) console.log('Meta:', json.meta);

      const items = json.products || json.data || (Array.isArray(json) ? json : []);
      console.log('Items Count:', items.length);

      if (items.length > 0) {
        console.log('\n--- ALL ITEMS FROM GOOGLE SHEETS ---');
        items.forEach((it: any, idx: number) => {
          console.log(`\nProduct [${idx}] ${it.productId} (${it.productName || it.name}):`);
          console.log('All Keys:', Object.keys(it));
          console.log('Images info:', {
            mainImage: it.mainImage,
            image2: it.image2,
            image3: it.image3,
            image4: it.image4,
            galleryImages: it.galleryImages,
            images: it.images,
          });
        });
      }
    } catch (e) {
      console.log('Response body snippet:', text.substring(0, 300));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLiveApi();
