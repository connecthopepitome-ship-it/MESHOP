'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/lib/services/AuthService';
import { Package, Heart, MapPin, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Customer } from '@/types/customer';

const NO_AUTH_ROUTES = [
  '/account/login',
  '/account/signup',
  '/account/verify',
  '/account/forgot-password'
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthRoute = NO_AUTH_ROUTES.some(r => pathname.includes(r));

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      const user = await AuthService.getCurrentUser();
      setCustomer(user);
      setIsLoading(false);

      if (!user && !isAuthRoute) {
        router.push('/account/login');
      } else if (user && isAuthRoute) {
        router.push('/account');
      }
    }
    checkAuth();
  }, [pathname, router, isAuthRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-ivory flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If it's an auth route (login/signup), just render children without sidebar
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Otherwise render the authenticated Account Shell
  return (
    <div className="w-full bg-warm-ivory min-h-screen pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-sans-fashion tracking-widest text-deep-espresso/50 mb-8 uppercase">
          <Link href="/" className="hover:text-terracotta transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/account" className="hover:text-terracotta transition-colors">ACCOUNT</Link>
          {pathname !== '/account' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-deep-espresso">
                {pathname.split('/').pop()?.replace('-', ' ')}
              </span>
            </>
          )}
        </div>

        {/* Mobile Header Greeting */}
        <div className="sm:hidden mb-6">
          <h1 className="font-serif-display text-3xl text-deep-espresso">Hello, {customer?.name?.split(' ')[0]}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:flex w-64 flex-col gap-2 flex-shrink-0">
            <h2 className="font-sans-fashion text-xs font-bold tracking-[0.2em] text-terracotta uppercase mb-4 px-3">
              MY ACCOUNT
            </h2>
            <nav className="flex flex-col gap-1">
              <NavItem href="/account" icon={Package} label="Overview" isActive={pathname === '/account'} />
              <NavItem href="/account/orders" icon={Package} label="Orders" isActive={pathname.includes('/account/orders')} />
              <NavItem href="/account/wishlist" icon={Heart} label="Wishlist" isActive={pathname === '/account/wishlist'} />
              <NavItem href="/account/addresses" icon={MapPin} label="Addresses" isActive={pathname === '/account/addresses'} />
              <NavItem href="/account/profile" icon={User} label="Profile" isActive={pathname === '/account/profile'} />
              <NavItem href="/account/settings" icon={Settings} label="Settings" isActive={pathname === '/account/settings'} />
            </nav>
            <div className="mt-8 px-3">
              <button 
                onClick={async () => {
                  await AuthService.logout();
                  router.push('/account/login');
                }}
                className="flex items-center gap-3 text-sm font-sans-body text-deep-espresso/60 hover:text-terracotta transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Mobile Navigation (Stacked cards above content if on overview) */}
          {pathname === '/account' && (
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-8">
              <MobileNavCard href="/account/orders" icon={Package} label="Orders" />
              <MobileNavCard href="/account/wishlist" icon={Heart} label="Wishlist" />
              <MobileNavCard href="/account/addresses" icon={MapPin} label="Addresses" />
              <MobileNavCard href="/account/profile" icon={User} label="Profile" />
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-full overflow-hidden">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans-body transition-all relative ${
        isActive 
          ? 'bg-terracotta/10 text-deep-espresso font-medium' 
          : 'text-deep-espresso/70 hover:bg-black/5 hover:text-deep-espresso'
      }`}
    >
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-terracotta rounded-r-full" />}
      <Icon className={`w-4 h-4 ${isActive ? 'text-terracotta' : 'text-deep-espresso/50'}`} />
      {label}
    </Link>
  );
}

function MobileNavCard({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link 
      href={href}
      className="sorayva-glass-card rounded-xl p-4 flex flex-col gap-3 active:scale-95 transition-transform"
    >
      <div className="w-8 h-8 rounded-full bg-champagne/30 flex items-center justify-center">
        <Icon className="w-4 h-4 text-deep-espresso" />
      </div>
      <span className="font-sans-body text-sm text-deep-espresso">{label}</span>
    </Link>
  );
}
