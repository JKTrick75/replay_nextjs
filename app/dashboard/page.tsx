import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import { Package, Euro, ShoppingBag, ArrowRight, Truck, CheckCircle, Clock, PackageX, Tag, Hourglass } from 'lucide-react';
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

  //CONSULTAS
  const [
    activeListingsCount, 
    processListingsCount, 
    completedListingsCount, 
    purchasedListingsCount,
    earningsData, 
    recentActivity,
    recentPurchases
  ] = await Promise.all([
    prisma.listing.count({ where: { sellerId: user.id, status: 'active' } }),
    
    prisma.listing.count({ 
      where: { 
        sellerId: user.id, 
        status: 'sold',
        deliveryStatus: { in: ['pending', 'shipped'] } 
      } 
    }),
    
    prisma.listing.count({ 
      where: { 
        sellerId: user.id, 
        status: 'sold',
        deliveryStatus: 'delivered'
      } 
    }),

    prisma.listing.count({ 
      where: { 
        buyerId: user.id,
        status: 'sold',
        deliveryStatus: 'delivered'
      } 
    }),

    prisma.listing.aggregate({
      where: { 
        sellerId: user.id, 
        status: 'sold',
        deliveryStatus: 'delivered' 
      },
      _sum: { price: true },
    }),

    prisma.listing.findMany({
      where: { sellerId: user.id },
      include: { game: true, platform: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),

    prisma.listing.findMany({
      where: { buyerId: user.id },
      include: { game: true, platform: true },
      orderBy: { soldAt: 'desc' },
      take: 5,
    })
  ]);

  const totalEarnings = earningsData._sum.price || 0;

  // --- HELPER DE ESTADO ---
  const renderStatusBadge = (item: any) => {
    if (item.status === 'active') {
        return (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                <Tag size={16} /> <span>En Venta</span>
            </div>
        );
    }
    if (item.status === 'cancelled') {
        return (
            <div className="flex items-center gap-2 text-red-500 font-medium">
                <PackageX size={16} /> <span>Cancelado</span>
            </div>
        );
    }
    if (item.status === 'sold') {
        if (item.deliveryStatus === 'pending') {
            return (
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium">
                    <Clock size={16} /> <span>Pendiente</span>
                </div>
            );
        }
        if (item.deliveryStatus === 'shipped') {
            return (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-medium">
                    <Truck size={16} /> <span>Enviado</span>
                </div>
            );
        }
        if (item.deliveryStatus === 'delivered') {
            return (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
                    <CheckCircle size={16} /> <span>Entregado</span>
                </div>
            );
        }
    }
    return null;
  };

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-10">
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><Euro size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ganancias</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{formatCurrency(totalEarnings * 100)}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Package size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Venta</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{activeListingsCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><Hourglass size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">En Proceso</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{processListingsCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completados</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{completedListingsCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><ShoppingBag size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mis Compras</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{purchasedListingsCount}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* TUS ÚLTIMOS ANUNCIOS */}
      <div className="mb-8">
        {/* CABECERA */}
        <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xl font-bold text-dark dark:text-white">Tus últimos anuncios</h2>
            <Link href="/dashboard/ventas" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                Ver todo <ArrowRight size={16} />
            </Link>
        </div>

        {/* CONTENEDOR TABLA */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
            {recentActivity.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
                Aún no has publicado ningún anuncio.
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                    <tr>
                    <th className="py-4 pl-6 pr-3 font-bold text-gray-900 dark:text-white w-[35%] text-sm">Juego</th>
                    <th className="px-3 py-4 font-bold text-gray-900 dark:text-white w-[25%] text-sm">Estado</th>
                    <th className="px-3 py-4 font-bold text-gray-900 dark:text-white w-[15%] text-sm">Precio</th>
                    <th className="px-3 py-4 font-bold text-gray-900 dark:text-white text-right pr-6 w-[25%] text-sm">Actualizado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                    {recentActivity.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors text-sm">
                        <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-dark dark:text-white">
                        <Link href={`/tienda/${item.id}`} className="flex items-center gap-3 group">
                            <img src={item.game?.coverImage || '/placeholder.png'} className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-neutral-700 transition-opacity group-hover:opacity-80" alt="" />
                            <span className="truncate max-w-37.5 sm:max-w-xs transition-colors group-hover:text-primary">{item.game?.title}</span>
                        </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {renderStatusBadge(item)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold text-primary">{formatCurrency(item.price * 100)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-gray-500 pr-6">{formatDateToLocal(item.updatedAt.toString())}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
      </div>

      {/* TUS ÚLTIMAS COMPRAS */}
      <div>
        {/* CABECERA */}
        <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xl font-bold text-dark dark:text-white">Tus últimas compras</h2>
            <Link href="/dashboard/compras" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                Ver todo <ArrowRight size={16} />
            </Link>
        </div>

        {/* CONTENEDOR TABLA */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
            {recentPurchases.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
                Aún no has realizado ninguna compra.
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                    <tr>
                    <th className="py-4 pl-6 pr-3 font-bold text-gray-900 dark:text-white w-[35%] text-sm">Juego</th>
                    <th className="px-3 py-4 font-bold text-gray-900 dark:text-white w-[25%] text-sm">Estado</th>
                    <th className="px-3 py-4 font-bold text-gray-900 dark:text-white w-[15%] text-sm">Precio</th>
                    <th className="px-3 py-4 font-bold text-gray-900 dark:text-white text-right pr-6 w-[25%] text-sm">Fecha compra</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                    {recentPurchases.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors text-sm">
                        <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-dark dark:text-white">
                        <Link href={`/tienda/${item.id}`} className="flex items-center gap-3 group">
                            <img src={item.game?.coverImage || '/placeholder.png'} className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-neutral-700 transition-opacity group-hover:opacity-80" alt="" />
                            <span className="truncate max-w-37.5 sm:max-w-xs transition-colors group-hover:text-primary">{item.game?.title}</span>
                        </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {renderStatusBadge(item)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-bold text-primary">{formatCurrency(item.price * 100)}</td>
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
      </div>

    </main>
  );
}