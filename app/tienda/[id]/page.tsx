import { prisma } from '@/app/lib/db';
import { Listing as IListing } from '@/app/lib/definitions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Tag, Monitor, Calendar, Globe, Clock } from 'lucide-react';
import MapLoader from '@/app/ui/shop/map-loader';
import { auth } from '@/auth';
import FavoriteButton from '@/app/ui/favorite-button';

type Params = Promise<{ id: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;

  // 1. Obtener sesión
  const session = await auth();
  
  // 2. Buscar producto
  const listingRaw = await prisma.listing.findUnique({
    where: { id: id },
    include: {
      game: true,
      platform: true,
      seller: true
    }
  });

  if (!listingRaw) {
    notFound(); 
  }

  // 3. Comprobar favorito
  let isFavorite = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      const favoriteRecord = await prisma.favorite.findUnique({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: listingRaw.id,
          },
        },
      });
      isFavorite = !!favoriteRecord;
    }
  }

  const listing = listingRaw as unknown as IListing;
  const listingsArray = [listing];

  // 👇 LÓGICA NUEVA: CALCULAR DÍAS DESDE PUBLICACIÓN
  const now = new Date();
  const created = new Date(listing.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let publishedText = "Hoy";
  if (diffDays === 1) publishedText = "Ayer";
  if (diffDays > 1) publishedText = `Hace ${diffDays} días`;


  return (
    <div className="min-h-screen bg-white-off dark:bg-neutral-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/tienda" className="inline-flex items-center text-gray dark:text-gray-400 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver a la tienda
        </Link>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* COLUMNA IZQUIERDA: IMAGEN */}
            <div className="relative h-96 md:h-auto bg-gray-200 dark:bg-gray-700">
              <img 
                src={listing.game?.coverImage || '/placeholder.png'} 
                alt={listing.game?.title || 'Juego'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {listing.condition}
                </span>
              </div>
            </div>

            {/* COLUMNA DERECHA: INFO */}
            <div className="p-8 md:p-12 flex flex-col">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-bold uppercase text-sm tracking-wide">
                    {listing.platform?.name}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-dark dark:text-white mb-2">
                  {listing.game?.title}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-8 border-b border-gray-light dark:border-gray-700">
                <div className="text-4xl font-bold text-primary">
                  {listing.price} €
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button className="flex-1 sm:flex-none bg-dark dark:bg-white text-white dark:text-dark px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <ShoppingCart size={20} />
                    Añadir
                  </button>
                  
                  <FavoriteButton 
                    listingId={listing.id} 
                    initialIsFavorite={isFavorite} 
                  />
                </div>
              </div>

              {/* GRID DE DETALLES (AQUÍ AÑADIMOS EL NUEVO) */}
               <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 text-sm">
                
                {/* 1. Género */}
                <div className="flex items-start gap-3">
                  <Tag className="text-primary mt-1" size={18} />
                  <div>
                    <p className="font-bold text-dark dark:text-white">Género</p>
                    <p className="text-gray dark:text-gray-400">{listing.game?.genre || 'N/A'}</p>
                  </div>
                </div>

                {/* 2. Plataforma */}
                <div className="flex items-start gap-3">
                  <Monitor className="text-primary mt-1" size={18} />
                  <div>
                    <p className="font-bold text-dark dark:text-white">Plataforma</p>
                    <p className="text-gray dark:text-gray-400">{listing.platform?.name}</p>
                  </div>
                </div>

                {/* 3. Lanzamiento Juego */}
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1" size={18} />
                  <div>
                    <p className="font-bold text-dark dark:text-white">Lanzamiento</p>
                    <p className="text-gray dark:text-gray-400">{listing.game?.releaseYear || 'Desconocido'}</p>
                  </div>
                </div>

                {/* 4. Región */}
                <div className="flex items-start gap-3">
                  <Globe className="text-primary mt-1" size={18} />
                  <div>
                    <p className="font-bold text-dark dark:text-white">Región</p>
                    <p className="text-gray dark:text-gray-400">PAL / España</p>
                  </div>
                </div>

                {/* 👇 5. NUEVO: PUBLICADO HACE... */}
                <div className="flex items-start gap-3 col-span-2 sm:col-span-1">
                  <Clock className="text-primary mt-1" size={18} />
                  <div>
                    <p className="font-bold text-dark dark:text-white">Publicado</p>
                    <p className="text-gray dark:text-gray-400">{publishedText}</p>
                  </div>
                </div>

              </div>

              <div className="mb-8">
                <h3 className="font-bold text-lg text-dark dark:text-white mb-2">Descripción del vendedor</h3>
                <p className="text-gray dark:text-gray-300 leading-relaxed">
                  {listing.description || `Vendo ${listing.game?.title} en estado ${listing.condition}. Funciona perfectamente.`}
                </p>
              </div>

              <div className="mb-8 pt-6 border-t border-gray-light dark:border-gray-700 flex items-center gap-4">
                <img 
                  src={listing.seller?.image || `https://ui-avatars.com/api/?name=${listing.seller?.name}`} 
                  alt={listing.seller?.name || 'Vendedor'}
                  className="w-12 h-12 rounded-full border border-gray-200"
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Vendido por</p>
                  <p className="font-bold text-dark dark:text-white">{listing.seller?.name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-dark dark:text-white flex items-center gap-2">
                  📍 Ubicación del producto
                </h3>
                <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 shadow-inner bg-gray-100 dark:bg-neutral-900 relative z-0">
                   <MapLoader listings={listingsArray} />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Ubicación aproximada por seguridad.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}