'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/verify-email');
  }, [router]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
