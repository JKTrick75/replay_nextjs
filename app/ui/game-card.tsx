import Link from 'next/link';
import { Listing } from '@/app/lib/definitions';

export default function GameCard({ ad }: { ad: Listing }) {
  return (
    <Link href={`/tienda/${ad._id}`} className="block h-full group">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent dark:border-neutral-700 h-full flex flex-col relative">
        
        {/* Imagen del Juego */}
        <div className="relative h-48 bg-gray-200 dark:bg-neutral-700 overflow-hidden">
          <img 
            src={ad.game.coverImage || '/placeholder.png'} 
            alt={ad.game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
            {ad.platform.shortName}
          </span>
          <span className="absolute bottom-2 left-2 bg-dark/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
            {ad.condition}
          </span>
        </div>

        {/* Detalles */}
        <div className="p-4 flex flex-col grow bg-white dark:bg-neutral-900">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1 group-hover:text-primary transition-colors" title={ad.game.title}>
            {ad.game.title}
          </h2>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">
             {ad.game.genre || 'Aventura'}
          </p>

          <div className="mt-auto flex justify-between items-end">
            <p className="text-2xl font-bold text-primary">{ad.price} €</p>
          </div>
        </div>
      </div>
    </Link>
  );
}