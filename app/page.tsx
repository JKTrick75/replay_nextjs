import { prisma } from '@/app/lib/db'; 
import { Listing as IListing } from '@/app/lib/definitions'; 
import Hero from '@/app/ui/hero';
import CategoryGrid from '@/app/ui/home/category-grid';
import GameCard from '@/app/ui/game-card';
import Link from 'next/link';
import { auth } from '@/auth'; 

export default async function Home() {
  
  //1- OBTENER SESIÓN Y FAVORITOS
  const session = await auth();
  const userEmail = session?.user?.email;
  let favoriteIds: string[] = [];

  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { favorites: true }
    });
    if (user) {
      favoriteIds = user.favorites.map(fav => fav.listingId);
    }
  }

  //2- Obtener los últimos 8 anuncios activos
  const listingsRaw = await prisma.listing.findMany({
    where: { 
      status: 'active' 
    },
    include: {
      game: true,     
      platform: true, 
      seller: true    
    },
    orderBy: {
      createdAt: 'desc' 
    },
    take: 8 
  });

  const listings = listingsRaw as unknown as IListing[];

  return (
    <main className="min-h-screen bg-white-off dark:bg-neutral-900 transition-colors duration-300">
      
      {/* HERO */}
      <Hero />

      {/* CATEGORÍAS */}
      <CategoryGrid />

      {/* JUEGOS DESTACADOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white border-l-4 border-primary pl-4">
            Recién llegados
          </h2>
          <Link href="/tienda" className="text-primary font-bold hover:underline hidden sm:block">
            Ver todo el catálogo &rarr;
          </Link>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-neutral-800 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay anuncios disponibles en este momento.
            </p>
            <p className="text-sm text-gray-400 mt-2">¡Sé el primero en vender algo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {listings.map((ad) => (
              <GameCard 
                key={ad.id} 
                ad={ad} 
                isLoggedIn={!!userEmail}
                initialIsFavorite={favoriteIds.includes(ad.id)}
              />
            ))}
          </div>
        )}
        
        {/* Enlace móvil */}
        <div className="mt-12 text-center sm:hidden">
          <Link href="/tienda" className="inline-block bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-primary font-bold py-3 px-8 rounded-full shadow-sm">
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}