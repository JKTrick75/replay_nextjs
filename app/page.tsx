import { prisma } from '@/app/lib/db'; // Importamos Prisma
import { Listing as IListing } from '@/app/lib/definitions'; 
import Hero from '@/app/ui/hero';
import CategoryGrid from '@/app/ui/home/category-grid';
import GameCard from '@/app/ui/game-card';
import Link from 'next/link';

export default async function Home() {
  // 1. Obtener los últimos 8 anuncios activos (VERSIÓN PRISMA)
  const listingsRaw = await prisma.listing.findMany({
    where: { 
      status: 'active' 
    },
    include: {
      game: true,     // .populate('game')
      platform: true, // .populate('platform')
      seller: true    // Necesario para evitar errores de tipo en la interfaz
    },
    orderBy: {
      createdAt: 'desc' // .sort({ createdAt: -1 })
    },
    take: 8 // .limit(8)
  });

  // 2. Adaptar tipos (Prisma devuelve objetos con nulls, forzamos la interfaz)
  const listings = listingsRaw as unknown as IListing[];

  return (
    <main className="min-h-screen bg-white-off dark:bg-neutral-800 transition-colors duration-300">
      
      {/* 1. SECCIÓN HERO (Portada) */}
      <Hero />

      {/* 2. SECCIÓN: CATEGORÍAS */}
      <CategoryGrid />

      {/* 3. SECCIÓN: JUEGOS DESTACADOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white border-l-4 border-primary pl-4">
            Los Juegos más Buscados
          </h2>
          <Link href="/tienda" className="text-primary font-medium hover:underline hidden sm:block">
            Ver todo el catálogo &rarr;
          </Link>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay anuncios disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((ad) => (
              // OJO: Cambiamos _id por id
              <GameCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
        
        {/* Enlace móvil */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/tienda" className="text-primary font-medium hover:underline">
            Ver todo el catálogo &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}