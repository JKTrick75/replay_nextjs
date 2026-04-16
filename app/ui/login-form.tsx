'use client';

import { useActionState, useEffect } from 'react';
import { authenticate } from '@/app/lib/actions';
import { AtSign, Key, LogIn } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; 

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(authenticate, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      showToast('success', '¡Sesión iniciada!', 'Bienvenido de nuevo');
      
      router.push('/dashboard');
      router.refresh();
    } 

    else if (state?.message) {
      showToast('error', 'Error de acceso', state.message);
    }
  }, [state, router]);

  // Función para manejar el clic en el botón de Google
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

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

        {/* Botón Normal */}
        <button
            type="submit" 
            className="w-full bg-primary text-white text-lg font-bold py-3 px-4 rounded-xl hover:bg-primary-hover transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending || state?.success} 
        >
          {isPending || state?.success ? 'Entrando...' : 'Entrar'} 
          {!isPending && !state?.success && <LogIn size={20} />}
        </button>

        {/* --- SEPARADOR VISUAL --- */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-neutral-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-neutral-800 px-3 text-gray-500 font-medium">
              O continúa con
            </span>
          </div>
        </div>

        {/* --- BOTÓN DE GOOGLE --- */}
        <button
          type="button" 
          onClick={handleGoogleLogin}
          disabled={isPending || state?.success}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-4 py-3 text-dark dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
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