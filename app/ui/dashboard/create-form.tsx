'use client';

import { useActionState, useState } from 'react';
import { Game, Console } from '@/app/lib/definitions';
import Link from 'next/link';
import { Save, Gamepad2, Monitor, DollarSign } from 'lucide-react';
import { createListing } from '@/app/lib/actions';
import { State } from '@/app/lib/definitions';

// Extendemos la interfaz para incluir la relación 'platforms'
interface GameWithPlatforms extends Game {
  platforms: Console[];
}

export default function CreateListingForm({ games }: { games: GameWithPlatforms[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createListing, initialState);

  // Estado para controlar qué juego se ha seleccionado
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  
  // Buscamos el juego completo para saber qué plataformas permite
  const selectedGame = games.find((g) => g.id === selectedGameId);
  const availablePlatforms = selectedGame ? selectedGame.platforms : [];

  return (
    <form action={formAction} className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-6 border border-gray-100 dark:border-neutral-700">
      
      {/* 1. SELECCIONAR JUEGO */}
      <div className="mb-6">
        <label htmlFor="gameId" className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Juego
        </label>
        <div className="relative">
          <select
            id="gameId"
            name="gameId"
            className="peer block w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-2 placeholder:text-gray-500 text-dark dark:text-white"
            defaultValue=""
            onChange={(e) => setSelectedGameId(e.target.value)}
          >
            <option value="" disabled>Selecciona un título</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>{game.title}</option>
            ))}
          </select>
          <Gamepad2 className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500" />
        </div>
        {state.errors?.gameId && <p className="mt-2 text-sm text-red-500">{state.errors.gameId[0]}</p>}
      </div>

      {/* 2. PLATAFORMA (Filtrada dinámicamente) */}
      <div className="mb-6">
        <label htmlFor="platformId" className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Plataforma
        </label>
        <div className="relative">
          <select
            id="platformId"
            name="platformId"
            className="peer block w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-2 placeholder:text-gray-500 text-dark dark:text-white disabled:opacity-50"
            defaultValue=""
            disabled={!selectedGameId}
          >
            <option value="" disabled>
              {!selectedGameId ? 'Elige un juego primero' : 'Selecciona versión'}
            </option>
            {availablePlatforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Monitor className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500" />
        </div>
        {state.errors?.platformId && <p className="mt-2 text-sm text-red-500">{state.errors.platformId[0]}</p>}
      </div>

      {/* 3. PRECIO Y ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-dark dark:text-white">Precio (€)</label>
          <div className="relative">
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="peer block w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-2 placeholder:text-gray-500 text-dark dark:text-white"
            />
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.price && <p className="mt-2 text-sm text-red-500">{state.errors.price[0]}</p>}
        </div>

        <div>
          <label htmlFor="condition" className="mb-2 block text-sm font-medium text-dark dark:text-white">Estado</label>
          <select
            id="condition"
            name="condition"
            className="peer block w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-4 text-sm outline-2 placeholder:text-gray-500 text-dark dark:text-white"
            defaultValue=""
          >
            <option value="" disabled>Selecciona estado</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Seminuevo">Seminuevo</option>
            <option value="Usado">Usado</option>
          </select>
          {state.errors?.condition && <p className="mt-2 text-sm text-red-500">{state.errors.condition[0]}</p>}
        </div>
      </div>

      {/* 4. DESCRIPCIÓN */}
      <div className="mb-8">
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-dark dark:text-white">Descripción</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="peer block w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-2 px-3 text-sm outline-2 placeholder:text-gray-500 text-dark dark:text-white resize-none"
        ></textarea>
      </div>

      {state.message && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
          {state.message}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Link
          href="/dashboard/ventas"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Save size={18} className="mr-2" /> Publicar Anuncio
        </button>
      </div>
    </form>
  );
}