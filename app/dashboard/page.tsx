import { auth } from '@/auth';
import { Package, DollarSign, ShoppingCart, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Panel de Control
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Bienvenido de nuevo, <span className="text-primary font-bold">{user?.name}</span>. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* Grid de Estadísticas (Placeholders) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Ventas Totales */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ganancias</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">0 €</h3>
            </div>
          </div>
        </div>

        {/* Card 2: En Venta */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Venta</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">0 Juegos</h3>
            </div>
          </div>
        </div>

        {/* Card 3: Compras */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mis Pedidos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">0</h3>
            </div>
          </div>
        </div>

        {/* Card 4: Pendientes */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Proceso</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">0</h3>
            </div>
          </div>
        </div>

      </div>
      
      {/* Área vacía para futuros contenidos */}
      <div className="mt-8 p-10 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl flex items-center justify-center text-gray-400">
         Próximamente: Gráficas de actividad reciente
      </div>

    </main>
  );
}