import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { Plus, Pencil, PackageOpen, Filter, Truck, CheckCircle, PackageX, Clock, NotebookText, Tag } from 'lucide-react';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { DeleteButton } from '@/app/ui/dashboard/delete-button';
// 🟢 Importamos el componente de paginación
import Pagination from '@/app/ui/pagination';

export default async function MyProductsPage(props: {
  searchParams?: Promise<{ filter?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || 'all'; 
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 6; // Ajusta este número según prefieras (6, 8, 12...)

  const session = await auth();
  if (!session?.user?.email) return <div>No tienes permiso.</div>;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return <div>Usuario no encontrado.</div>;

  // --- LÓGICA DE FILTROS AVANZADA ---
  const whereCondition: any = { sellerId: user.id };

  if (filter === 'active') {
    whereCondition.status = 'active';
  } else if (filter === 'process') {
    whereCondition.status = 'sold';
    whereCondition.deliveryStatus = { in: ['pending', 'shipped'] };
  } else if (filter === 'delivered') {
    whereCondition.status = 'sold';
    whereCondition.deliveryStatus = 'delivered';
  } else if (filter === 'cancelled') {
    whereCondition.status = 'cancelled';
  }

  // 1. Contamos el total de elementos para este filtro
  const totalItems = await prisma.listing.count({
    where: whereCondition,
  });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2. Obtenemos SOLO los de la página actual
  const listings = await prisma.listing.findMany({
    where: whereCondition,
    include: { game: true, platform: true },
    orderBy: { createdAt: 'desc' },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  const activeTabClass = "bg-white text-dark shadow dark:bg-neutral-700 dark:text-white";
  const inactiveTabClass = "text-gray-500 hover:text-dark dark:text-gray-400 dark:hover:text-white";

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row w-full md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Mis Productos</h1>
        <div className="flex items-center gap-4">
            <Link
            href="/dashboard/ventas/crear"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover shadow-md"
            >
            <Plus size={16} /> <span>Nuevo Anuncio</span>
            </Link>
        </div>
      </div>

      {/* --- FILTROS --- */}
      <div className="mb-8 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800 w-fit">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'En Venta' },
          { key: 'process', label: 'En Proceso' },
          { key: 'delivered', label: 'Finalizados' },
          { key: 'cancelled', label: 'Cancelados' }
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/ventas?filter=${tab.key}`}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${filter === tab.key ? activeTabClass : inactiveTabClass}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-12 text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 mb-4">
            <PackageOpen className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-dark dark:text-white">No se encontraron productos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Prueba con otro filtro.</p>
        </div>
      ) : (
        <div className="mt-6 flow-root animate-fade-in flex flex-col min-h-[500px]">
          <div className="inline-block min-w-full align-middle flex-grow">
            <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-2 md:pt-0">
              
              {/* --- VISTA MÓVIL --- */}
              <div className="md:hidden">
                {listings.map((listing) => (
                  <div key={listing.id} className="mb-2 w-full rounded-md p-4 border bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-700 transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-700 pb-4">
                      <div className="flex items-center">
                        <img
                          src={listing.game?.coverImage || '/placeholder.png'}
                          className="mr-2 h-10 w-10 rounded-md object-cover"
                          alt="Cover"
                        />
                        <div>
                          <p className="font-medium text-dark dark:text-white truncate max-w-37.5">{listing.game?.title}</p>
                          <span className="text-xs text-gray-500">{listing.platform?.shortName}</span>
                        </div>
                      </div>
                      
                      {/* Badge de estado (Móvil) */}
                      <div className="flex flex-col items-end">
                        {listing.status === 'active' && (
                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1">
                                <Tag size={12} /> Activo
                            </span>
                        )}
                        {listing.status === 'cancelled' && (
                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-red-50 text-red-500 border-red-100 flex items-center gap-1">
                                <PackageX size={12} /> Cancelado
                            </span>
                        )}
                        {listing.status === 'sold' && (
                            <>
                                {listing.deliveryStatus === 'pending' && (
                                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-yellow-50 text-yellow-700 border-yellow-100 flex items-center gap-1">
                                        <Clock size={12} /> Pendiente
                                    </span>
                                )}
                                {listing.deliveryStatus === 'shipped' && (
                                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                                        <Truck size={12} /> Enviado
                                    </span>
                                )}
                                {listing.deliveryStatus === 'delivered' && (
                                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-green-50 text-green-700 border-green-100 flex items-center gap-1">
                                        <CheckCircle size={12} /> Entregado
                                    </span>
                                )}
                            </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex w-full items-center justify-between pt-4">
                      <p className="text-xl font-bold text-dark dark:text-white">
                        {formatCurrency(listing.price * 100)}
                      </p>
                      <div className="flex justify-end gap-2 items-center min-w-20">
                          {listing.status === 'active' ? (
                            <>
                              <Link href={`/dashboard/ventas/${listing.id}/editar`} className="p-2 rounded-md text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition-colors">
                                <Pencil size={18} />
                              </Link>
                              <DeleteButton id={listing.id} />
                            </>
                          ) : (
                            <Link href={`/dashboard/ventas/${listing.id}`} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-600 hover:text-primary transition-colors">
                              <NotebookText size={20} />
                            </Link>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* --- TABLA ESCRITORIO --- */}
              <table className="hidden min-w-full text-gray-900 dark:text-gray-200 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th className="px-4 py-5 font-medium sm:pl-6">Juego</th>
                    <th className="px-3 py-5 font-medium">Estado</th>
                    <th className="px-3 py-5 font-medium">Precio</th>
                    <th className="px-3 py-5 font-medium">Fecha</th>
                    <th className="relative py-3 pl-6 pr-3"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="w-full border-b border-gray-light dark:border-neutral-800 py-3 text-sm last-of-type:border-none transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <Link href={`/tienda/${listing.id}`} className="flex items-center gap-3 group">
                          <img src={listing.game?.coverImage || '/placeholder.png'} className="h-10 w-10 rounded-md object-cover border border-gray-200 dark:border-neutral-700 transition-opacity group-hover:opacity-80" alt="" />
                          <div>
                            <p className="font-semibold text-dark dark:text-white max-w-50 truncate transition-colors group-hover:text-primary">{listing.game?.title}</p>
                            <span className="text-xs text-gray-500">{listing.platform?.shortName}</span>
                          </div>
                        </Link>
                      </td>
                      
                      <td className="whitespace-nowrap px-3 py-3">
                          {listing.status === 'active' && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                                <Tag size={16} /> En Venta
                            </div>
                          )}
                          {listing.status === 'cancelled' && (
                            <div className="flex items-center gap-2 text-red-500 font-medium">
                                <PackageX size={16} /> Cancelado
                            </div>
                          )}
                          {listing.status === 'sold' && (
                            <>
                              {listing.deliveryStatus === 'pending' && (
                                <div className="flex items-center gap-2 text-yellow-600 font-medium">
                                    <Clock size={16}/> Pendiente
                                </div>
                              )}
                              {listing.deliveryStatus === 'shipped' && (
                                <div className="flex items-center gap-2 text-blue-600 font-medium">
                                    <Truck size={16}/> Enviado
                                </div>
                              )}
                              {listing.deliveryStatus === 'delivered' && (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <CheckCircle size={16}/> Entregado
                                </div>
                              )}
                            </>
                          )}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 font-bold">{formatCurrency(listing.price * 100)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-500">{formatDateToLocal(listing.createdAt.toString())}</td>
                      
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end items-center min-w-20 gap-3">
                            {listing.status === 'active' ? (
                              <>
                                <Link href={`/dashboard/ventas/${listing.id}/editar`} className="p-2 rounded-md text-gray-400 hover:text-primary transition-colors"><Pencil size={18} /></Link>
                                <DeleteButton id={listing.id} />
                              </>
                            ) : (
                              <Link 
                                  href={`/dashboard/ventas/${listing.id}`} 
                                  className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
                              >
                                  <NotebookText size={18} />
                                  <span className="hidden lg:inline">Gestionar</span>
                              </Link>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🟢 PAGINACIÓN AL FINAL DE LA LISTA */}
          <div className="mt-6 flex w-full justify-center">
             <Pagination totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
}