import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link'; 
import { ShoppingBag, NotebookText, Truck, CheckCircle, Clock, PackageX, Filter } from 'lucide-react'; 
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
// 🟢 Importamos paginación
import Pagination from '@/app/ui/pagination';

export default async function MyPurchasesPage(props: {
  searchParams?: Promise<{ filter?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || 'all';
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 6;

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>No tienes permiso.</div>;

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return <div>Usuario no encontrado.</div>;

  // --- LÓGICA DE FILTROS ---
  const whereCondition: any = {
    buyerId: user.id, 
  };

  if (filter === 'pending') {
    whereCondition.status = 'sold';
    whereCondition.deliveryStatus = 'pending';
  } else if (filter === 'shipped') {
    whereCondition.status = 'sold';
    whereCondition.deliveryStatus = 'shipped';
  } else if (filter === 'delivered') {
    whereCondition.status = 'sold';
    whereCondition.deliveryStatus = 'delivered';
  } else if (filter === 'cancelled') {
    whereCondition.status = 'cancelled';
  }

  // 1. Contar total para paginación
  const totalItems = await prisma.listing.count({
    where: whereCondition,
  });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2. Obtener compras de la página actual
  const purchases = await prisma.listing.findMany({
    where: whereCondition,
    include: { 
      game: true, 
      platform: true,
      seller: true 
    },
    orderBy: { soldAt: 'desc' }, 
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  const activeTabClass = "bg-white text-dark shadow dark:bg-neutral-700 dark:text-white";
  const inactiveTabClass = "text-gray-500 hover:text-dark dark:text-gray-400 dark:hover:text-white";

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Mis Compras
        </h1>
        <span className="text-sm text-gray-500 hidden md:inline-block">
            Total: {totalItems}
        </span>
      </div>

      {/* --- FILTROS DE ESTADO --- */}
      <div className="mb-8 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800 w-fit">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'shipped', label: 'En Camino' },
          { key: 'delivered', label: 'Entregados' },
          { key: 'cancelled', label: 'Cancelados' }
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/compras?filter=${tab.key}`}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${filter === tab.key ? activeTabClass : inactiveTabClass}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-12 text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 mb-4">
            {filter === 'all' ? <ShoppingBag className="text-gray-400" size={24} /> : <Filter className="text-gray-400" size={24} />}
          </div>
          <h3 className="text-lg font-medium text-dark dark:text-white">
            No se encontraron pedidos
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'Aún no has comprado nada.' : 'No tienes pedidos en este estado.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 flow-root animate-fade-in flex flex-col min-h-[500px]">
          
          {/* 🟢 CONTENEDOR ESTILO ADMIN: Fondo neutral-800, Borde gris, Sombra */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden flex-grow">
            
            {/* VISTA MÓVIL (Dentro del contenedor unificado) */}
            <div className="md:hidden p-4 space-y-4">
                {purchases.map((listing) => (
                  <div key={listing.id} className="w-full rounded-xl bg-white dark:bg-neutral-900 p-4 border border-gray-100 dark:border-neutral-700 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-700 pb-4">
                      
                      <Link href={`/tienda/${listing.id}`} className="flex items-center group">
                        <img 
                          src={listing.game?.coverImage || '/placeholder.png'} 
                          className="mr-2 h-10 w-10 rounded-md object-cover transition-opacity group-hover:opacity-80" 
                          alt="Cover" 
                        />
                        <div>
                          <p className="font-medium text-dark dark:text-white truncate max-w-37.5 transition-colors group-hover:text-primary">
                            {listing.game?.title}
                          </p>
                          <p className="text-xs text-gray-500">Vendedor: {listing.seller.name}</p>
                        </div>
                      </Link>

                      {/* 🟢 ESTADO CLEAN EN MÓVIL (Sin Badges) */}
                      <div className="flex flex-col items-end">
                        {listing.status === 'cancelled' ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                                <PackageX size={14} /> <span>Cancelado</span>
                            </div>
                        ) : (
                            <>
                                {listing.deliveryStatus === 'pending' && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-500">
                                        <Clock size={14} /> <span>Pendiente</span>
                                    </div>
                                )}
                                {listing.deliveryStatus === 'shipped' && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-500">
                                        <Truck size={14} /> <span>Enviado</span>
                                    </div>
                                )}
                                {listing.deliveryStatus === 'delivered' && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-500">
                                        <CheckCircle size={14} /> <span>Entregado</span>
                                    </div>
                                )}
                            </>
                        )}
                      </div>

                    </div>
                    <div className="flex w-full items-center justify-between pt-4">
                      <div className="flex flex-col">
                        <p className="text-xl font-bold text-dark dark:text-white">
                          {formatCurrency(listing.price * 100)}
                        </p>
                        <p className="text-xs text-gray-400">
                           {listing.soldAt 
                              ? formatDateToLocal(listing.soldAt.toString()) 
                              : formatDateToLocal(listing.updatedAt.toString())}
                        </p>
                      </div>
                      
                      {/* 🟢 BOTÓN MÓVIL NORMALIZADO */}
                      <Link 
                        href={`/dashboard/compras/${listing.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                      >
                         <NotebookText size={16} /> Ver Pedido
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            {/* VISTA ESCRITORIO - TABLA ESTILO ADMIN */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                {/* 🟢 THEAD: Fondo oscuro neutral-900 (Admin Style) */}
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Juego</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Vendedor</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Estado</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Precio Pagado</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Fecha Compra</th>
                    <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-white">Detalles</th>
                  </tr>
                </thead>
                {/* 🟢 TBODY: Transparente + Divisores */}
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {purchases.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/tienda/${listing.id}`} className="flex items-center gap-3 group">
                          <img 
                            src={listing.game?.coverImage || '/placeholder.png'} 
                            className="h-10 w-10 rounded-md object-cover border border-gray-200 dark:border-neutral-600 transition-opacity group-hover:opacity-80" 
                            alt="Cover" 
                          />
                          <p className="font-bold text-dark dark:text-white truncate max-w-[200px] group-hover:text-primary transition-colors">
                            {listing.game?.title}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
                                <img src={listing.seller.image || '/placeholder-user.png'} alt="" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300">{listing.seller.name}</span>
                         </div>
                      </td>

                      {/* 🟢 ESTADO CLEAN (Escritorio) */}
                      <td className="px-6 py-4">
                        {listing.status === 'cancelled' ? (
                            <div className="flex items-center gap-2 text-red-500 font-medium">
                                <PackageX size={16} /> <span>Cancelado</span>
                            </div>
                        ) : (
                            <>
                                {listing.deliveryStatus === 'pending' && (
                                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium">
                                        <Clock size={16} /> <span>Pendiente</span>
                                    </div>
                                )}
                                {listing.deliveryStatus === 'shipped' && (
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-medium">
                                        <Truck size={16} /> <span>Enviado</span>
                                    </div>
                                )}
                                {listing.deliveryStatus === 'delivered' && (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
                                        <CheckCircle size={16} /> <span>Entregado</span>
                                    </div>
                                )}
                            </>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-primary">
                        {formatCurrency(listing.price * 100)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                         {listing.soldAt 
                            ? formatDateToLocal(listing.soldAt.toString()) 
                            : formatDateToLocal(listing.updatedAt.toString())}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* 🟢 BOTÓN NORMALIZADO */}
                        <Link 
                          href={`/dashboard/compras/${listing.id}`} 
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                          title="Ver detalles del pedido"
                        >
                          <NotebookText size={16} /> Ver Pedido
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex w-full justify-center">
             <Pagination totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
}