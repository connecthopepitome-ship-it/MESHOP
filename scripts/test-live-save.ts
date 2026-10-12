import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const LIVE_API_URL = process.env.GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/AKfycby5hikFkv1__CQlkwSLoAFhnHM3SGesvHI84uIl9hlExn-6WX7WPVRe0nOD_kjbeoQOtw/exec';
const ADMIN_TOKEN = process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026';

async function testLiveSave() {
  console.log('Testing live Google Apps Script POST saveProduct:');
  console.log('Target URL:', LIVE_API_URL);

  const testPayload = {
    action: 'saveProduct',
    adminToken: ADMIN_TOKEN,
    product: {
      productId: 'SAR-MV44PONJ',
      productName: 'Premium Pure Georgette Handwork Saree with Scallop Border & Floral Print',
      name: 'Premium Pure Georgette Handwork Saree with Scallop Border & Floral Print',
      category: 'Georgette Sarees',
      fabric: 'Georgette',
      colour: 'Crimson',
      price: 1149,
      compareAtPrice: 2500,
      stock: 5,
      status: 'Active',
      mainImage: 'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
      'Main Image URL': 'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
      image2: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
      'Image 2 URL': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
      image3: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
      'Image 3 URL': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
      images: [
        'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b'
      ],
      galleryImages: [
        'https://lh3.googleusercontent.com/d/1oS3l1DpzvdO2NVRJ2eTeKmtEw9Iichqu=s1600',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b'
      ]
    }
  };

  try {
    const res = await fetch(LIVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      redirect: 'follow'
    });

    console.log('POST Response status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (e) {
    console.error('POST Error:', e);
  }
}

testLiveSave();
