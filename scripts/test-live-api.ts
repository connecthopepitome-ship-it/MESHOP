import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const LIVE_API_URL = process.env.GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/AKfycby5hikFkv1__CQlkwSLoAFhnHM3SGesvHI84uIl9hlExn-6WX7WPVRe0nOD_kjbeoQOtw/exec';
const ADMIN_TOKEN = process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026';

async function testLiveApi() {
  console.log('Testing live Google Apps Script ADMIN endpoint:');
  const url = `${LIVE_API_URL}?action=getAdminProducts&token=${ADMIN_TOKEN}`;
  console.log('Target URL:', url);

  try {
    let res = await fetch(url, { redirect: 'manual' });
    console.log('Initial Status:', res.status);

    if (res.status === 302 || res.status === 301 || res.status === 307) {
      const redirectUrl = res.headers.get('location');
      console.log('Redirecting to:', redirectUrl);
      if (redirectUrl) {
        res = await fetch(redirectUrl);
      }
    }

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
        console.log('\nSample Item Keys:', Object.keys(items[0]));
        console.log('Sample Item Name:', items[0].productName || items[0].name);

        const forbiddenKeys = ['meeshoReferenceLink', 'sourceCost', 'sourceStatus', 'supplierReference', 'lastSourceCheck', 'sourceUrl'];
        const leaked = Object.keys(items[0]).filter((k) => forbiddenKeys.includes(k));
        if (leaked.length > 0) {
          console.error('❌ LEAKED INTERNAL KEYS DETECTED:', leaked);
        } else {
          console.log('🔒 SECURITY VERIFIED: Zero internal keys present!');
        }
      }
    } catch (e) {
      console.log('Response body snippet:', text.substring(0, 300));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLiveApi();
