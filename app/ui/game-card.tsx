import Link from 'next/link';
import { Listing } from '@/app/lib/definitions';
import { Tag } from 'lucide-react';

export default function GameCard({ ad }: { ad: Listing }) {
  
  // LÓGICA DE NOVEDAD:
  const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const isNew = new Date(ad.createdAt).getTime() > threeDaysAgo;

  return (
    <Link 
      href={`/tienda/${ad._id}`} 
      className="group bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-gray-light dark:border-neutral-700 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative"
    >
      {/* --- ETIQUETA DE "NUEVO" (Arriba Izquierda) --- */}
      {isNew && (
        <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-pulse">
          ¡NUEVO!
        </span>
      )}

      {/* Imagen */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 animate-pulse" />
        <img
          src={ad.game.coverImage || '/placeholder.png'}
          alt={ad.game.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* --- ETIQUETA DE PLATAFORMA (Arriba Derecha - RECUPERADA) --- */}
        <span className="absolute top-2 right-2 z-10 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            {ad.platform.shortName}
        </span>

        {/* Badge de Condición (Abajo derecha) */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10">
          {ad.condition}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col grow">
        <div className="flex justify-between items-start gap-2 mb-2">
           <div>
              {/* Hemos quitado el texto de la plataforma de aquí porque ya está en la foto */}
              <h3 className="font-bold text-lg text-dark dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {ad.game.title}
              </h3>
           </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-light dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
             <Tag size={14} />
             <span>{ad.game.genre}</span>
          </div>
          <span className="text-xl font-bold text-dark dark:text-white">
            {ad.price} €
          </span>
        </div>
      </div>
    </Link>
  );
}