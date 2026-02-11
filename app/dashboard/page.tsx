import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import { Package, Euro, ShoppingCart, ShoppingBag, ArrowRight, Truck, CheckCircle, Clock, PackageX, Tag, Hourglass } from 'lucide-react';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>Error: No hay sesión activa.</div>;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return <div>Usuario no encontrado.</div>;

  // 3. CONSULTAS
  const [
    activeListingsCount, 
    processListingsCount, 
    completedListingsCount, 
    purchasedListingsCount,
    earningsData, 
    recentActivity,
    recentPurchases
  ] = await Promise.all([
    // Stats Ventas: Productos actualmente listados
    prisma.listing.count({ where: { sellerId: user.id, status: 'active' } }),
    
    // Stats Ventas: Pedidos vendidos pero aún en camino o pendientes
    prisma.listing.count({ 
      where: { 
        sellerId: user.id, 
        status: 'sold',
        deliveryStatus: { in: ['pending', 'shipped'] } 
      } 
    }),
    
    // Stats Ventas: Pedidos que ya han sido entregados con éxito
    prisma.listing.count({ 
      where: { 
        sellerId: user.id, 
        status: 'sold',
        deliveryStatus: 'delivered'
      } 
    }),

    // Stats Compras: Total de productos comprados por el usuario
    prisma.listing.count({ where: { buyerId: user.id } }),

    // 🟢 GANANCIAS ACTUALIZADAS: Ahora solo suma el precio de los pedidos 'Entregados'
    prisma.listing.aggregate({
      where: { 
        sellerId: user.id, 
        status: 'sold',
        deliveryStatus: 'delivered' // Solo cuenta lo que ya ha llegado al comprador
      },
      _sum: { price: true },
    }),

    // Actividad Ventas (5 últimas)
    prisma.listing.findMany({
      where: { sellerId: user.id },
      include: { game: true, platform: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),

    // Actividad Compras (5 últimas)
    prisma.listing.findMany({
      where: { buyerId: user.id },
      include: { game: true, platform: true },
      orderBy: { soldAt: 'desc' },
      take: 5,
    })
  ]);

  const totalEarnings = earningsData._sum.price || 0;

  // --- HELPER DE ESTADO ---
  const renderStatusBadge = (item: any) => (
    <>
      {/* Móvil: Pills */}
      <div className="md:hidden flex flex-col items-start gap-1">
          {item.status === 'active' && (
              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1">
                  <Tag size={12} /> Activo
              </span>
          )}
          {item.status === 'cancelled' && (
              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-red-50 text-red-500 border-red-100 flex items-center gap-1">
                  <PackageX size={12} /> Cancelado
              </span>
          )}
          {item.status === 'sold' && (
              <>
                  {item.deliveryStatus === 'pending' && (
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-yellow-50 text-yellow-700 border-yellow-100 flex items-center gap-1">
                          <Clock size={12} /> Pendiente
                      </span>
                  )}
                  {item.deliveryStatus === 'shipped' && (
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                          <Truck size={12} /> Enviado
                      </span>
                  )}
                  {item.deliveryStatus === 'delivered' && (
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-green-50 text-green-700 border-green-100 flex items-center gap-1">
                          <CheckCircle size={12} /> Entregado
                      </span>
                  )}
              </>
          )}
      </div>

      {/* Escritorio: Texto + Icono */}
      <div className="hidden md:block">
            {item.status === 'active' && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                  <Tag size={16} /> En Venta
              </div>
            )}
            {item.status === 'cancelled' && (
              <div className="flex items-center gap-2 text-red-500 font-medium">
                  <PackageX size={16} /> Cancelado
              </div>
            )}
            {item.status === 'sold' && (
              <>
                {item.deliveryStatus === 'pending' && (
                  <div className="flex items-center gap-2 text-yellow-600 font-medium">
                      <Clock size={16}/> Pendiente
                  </div>
                )}
                {item.deliveryStatus === 'shipped' && (
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <Truck size={16}/> Enviado
                  </div>
                )}
                {item.deliveryStatus === 'delivered' && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={16}/> Entregado
                  </div>
                )}
              </>
            )}
      </div>
    </>
  );

  return (
    <main className="w-full pb-10">
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><Euro size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ganancias</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{formatCurrency(totalEarnings * 100)}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Package size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Venta</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{activeListingsCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><Hourglass size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Proceso</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{processListingsCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completados</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{completedListingsCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><ShoppingBag size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mis Compras</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{purchasedListingsCount}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* 1. TUS ÚLTIMOS ANUNCIOS */}
      <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden mb-8">
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
            <table className="min-w-full text-gray-900 dark:text-gray-200 text-left">
              <thead className="rounded-lg text-left text-sm font-normal bg-gray-50 dark:bg-neutral-900/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-3 pl-6 pr-3 font-medium sm:pl-6 w-[35%]">Juego</th>
                  <th className="px-3 py-3 font-medium w-[25%]">Estado</th>
                  <th className="px-3 py-3 font-medium w-[15%]">Precio</th>
                  <th className="px-3 py-3 font-medium text-right pr-6 w-[25%]">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {recentActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-dark dark:text-white">
                      <Link href={`/tienda/${item.id}`} className="flex items-center gap-3 group">
                        <img src={item.game?.coverImage || '/placeholder.png'} className="w-8 h-8 rounded object-cover bg-gray-200 transition-opacity group-hover:opacity-80" alt="" />
                        <span className="truncate max-w-37.5 sm:max-w-xs transition-colors group-hover:text-primary">{item.game?.title}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                        {renderStatusBadge(item)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold text-dark dark:text-white">{formatCurrency(item.price * 100)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-gray-500 pr-6">{formatDateToLocal(item.updatedAt.toString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. TUS ÚLTIMAS COMPRAS */}
      <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-dark dark:text-white">Tus últimas compras</h2>
          <Link href="/dashboard/compras" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>
        
        {recentPurchases.length === 0 ? (
           <div className="p-10 text-center text-gray-500">
             Aún no has realizado ninguna compra.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-gray-900 dark:text-gray-200 text-left">
              <thead className="rounded-lg text-left text-sm font-normal bg-gray-50 dark:bg-neutral-900/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-3 pl-6 pr-3 font-medium sm:pl-6 w-[35%]">Juego</th>
                  <th className="px-3 py-3 font-medium w-[25%]">Estado</th>
                  <th className="px-3 py-3 font-medium w-[15%]">Precio</th>
                  <th className="px-3 py-3 font-medium text-right pr-6 w-[25%]">Fecha compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {recentPurchases.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-dark dark:text-white">
                      <Link href={`/tienda/${item.id}`} className="flex items-center gap-3 group">
                        <img src={item.game?.coverImage || '/placeholder.png'} className="w-8 h-8 rounded object-cover bg-gray-200 transition-opacity group-hover:opacity-80" alt="" />
                        <span className="truncate max-w-37.5 sm:max-w-xs transition-colors group-hover:text-primary">{item.game?.title}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                        {renderStatusBadge(item)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-bold text-dark dark:text-white">{formatCurrency(item.price * 100)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-gray-500 pr-6">
                      {formatDateToLocal((item.soldAt || item.updatedAt).toString())}
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