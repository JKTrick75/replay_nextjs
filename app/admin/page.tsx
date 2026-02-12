import { prisma } from '@/app/lib/db';
import { Users, ShoppingBag, Package } from 'lucide-react'; // 🟢 Quitamos Euro

export default async function AdminDashboardPage() {
  
  // Consultas globales
  const [userCount, listingCount, openOrdersCount] = await Promise.all([
    // Total Usuarios
    prisma.user.count(),
    
    // Total Artículos (En venta / Activos)
    prisma.listing.count({ where: { status: 'active' } }),
    
    // 🟢 Total Pedidos Abiertos (Vendidos pero NO entregados aún)
    prisma.listing.count({ 
        where: { 
            status: 'sold',
            deliveryStatus: { in: ['pending', 'shipped'] }
        } 
    }),
  ]);

  return (
    <main>
      <h1 className="text-3xl font-bold text-dark dark:text-white mb-8">
        Panel de Administración
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"> {/* 🟢 Cambiado a 3 columnas */}
        
        {/* Card Usuarios */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Usuarios</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{userCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Artículos (Antes "En Venta") */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Artículos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{listingCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Pedidos Abiertos (Antes "Ventas Totales") */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pedidos Abiertos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{openOrdersCount}</h3>
            </div>
          </div>
        </div>

      </div>
      
      <div className="mt-12 p-8 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-700 text-center">
          <p className="text-gray-500">Selecciona una opción del menú lateral para gestionar la plataforma.</p>
      </div>
    </main>
  );
}