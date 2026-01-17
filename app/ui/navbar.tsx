'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/app/ui/theme-toggle';
import { LogIn } from 'lucide-react';

// Definimos los enlaces en una lista para no repetir código
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Tienda', href: '/tienda' },
  { name: 'Vender', href: '/vender' },
];

export default function Navbar() {
  const pathname = usePathname();

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

          {/* ENLACES */}
          <div className="hidden md:flex items-center space-x-6 font-medium">
            
            {/* Generamos los enlaces dinámicamente */}
            {navLinks.map((link) => {
              // Comprobamos si el enlace es el activo
              const isActive = pathname === link.href;
              
              return (
                <Link 
                  key={link.name}
                  href={link.href}
                  className={`transition-colors ${
                    isActive 
                      ? 'text-primary border-b-2 border-primary pb-0.5' // Estilo ACTIVO
                      : 'text-gray dark:text-gray-light hover:text-primary' // Estilo INACTIVO
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
             
            {/* TOGGLE */}
            <ThemeToggle />

            {/* Botón Login */}
            <Link 
              href="/login" 
              className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-2xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}