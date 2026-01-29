import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
// 👇 Corregido: 'Euro' en lugar de 'EuroIcon' (estándar de Lucide)
import { Package, Euro, ShoppingCart, Clock } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';

export default async function DashboardPage() {
  // 1. Obtener sesión
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return <div>Error: No hay sesión activa.</div>;
  }

  // 2. Obtener datos del usuario (ID)
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return <div>Usuario no encontrado.</div>;

  // 3. CONSULTAS A BASE DE DATOS
  const [activeListingsCount, soldListingsCount, earningsData] = await Promise.all([
    // A. Contar juegos EN VENTA (Activos)
    prisma.listing.count({
      where: {
        sellerId: user.id,
        status: 'active',
      },
    }),
    
    // B. Contar juegos VENDIDOS
    prisma.listing.count({
      where: {
        sellerId: user.id,
        status: 'sold',
      },
    }),

    // C. Calcular GANANCIAS TOTALES
    prisma.listing.aggregate({
      where: {
        sellerId: user.id,
        status: 'sold',
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  // Si earningsData._sum.price es null (no hay ventas), ponemos 0
  const totalEarnings = earningsData._sum.price || 0;

  return (
    <main>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Panel de Control
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Bienvenido de nuevo, <span className="text-primary font-bold">{user.name}</span>. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Ganancias Totales */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              {/* 👇 Icono corregido */}
              <Euro size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ganancias</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">
                {/* Ahora esto saldrá como '0,00 €' gracias al cambio en utils.ts */}
                {formatCurrency(totalEarnings * 100)}
              </h3>
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
              <h3 className="text-2xl font-bold text-dark dark:text-white">
                {activeListingsCount} {activeListingsCount === 1 ? 'Juego' : 'Juegos'}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 3: Juegos Vendidos */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Juegos Vendidos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">
                {soldListingsCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 4: En Proceso */}
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
      
      {/* Área vacía */}
      <div className="mt-8 p-10 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl flex items-center justify-center text-gray-400">
         Próximamente: Gráficas de actividad reciente
      </div>

    </main>
  );
}