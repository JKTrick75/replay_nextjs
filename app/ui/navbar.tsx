'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/app/ui/theme-toggle';
import { LogIn, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'; // Iconos necesarios
import { logout } from '@/app/lib/actions'; // Importamos la acción de salir

// Tipo para el usuario que recibimos del layout
type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Tienda', href: '/tienda' },
  { name: 'Vender', href: '/vender' },
];

// Recibimos 'user' como prop
export default function Navbar({ user }: { user?: UserProps }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white dark:bg-dark border-b border-gray-light dark:border-gray sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold text-primary group-hover:opacity-80 transition-opacity">
              R<span className="text-dark dark:text-white">eplay</span>
            </div> 
          </Link>

          {/* ENLACES Y ACCIONES */}
          <div className="hidden md:flex items-center space-x-6 font-medium">
            
            {/* Links de Navegación */}
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href}
                  className={`transition-colors ${
                    isActive 
                      ? 'text-primary border-b-2 border-primary pb-0.5' 
                      : 'text-gray dark:text-gray-light hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
             
            <ThemeToggle />

            {/* --- LÓGICA DE USUARIO --- */}
            {user ? (
              // CASO 1: USUARIO LOGUEADO (Avatar + Dropdown)
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 dark:hover:bg-neutral-800 p-1 rounded-full transition-colors pr-3 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
                >
                  <img 
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-neutral-700"
                  />
                  <span className="text-sm font-bold text-dark dark:text-white max-w-25 truncate hidden lg:block">
                    {user.name}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-light dark:border-gray py-2 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Header del Menu */}
                    <div className="px-4 py-3 border-b border-gray-light dark:border-gray mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Conectado como</p>
                      <p className="text-sm font-bold text-dark dark:text-white truncate">{user.email}</p>
                    </div>

                    {/* Opciones */}
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-primary" />
                      Mi Panel
                    </Link>

                    <button
                      onClick={async () => {
                         await logout();
                         setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-red-50 dark:hover:bg-primary-hover/20 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
                
                {/* Backdrop invisible para cerrar al hacer click fuera */}
                {isMenuOpen && (
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                )}
              </div>

            ) : (
              // CASO 2: USUARIO NO LOGUEADO (Botón Login)
              <Link 
                href="/login" 
                className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-2xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}