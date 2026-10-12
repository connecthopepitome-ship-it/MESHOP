import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const LIVE_API_URL = process.env.GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/AKfycby5hikFkv1__CQlkwSLoAFhnHM3SGesvHI84uIl9hlExn-6WX7WPVRe0nOD_kjbeoQOtw/exec';
const ADMIN_TOKEN = process.env.GOOGLE_SHEETS_ADMIN_TOKEN || 'sorayva_admin_secret_key_2026';

async function check() {
  const url = `${LIVE_API_URL}?action=getAdminProducts&token=${ADMIN_TOKEN}`;
  console.log('Fetching:', url);
  const res = await fetch(url, { redirect: 'follow' });
  const data = await res.json();
  const p = (data.products || []).find((x: any) => x.productId === 'SAR-MV44PONJ');
  console.log('Keys for SAR-MV44PONJ:', Object.keys(p || {}));
  console.log('Images for SAR-MV44PONJ:', {
    mainImage: p?.mainImage,
    image2: p?.image2,
    image3: p?.image3,
    image4: p?.image4,
    galleryImages: p?.galleryImages,
    images: p?.images,
  });
}

check();
