import connectDB from '@/app/lib/db';
import { Listing, Console } from '@/app/lib/models';
import { Listing as IListing, Console as IConsole } from '@/app/lib/definitions'; 
import GameCard from '@/app/ui/game-card';
import ShopFilters from '@/app/ui/shop/filters';
import Pagination from '@/app/ui/pagination';
import Link from 'next/link';
// Importamos nuestro Loader de cliente para el mapa
import MapLoader from '@/app/ui/shop/map-loader';

// Tipado de searchParams para Next.js 15
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  await connectDB();

  // 1. Obtener parámetros de la URL
  const query = searchParams.query?.toString().toLowerCase() || '';
  const platformFilter = searchParams.platform?.toString() || '';
  const conditionFilter = searchParams.condition?.toString() || '';
  const genreFilter = searchParams.genre?.toString() || '';
  const sortFilter = searchParams.sort?.toString() || '';
  const currentPage = Number(searchParams.page) || 1;
  const ITEMS_PER_PAGE = 6; 

  // 2. Traer datos de la Base de Datos
  // Nota: Usamos .lean() para que sean objetos JS planos y más rápidos
  const [listingsRaw, platformsRaw] = await Promise.all([
    Listing.find({ status: 'active' }).populate('game').populate('platform').lean(),
    Console.find({}).sort({ name: 1 }).lean()
  ]);

  // Serialización para evitar errores de objetos complejos de Mongoose en Next.js
  const allListings = JSON.parse(JSON.stringify(listingsRaw)) as IListing[];
  const platforms = JSON.parse(JSON.stringify(platformsRaw)) as IConsole[];

  // 3. Lógica de Filtrado (En memoria)
  let filteredListings = allListings.filter((ad) => {
    // Texto
    const matchesSearch = ad.game.title.toLowerCase().includes(query);
    
    // Plataforma (Búsqueda flexible)
    const matchesPlatform = platformFilter 
      ? ad.platform.shortName.toLowerCase().includes(platformFilter.toLowerCase()) 
      : true;

    // Estado
    const matchesCondition = conditionFilter ? ad.condition === conditionFilter : true;

    // Género
    const matchesGenre = genreFilter 
      ? ad.game.genre?.toLowerCase().includes(genreFilter.toLowerCase()) 
      : true;

    return matchesSearch && matchesPlatform && matchesCondition && matchesGenre;
  });

  // 4. Lógica de Ordenación
  if (sortFilter === 'asc') {
    // Precio: Menor a Mayor
    filteredListings.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'desc') {
    // Precio: Mayor a Menor
    filteredListings.sort((a, b) => b.price - a.price);
  } else {
    // POR DEFECTO: Novedades primero (Fecha más reciente arriba)
    // Convertimos la fecha (string) a número (milisegundos) para comparar
    filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 5. Lógica de Paginación
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-white-off dark:bg-neutral-800 transition-colors duration-300">
      
      {/* --- COLUMNA IZQUIERDA: LISTA (60%) --- */}
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
                <div key={ad._id} className="h-full">
                   <GameCard ad={ad} />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: MAPA (40%) --- */}
      <div className="hidden lg:block w-2/5 sticky top-16 h-[calc(100vh-64px)] bg-gray-200 dark:bg-neutral-900 border-l border-gray-light dark:border-neutral-800 z-0">
         <MapLoader listings={paginatedListings} /> 
      </div>
    </div>
  );
}