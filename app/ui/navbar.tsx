'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/app/ui/theme-toggle';
import { LogIn, LogOut, LayoutDashboard, ChevronDown, Menu, X, ShoppingCart, Shield, User as UserIcon, MessageCircle } from 'lucide-react';
import { logout } from '@/app/lib/actions';
import { confirmAction, showToast } from '@/app/lib/swal';

type UserProps = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string; 
};

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Tienda', href: '/tienda' },
  { name: 'Vender', href: '/dashboard/ventas/crear' },
];

// 🟢 Añadimos prop unreadCount
export default function Navbar({ 
  user, 
  cartCount = 0, 
  unreadCount = 0 
}: { 
  user?: UserProps, 
  cartCount?: number, 
  unreadCount?: number 
}) {
  const pathname = usePathname();
  const router = useRouter(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const [animateBadge, setAnimateBadge] = useState(false);
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleCartClick = async () => {
    if (user) {
      router.push('/carrito');
    } else {
      const confirm = await confirmAction(
        '¿Quieres iniciar sesión?',
        'Necesitas tu cuenta para ver el carrito.',
        'Sí, ir al login'
      );

      if (confirm.isConfirmed) {
        router.push('/login');
      }
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);

    const confirm = await confirmAction(
      '¿Cerrar sesión?',
      'Volverás a la pantalla de inicio.',
      'Sí, salir'
    );

    if (confirm.isConfirmed) {
      await logout();
      showToast('info', 'Has cerrado sesión', '¡Hasta pronto!');
      router.push('/');
      router.refresh();
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-neutral-800 border-b border-gray-light dark:border-neutral-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold text-primary group-hover:opacity-80 transition-opacity">
              R<span className="text-dark dark:text-white">eplay</span>
            </div> 
          </Link>

          {/* --- MENÚ ESCRITORIO --- */}
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

            <button
              onClick={handleCartClick}
              className="relative text-gray dark:text-gray-light hover:text-primary transition-colors p-1 mr-2 focus:outline-none"
              title="Ver carrito"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-dark transition-transform ${animateBadge ? 'scale-125' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </button>
             
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 dark:hover:bg-neutral-900 p-1 rounded-full transition-colors pr-3 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
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

                {/* --- DROPDOWN ESCRITORIO --- */}
                {isMenuOpen && (
                  <div className="absolute -right-2 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-light dark:border-gray py-2 animate-in fade-in slide-in-from-top-2 z-50 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-light dark:border-gray mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Conectado como</p>
                      <p className="text-sm font-bold text-dark dark:text-white truncate">{user.email}</p>
                    </div>

                    <Link 
                      href={`/seller/${user.id}`} 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <UserIcon size={16} className="text-primary" />
                      Perfil
                    </Link>

                    {/* 🟢 NUEVO: MENSAJES (Con Badge) */}
                    <Link 
                      href="/mensajes" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-primary" />
                        Mensajes
                      </div>
                      {/* Badge Rojo */}
                      {unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-primary" />
                      Mi Panel
                    </Link>

                    {user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Shield size={16} className="text-primary" />
                        Panel Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-red-50 dark:hover:bg-primary-hover/20 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
                
                {isMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
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

          {/* --- BOTÓN MENÚ MÓVIL --- */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={handleCartClick}
              className="relative text-gray dark:text-gray-light hover:text-primary transition-colors p-1 focus:outline-none"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-dark transition-transform ${animateBadge ? 'scale-125' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </button>

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
            
            {/* Enlaces Principales (Home, Tienda...) */}
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

            {/* Panel de Usuario Móvil */}
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
                  href={`/seller/${user.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-dark dark:text-white bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                   <UserIcon size={18} className="text-primary" />
                   Perfil
                </Link>

                {/* 🟢 NUEVO: MENSAJES (Móvil con Badge) */}
                <Link 
                  href="/mensajes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-dark dark:text-white bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                   <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-primary" />
                      Mensajes
                   </div>
                   {unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                   )}
                </Link>

                <Link 
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
                >
                   <LayoutDashboard size={18} /> Mi Panel
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded-lg hover:bg-neutral-700"
                  >
                     <Shield size={18} /> Panel Admin
                  </Link>
                )}

                <button
                   onClick={handleLogout} 
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