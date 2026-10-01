import type { Metadata } from 'next';
import './globals.css';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Royal Silks Boutique | Premium Handloom & Designer Sarees',
  description:
    'Curated luxury saree storefront featuring authentic Kanjeevaram pure silk, Banarasi organza, chiffon, and handblock printed heritage drapes.',
  keywords: ['saree', 'kanjeevaram silk', 'banarasi saree', 'organza saree', 'bridal saree', 'handloom saree'],
  authors: [{ name: 'Royal Silks Boutique' }],
  openGraph: {
    title: 'Royal Silks Boutique | Luxury Saree Storefront',
    description: 'Timeless drapes. Modern elegance.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Royal Silks Boutique',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col justify-between bg-brand-base text-brand-charcoal font-sans antialiased">
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
