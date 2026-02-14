import { prisma } from '@/app/lib/db'; 
import { Listing as IListing, Console as IConsole } from '@/app/lib/definitions'; 
import GameCard from '@/app/ui/game-card';
import ShopFilters from '@/app/ui/shop/filters';
import Pagination from '@/app/ui/pagination';
import Link from 'next/link';
import MapLoader from '@/app/ui/shop/map-loader';
import { auth } from '@/auth'; 

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

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

  const query = searchParams.query?.toString().toLowerCase() || '';
  const platformFilter = searchParams.platform?.toString() || '';
  const conditionFilter = searchParams.condition?.toString() || '';
  const genreFilter = searchParams.genre?.toString() || '';
  const sortFilter = searchParams.sort?.toString() || '';
  const currentPage = Number(searchParams.page) || 1;
  const ITEMS_PER_PAGE = 6; 

  const [listingsRaw, platformsRaw] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'active' },
      include: { game: true, platform: true, seller: true }
    }),
    prisma.console.findMany({ orderBy: { name: 'asc' } })
  ]);

  const allListings = listingsRaw as unknown as IListing[];
  const platforms = platformsRaw as unknown as IConsole[];

  let filteredListings = allListings.filter((ad) => {
    const matchesSearch = ad.game?.title.toLowerCase().includes(query) ?? false;
    const matchesPlatform = platformFilter ? ad.platform?.shortName?.toLowerCase().includes(platformFilter.toLowerCase()) : true;
    const matchesCondition = conditionFilter ? ad.condition === conditionFilter : true;
    const matchesGenre = genreFilter ? ad.game?.genre?.toLowerCase().includes(genreFilter.toLowerCase()) : true;
    return matchesSearch && matchesPlatform && matchesCondition && matchesGenre;
  });

  if (sortFilter === 'asc') {
    filteredListings.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'desc') {
    filteredListings.sort((a, b) => b.price - a.price);
  } else {
    filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    // 🟢 CAMBIO: Fondo neutral-900 (El intermedio perfecto)
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-neutral-900 transition-colors duration-300">
      
      {/* --- COLUMNA IZQUIERDA: LISTA --- */}
      <div className="w-full lg:w-3/5 p-4 sm:p-6 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
             <h1 className="text-3xl font-bold text-dark dark:text-white">
                Catálogo <span className="text-gray-400 text-lg font-normal ml-2">({filteredListings.length})</span>
             </h1>
          </div>

          <ShopFilters platforms={platforms} />

          {paginatedListings.length === 0 ? (
            // 🟢 CAMBIO: Fondo neutral-800 para destacar sobre el 900
            <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No hay juegos con estos filtros.</p>
              <Link href="/tienda" className="text-primary mt-2 inline-block hover:underline">
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paginatedListings.map((ad) => (
                <div key={ad.id} className="h-full">
                   <GameCard 
                      ad={ad} 
                      isLoggedIn={!!userEmail}
                      initialIsFavorite={favoriteIds.includes(ad.id)}
                   />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-10 pb-6">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: MAPA --- */}
      {/* 🟢 CAMBIO: Fondo neutral-900 para continuidad visual */}
      <div className="hidden lg:block w-2/5 sticky top-16 h-[calc(100vh-64px)] bg-gray-200 dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 z-0">
         <MapLoader listings={paginatedListings} /> 
      </div>
    </div>
  );
}