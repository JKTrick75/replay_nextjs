import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { Plus, Pencil, PackageOpen, Filter, Truck, CheckCircle, PackageX, Clock, NotebookText, Tag, Settings } from 'lucide-react';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { DeleteButton } from '@/app/ui/dashboard/delete-button';
import Pagination from '@/app/ui/pagination';

export default async function MyProductsPage(props: {
  searchParams?: Promise<{ filter?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || 'all'; 
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 6; 

  const session = await auth();
  if (!session?.user?.email) return <div>No tienes permiso.</div>;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return <div>Usuario no encontrado.</div>;

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

  const totalItems = await prisma.listing.count({ where: whereCondition });
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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
          
          {/* 🟢 CONTENEDOR ESTILO ADMIN: Fondo neutral-800, Borde gris, Sombra */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden flex-grow">
              
              {/* --- VISTA MÓVIL (Tarjetas dentro del contenedor nuevo) --- */}
              <div className="md:hidden p-4 space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="w-full rounded-xl p-4 border bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-700 transition-all hover:shadow-sm">
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
                      
                      {/* ESTADO CLEAN (Móvil) */}
                      <div className="flex flex-col items-end">
                        {listing.status === 'active' && (
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400">
                                <Tag size={14} /> <span>Activo</span>
                            </div>
                        )}
                        {listing.status === 'cancelled' && (
                            <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                                <PackageX size={14} /> <span>Cancelado</span>
                            </div>
                        )}
                        {listing.status === 'sold' && (
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
                      <p className="text-xl font-bold text-dark dark:text-white">
                        {formatCurrency(listing.price * 100)}
                      </p>
                      <div className="flex justify-end gap-2 items-center min-w-20">
                          {listing.status === 'active' ? (
                            <>
                              <Link href={`/dashboard/ventas/${listing.id}/editar`} className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                <Pencil size={18} />
                              </Link>
                              <DeleteButton id={listing.id} />
                            </>
                          ) : (
                            <Link href={`/dashboard/ventas/${listing.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors text-sm font-medium">
                              <Settings size={16} /> Gestionar
                            </Link>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* --- TABLA ESCRITORIO --- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    {/* 🟢 THEAD: Fondo oscuro neutral-900 (igual que Admin) */}
                    <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Juego</th>
                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Estado</th>
                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Precio</th>
                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Fecha</th>
                        <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-white">Acciones</th>
                    </tr>
                    </thead>
                    {/* 🟢 TBODY: Transparente (hereda el neutral-800 del contenedor) + Divisores */}
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                    {listings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                        <td className="px-6 py-4">
                            <Link href={`/tienda/${listing.id}`} className="flex items-center gap-3 group">
                            <img src={listing.game?.coverImage || '/placeholder.png'} className="h-10 w-10 rounded-md object-cover border border-gray-200 dark:border-neutral-600 transition-opacity group-hover:opacity-80" alt="" />
                            <div>
                                <p className="font-bold text-dark dark:text-white truncate max-w-[200px] group-hover:text-primary transition-colors">{listing.game?.title}</p>
                                <span className="text-xs text-gray-500">{listing.platform?.shortName}</span>
                            </div>
                            </Link>
                        </td>
                        
                        <td className="px-6 py-4">
                            {listing.status === 'active' && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                                    <Tag size={16} /> <span>En Venta</span>
                                </div>
                            )}
                            {listing.status === 'cancelled' && (
                                <div className="flex items-center gap-2 text-red-500 font-medium">
                                    <PackageX size={16} /> <span>Cancelado</span>
                                </div>
                            )}
                            {listing.status === 'sold' && (
                                <>
                                {listing.deliveryStatus === 'pending' && (
                                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium">
                                        <Clock size={16}/> <span>Pendiente</span>
                                    </div>
                                )}
                                {listing.deliveryStatus === 'shipped' && (
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-medium">
                                        <Truck size={16}/> <span>Enviado</span>
                                    </div>
                                )}
                                {listing.deliveryStatus === 'delivered' && (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
                                        <CheckCircle size={16}/> <span>Entregado</span>
                                    </div>
                                )}
                                </>
                            )}
                        </td>

                        <td className="px-6 py-4 font-bold text-primary">
                            {formatCurrency(listing.price * 100)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                            {formatDateToLocal(listing.createdAt.toString())}
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                                {listing.status === 'active' ? (
                                <>
                                    <Link href={`/dashboard/ventas/${listing.id}/editar`} className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                        <Pencil size={18} />
                                    </Link>
                                    <DeleteButton id={listing.id} />
                                </>
                                ) : (
                                <Link 
                                    href={`/dashboard/ventas/${listing.id}`} 
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                                >
                                    <Settings size={16} /> Gestionar
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

          <div className="mt-6 flex w-full justify-center">
             <Pagination totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
}