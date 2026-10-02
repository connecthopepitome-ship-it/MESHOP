'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product } from '@/types';
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
    <main className="w-full">
      {/* 1. HERO EXPERIENCE: ASYMMETRICAL EDITORIAL SALON SPREAD */}
      <section
        className="relative w-full overflow-hidden min-h-[90vh] lg:min-h-[880px] flex items-center justify-center border-b border-outline-variant/40 py-20 lg:py-24"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCnB9vHgJxa43szzkS7jBzykvoR1YuTQEiLjBpArq71LhEMQHgz1UlryxRlcby6hRuD52dWEWuFvoFFfZJTmS8Cm9wWCF8lwmA2ijttT5tIjox1KeRoZMdiijNRv_ewzR9H0twih3EiJoJem35QC_0V0Vgq865HstugSKja5mSNdwx1bo2BHpIpejZ8blpVz8sKYQs7iqphIX1VKkT0NjpGt8afl-27X63TzskjIzY-JCXjL62BXABR8w")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c0a]/75 via-[#1a120c]/50 to-[#0f0c0a]/90 pointer-events-none"></div>

        {/* Radiant Golden Glow Overlays */}
        <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
          <div
            className="absolute -top-24 -left-20 w-[650px] h-[650px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(238, 190, 135, 0.42) 0%, rgba(200, 155, 103, 0.22) 42%, rgba(200, 155, 103, 0) 72%)',
              filter: 'blur(55px)',
              mixBlendMode: 'screen',
            }}
          ></div>
          <div
            className="absolute top-1/4 right-0 w-[550px] h-[550px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 221, 185, 0.35) 0%, rgba(184, 134, 77, 0.16) 48%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(60px)',
              mixBlendMode: 'screen',
            }}
          ></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative w-full max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full fine-gold-border bg-black/40 backdrop-blur-md font-sans-fashion text-xs tracking-[0.25em] uppercase text-[#ffddb9] font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                  THE FESTIVE COUTURE REPERTOIRE
                </span>
                <div className="h-[1px] w-12 bg-primary-container/70 hidden sm:block"></div>
              </div>

              <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-[4.75rem] text-[#fbf9f5] leading-[1.08] tracking-tight mb-6">
                The Architecture<br />
                of <span className="font-serif-editorial italic font-normal text-[#eebe87]">Nine Yards.</span>
              </h1>

              <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#ede6dc] leading-relaxed mb-5 max-w-xl font-light">
                “Where ancient Kanjeevaram geometry and Banarasi Katan poetry dissolve into fluid modern poise.”
              </p>

              <p className="font-sans-body text-sm md:text-base text-[#d3c4b6] leading-relaxed max-w-xl mb-10 font-light">
                Crafted in limited atelier batches across Varanasi and Kanchipuram. Each weave is a collector’s heirloom composed with certified natural mulberry silk and authentic gold-tested zari threads.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
                <Link
                  className="h-12 px-8 rounded-full bg-primary-container text-[#1b1c1a] font-sans-fashion text-xs font-semibold tracking-[0.2em] uppercase text-center shadow-xl shadow-primary-container/25 hover:bg-[#ffddb9] transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                  href="#collections"
                >
                  <span>EXPLORE THE VINTAGE ARCHIVE</span>
                  <span className="text-sm">→</span>
                </Link>
                <a
                  className="h-12 px-7 rounded-full bg-black/30 backdrop-blur-md fine-gold-border text-[#fbf9f5] font-sans-fashion text-xs font-medium tracking-[0.2em] uppercase text-center hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center"
                  href="#concierge"
                >
                  RESERVE PRIVATE SALON
                </a>
              </div>

              <div className="inline-flex items-center gap-4 p-3 pr-6 rounded-full bg-black/40 backdrop-blur-md fine-gold-border w-fit">
                <div className="w-9 h-9 rounded-full fine-gold-border bg-white/10 flex items-center justify-center text-[#ffddb9] flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <p className="font-sans-fashion text-xs tracking-[0.18em] uppercase text-[#ffddb9] font-medium">
                    100% PURE SILK &amp; REAL ZARI MARK
                  </p>
                  <p className="font-sans-body text-[0.7rem] text-[#d3c4b6] font-light">
                    Handloom Board of India Certified • Hallmarked Silver Weft
                  </p>
                </div>
              </div>
            </div>

            {/* Right Plate Floating Card */}
            <div className="lg:col-span-5 relative flex flex-col gap-6">
              <div className="p-6 sm:p-8 rounded-sm bg-black/45 backdrop-blur-md fine-gold-border shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-container/15 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-4">
                  <span className="font-sans-fashion text-xs tracking-[0.22em] text-[#ffddb9] uppercase font-semibold">
                    PLATE NO. 04 — BANARAS KATAN
                  </span>
                  <span className="font-serif-display text-lg tracking-wider text-[#fbf9f5] font-medium">
                    ₹58,000
                  </span>
                </div>
                <h4 className="font-serif-display text-2xl text-[#fbf9f5] font-medium italic mb-2.5">
                  “The Suryakanti Kadwa Weave”
                </h4>
                <p className="font-sans-body text-xs text-[#d3c4b6] font-light leading-relaxed mb-6">
                  Pure mulberry katan with unpolished antique rose gold zari, requiring 210 continuous artisan hours by 4th-generation guild weavers in Varanasi.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30 text-[#fbf9f5]">
                  <div>
                    <p className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-[#ffddb9]">METALLURGY</p>
                    <p className="font-serif-display text-sm mt-0.5">Hallmarked Gold Zari</p>
                  </div>
                  <div>
                    <p className="font-sans-fashion text-[0.65rem] tracking-[0.2em] uppercase text-[#ffddb9]">WARP COUNT</p>
                    <p className="font-serif-display text-sm mt-0.5">208/2 Mulberry Filature</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 px-6 rounded-sm bg-black/35 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#ffddb9]">history_edu</span>
                  <span className="font-sans-fashion text-xs tracking-[0.16em] uppercase text-[#ede6dc]">Guild Heritage Archive 1924</span>
                </div>
                <a className="font-sans-fashion text-xs tracking-[0.16em] uppercase text-[#ffddb9] hover:underline flex items-center gap-1" href="#the-weaves">
                  View Plate Details ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE TEXTILE & FABRIC REPERTOIRE (FABRIC TAXONOMY DIRECTORY) */}
      <section className="w-full py-20 bg-surface-container-low border-b border-outline-variant/50 relative overflow-hidden" id="fabric-directory">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/60 pb-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold">CHAPTER I • FABRIC TAXONOMY</span>
                <span className="text-primary-container text-xs">✦</span>
                <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-outline">TACTILE DIRECTORY</span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
                The Textile &amp; Fabric Repertoire
              </h2>
            </div>
            <p className="font-serif-editorial italic text-lg sm:text-xl text-on-surface-variant max-w-md mt-4 md:mt-0 font-light leading-relaxed">
              Navigate by handfeel, warp composition, and artisanal drape density across our eight premier handloom textiles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fabric Card 1: Pure Kanjeevaram Silk */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Pure Kanjeevaram Silk Fabric Weave"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1n8q8SoOAITDg1zDJ6LqA13X-M_Waw-ysCzG7XEGR0wCY0uF0bLmRucU9e44LZlhfqMWrBN_NTkhTJExS8Kkm7NiWk7wFfT9dkuYR5jMxM0VCtkpO5QheaPMR8LQqvwZJLV1XSL_ta--z7S-DgN7vfd3Cg79an5SNgzUmdd03p8UaHDsDH43VOTQzD2AzJITe1NJjl0Oe9UqKZ1PJHIs7VtwTCxgBs2ue4CV5fx8KFytrXbIGZTFugg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">100% Certified Mulberry</span>
                  <span className="text-outline">3-Ply Warp</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Pure Kanjeevaram Silk
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Structured Royal Luster
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Heavy lustrous drape with authentic Korvai interlocking borders and certified gold-tested pure zari threads.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">54 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/silk">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 2: Banarasi Katan Silk */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Banarasi Katan Silk Floral Kadwa Weave"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8o51XHjhwR26ti_rUtOm3A-kVXjyfgK-m_fUxwRDxlIuK0pZ3gujo_3MuJy0Gg0Duj_bZ0ph4-qq8r605txPrx1_gjZWxqSaEIurzWFVctkQLDvj9NAE0kYfc_s53EIhUaZV0sJAhjF_C-rmKCWYhZKX2wWVWXwSBZvCHHl3rRsO2Em3h6zrhjOWtBVnnzmz8nd7O6FdsTUaboe3d6OpB9NN504W0bJoK1ejUag5MiD-b12s5T58Wkg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">Pure Mulberry Warp</span>
                  <span className="text-outline">208/2 Filature</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Banarasi Katan Silk
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Supple Sculptural Body
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Fine pure mulberry warp interworked with intricate Kadwa floral jaals and hallmarked unpolished antique zari.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">42 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/banarasi">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 3: Tissue & Organza */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Tissue and Organza Sheer Metallic Saree Fabric"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAosg85qi8nEqHgCeJo1_knxxmEeC6y6jNxlnAYzYx-Bbte_KeLNmnfC4PhNrjZMqbeKjwyqxza7B6MLVHlLG33Gy-0ickXE1cPzTJNgHOus1UNJHiRVX8mmNrHMrd3kFx15-QK2EDk1vIiARCtEUg0G9y_cwdYkrigbHhULnhol2pSy4n1Ozwa2bneuS3SALU3Ho9WwAnKk9_nT_8e8yNFrMY_ipF_1n9FgzGUitNmqS9lONlIoU_-Fw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">40-Denier Organza Silk</span>
                  <span className="text-outline">Rose Gold Weft</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Tissue &amp; Organza
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Featherlight Sheer
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Featherlight translucent weave exuding glass-silk luster and whisper-thin rose-gold and copper metallic sheen.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">36 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/organza">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 4: Chiffon & Georgette */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Pure Silk Chiffon and Georgette Drape"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi7BFG0C7-RGvg9nwsOwcQ5wCsxBUpkAr62GU4jbe1yLA43i5RdSsSD9MD4JbCksYexDkae8vtjW0SPqR2Mdk9QsmfUaF7WdtR4cWovzVXCIAsG1NGXNQsKXuwgvApu3yD4jQy62opUl_0FCm613wRVdrZnGDaa8Pca49jaXUjrZYGJh_ACRo_GlQ4HK_qwP82sn_l9sKasIOPzlwldUoTyH9sQcy8Sqevn31TOjiJdCFiPaqJPdI8qQ"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">High-Twist Silk Crepe</span>
                  <span className="text-outline">French Bouclé</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Chiffon &amp; Georgette
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Fluid Ethereal Fall
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Ethereal fluid fall with airy crimp texture, finished with hand-cut French bullion and delicate gota patti borders.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">28 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/chiffon">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 5: Chanderi Pattu & Silk Cotton */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Chanderi Pattu Fabric"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2HjZ2llx89xjkP9YOE8lVGbYiQpxLEBk4FKiKcmzOgBZGGaytGZes7azj6ydmPu4L3scdwgNRt9-LAsn1c-hhA9XCTdQ4U6ngrvlV9wA5tqM48Bib9yYzGvI0RH5cbv2_MGJHay0FrgUYOiwaj_qs_K5Q0LTv-a72Nbx2PeSdbWGF5Kr0E0QNpmJruWEZiNDmcaqSp0V-vtyGIWPcxeAuYwQMckXP0Io3Ako6prZnhOc-qRxKARDuPQ"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">300-Count Handspun Warp</span>
                  <span className="text-outline">Madhya Pradesh</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Chanderi Pattu &amp; Silk Cotton
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Crisp Translucent Drape
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Featherweight sheer texture with gold booti motifs and natural indigo selvedge borders, woven with handspun cotton warp.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">31 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/chanderi">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 6: Wild Tussar & Muga Silk */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Wild Tussar and Muga Silk Fabric"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiO53-evECL0cYiuy3lKi7x5U0CfCs4PcmCO5lLu7eSrPIKN_KAXz25kBxiLft3wgApSGMWEQauBDX6MChhtwMUQJf8p3MHGc5WbYhWv3WJeQ3ccDO_AUT-Y5ogbJWaLnBxclctSiQvGPO_K98sTALXhsYk7byQu642Mj4yA8oSL6wRr8pnO6P9RA36AKUJaclzmJXzc8WUw-esIKQVKfoiAhRhKRF4BYQKz82Is5mTfoO47lotjZE0g"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">Wild Forest Cocoon Silk</span>
                  <span className="text-outline">Assam Guild</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Wild Tussar &amp; Muga Silk
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Textured Honey Luster
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Textured raw golden honey luster and organic handloom feel that naturally deepens in brilliance with every celebratory wear.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">22 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/tussar">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 7: Handspun Linen & Zari */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Handspun Organic Linen and Zari Saree"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtyevRqW8CYXCsFMejHqN5841J457jKJpRd-qdlsJ0dJuRO2M5KNUCSpocPqGHxCjXWofMIYVmhly7pPEnXhknhOPPBgx1j0LX4czPe8II_f0KWNvUbjwwD9yA3_AbmgPm8Q_nQgUzPXML8ka9bF37g_4-3BE1xV4qb5x-8XV58ZIrTxUuu_tmyOBjAv6onqOa36urSZSmIq3KHYrSSFome2OEWdSZcXb7bDtHL_T5cILXdi_91Fwi_w"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">120-Lea Organic Flax</span>
                  <span className="text-outline">Bengal Loom</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Handspun Linen &amp; Zari
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Breathable Relaxed Drape
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Breathable organic luxury featuring metallic selvedge borders and fluid linen fall, suited for understated day-salon soirees.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">19 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/linen">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Fabric Card 8: Velvet & Brocade */}
            <div className="bg-surface-bright fine-gold-border p-5 group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-container">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-4 bg-surface-container">
                  <Image
                    alt="Royal Silk Velvet and Brocade Heirloom"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4fSjtWwzWCYrcMYjNttmXU6Z8yF6kkjuP5Cn2hIlCZQ9vmoFfAMPdi3_LDoAup5PxDcET3S-5LnL1QuYUSFY2Bnl0NhFTWJiwVh6Qq1Qwb-xzWgOmYgCPdMbs7cliI8QQXFVqCLXGZ0llD-sXUenhlsPssb0uMtmIhX2oi91RnpL9mGHeTTlgatLCCy8dTZOO4bKfkeUisGXJc1io-UHurxTaIDG1S8CA0QB2skyff39MoXvqW1WWTw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <div className="flex items-center justify-between text-xs font-sans-fashion tracking-widest text-primary-container uppercase mb-3">
                  <span className="bg-surface-container px-2 py-0.5 rounded-full fine-gold-border">Silk Velvet &amp; Brocade</span>
                  <span className="text-outline">Heirloom Zardozi</span>
                </div>
                <h3 className="font-serif-display text-xl text-secondary font-normal mb-2 min-h-[3rem] flex items-center group-hover:text-primary transition-colors">
                  Velvet &amp; Brocade
                </h3>
                <div className="inline-block px-2 py-0.5 bg-secondary-container/60 text-secondary font-sans-fashion text-xs tracking-wider uppercase mb-3">
                  Opulent Heavy Bridal Fall
                </div>
                <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                  Opulent heavy bridal drape in deep royal jewel tones, intricately embroidered with dabka, seed pearls, and gilded metallic wire.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="font-sans-fashion text-xs tracking-wider text-secondary font-medium">26 ATELIER WEAVES</span>
                <Link className="font-sans-fashion text-xs text-primary-container group-hover:text-primary flex items-center gap-1 font-medium transition-colors" href="/shop/bridal">
                  <span>Explore Drapes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED WEAVES & CRAFT CATEGORIES (ARCHIVAL DIRECTORY) */}
      <section className="w-full py-20 bg-surface" id="the-weaves">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/60 pb-8 mb-14">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sans-fashion text-[0.6875rem] tracking-[0.3em] uppercase text-primary-container font-semibold">CHAPTER II</span>
                <span className="text-primary-container text-xs">•</span>
                <span className="font-sans-fashion text-[0.6875rem] tracking-[0.3em] uppercase text-outline">ARCHIVAL DIRECTORY</span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
                Curated Silks &amp; Rare Weaves
              </h2>
            </div>
            <p className="font-serif-editorial italic text-lg sm:text-xl text-on-surface-variant max-w-md mt-4 md:mt-0 font-light">
              Every geographic cluster commands its own distinct metallurgy, warp tension, and centuries of dynastic patronage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Spotlight Card: Organza & Tissue (5 Cols) */}
            <div className="lg:col-span-5 bg-surface-bright fine-gold-border p-4 shadow-sm group">
              <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
                <Image
                  alt="Ethereal Tissue Organza Saree"
                  fill
                  unoptimized
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Nb8pdMYotVfupFLSn4WEqi_SKckuqeAkHydx2wZj0zxzOWNdsPZLVWN6qYMMSJlNeKwimrE0UbkByhSXpSiMGPlSX7CxCShkin2C1eKir2u0BbhtudllUMhGP_PgOUU7c7tm_PnI1lVqf7F4-a2nvTqcVv1bPVzGEkEQXgd7W0_3_XRbENPE3zq4NHVYxFuSUTj5VxqJx64ZMbNrY82kQ2AYPSoOAqCjCu8C75QRzJ6R8ZOrOec-MA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 bg-surface-bright/90 backdrop-blur-sm px-3 py-1 text-[0.625rem] font-sans-fashion tracking-[0.2em] text-secondary uppercase fine-gold-border">
                  COUTURE SPOTLIGHT
                </div>
                <div className="absolute bottom-6 inset-x-6 text-white">
                  <span className="font-sans-fashion text-[0.65rem] tracking-[0.25em] uppercase text-primary-fixed block mb-1">
                    VARANASI ATELIER • 48 PIECES
                  </span>
                  <h3 className="font-serif-display text-2xl sm:text-3xl text-white font-normal mb-2">Ethereal Tissue &amp; Organza</h3>
                  <p className="font-sans-body text-xs text-white/80 line-clamp-2 mb-3 font-light">
                    Featherlight raw organza woven with whisper-thin metallic copper and rose-gold zari borders for modern celebratory evenings.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs font-sans-fashion">
                    <span className="tracking-widest">FROM ₹26,500</span>
                    <Link className="text-primary-fixed group-hover:translate-x-1 transition-transform flex items-center gap-1" href="/shop/organza">
                      <span>EXPLORE DRAPE ↗</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Staggered Right Quad Tiles (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Tile 1: Kanjeevaram Silks */}
              <div className="bg-surface-bright fine-gold-border p-4 shadow-sm group flex flex-col justify-between">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container mb-4">
                  <Image
                    alt="Pure Kanjeevaram Silk Saree"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1UYxReYpCzL2ta2vwzBYXkw5TUTcUa2o4iw-1DKRVEaaTvd2ojb0Ywc9UVeJEN7vGwRe2DfpDLuFT3fc3ZH2sd69I6WolMZw0Dz9Myi4R61SpXQWyO_0ddiQux9rejZsiD7tTvz_UlwJRnIla6oGu2A1o7fwdk_3fl4EaXBEDZSUeA-HUVrHO-FxYfdgWlRWudXrx4Vwo2aivWCw4J87dh57Je4JsVzNDw3zY0D4mdI4i0dw8OOKx7U_3kj"
                  />
                  <div className="absolute top-3 right-3 bg-secondary/80 text-white font-sans-fashion text-[0.6rem] px-2.5 py-1 tracking-widest uppercase">
                    HEIRLOOM
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[0.6875rem] font-sans-fashion tracking-widest text-primary-container uppercase mb-1">
                    <span>KANCHIPURAM, TN</span>
                    <span>1200 WARP</span>
                  </div>
                  <h4 className="font-serif-display text-xl text-secondary font-medium mb-1 group-hover:text-primary transition-colors">Kanjeevaram Silks</h4>
                  <p className="font-sans-body text-xs text-on-surface-variant font-light mb-3">Authentic Korvai interlocking borders with pure heavy mulberry zari pallus.</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs font-sans-fashion">
                    <span className="text-secondary font-semibold">FROM ₹38,000</span>
                    <Link className="text-primary hover:underline flex items-center gap-1" href="/shop/silk">
                      <span>Explore Drape ↗</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tile 2: Banarasi Katan */}
              <div className="bg-surface-bright fine-gold-border p-4 shadow-sm group flex flex-col justify-between sm:translate-y-6">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container mb-4">
                  <Image
                    alt="Banarasi Katan Silk Weave"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQZggY1zAngZS4nkr4o-8kKYVfCul6jysYqDuBXCd5GiRivo0Tcbl4FbjmVHsU_qmxyQSavPKqSGyuL9z10rx54oInDXSI03aGzwdS7a3XCa4O6XUl5qqPqnYXlejuxlGWuWwMxW1BvLtvCpfOpnT5PPJks7iLd8P5hkpi5LGLxmmjfSnxI4X4ZZrvqmsROdZf84wB-OQ8jBoPzU-jrtHyc4l50bpN-hNsGLboHMgDzjHKVL1TjnI2fw"
                  />
                  <div className="absolute top-3 right-3 bg-secondary/80 text-white font-sans-fashion text-[0.6rem] px-2.5 py-1 tracking-widest uppercase">
                    KADWA TECHNIQUE
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[0.6875rem] font-sans-fashion tracking-widest text-primary-container uppercase mb-1">
                    <span>VARANASI, UP</span>
                    <span>PURE SILVER WEFT</span>
                  </div>
                  <h4 className="font-serif-display text-xl text-secondary font-medium mb-1 group-hover:text-primary transition-colors">Banarasi Katan Weaves</h4>
                  <p className="font-sans-body text-xs text-on-surface-variant font-light mb-3">Intricate shikargah &amp; jaal motifs crafted by multi-generational guild weavers.</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs font-sans-fashion">
                    <span className="text-secondary font-semibold">FROM ₹32,000</span>
                    <Link className="text-primary hover:underline flex items-center gap-1" href="/shop/banarasi">
                      <span>Explore Drape ↗</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tile 3: Chiffon & Georgette */}
              <div className="bg-surface-bright fine-gold-border p-4 shadow-sm group flex flex-col justify-between">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container mb-4">
                  <Image
                    alt="Pastel Chiffon Saree"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe7tj1LDGUaEdMGjyvotBfzLL-vxPdGzVw4yRRyZCKhcINrCLuXour6fywX7gVtzzeq-Q3NAwROeuNuR-ie-03kGUgf93_Vl-p6TNZA1dV6hignSS-Ik-7yYdkV0I86C_cjoL0rd5W99-uHh6FFH_ZDT2rF03Pz6TjFMF0ksZJR5uCy25kx5o1FWcOReHbmvESSgxFNa3zjEyS9h9x-KZx3cqoUo3P8uYQg5v0e3EWcGW0QTVdZHIhfw"
                  />
                  <div className="absolute top-3 right-3 bg-secondary/80 text-white font-sans-fashion text-[0.6rem] px-2.5 py-1 tracking-widest uppercase">
                    FEATHERWEIGHT
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[0.6875rem] font-sans-fashion tracking-widest text-primary-container uppercase mb-1">
                    <span>JAIPUR ATELIER</span>
                    <span>GOTA PATTI EMBROIDERY</span>
                  </div>
                  <h4 className="font-serif-display text-xl text-secondary font-medium mb-1 group-hover:text-primary transition-colors">Chiffon &amp; Georgette</h4>
                  <p className="font-sans-body text-xs text-on-surface-variant font-light mb-3">Airy fluid drapery highlighted with hand-cut French bullion and metallic ribbon accents.</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs font-sans-fashion">
                    <span className="text-secondary font-semibold">FROM ₹22,000</span>
                    <Link className="text-primary hover:underline flex items-center gap-1" href="/shop/chiffon">
                      <span>Explore Drape ↗</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tile 4: Royal Bridal Trousseau */}
              <div className="bg-surface-bright fine-gold-border p-4 shadow-sm group flex flex-col justify-between sm:translate-y-6">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container mb-4">
                  <Image
                    alt="Bridal Trousseau Ensemble"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByahspuLw0Mjujb8Wa9JK0Og-N7sNjELyNsEaYPl1Agm1LM1AW0cYXF-t3EUG8doDPO-2WSS0glwFOWJAz_AL37--lAClNqVDe5YsbM3_UaK3zSF-C4AZZ0x6FVh55LtducLAV5zr7KBqA0lozP7Sq9OdI_xIXOoikQu3ZBpVtH8bVVSHgCKcsK8iawfuFgk2MXkOtMmKJ_pCCTJ_23w7CQ4KASP6GuYUGhSQweSwKSstUCCu2-zc1Wg"
                  />
                  <div className="absolute top-3 right-3 bg-secondary/80 text-white font-sans-fashion text-[0.6rem] px-2.5 py-1 tracking-widest uppercase">
                    ROYAL ATELIER
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[0.6875rem] font-sans-fashion tracking-widest text-primary-container uppercase mb-1">
                    <span>COUTURE WEDDING</span>
                    <span>HEIRLOOM ZARDOZI</span>
                  </div>
                  <h4 className="font-serif-display text-xl text-secondary font-medium mb-1 group-hover:text-primary transition-colors">The Royal Trousseau</h4>
                  <p className="font-sans-body text-xs text-on-surface-variant font-light mb-3">Opulent scarlet, vermillion and raw gold weaves designed for once-in-a-lifetime heritage moments.</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs font-sans-fashion">
                    <span className="text-secondary font-semibold">FROM ₹65,000</span>
                    <Link className="text-primary hover:underline flex items-center gap-1" href="/shop/bridal">
                      <span>Explore Drape ↗</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE ATELIER CREATIONS (PRODUCT GRID SHOWCASE) */}
      <section className="w-full py-24 bg-surface-container-low border-y border-outline-variant/50" id="collections">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-2">
                CURATED ACQUISITIONS
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-secondary font-normal tracking-tight">
                Signature Atelier Creations
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {[
                { label: 'ALL WEAVES', key: 'all' },
                { label: 'PURE KANJEEVARAM', key: 'kanjeevaram' },
                { label: 'BANARASI KATAN', key: 'banarasi' },
                { label: 'TISSUE ORGANZA', key: 'organza' },
                { label: 'BRIDAL REDS', key: 'bridal' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilter(tab.key)}
                  className={`h-10 px-5 rounded-full font-sans-fashion text-xs tracking-wider uppercase transition-colors inline-flex items-center justify-center ${
                    activeFilter === tab.key
                      ? 'bg-secondary text-white font-medium'
                      : 'bg-surface fine-gold-border text-secondary hover:bg-secondary hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-surface-container animate-pulse fine-gold-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.slice(0, 8).map((prod) => (
                <ProductCard
                  key={prod.productId}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              className="inline-flex items-center gap-2 font-sans-fashion text-xs tracking-[0.2em] text-secondary uppercase pb-1 border-b border-primary-container hover:text-primary transition-all"
              href="/shop"
            >
              <span>VIEW COMPLETE REPERTOIRE ({allProducts.length || '140+'} COUTURE PIECES)</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BESPOKE VIP ATELIER CONCIERGE STRIP */}
      <section className="w-full py-16 bg-surface-container-low border-t border-outline-variant/60" id="concierge">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-sans-fashion text-xs tracking-[0.25em] uppercase text-primary-container font-semibold block mb-1.5">
              ATELIER PRIVILEGES
            </span>
            <h3 className="font-serif-display text-2xl sm:text-3xl text-secondary font-normal">
              The Bespoke Experience
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-sm flex flex-col justify-between">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">video_camera_front</span>
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                1-ON-1 VIRTUAL SALON
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Private 45-minute video draping consultation with our senior sari stylists and draping masters.
              </p>
            </div>

            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-sm flex flex-col justify-between">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">design_services</span>
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                CUSTOM BLOUSE ATELIER
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Complimentary personalized blouse tailoring, neckline customization, and hand-embroidered latkans.
              </p>
            </div>

            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-sm flex flex-col justify-between">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                HEIRLOOM CONCIERGE BOX
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                Acid-free unbleached cotton muslin preservation sleeves, cedarwood tablets, and guild provenance seal.
              </p>
            </div>

            <div className="bg-surface-bright fine-gold-border p-6 text-center group hover:bg-white transition-all shadow-sm flex flex-col justify-between">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
              </div>
              <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.18em] text-secondary uppercase mb-2 min-h-[2.5rem] flex items-center justify-center">
                INSURED GLOBAL DISPATCH
              </h4>
              <p className="font-sans-body text-xs text-on-surface-variant font-light leading-relaxed">
                White-glove courier shipping across USA, UK, UAE, Canada, and Australia with real-time transit insurance.
              </p>
            </div>
          </div>
        </div>
      </section>

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
