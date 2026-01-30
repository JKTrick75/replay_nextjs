import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import { Package, Euro, ShoppingCart, ShoppingBag, ArrowRight } from 'lucide-react'; // Añadido ShoppingBag
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  // 1. Obtener sesión
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>Error: No hay sesión activa.</div>;

  // 2. Obtener datos del usuario
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return <div>Usuario no encontrado.</div>;

  // 3. CONSULTAS A BASE DE DATOS
  const [
    activeListingsCount, 
    soldListingsCount, 
    purchasedListingsCount, // 👇 NUEVO: Contador de compras
    earningsData, 
    recentActivity
  ] = await Promise.all([
    // A. Contar Activos (Ventas)
    prisma.listing.count({ where: { sellerId: user.id, status: 'active' } }),
    
    // B. Contar Vendidos (Ventas)
    prisma.listing.count({ where: { sellerId: user.id, status: 'sold' } }),

    // C. 👇 NUEVO: Contar Comprados (Compras)
    prisma.listing.count({ where: { buyerId: user.id } }),

    // D. Calcular Ganancias (Ventas)
    prisma.listing.aggregate({
      where: { sellerId: user.id, status: 'sold' },
      _sum: { price: true },
    }),

    // E. Últimos 5 movimientos de VENTA (Tu historial como vendedor)
    prisma.listing.findMany({
      where: { sellerId: user.id },
      include: { game: true, platform: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })
  ]);

  const totalEarnings = earningsData._sum.price || 0;

  return (
    <main className="w-full">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Panel de Control
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Bienvenido de nuevo, <span className="text-primary font-bold">{user.name}</span>.
        </p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        
        {/* Card 1: Ganancias */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <Euro size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ganancias</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">
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
                {activeListingsCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 3: Vendidos */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vendidos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">
                {soldListingsCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 4: Compras (Sustituye a 'En Proceso') */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            {/* Usamos un color distinto (Indigo/Violeta) para diferenciar Compras de Ventas */}
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mis Compras</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">
                {purchasedListingsCount}
              </h3>
            </div>
          </div>
        </div>

      </div>
      
      {/* TABLA DE ÚLTIMA ACTIVIDAD (Ventas) */}
      <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-dark dark:text-white">Tus últimos anuncios</h2>
          <Link href="/dashboard/ventas" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>
        
        {recentActivity.length === 0 ? (
           <div className="p-10 text-center text-gray-500">
             Aún no has publicado ningún anuncio.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-neutral-900/50 text-gray-500 dark:text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Juego</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 text-right">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {recentActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors">
                    
                    {/* 👇 1. CELDA CLICABLE CON LINK */}
                    <td className="px-6 py-4 font-medium text-dark dark:text-white">
                      <Link href={`/tienda/${item.id}`} className="flex items-center gap-3 group">
                        <img 
                          src={item.game?.coverImage || '/placeholder.png'} 
                          className="w-8 h-8 rounded object-cover bg-gray-200 transition-opacity group-hover:opacity-80" 
                          alt="" 
                        />
                        <span className="truncate max-w-37.5 sm:max-w-xs transition-colors group-hover:text-primary">
                          {item.game?.title}
                        </span>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                        ${item.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {item.status === 'active' ? 'En Venta' : 'Vendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-dark dark:text-white">
                      {formatCurrency(item.price * 100)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {formatDateToLocal(item.updatedAt.toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}