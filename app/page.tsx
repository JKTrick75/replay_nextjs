import connectDB from '@/app/lib/db';
import { Listing } from '@/app/lib/models';
import { Listing as IListing } from '@/app/lib/definitions'; 
import Hero from '@/app/ui/hero';
import GameCard from '@/app/ui/game-card';

export default async function Home() {
  await connectDB();

  const listingsRaw = await Listing.find({ status: 'active' })
    .populate('game')
    .populate('platform')
    .limit(8) 
    .lean();

  const listings = JSON.parse(JSON.stringify(listingsRaw)) as IListing[];

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white border-l-4 border-primary pl-4">
            Los Juegos más Buscados
          </h2>
          <a href="/tienda" className="text-primary font-medium hover:underline hidden sm:block">
            Ver todo el catálogo &rarr;
          </a>
        </div>
        
        {listings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay anuncios disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((ad) => (
              // 2. USAMOS EL COMPONENTE (Mucho más limpio)
              <GameCard key={ad._id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}