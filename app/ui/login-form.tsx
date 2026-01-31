'use client';

import { useActionState, useEffect } from 'react';
import { authenticate } from '@/app/lib/actions';
import { AtSign, Key, LogIn } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(authenticate, undefined);
  const router = useRouter();

  // 👇 LÓGICA DE ALERTAS RÁPIDA
  useEffect(() => {
    // CASO 1: ÉXITO
    if (state?.success) {
      // 1. Lanzamos el Toast (se quedará flotando mientras carga la página)
      showToast('success', '¡Sesión iniciada!', 'Bienvenido de nuevo');
      
      // 2. Redirigimos INMEDIATAMENTE sin esperar
      router.push('/dashboard');
      router.refresh();
    } 
    // CASO 2: ERROR
    else if (state?.message) {
      showToast('error', 'Error de acceso', state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden transition-colors duration-300">
      
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
          ¡Hola de nuevo!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Inicia sesión para gestionar tus juegos.
        </p>
      </div>

      <div className="px-8 pb-8 space-y-5">
        
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
              placeholder="ejemplo@correo.com"
              required
            />
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
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
              placeholder="Introduce tu contraseña"
              required
              minLength={6}
            />
            <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary transition-colors" />
          </div>
        </div>

        {/* Botón */}
        <button
            type="submit" 
            className="w-full bg-primary text-white text-lg font-bold py-3 px-4 rounded-xl hover:bg-primary-hover transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending || state?.success} 
        >
          {isPending || state?.success ? 'Entrando...' : 'Entrar'} 
          {!isPending && !state?.success && <LogIn size={20} />}
        </button>
        
        {/* Footer */}
        <div className="pt-2 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="text-primary font-bold hover:underline transition-colors">
                  Regístrate aquí
              </Link>
            </p>
        </div>
      </div>
    </form>
  );
}