'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500"></div>
        <p className="text-sm font-semibold tracking-wide text-zinc-400">Loading Sports Admin...</p>
      </div>
    </div>
  );
}
