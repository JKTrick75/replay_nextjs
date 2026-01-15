import connectDB from '@/app/lib/db';
import { Listing } from '@/app/lib/models';
// Importamos la interfaz correcta para TypeScript
import { Listing as IListing } from '@/app/lib/definitions'; 
// Importamos todos los componentes visuales
import Hero from '@/app/ui/hero';
import CategoryGrid from '@/app/ui/home/category-grid';
import GameCard from '@/app/ui/game-card';
import Link from 'next/link';

export default async function Home() {
  // 1. Conexión a Base de Datos
  await connectDB();

  // 2. Obtener los últimos 8 anuncios activos
  const listingsRaw = await Listing.find({ status: 'active' })
    .populate('game')
    .populate('platform')
    .sort({ createdAt: -1 }) // Opcional: Ordenar por más recientes
    .limit(8) 
    .lean();

  // 3. Serializar datos (truco para evitar error de objetos complejos en Next.js)
  const listings = JSON.parse(JSON.stringify(listingsRaw)) as IListing[];

  return (
    <main className="min-h-screen bg-white-off dark:bg-neutral-800 transition-colors duration-300">
      
      {/* 1. SECCIÓN HERO (Portada) */}
      <Hero />

      {/* 2. NUEVA SECCIÓN: CATEGORÍAS (Consolas y Géneros) */}
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
              // Usamos el componente GameCard reutilizable
              <GameCard key={ad._id} ad={ad} />
            ))}
          </div>
        )}
        
        {/* Enlace móvil para ver todo (por si se ocultó el de arriba) */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/tienda" className="text-primary font-medium hover:underline">
            Ver todo el catálogo &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}