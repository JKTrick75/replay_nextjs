'use client';

import dynamic from 'next/dynamic';

const ShopMap = dynamic(() => import('@/app/ui/shop/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-neutral-900 text-gray-400">
      <p>Cargando mapa...</p>
    </div>
  ),
});

export default function MapLoader({ listings }: { listings: any[] }) {
  return <ShopMap listings={listings} />;
}