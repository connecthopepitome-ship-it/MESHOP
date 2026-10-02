'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/catalog/ProductCard';
import { QuickViewModal } from '@/components/shared/QuickViewModal';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await repository.getProducts({});
        setAllProducts(prods);
        setFilteredProducts(prods);
      } catch (e) {
        console.error('Failed to load homepage products:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFilter = (filterKey: string) => {
    setActiveFilter(filterKey);
    if (filterKey === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(
        allProducts.filter(
          (p) =>
            p.category?.toLowerCase().includes(filterKey) ||
            p.tags?.some((t) => t.toLowerCase().includes(filterKey)) ||
            p.fabric?.toLowerCase().includes(filterKey)
        )
      );
    }
  };

  return (
    <main className="w-full bg-surface">
      <div className="flex flex-col w-full">
        {/* 1. HERO BANNER SECTION */}
        <section className="relative w-full min-h-[82vh] lg:min-h-[88vh] flex items-center overflow-hidden bg-surface">
          {/* Cinematic Visual Background with Atmospheric Scrim */}
          <div className="absolute inset-0 z-0">
            <Image
              alt="Sorayva Autumn Heritage 2026 Collection"
              fill
              priority
              unoptimized
              className="w-full h-full object-cover object-top filter brightness-[0.96] contrast-[1.02]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl1D7FkDn2nacnNMlh7_vbfY6PoghKNIDjZ9znUYuyk7S8FM9P4NYpn_VLPKVa1zG2eJxY0j1OQSScmWjx46Fa2ZhXARG8fhVTOLcJMLXlvLqTPRx1EaJvgp7MuIz70f2SXf-1hIit1hFjFJrdxcZ34sGQul5jKIh-OMeYrl6GCGtmL9d7AviaiEeAF0DwOLzvbExMvFh8IndhUiNiKHGMwYcPSUaC10ywKIQwDYCcZ86ya80VF1yRIA"
            />
            {/* Smokey Champagne/Taupe Editorial Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-transparent w-full md:w-3/4 lg:w-3/5"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent h-48 bottom-0"></div>
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 w-full px-margin md:px-margin-tablet xl:px-margin-desktop py-space-3xl">
            <div className="max-w-2xl">
              {/* Eyebrow Badge & Line */}
              <div className="flex items-center gap-space-md mb-space-md">
                <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-container tracking-[0.28em] uppercase font-semibold">
                  AUTUMN HERITAGE '26
                </span>
                <div className="h-[1px] w-16 bg-primary-container/60"></div>
              </div>

              {/* Headline */}
              <h1 className="font-display-hero text-[3.25rem] lg:text-display-hero text-secondary font-normal tracking-tight leading-[1.08] mb-space-lg">
                Timeless Drapes.<br />
                <span className="italic font-light">Modern Elegance.</span>
              </h1>

              {/* Subheadline */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl font-light mb-space-2xl leading-relaxed">
                Discover handloom Kanjeevarams, Banarasi Katan silks, and romantic tissue organzas meticulously woven for celebrations of rare distinction.
              </p>

              {/* CTA Button Pair */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
                <Link
                  className="px-space-xl py-4 bg-primary-container text-on-primary font-label-uppercase text-label-uppercase tracking-[0.18em] text-center transition-all duration-300 hover:bg-primary shadow-lg shadow-primary-container/20 hover:shadow-primary/30"
                  href="/shop"
                >
                  EXPLORE THE COLLECTION
                </Link>
                <button
                  onClick={() => setSizeModalOpen(true)}
                  className="px-space-xl py-4 bg-transparent text-secondary border border-secondary font-label-uppercase text-label-uppercase tracking-[0.18em] text-center transition-all duration-300 hover:bg-secondary hover:text-on-secondary"
                >
                  BOOK ATELIER CONSULTATION
                </button>
              </div>

              {/* Micro Authenticity Note */}
              <div className="mt-space-2xl flex items-center gap-space-sm text-on-surface-variant/80">
                <span className="material-symbols-outlined text-[18px] text-primary-container">verified</span>
                <span className="font-label-numeric text-[0.75rem] tracking-wider uppercase">
                  CERTIFIED PURE ZARI &amp; NATURAL SILK MARK VERIFIED
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. VALUE PROPOSITION STRIP */}
        <section className="w-full bg-surface-container-lowest border-y border-outline-variant py-space-2xl">
          <div className="w-full px-margin md:px-margin-tablet xl:px-margin-desktop">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
              {/* Pillar 1 */}
              <div className="flex items-start gap-space-md group">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-container text-primary-container transition-colors duration-300 group-hover:bg-primary-container group-hover:text-on-primary">
                  <svg className="w-6 h-6 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 3v18m0-18l7 4v10l-7 4m0-18l-7 4v10l7 4m0-14l7 4m-7 0L5 7m7 4v10m-7-6l14-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-label-uppercase text-label-uppercase text-secondary tracking-[0.16em] mb-1 font-semibold">100% SILK MARK</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Certified handloom purity, authentic natural dyes &amp; heirloom provenance.</p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex items-start gap-space-md group">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-container text-primary-container transition-colors duration-300 group-hover:bg-primary-container group-hover:text-on-primary">
                  <svg className="w-6 h-6 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-label-uppercase text-label-uppercase text-secondary tracking-[0.16em] mb-1 font-semibold">EXPRESS WORLDWIDE</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Insured door-to-door white glove delivery across 45+ international hubs.</p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex items-start gap-space-md group">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-container text-primary-container transition-colors duration-300 group-hover:bg-primary-container group-hover:text-on-primary">
                  <svg className="w-6 h-6 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-label-uppercase text-label-uppercase text-secondary tracking-[0.16em] mb-1 font-semibold">7-DAY RETURNS</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Seamless luxury exchange guarantee with complimentary home pickup.</p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="flex items-start gap-space-md group">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-container text-primary-container transition-colors duration-300 group-hover:bg-primary-container group-hover:text-on-primary">
                  <svg className="w-6 h-6 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-label-uppercase text-label-uppercase text-secondary tracking-[0.16em] mb-1 font-semibold">STYLIST CONCIERGE</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Personalized 1-on-1 virtual styling and custom blouse tailoring atelier.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CURATED CATEGORIES SECTION */}
        <section className="w-full py-space-3xl bg-surface">
          <div className="w-full px-margin md:px-margin-tablet xl:px-margin-desktop">
            {/* Section Header with Metallic Line */}
            <div className="max-w-xl mx-auto text-center mb-space-3xl">
              <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-container uppercase tracking-[0.26em] block mb-space-xs font-semibold">
                EXPLORE BY SILK WEAVE &amp; OCCASION
              </span>
              <h2 className="font-headline-lg text-headline-lg text-secondary font-normal tracking-tight mb-space-md">
                Curated Categories
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 bg-primary-container/40"></div>
                <span className="text-primary-container text-xs">✦</span>
                <div className="h-[1px] w-12 bg-primary-container/40"></div>
              </div>
            </div>

            {/* 3x2 Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-desktop">
              {/* Category Card 1: Kanjeevaram Silks */}
              <Link
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-container-high transition-shadow duration-500 hover:shadow-xl"
                href="/shop/silk"
              >
                <img
                  alt="Pure Kanjeevaram Silk Saree folds"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4I8ErZWBWkjSos4fl6pIXHy1LdQ-Mthiw2DhyeraF9i-7iKtHrmGiGMslhQpUuc9Hf3TJi7TGGOpi9EHSCPW9-FuBWXKvxKKtn-a0EE_6EHlUVIOZY937dnZvsKLv8MDpBXI2qYpVggUU8vdGeOiKYnlHLmx3gUjh2aDOPHRe1UxVaQHAHtA_B8ZlIxipLQr7AUQr0RLGjHiULWQ9FagigzMvdL28BW-5SnBjIfCF14YxjjoTa79VPQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-space-lg flex flex-col justify-end">
                  <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-fixed uppercase tracking-[0.2em] mb-1">
                    42 Pieces • Mulberry Silk
                  </span>
                  <div className="flex items-end justify-between">
                    <h3 className="font-headline-md text-headline-md text-on-primary font-normal group-hover:text-primary-fixed transition-colors">
                      Kanjeevaram Silks
                    </h3>
                    <span className="text-on-primary group-hover:translate-x-1 transition-transform duration-300 font-label-uppercase text-xs flex items-center gap-1">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Category Card 2: Organza & Tissue */}
              <Link
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-container-high transition-shadow duration-500 hover:shadow-xl"
                href="/shop/organza"
              >
                <img
                  alt="Editorial tissue organza saree"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHQprwbfWUnUGVC80XCnL-4oKR3FXvO606KzuLq2l1zrANQnuVhMaTu-o8_wKzGEbHL6cvpBAFhXWxFGja0DUYMbnTfwwDZWpGMutabeOu-io5-X5s2__WayICUNqPLGNNUKncD6cuFQhS1TRmn9UvdfNhNnzmB71vYXR8tP3rsbhKbYEmWHaKgFpv7-fJM2gWv5mYR2f8dIdDmI_TRFhHTKq9Hc4F_DYKBwAB38LZnd2P8VGOaJ2-6g"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-space-lg flex flex-col justify-end">
                  <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-fixed uppercase tracking-[0.2em] mb-1">
                    36 Pieces • Ethereal Drape
                  </span>
                  <div className="flex items-end justify-between">
                    <h3 className="font-headline-md text-headline-md text-on-primary font-normal group-hover:text-primary-fixed transition-colors">
                      Organza &amp; Tissue
                    </h3>
                    <span className="text-on-primary group-hover:translate-x-1 transition-transform duration-300 font-label-uppercase text-xs flex items-center gap-1">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Category Card 3: Heirloom Banarasi */}
              <Link
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-container-high transition-shadow duration-500 hover:shadow-xl"
                href="/shop/banarasi"
              >
                <img
                  alt="Banarasi Katan silk saree"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQZggY1zAngZS4nkr4o-8kKYVfCul6jysYqDuBXCd5GiRivo0Tcbl4FbjmVHsU_qmxyQSavPKqSGyuL9z10rx54oInDXSI03aGzwdS7a3XCa4O6XUl5qqPqnYXlejuxlGWuWwMxW1BvLtvCpfOpnT5PPJks7iLd8P5hkpi5LGLxmmjfSnxI4X4ZZrvqmsROdZf84wB-OQ8jBoPzU-jrtHyc4l50bpN-hNsGLboHMgDzjHKVL1TjnI2fw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-space-lg flex flex-col justify-end">
                  <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-fixed uppercase tracking-[0.2em] mb-1">
                    58 Pieces • Katan Weave
                  </span>
                  <div className="flex items-end justify-between">
                    <h3 className="font-headline-md text-headline-md text-on-primary font-normal group-hover:text-primary-fixed transition-colors">
                      Heirloom Banarasi
                    </h3>
                    <span className="text-on-primary group-hover:translate-x-1 transition-transform duration-300 font-label-uppercase text-xs flex items-center gap-1">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Category Card 4: Chiffon & Georgette */}
              <Link
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-container-high transition-shadow duration-500 hover:shadow-xl"
                href="/shop/chiffon"
              >
                <img
                  alt="Flowing chiffon and georgette saree"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe7tj1LDGUaEdMGjyvotBfzLL-vxPdGzVw4yRRyZCKhcINrCLuXour6fywX7gVtzzeq-Q3NAwROeuNuR-ie-03kGUgf93_Vl-p6TNZA1dV6hignSS-Ik-7yYdkV0I86C_cjoL0rd5W99-uHh6FFH_ZDT2rF03Pz6TjFMF0ksZJR5uCy25kx5o1FWcOReHbmvESSgxFNa3zjEyS9h9x-KZx3cqoUo3P8uYQg5v0e3EWcGW0QTVdZHIhfw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-space-lg flex flex-col justify-end">
                  <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-fixed uppercase tracking-[0.2em] mb-1">
                    28 Pieces • Featherlight
                  </span>
                  <div className="flex items-end justify-between">
                    <h3 className="font-headline-md text-headline-md text-on-primary font-normal group-hover:text-primary-fixed transition-colors">
                      Chiffon &amp; Georgette
                    </h3>
                    <span className="text-on-primary group-hover:translate-x-1 transition-transform duration-300 font-label-uppercase text-xs flex items-center gap-1">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Category Card 5: Festive & Royal Trousseau */}
              <Link
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-container-high transition-shadow duration-500 hover:shadow-xl"
                href="/shop/bridal"
              >
                <img
                  alt="Bridal trousseau saree ensemble"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuByahspuLw0Mjujb8Wa9JK0Og-N7sNjELyNsEaYPl1Agm1LM1AW0cYXF-t3EUG8doDPO-2WSS0glwFOWJAz_AL37--lAClNqVDe5YsbM3_UaK3zSF-C4AZZ0x6FVh55LtducLAV5zr7KBqA0lozP7Sq9OdI_xIXOoikQu3ZBpVtH8bVVSHgCKcsK8iawfuFgk2MXkOtMmKJ_pCCTJ_23w7CQ4KASP6GuYUGhSQweSwKSstUCCu2-zc1Wg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-space-lg flex flex-col justify-end">
                  <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-fixed uppercase tracking-[0.2em] mb-1">
                    49 Pieces • Couture Bridal
                  </span>
                  <div className="flex items-end justify-between">
                    <h3 className="font-headline-md text-headline-md text-on-primary font-normal group-hover:text-primary-fixed transition-colors">
                      Festive &amp; Wedding
                    </h3>
                    <span className="text-on-primary group-hover:translate-x-1 transition-transform duration-300 font-label-uppercase text-xs flex items-center gap-1">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Category Card 6: Block Print & Handloom */}
              <Link
                className="group relative block aspect-[3/4] overflow-hidden bg-surface-container-high transition-shadow duration-500 hover:shadow-xl"
                href="/shop/handloom"
              >
                <img
                  alt="Hand block printed Chanderi silk saree"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNMufP-nOstPZ_fjl0v7Lxw2Q95oSCysEd3X3diHXn4VV6koMRahDPHxCcsIuQLj0YqPASMneRpFsSvRUHW9zrazOexafXvCGL-C_klvY4S9zk9f24hz-TqJJ6MRIExTLQVNePmVhR-PkwLqr7B4MakhCy3qvmGDeTPJRvo-RbSrdxjUG3ZcG83EnEz1jKjR0d2vDKwBn9bFOsFLtSwg23m6GgqQlWhvEZIUtB81XWzI6VvOvR26ZycQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-space-lg flex flex-col justify-end">
                  <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-fixed uppercase tracking-[0.2em] mb-1">
                    31 Pieces • Artisan Guild
                  </span>
                  <div className="flex items-end justify-between">
                    <h3 className="font-headline-md text-headline-md text-on-primary font-normal group-hover:text-primary-fixed transition-colors">
                      Block Print &amp; Craft
                    </h3>
                    <span className="text-on-primary group-hover:translate-x-1 transition-transform duration-300 font-label-uppercase text-xs flex items-center gap-1">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. FEATURED BOUTIQUE CREATIONS (PRODUCT GRID) */}
        <section className="w-full py-space-3xl bg-surface-container-lowest border-t border-outline-variant">
          <div className="w-full px-margin md:px-margin-tablet xl:px-margin-desktop">
            {/* Section Header & Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
              <div>
                <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-container uppercase tracking-[0.24em] block mb-space-xs font-semibold">
                  LIMITED ATELIER RELEASES
                </span>
                <h2 className="font-headline-lg text-headline-lg text-secondary font-normal tracking-tight">
                  Featured Boutique Creations
                </h2>
              </div>

              {/* Filter Tab Buttons */}
              <div className="flex items-center flex-wrap gap-space-xs border-b border-outline-variant pb-1">
                {[
                  { label: 'ALL', key: 'all' },
                  { label: 'BANARASI', key: 'banarasi' },
                  { label: 'KANJEEVARAM', key: 'kanjeevaram' },
                  { label: 'ORGANZA TISSUE', key: 'organza' },
                  { label: 'BRIDAL', key: 'bridal' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleFilter(tab.key)}
                    className={`px-space-md py-2 font-label-uppercase text-label-uppercase transition-colors ${
                      activeFilter === tab.key
                        ? 'text-primary border-b-2 border-primary -mb-[5px] font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-surface-container animate-pulse border border-outline-variant" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
                {filteredProducts.slice(0, 8).map((prod) => (
                  <ProductCard
                    key={prod.productId}
                    product={prod}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Centered Browse Catalog CTA */}
            <div className="mt-space-2xl text-center">
              <Link
                className="inline-flex items-center gap-space-sm font-label-uppercase text-label-uppercase text-secondary border-b border-primary-container pb-1 hover:text-primary transition-colors"
                href="/shop"
              >
                <span>VIEW COMPLETE ARCHIVE ({allProducts.length || '140+'} DESIGNS)</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. EDITORIAL LOOKBOOK / BRAND CRAFT STORY BANNER */}
        <section className="w-full bg-surface-container-low py-space-3xl border-t border-outline-variant">
          <div className="w-full px-margin md:px-margin-tablet xl:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
              {/* Left Imagery Diptych */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-space-md">
                <div className="aspect-[3/4] overflow-hidden bg-surface shadow-sm">
                  <img
                    alt="Indian master weaver at wooden pit loom"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYByQ7sG9KDH5NMqN5XUibQ7dLS6d01dtdRPHUSApgxh86K3i5Ett7nhUAbF-eEoLcLQIOZ2f_3VgLpWkAvx2kJcN2ngpYLahgQckodcPx3dkhgOr0F2bKsxAJUtdLBAJ-XBh0w3avO-5CSXIHmKsLL2e4jwgJQ0tJApSGJO7AloUFWq0ky3fM1fBoDPFoZ56ghDc29w1hqOWiXtwBxI7bhjx6dOdWnr9cxpgzWDVm99rwlkh_ffchmA"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-surface shadow-sm mt-space-xl">
                  <img
                    alt="Gold saree borders along antique stone stairs"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkCWortFi1xWTEFg2L0xWlG-TSPHnTuvKB0x_K78v3u9xtYlR_dwXfZd7PU21a3fWM6pzsurtBQHCq-aZzifis32O6qNOjRTWDJPwyFdXsfAp2b9srQBa4PxVongt8YeYpf0FSqU8wD_nw-gVzr_KQFp_6XPbcAbIsmTELamWtiZJTqJsUpQpz3jtNSwVo3i9FHVygLHCuZArYJSdLSOKcsjjbCYhdKckm8k0CDD2JHXNvFioEWtyQMA"
                  />
                </div>
              </div>

              {/* Right Philosophy Editorial Text */}
              <div className="lg:col-span-6 lg:pl-space-xl flex flex-col justify-center">
                <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary-container uppercase tracking-[0.28em] block mb-space-sm font-semibold">
                  THE ATELIER PHILOSOPHY
                </span>
                <h2 className="font-headline-lg text-headline-lg text-secondary font-normal tracking-tight mb-space-lg leading-[1.12]">
                  Preserving Centuries of Handloom Mastery with Modern Drape Architecture.
                </h2>
                <div className="border-l-2 border-primary-container pl-space-md my-space-md">
                  <p className="font-headline-sm text-headline-sm italic text-secondary font-light mb-2">
                    “A saree is not merely six yards of woven thread; it is living geometry, carrying the prayers, patience, and poetic heritage of Indian artisan guilds.”
                  </p>
                  <span className="font-subhead-eyebrow text-[0.6875rem] text-on-surface-variant uppercase tracking-wider block font-semibold">
                    — Master Weaver R. Sundaram, 4th Generation Kanchipuram Guild
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-xl font-light leading-relaxed">
                  Every Sorayva masterpiece takes upwards of 180 hand-guided loom hours. We practice slow, ethical couture by directly empowering artisan clusters with equitable wages, traceable raw zari, and pure mulberry silks uncompromised by synthetic blends.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-lg">
                  <Link
                    className="px-space-xl py-3.5 bg-secondary text-on-secondary font-label-uppercase text-label-uppercase tracking-[0.18em] transition-colors hover:bg-primary shadow-md inline-block text-center"
                    href="/our-story"
                  >
                    READ OUR CRAFT STORY
                  </Link>
                  <button
                    onClick={() => setSizeModalOpen(true)}
                    className="font-label-uppercase text-label-uppercase text-secondary tracking-[0.16em] hover:text-primary transition-colors flex items-center justify-center gap-1 py-2"
                  >
                    BLOUSE SIZE ASSISTANT →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick View & Size Modals */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenSizeGuide={() => setSizeModalOpen(true)}
      />

      <BlouseSizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
      />
    </main>
  );
}
