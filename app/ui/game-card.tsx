import Link from 'next/link';
import { Listing } from '@/app/lib/definitions';
import { Tag } from 'lucide-react';
import FavoriteButton from './favorite-button'; // 👇 Importamos el botón

export default function GameCard({ 
  ad, 
  initialIsFavorite = false // Por defecto false si no se pasa
}: { 
  ad: Listing,
  initialIsFavorite?: boolean 
}) {
  
  // LÓGICA DE NOVEDAD:
  const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const isNew = new Date(ad.createdAt).getTime() > threeDaysAgo;

  return (
    <div className="group relative h-full flex flex-col">

      <div className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-gray-light dark:border-neutral-700 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
        
        {/* --- ZONA DE IMAGEN (Con Link) --- */}
        <div className="relative aspect-video overflow-hidden">
            <Link href={`/tienda/${ad.id}`}>
                <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 animate-pulse" />
                <img
                    src={ad.game?.coverImage || '/placeholder.png'}
                    alt={ad.game?.title || 'Juego'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </Link>

            {/* BADGE: NUEVO */}
            {isNew && (
                <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-pulse pointer-events-none">
                ¡NUEVO!
                </span>
            )}
            
            {/* BADGE: PLATAFORMA */}
            <span className="absolute top-2 right-2 z-10 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm pointer-events-none">
                {ad.platform?.shortName || ad.platform?.name}
            </span>

            {/* BADGE: ESTADO (Abajo Derecha) */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10 pointer-events-none">
                {ad.condition}
            </div>

            {/* ❤️ BOTÓN FAVORITO (Abajo Izquierda - DENTRO DE LA FOTO) */}
            <div className="absolute bottom-2 left-2 z-30">
                <FavoriteButton 
                    listingId={ad.id} 
                    initialIsFavorite={initialIsFavorite} 
                />
            </div>
        </div>

        {/* --- CONTENIDO DE TEXTO --- */}
        <div className="p-4 flex flex-col grow">
            <div className="flex justify-between items-start gap-2 mb-2">
                <Link href={`/tienda/${ad.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-bold text-lg text-dark dark:text-white leading-tight line-clamp-2">
                        {ad.game?.title}
                    </h3>
                </Link>
            </div>

            <div className="mt-auto pt-3 border-t border-gray-light dark:border-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <Tag size={14} />
                    <span>{ad.game?.genre || 'N/A'}</span>
                </div>
                <span className="text-xl font-bold text-dark dark:text-white">
                    {ad.price} €
                </span>
            </div>
        </div>

      </div>
    </div>
  );
}