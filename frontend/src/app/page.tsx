'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 animate-pulse"></div>
        <p className="text-white/50 text-sm font-medium animate-pulse">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
