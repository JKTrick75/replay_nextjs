'use client';

import { useActionState } from 'react';
import { register } from '@/app/lib/actions';
import { State } from '@/app/lib/definitions';
import { User, AtSign, Key, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterForm() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden transition-colors duration-300">
      
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
          Únete a Replay
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Crea tu cuenta para empezar a vender y comprar.
        </p>
      </div>

      <div className="px-8 pb-8 space-y-5">
        
        {/* Nombre */}
        <div>
          <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200" htmlFor="name">
            Nombre de usuario
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-900 px-4 py-3 pl-11 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white placeholder:text-gray-400"
              id="name"
              type="text"
              name="name"
              placeholder="Ej: Player_1"
              required
              minLength={2}
            />
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name && state.errors.name.map((error: string) => (
                <p key={error} className="mt-1 text-sm text-red-500 font-medium">{error}</p>
            ))}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200" htmlFor="email">
            Correo electrónico
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-900 px-4 py-3 pl-11 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white placeholder:text-gray-400"
              id="email"
              type="email"
              name="email"
              placeholder="player1@correo.com"
              required
            />
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email && state.errors.email.map((error: string) => (
                <p key={error} className="mt-1 text-sm text-red-500 font-medium">{error}</p>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200" htmlFor="password">
            Contraseña
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-900 px-4 py-3 pl-11 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white placeholder:text-gray-400"
              id="password"
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
            <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
          </div>
          <div id="password-error" aria-live="polite" aria-atomic="true">
            {state.errors?.password && state.errors.password.map((error: string) => (
                <p key={error} className="mt-1 text-sm text-red-500 font-medium">{error}</p>
            ))}
          </div>
        </div>

        {/* Mensaje Global */}
        <div className="flex items-center space-x-2 min-h-5" aria-live="polite" aria-atomic="true">
          {state.message && (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500 font-medium">{state.message}</p>
            </>
          )}
        </div>

        {/* Botón con el COLOR CORRECTO (#ee8b7a) */}
        <button
            type="submit" 
            className="w-full bg-primary text-white text-lg font-bold py-3 px-4 rounded-xl hover:bg-primary-hover transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
        >
          {isPending ? 'Creando...' : 'Crear cuenta'} 
          {!isPending && <ArrowRight size={20} />}
        </button>

        <div className="pt-2 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline transition-colors">
                  Inicia sesión
              </Link>
            </p>
        </div>
      </div>
    </form>
  );
}