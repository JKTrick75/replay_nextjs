import Link from 'next/link';
import { Listing } from '@/app/lib/definitions'; // Importamos tu tipo global

export default function GameCard({ ad }: { ad: Listing }) {
  return (
    <div className="bg-white dark:bg-dark-light rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent dark:border-gray-700 group h-full flex flex-col">
      
      {/* Imagen del Juego */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img 
          src={ad.game.coverImage || '/placeholder.png'} 
          alt={ad.game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Etiqueta de Consola */}
        <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
          {ad.platform.shortName}
        </span>
        
        {/* Etiqueta de Estado (Nuevo/Usado) */}
        <span className="absolute bottom-2 left-2 bg-dark/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
          {ad.condition}
        </span>
      </div>

      {/* Detalles */}
      <div className="p-4 flex flex-col grow bg-white dark:bg-gray-800">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1" title={ad.game.title}>
          {ad.game.title}
        </h2>
        
        {/* Pequeña descripción o género */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">
           {ad.game.genre || 'Aventura'}
        </p>

        <div className="mt-auto flex justify-between items-end">
          <p className="text-2xl font-bold text-primary">{ad.price} €</p>
          
          <Link 
            href={`/tienda/${ad._id}`} 
            className="bg-dark dark:bg-gray-700 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 dark:hover:bg-primary transition-colors font-medium"
          >
            Ver
          </Link>
        </div>
      </div>
    </div>
  );
}