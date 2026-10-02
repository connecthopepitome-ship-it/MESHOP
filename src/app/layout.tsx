import type { Metadata } from 'next';
import './globals.css';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'SORAYVA | The Modern Saree House',
  description:
    'Discover handloom Kanjeevarams, Banarasi Katan silks, and romantic tissue organzas meticulously woven for celebrations of rare distinction.',
  keywords: ['sorayva', 'saree', 'kanjeevaram silk', 'banarasi saree', 'organza saree', 'bridal saree', 'handloom saree', 'the modern saree house'],
  authors: [{ name: 'SORAYVA Luxury Textiles' }],
  openGraph: {
    title: 'SORAYVA | The Modern Saree House',
    description: 'Timeless drapes. Modern elegance.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'SORAYVA',
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
