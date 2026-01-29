import { prisma } from '@/app/lib/db'; 
import { Listing as IListing, Console as IConsole } from '@/app/lib/definitions'; 
import GameCard from '@/app/ui/game-card';
import ShopFilters from '@/app/ui/shop/filters';
import Pagination from '@/app/ui/pagination';
import Link from 'next/link';
import MapLoader from '@/app/ui/shop/map-loader';
import { auth } from '@/auth'; // 👈 IMPORTANTE

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  // 1. OBTENER SESIÓN Y FAVORITOS (NUEVO)
  const session = await auth();
  const userEmail = session?.user?.email;
  let favoriteIds: string[] = []; // Lista de IDs que le gustan al usuario

  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { favorites: true } // Traemos los favoritos
    });
    if (user) {
      favoriteIds = user.favorites.map(fav => fav.listingId);
    }
  }

  // 2. Obtener parámetros de la URL
  const query = searchParams.query?.toString().toLowerCase() || '';
  const platformFilter = searchParams.platform?.toString() || '';
  const conditionFilter = searchParams.condition?.toString() || '';
  const genreFilter = searchParams.genre?.toString() || '';
  const sortFilter = searchParams.sort?.toString() || '';
  const currentPage = Number(searchParams.page) || 1;
  const ITEMS_PER_PAGE = 6; 

  // 3. Traer datos de la Base de Datos
  const [listingsRaw, platformsRaw] = await Promise.all([
    prisma.listing.findMany({
      where: { 
        status: 'active' 
      },
      include: {
        game: true,     
        platform: true, 
        seller: true    
      }
    }),
    prisma.console.findMany({
      orderBy: { name: 'asc' } 
    })
  ]);

  const allListings = listingsRaw as unknown as IListing[];
  const platforms = platformsRaw as unknown as IConsole[];

  // 4. Lógica de Filtrado
  let filteredListings = allListings.filter((ad) => {
    const matchesSearch = ad.game?.title.toLowerCase().includes(query) ?? false;
    
    const matchesPlatform = platformFilter 
      ? ad.platform?.shortName?.toLowerCase().includes(platformFilter.toLowerCase()) 
      : true;

    const matchesCondition = conditionFilter ? ad.condition === conditionFilter : true;

    const matchesGenre = genreFilter 
      ? ad.game?.genre?.toLowerCase().includes(genreFilter.toLowerCase()) 
      : true;

    return matchesSearch && matchesPlatform && matchesCondition && matchesGenre;
  });

  // 5. Lógica de Ordenación
  if (sortFilter === 'asc') {
    filteredListings.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'desc') {
    filteredListings.sort((a, b) => b.price - a.price);
  } else {
    filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 6. Lógica de Paginación
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-white-off dark:bg-neutral-800 transition-colors duration-300">
      
      {/* --- COLUMNA IZQUIERDA: LISTA --- */}
      <div className="w-full lg:w-3/5 p-4 sm:p-6 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-6">
            Catálogo ({filteredListings.length})
          </h1>

          <ShopFilters platforms={platforms} />

          {paginatedListings.length === 0 ? (
            <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No hay juegos con estos filtros.</p>
              <Link href="/tienda" className="text-primary mt-2 inline-block hover:underline">
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paginatedListings.map((ad) => (
                <div key={ad.id} className="h-full">
                   {/* 👇 AQUÍ PASAMOS LAS PROPS QUE FALTABAN */}
                   <GameCard 
                      ad={ad} 
                      isLoggedIn={!!userEmail}
                      initialIsFavorite={favoriteIds.includes(ad.id)}
                   />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: MAPA --- */}
      <div className="hidden lg:block w-2/5 sticky top-16 h-[calc(100vh-64px)] bg-gray-200 dark:bg-neutral-900 border-l border-gray-light dark:border-neutral-800 z-0">
         <MapLoader listings={paginatedListings} /> 
      </div>
    </div>
  );
}