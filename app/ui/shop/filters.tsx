'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Console } from '@/app/lib/definitions';

export default function ShopFilters({ platforms }: { platforms: Console[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Lista de géneros consistente con el Home
  const genres = [
    'Acción', 'Aventura', 'RPG', 'Shooter', 'Deportes', 'Carreras', 
    'Lucha', 'Estrategia', 'Plataformas', 'Terror', 'Simulación', 
    'Puzzle', 'Musical', 'Varios'
  ];

  // 👇 AÑADIDO: 'genre' al tipo de filtro
  const handleFilterChange = (term: string, type: 'query' | 'platform' | 'condition' | 'sort' | 'genre') => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set(type, term);
    } else {
      params.delete(type);
    }
    
    // Al filtrar, siempre volvemos a la página 1
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-gray-light dark:border-neutral-700 mb-6 space-y-4">
      
      {/* Fila 1: Buscador de Texto */}
      <div className="relative">
        <input
          className="w-full pl-10 pr-4 py-2 border border-gray-light dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          placeholder="Buscar juego..."
          defaultValue={searchParams.get('query')?.toString()}
          onChange={(e) => handleFilterChange(e.target.value, 'query')}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {/* Fila 2: Selectores */}
      <div className="flex flex-wrap gap-4">
        
        {/* Filtro Consola */}
        <select
          className="flex-1 min-w-35 p-2 border border-gray-light dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-primary outline-none"
          onChange={(e) => handleFilterChange(e.target.value, 'platform')}
          defaultValue={searchParams.get('platform')?.toString()}
        >
          <option value="">Todas las Consolas</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.shortName || p.name}>
              {p.name}
            </option>
          ))}
        </select>

        {/* 👇 NUEVO: Filtro Género */}
        <select
          className="flex-1 min-w-35 p-2 border border-gray-light dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-primary outline-none"
          onChange={(e) => handleFilterChange(e.target.value, 'genre')}
          defaultValue={searchParams.get('genre')?.toString()}
        >
          <option value="">Todos los Géneros</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        {/* Filtro Condición */}
        <select
          className="flex-1 min-w-35 p-2 border border-gray-light dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-primary outline-none"
          onChange={(e) => handleFilterChange(e.target.value, 'condition')}
          defaultValue={searchParams.get('condition')?.toString()}
        >
          <option value="">Cualquier estado</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Seminuevo">Seminuevo</option>
          <option value="Usado">Usado</option>
        </select>

        {/* Ordenar por Precio */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={18} className="text-gray-400 hidden sm:block" />
            <select
              className="w-full sm:w-auto p-2 border border-gray-light dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-primary outline-none"
              onChange={(e) => handleFilterChange(e.target.value, 'sort')}
              defaultValue={searchParams.get('sort')?.toString()}
            >
              <option value="">Relevancia</option>
              <option value="asc">Precio: Menor a Mayor</option>
              <option value="desc">Precio: Mayor a Menor</option>
            </select>
        </div>
      </div>
    </div>
  );
}