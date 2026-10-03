import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.GOOGLE_SHEETS_API_URL || process.env.NEXT_PUBLIC_CATALOG_API_URL || '';
  const adminToken = process.env.GOOGLE_SHEETS_ADMIN_TOKEN || '';

  const diag: any = {
    appsScriptConfigured: Boolean(apiUrl),
    appsScriptUrl: apiUrl ? `${apiUrl.substring(0, 45)}...` : 'NOT_CONFIGURED',
    writeEndpointConfigured: Boolean(adminToken),
    appsScriptReachable: false,
    productsEndpointWorking: false,
    productCount: 0,
    sar003Found: false,
    sar003Price: null,
    timestamp: new Date().toISOString()
  };

  if (apiUrl) {
    try {
      const healthRes = await fetch(`${apiUrl}?action=health`, { cache: 'no-store' });
      if (healthRes.ok) {
        diag.appsScriptReachable = true;
      }
    } catch (e: any) {
      diag.healthError = e.message;
    }

    try {
      const prodRes = await fetch(`${apiUrl}?action=getProducts&refresh=true`, { cache: 'no-store' });
      if (prodRes.ok) {
        const text = await prodRes.text();
        if (text && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          const prods = json.products || json.data || [];
          diag.productsEndpointWorking = true;
          diag.productCount = prods.length;

          const sar003 = prods.find((p: any) => String(p.productId || p.id).toUpperCase() === 'SAR-003');
          if (sar003) {
            diag.sar003Found = true;
            diag.sar003Price = sar003.price;
          }
        }
      }
    } catch (e: any) {
      diag.productsError = e.message;
    }
  }

  return NextResponse.json(diag);
}
