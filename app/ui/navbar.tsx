'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/app/ui/theme-toggle';
// 👇 Añadido ShoppingCart
import { LogIn, LogOut, LayoutDashboard, ChevronDown, Menu, X, ShoppingCart } from 'lucide-react';
import { logout } from '@/app/lib/actions';

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Tienda', href: '/tienda' },
  { name: 'Vender', href: '/dashboard/ventas/crear' },
];

// 👇 Añadimos cartCount a las props
export default function Navbar({ user, cartCount = 0 }: { user?: UserProps, cartCount?: number }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);        // Dropdown escritorio
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Menú móvil

  // Cerrar menús automáticamente al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 👇 ANIMACIÓN DEL BADGE: Efecto "pop" cuando cambia el número
  const [animateBadge, setAnimateBadge] = useState(false);
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

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

          {/* --- MENÚ ESCRITORIO (Hidden en móvil) --- */}
          <div className="hidden md:flex items-center space-x-6 font-medium">
            
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

            {/* 👇 CARRITO DE COMPRA ESCRITORIO */}
            <Link 
              href={user ? "/carrito" : "/login"} 
              className="relative text-gray dark:text-gray-light hover:text-primary transition-colors p-1 mr-2"
              title="Ver carrito"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-dark transition-transform ${animateBadge ? 'scale-125' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </Link>
             
            <ThemeToggle />

            {/* Lógica de Usuario Escritorio */}
            {user ? (
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
                    
                    <div className="px-4 py-3 border-b border-gray-light dark:border-gray mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Conectado como</p>
                      <p className="text-sm font-bold text-dark dark:text-white truncate">{user.email}</p>
                    </div>

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
                
                {isMenuOpen && (
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
                )}
              </div>

            ) : (
              <Link 
                href="/login" 
                className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-2xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* --- BOTÓN MENÚ MÓVIL (Visible solo en móvil) --- */}
          <div className="flex md:hidden items-center gap-4">
            {/* También mostramos el carrito en móvil fuera del menú */}
            <Link 
              href={user ? "/carrito" : "/login"} 
              className="relative text-gray dark:text-gray-light hover:text-primary transition-colors p-1"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-dark transition-transform ${animateBadge ? 'scale-125' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </Link>

            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 dark:text-gray-300 hover:text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* --- DESPLEGABLE MÓVIL --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-light dark:border-gray bg-white dark:bg-dark animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-2">
            
            {navLinks.map((link) => {
               const isActive = pathname === link.href;
               return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
               )
            })}

            <div className="border-t border-gray-light dark:border-gray my-2"></div>

            {user ? (
              <div className="px-3 space-y-3">
                <div className="flex items-center gap-3 py-2">
                   <img 
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-700"
                  />
                  <div>
                    <p className="font-bold text-dark dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <Link 
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
                >
                   <LayoutDashboard size={18} /> Mi Panel
                </Link>

                <button
                   onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                   }}
                   className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-primary bg-red-50 dark:bg-primary-hover/10 rounded-lg hover:bg-red-100 dark:hover:bg-primary-hover/20"
                >
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white bg-primary rounded-lg font-bold hover:bg-primary-hover shadow-md"
              >
                <LogIn size={20} /> Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}