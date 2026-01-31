'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Heart, 
  Settings, 
  LogOut
} from 'lucide-react';
import { logout } from '@/app/lib/actions';
import { confirmAction, showToast } from '@/app/lib/swal';

const links = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mis Productos', href: '/dashboard/ventas', icon: Package },
  { name: 'Mis Compras', href: '/dashboard/compras', icon: ShoppingBag },
  { name: 'Favoritos', href: '/dashboard/favoritos', icon: Heart },
  { name: 'Perfil', href: '/dashboard/perfil', icon: Settings },
];

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const confirm = await confirmAction(
      '¿Cerrar sesión?',
      'Volverás a la página de inicio.',
      'Sí, salir'
    );

    if (confirm.isConfirmed) {
      await logout();
      
      // 1. Mostramos Toast
      showToast('info', 'Has cerrado sesión', '¡Hasta pronto!');
      
      // 2. Redirigimos YA (sin esperar)
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
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

        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-transparent md:block"></div>

        <button
          onClick={handleLogout}
          className="flex h-12 w-full grow items-center justify-center gap-2 rounded-xl bg-white dark:bg-neutral-800 p-3 text-sm font-medium text-primary hover:bg-red-50 dark:hover:bg-primary-hover/20 md:flex-none md:justify-start md:p-2 md:px-3 transition-colors border border-gray-200 dark:border-neutral-700"
        >
          <LogOut className="w-6" />
          <div className="hidden md:block">Cerrar Sesión</div>
        </button>
      </div>
    </div>
  );
}