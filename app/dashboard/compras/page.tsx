import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link'; 
// 👇 AÑADIDO: Nuevos iconos de estado
import { ShoppingBag, NotebookText, Truck, CheckCircle, Clock, PackageX } from 'lucide-react'; 
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';

export default async function MyPurchasesPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>No tienes permiso.</div>;

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return <div>Usuario no encontrado.</div>;

  // QUERY: Mis compras
  const purchases = await prisma.listing.findMany({
    where: {
      buyerId: user.id, 
    },
    include: { 
      game: true, 
      platform: true,
      seller: true 
    },
    orderBy: { soldAt: 'desc' }, 
  });

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Mis Compras
        </h1>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-12 text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 mb-4">
            <ShoppingBag className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-dark dark:text-white">
            Aún no has comprado nada
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ¡Explora la tienda y encuentra tu próximo juego!
          </p>
        </div>
      ) : (
        <div className="mt-6 flow-root animate-fade-in">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-2 md:pt-0">
              
              {/* VISTA MÓVIL */}
              <div className="md:hidden">
                {purchases.map((listing) => (
                  <div key={listing.id} className="mb-2 w-full rounded-md bg-white dark:bg-neutral-900 p-4 border border-gray-100 dark:border-neutral-700 hover:shadow-sm transition-all">
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

                      {/* 👇 ESTADO EN MÓVIL (Badge dinámico) */}
                      <div className="flex flex-col items-end">
                        {listing.status === 'cancelled' ? (
                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-red-50 text-red-500 border-red-100 flex items-center gap-1">
                                <PackageX size={12} /> Cancelado
                            </span>
                        ) : (
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
                      
                      {/* BOTÓN MÓVIL DETALLES */}
                      <Link 
                        href={`/dashboard/compras/${listing.id}`}
                        className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-600 hover:text-primary transition-colors"
                      >
                         <NotebookText size={20} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA ESCRITORIO */}
              <table className="hidden min-w-full text-gray-900 dark:text-gray-200 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th className="px-4 py-5 font-medium sm:pl-6">Juego</th>
                    <th className="px-3 py-5 font-medium">Vendedor</th>
                    <th className="px-3 py-5 font-medium">Estado</th>
                    <th className="px-3 py-5 font-medium">Precio Pagado</th>
                    <th className="px-3 py-5 font-medium">Fecha Compra</th>
                    <th className="px-3 py-5 font-medium text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900">
                  {purchases.map((listing) => (
                    <tr key={listing.id} className="w-full border-b border-gray-light dark:border-neutral-800 py-3 text-sm last-of-type:border-none hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <Link href={`/tienda/${listing.id}`} className="flex items-center gap-3 group">
                          <img 
                            src={listing.game?.coverImage || '/placeholder.png'} 
                            className="h-10 w-10 rounded-md object-cover border border-gray-200 dark:border-neutral-700 transition-opacity group-hover:opacity-80" 
                            alt="Cover" 
                          />
                          <p className="font-semibold text-dark dark:text-white truncate max-w-50 transition-colors group-hover:text-primary">
                            {listing.game?.title}
                          </p>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                         <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
                                <img src={listing.seller.image || '/placeholder-user.png'} alt="" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300">{listing.seller.name}</span>
                         </div>
                      </td>

                      {/* 👇 COLUMNA DE ESTADO CON ICONOS */}
                      <td className="whitespace-nowrap px-3 py-3">
                        {listing.status === 'cancelled' ? (
                            <div className="flex items-center gap-2 text-red-500 font-medium">
                                <PackageX size={16} /> Cancelado
                            </div>
                        ) : (
                            <>
                                {listing.deliveryStatus === 'pending' && (
                                    <div className="flex items-center gap-2 text-yellow-600 font-medium">
                                        <Clock size={16} /> Pendiente
                                    </div>
                                )}
                                {listing.deliveryStatus === 'shipped' && (
                                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                                        <Truck size={16} /> Enviado
                                    </div>
                                )}
                                {listing.deliveryStatus === 'delivered' && (
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <CheckCircle size={16} /> Entregado
                                    </div>
                                )}
                            </>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 font-bold text-dark dark:text-white">
                        {formatCurrency(listing.price * 100)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                         {listing.soldAt 
                            ? formatDateToLocal(listing.soldAt.toString()) 
                            : formatDateToLocal(listing.updatedAt.toString())}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right pr-6">
                        <Link 
                          href={`/dashboard/compras/${listing.id}`} 
                          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
                          title="Ver detalles del pedido"
                        >
                          <NotebookText size={18} />
                          <span className="hidden lg:inline">Ver Pedido</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}