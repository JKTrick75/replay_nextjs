'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/lib/actions';

export default function FavoriteButton({ 
  listingId, 
  initialIsFavorite 
}: { 
  listingId: string, 
  initialIsFavorite: boolean 
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar qué animación se ejecuta
  const [animClass, setAnimClass] = useState('');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (isLoading) return;
    
    setIsLoading(true);
    const previousState = isFavorite;
    const newState = !isFavorite;

    // 1. Decidir qué animación lanzar
    if (newState === true) {
      setAnimClass('animate-like-trigger'); // Clase del CSS global
    } else {
      setAnimClass('animate-dislike-trigger'); // Clase del CSS global
    }

    // 2. Limpiar la animación al terminar (para poder repetirla luego)
    setTimeout(() => setAnimClass(''), 600); // 600ms dura la animación más larga

    // 3. Optimistic UI update
    setIsFavorite(newState);

    try {
      await toggleFavorite(listingId);
    } catch (error) {
      setIsFavorite(previousState);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`
        group relative p-3 rounded-xl border-2 transition-colors duration-300 ease-out flex items-center justify-center
        bg-white dark:bg-neutral-900
        
        ${isFavorite 
          ? 'border-primary text-primary' 
          : 'border-gray-light dark:border-neutral-700 text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary'
        }
      `}
      title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart 
        size={20} 
        className={`
          transition-colors duration-300
          ${isFavorite ? "fill-current" : ""} 
          ${animClass} 
        `} 
      />
    </button>
  );
}