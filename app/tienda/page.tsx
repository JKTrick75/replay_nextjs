import connectDB from '@/app/lib/db';
import { Listing, Console } from '@/app/lib/models';
import { Listing as IListing, Console as IConsole } from '@/app/lib/definitions'; 
import GameCard from '@/app/ui/game-card';
import ShopFilters from '@/app/ui/shop/filters';
import Pagination from '@/app/ui/pagination'; // <--- IMPORTAMOS TU NUEVO COMPONENTE
import Link from 'next/link';
import { Map } from 'lucide-react';

// Tipado de searchParams para Next.js 15
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  await connectDB();

  // 1. Obtener parámetros
  const query = searchParams.query?.toString().toLowerCase() || '';
  const platformFilter = searchParams.platform?.toString() || '';
  const conditionFilter = searchParams.condition?.toString() || '';
  const genreFilter = searchParams.genre?.toString() || '';
  const sortFilter = searchParams.sort?.toString() || '';
  const currentPage = Number(searchParams.page) || 1;
  const ITEMS_PER_PAGE = 6; 

  // 2. Traer datos
  const [listingsRaw, platformsRaw] = await Promise.all([
    Listing.find({ status: 'active' }).populate('game').populate('platform').lean(),
    Console.find({}).sort({ name: 1 }).lean()
  ]);

  const allListings = JSON.parse(JSON.stringify(listingsRaw)) as IListing[];
  const platforms = JSON.parse(JSON.stringify(platformsRaw)) as IConsole[];

  // 3. FILTRADO EN MEMORIA ACTUALIZADO
  let filteredListings = allListings.filter((ad) => {
    // Filtro Texto (Título)
    const matchesSearch = ad.game.title.toLowerCase().includes(query);
    
    // Filtro Plataforma (Tu versión flexible mejorada)
    const matchesPlatform = platformFilter 
      ? ad.platform.shortName.toLowerCase().includes(platformFilter.toLowerCase()) 
      : true;

    // Filtro Condición
    const matchesCondition = conditionFilter ? ad.condition === conditionFilter : true;

    // --- NUEVO: Filtro Género ---
    // Verificamos si existe el género en el juego y si coincide con la URL
    const matchesGenre = genreFilter 
      ? ad.game.genre?.toLowerCase().includes(genreFilter.toLowerCase()) 
      : true;

    // AÑADIMOS matchesGenre AL FINAL
    return matchesSearch && matchesPlatform && matchesCondition && matchesGenre;
  });

  // 4. Ordenación
  if (sortFilter === 'asc') filteredListings.sort((a, b) => a.price - b.price);
  if (sortFilter === 'desc') filteredListings.sort((a, b) => b.price - a.price);

  // 5. Paginación
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-white-off dark:bg-neutral-800 transition-colors duration-300">
      
      {/* --- COLUMNA IZQUIERDA: LISTA --- */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto h-full">
        <div className="max-w-3xl mx-auto">
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
                <div key={ad._id} className="h-full">
                   <GameCard ad={ad} />
                </div>
              ))}
            </div>
          )}

          {/* USAMOS EL COMPONENTE DE PAGINACIÓN AQUÍ */}
          <div className="flex justify-center mt-8">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: MAPA PLACEHOLDER --- */}
      <div className="hidden lg:block w-1/2 sticky top-[64px] h-[calc(100vh-64px)] bg-gray-200 dark:bg-neutral-900 border-l border-gray-light dark:border-neutral-800 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <Map size={64} className="mb-4 opacity-50" />
            <p className="text-xl font-bold">Mapa de Vendedores</p>
            <p className="text-sm">Próximamente con Leaflet</p>
        </div>
      </div>
    </div>
  );
}