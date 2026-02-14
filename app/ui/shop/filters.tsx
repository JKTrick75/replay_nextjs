'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Console } from '@/app/lib/definitions';

export default function ShopFilters({ platforms }: { platforms: Console[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const genres = [
    'Acción', 'Aventura', 'RPG', 'Shooter', 'Deportes', 'Carreras', 
    'Lucha', 'Estrategia', 'Plataformas', 'Terror', 'Simulación', 
    'Puzzle', 'Musical', 'Varios'
  ];

  const handleFilterChange = (term: string, type: 'query' | 'platform' | 'condition' | 'sort' | 'genre') => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set(type, term);
    } else {
      params.delete(type);
    }
    
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  // ESTILOS:
  // 1. Label: Pequeño, negrita, mayúsculas, color gris suave.
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1";
  
  // 2. Input/Select: Fondo neutral-900 (hundido sobre la tarjeta 800), texto blanco.
  // Esto crea el contraste "inset" que queda muy pro.
  const inputClass = "w-full p-2.5 pr-10 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400 appearance-none cursor-pointer text-sm font-medium";
  
  // 3. Wrapper
  const fieldWrapperClass = "relative w-full";

  // Flecha personalizada
  const ArrowIcon = () => (
    <ChevronDown 
        size={16} 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
    />
  );

  return (
    // 🟢 CAMBIO: Fondo dark:bg-neutral-800
    // (Más claro que el 950 anterior, y se distingue del fondo 900 de la página)
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 mb-8">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* 1. BUSCADOR */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
           <label className={labelClass}>Búsqueda</label>
           <div className="relative">
             <input
                className={`${inputClass} pl-10 cursor-text`}
                placeholder="Buscar por título..."
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => handleFilterChange(e.target.value, 'query')}
             />
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           </div>
        </div>

        {/* 2. CONSOLA */}
        <div className={fieldWrapperClass}>
            <label className={labelClass}>Consola</label>
            <div className="relative">
                <select
                    className={inputClass}
                    onChange={(e) => handleFilterChange(e.target.value, 'platform')}
                    defaultValue={searchParams.get('platform')?.toString()}
                >
                    <option value="">Todas</option>
                    {platforms.map((p) => (
                        <option key={p.id} value={p.shortName || p.name}>
                        {p.name}
                        </option>
                    ))}
                </select>
                <ArrowIcon />
            </div>
        </div>

        {/* 3. GÉNERO */}
        <div className={fieldWrapperClass}>
            <label className={labelClass}>Género</label>
            <div className="relative">
                <select
                    className={inputClass}
                    onChange={(e) => handleFilterChange(e.target.value, 'genre')}
                    defaultValue={searchParams.get('genre')?.toString()}
                >
                    <option value="">Todos</option>
                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                        {genre}
                        </option>
                    ))}
                </select>
                <ArrowIcon />
            </div>
        </div>

        {/* 4. ESTADO */}
        <div className={fieldWrapperClass}>
            <label className={labelClass}>Estado</label>
            <div className="relative">
                <select
                    className={inputClass}
                    onChange={(e) => handleFilterChange(e.target.value, 'condition')}
                    defaultValue={searchParams.get('condition')?.toString()}
                >
                    <option value="">Cualquiera</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Seminuevo">Seminuevo</option>
                    <option value="Usado">Usado</option>
                </select>
                <ArrowIcon />
            </div>
        </div>

        {/* 5. ORDENAR */}
        <div className={fieldWrapperClass}>
            <label className={labelClass}>Ordenar por</label>
            <div className="relative">
                <select
                    className={inputClass}
                    onChange={(e) => handleFilterChange(e.target.value, 'sort')}
                    defaultValue={searchParams.get('sort')?.toString()}
                >
                    <option value="">Relevancia</option>
                    <option value="asc">Precio: Bajo a Alto</option>
                    <option value="desc">Precio: Alto a Bajo</option>
                </select>
                <SlidersHorizontal size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none hidden sm:block" /> 
                <ArrowIcon />
            </div>
        </div>

      </div>
    </div>
  );
}