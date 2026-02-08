'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/lib/actions';
import { useRouter } from 'next/navigation'; // 👇 Importamos el router

export default function FavoriteButton({ 
  listingId, 
  initialIsFavorite,
  isLoggedIn // 👇 NUEVA PROP: Nos dice si el usuario está logueado
}: { 
  listingId: string, 
  initialIsFavorite: boolean,
  isLoggedIn: boolean 
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [animClass, setAnimClass] = useState('');
  
  const router = useRouter(); // Hook para redirigir

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    // 🛑 VALIDACIÓN DE SESIÓN
    // Si no está logueado, le mandamos al login y NO hacemos nada más
    if (!isLoggedIn) {
      router.push('/login'); 
      return; 
    }

    if (isLoading) return;
    
    setIsLoading(true);
    const previousState = isFavorite;
    const newState = !isFavorite;

    // 1. Animación (Solo si hay sesión)
    if (newState === true) {
      setAnimClass('animate-like-trigger'); 
    } else {
      setAnimClass('animate-dislike-trigger'); 
    }

    setTimeout(() => setAnimClass(''), 600); 

    // 2. Optimistic UI update
    setIsFavorite(newState);

    try {
      await toggleFavorite(listingId);
    } catch (error) {
      setIsFavorite(previousState); // Revertimos si falla
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
      // Cambiamos el título según si está logueado
      title={!isLoggedIn ? "Inicia sesión para guardar" : (isFavorite ? "Quitar de favoritos" : "Añadir a favoritos")}
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