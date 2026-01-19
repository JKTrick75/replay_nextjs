'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { createListing } from '@/app/lib/actions';
import { State } from '@/app/lib/definitions';
import Link from 'next/link';
import { Save, Gamepad2, Monitor, DollarSign, Search, Plus } from 'lucide-react';

// Tipos básicos para las props
type SimpleGame = { id: string; title: string; coverImage: string | null };
type SimpleConsole = { id: string; name: string };

export default function CreateListingForm({ 
  games, 
  consoles 
}: { 
  games: SimpleGame[], 
  consoles: SimpleConsole[] 
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createListing, initialState);

  // --- ESTADO PARA EL BUSCADOR DE JUEGOS ---
  const [query, setQuery] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filtramos juegos en tiempo real
  const filteredGames = query === ''
    ? []
    : games.filter((game) =>
        game.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limitamos a 5 resultados para no saturar

  // Cerrar dropdown si clicamos fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Al seleccionar un juego de la lista
  const handleSelectGame = (game: SimpleGame) => {
    setQuery(game.title);
    setSelectedGameId(game.id);
    setIsDropdownOpen(false);
  };

  // Al escribir manualmente
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedGameId(''); // Si escribe, reseteamos el ID (asumimos que puede ser nuevo)
    setIsDropdownOpen(true);
  };

  return (
    <form action={formAction} className="rounded-xl bg-white-off dark:bg-neutral-800 p-6 md:p-8 border border-gray-light dark:border-neutral-700 shadow-sm">
      
      {/* 1. BUSCADOR DE JUEGOS (COMBOBOX) */}
      <div className="mb-6 relative" ref={wrapperRef}>
        <label htmlFor="gameSearch" className="mb-2 block text-sm font-bold text-dark dark:text-white">
          ¿Qué juego vendes?
        </label>
        
        {/* Input Visible (Buscador/Texto Nuevo) */}
        <div className="relative">
          <input
            type="text"
            id="gameSearch"
            name="gameSearch"
            autoComplete="off"
            className="peer block w-full rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white transition-colors"
            placeholder="Escribe el nombre del juego..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray" />
        </div>

        {/* Input Oculto (Para enviar el ID si existe) */}
        <input type="hidden" name="gameId" value={selectedGameId} />

        {/* Dropdown de Sugerencias */}
        {isDropdownOpen && query.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
            {filteredGames.length > 0 ? (
              <ul>
                {filteredGames.map((game) => (
                  <li 
                    key={game.id}
                    onClick={() => handleSelectGame(game)}
                    className="cursor-pointer px-4 py-3 hover:bg-primary/10 transition-colors flex items-center gap-3 border-b border-gray-light dark:border-neutral-800 last:border-0"
                  >
                    <img src={game.coverImage || '/placeholder.png'} alt="" className="w-8 h-8 rounded object-cover bg-gray-200" />
                    <span className="text-sm font-medium text-dark dark:text-white">{game.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray flex items-center gap-2">
                <Plus size={16} className="text-primary" />
                <span>Se creará como <strong>&quot;{query}&quot;</strong></span>
              </div>
            )}
          </div>
        )}

        {state.errors?.newGameTitle && (
          <p className="mt-2 text-sm text-primary font-medium">{state.errors.newGameTitle[0]}</p>
        )}
      </div>

      {/* 2. SELECCIONAR PLATAFORMA (Ahora muestra TODAS) */}
      <div className="mb-6">
        <label htmlFor="platformId" className="mb-2 block text-sm font-bold text-dark dark:text-white">
          Plataforma / Consola
        </label>
        <div className="relative">
          <select
            id="platformId"
            name="platformId"
            className="peer block w-full rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Selecciona la plataforma</option>
            {consoles.map((console) => (
              <option key={console.id} value={console.id}>
                {console.name}
              </option>
            ))}
          </select>
          <Monitor className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray" />
        </div>
        {state.errors?.platformId && <p className="mt-2 text-sm text-primary font-medium">{state.errors.platformId[0]}</p>}
      </div>

      {/* 3. PRECIO Y ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-bold text-dark dark:text-white">
            Precio (€)
          </label>
          <div className="relative">
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="peer block w-full rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white"
            />
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray" />
          </div>
          {state.errors?.price && <p className="mt-2 text-sm text-primary font-medium">{state.errors.price[0]}</p>}
        </div>

        <div>
          <label htmlFor="condition" className="mb-2 block text-sm font-bold text-dark dark:text-white">
            Estado
          </label>
          <select
            id="condition"
            name="condition"
            className="peer block w-full rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Selecciona estado</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Seminuevo">Seminuevo</option>
            <option value="Usado">Usado</option>
          </select>
          {state.errors?.condition && <p className="mt-2 text-sm text-primary font-medium">{state.errors.condition[0]}</p>}
        </div>
      </div>

      {/* 4. DESCRIPCIÓN */}
      <div className="mb-8">
        <label htmlFor="description" className="mb-2 block text-sm font-bold text-dark dark:text-white">
          Descripción (Opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="peer block w-full rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white resize-none"
          placeholder="Ej: Solo cartucho, caja un poco dañada..."
        ></textarea>
      </div>

      {/* MENSAJE GENERAL ERROR */}
      {state.message && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-primary border border-primary/20 rounded-lg text-sm text-center font-medium">
          {state.message}
        </div>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-4 pt-2">
        <Link
          href="/dashboard/ventas"
          className="flex h-11 items-center rounded-lg bg-white-off border border-gray-light px-6 text-sm font-medium text-gray transition-colors hover:bg-gray-light/50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover shadow-md shadow-primary/20"
        >
          <Save size={18} className="mr-2" /> Publicar Anuncio
        </button>
      </div>
    </form>
  );
}