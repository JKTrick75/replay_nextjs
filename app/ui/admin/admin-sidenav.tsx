'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Package, ShoppingCart, BarChart3, LogOut, Home, Shield } from 'lucide-react';
import { logout } from '@/app/lib/actions'; 

const links = [
  { name: 'Resumen', href: '/admin', icon: BarChart3 },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
];

export default function AdminSideNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      
      <div className="mb-2 flex h-20 items-end justify-start rounded-xl p-4 md:h-40 cursor-default shadow-md transition-colors duration-300 bg-neutral-500 dark:bg-neutral-700 text-white">
        <div className="w-full">
           <div className="flex items-center gap-2 font-bold text-2xl">
             <Shield className="w-6 h-6" />
             Admin
           </div>
           <p className="text-xs text-gray-200 mt-1">Panel de control</p>
        </div>
      </div>
      
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex h-12 grow items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3
                ${isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-primary'
                }
              `}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
        
        {/* Espaciador */}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-transparent md:block"></div>

        <form action={async () => {
            await logout();
        }}>
          <button className="flex h-12 w-full grow items-center justify-center gap-2 rounded-xl bg-white dark:bg-neutral-800 p-3 text-sm font-medium text-primary hover:bg-red-50 dark:hover:bg-primary-hover/20 md:flex-none md:justify-start md:p-2 md:px-3 transition-colors border border-gray-200 dark:border-neutral-700">
            <LogOut className="w-6" />
            <div className="hidden md:block">Cerrar Sesión</div>
          </button>
        </form>
      </div>
    </div>
  );
}