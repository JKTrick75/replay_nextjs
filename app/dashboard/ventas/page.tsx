import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { Plus, Pencil, PackageOpen, Filter, Lock } from 'lucide-react';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { DeleteButton } from '@/app/ui/dashboard/delete-button';

export default async function MyProductsPage(props: {
  searchParams?: Promise<{
    filter?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || 'all'; 

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>No tienes permiso para ver esto.</div>;

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return <div>Usuario no encontrado.</div>;

  const whereCondition: any = {
    sellerId: user.id,
  };

  if (filter === 'active') {
    whereCondition.status = 'active';
  } else if (filter === 'sold') {
    whereCondition.status = 'sold';
  }

  const listings = await prisma.listing.findMany({
    where: whereCondition,
    include: {
      game: true,
      platform: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Clase común para el estado ACTIVO de las pestañas (Tu estilo 'Blanco de Todos')
  const activeTabClass = "bg-white text-dark shadow dark:bg-neutral-700 dark:text-white";
  // Clase común para el estado INACTIVO
  const inactiveTabClass = "text-gray-500 hover:text-dark dark:text-gray-400 dark:hover:text-white";

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row w-full md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Mis Productos
        </h1>
        
        <Link
          href="/dashboard/ventas/crear"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover shadow-md shadow-primary/20"
        >
          <Plus size={16} /> 
          <span>Nuevo Anuncio</span>
        </Link>
      </div>

      {/* --- PESTAÑAS DE FILTRO (Estilo unificado a la paleta) --- */}
      <div className="mb-8 flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800 w-fit">
        <Link
          href="/dashboard/ventas?filter=all"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all
            ${filter === 'all' ? activeTabClass : inactiveTabClass}`}
        >
          Todos
        </Link>
        <Link
          href="/dashboard/ventas?filter=active"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all
            ${filter === 'active' ? activeTabClass : inactiveTabClass}`}
        >
          En Venta
        </Link>
        <Link
          href="/dashboard/ventas?filter=sold"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all
            ${filter === 'sold' ? activeTabClass : inactiveTabClass}`}
        >
          Vendidos
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-12 text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 mb-4">
            {filter === 'active' ? <PackageOpen className="text-gray-400" size={24} /> : <Filter className="text-gray-400" size={24} />}
          </div>
          <h3 className="text-lg font-medium text-dark dark:text-white">
            No se encontraron productos
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'active' 
              ? 'No tienes nada a la venta ahora mismo.' 
              : filter === 'sold' 
                ? 'Aún no has vendido nada.' 
                : 'No hay resultados para este filtro.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 flow-root animate-fade-in">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-2 md:pt-0">
              
              {/* --- VISTA MÓVIL --- */}
              <div className="md:hidden">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="mb-2 w-full rounded-md p-4 border bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-700 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-700 pb-4">
                      <div className="flex items-center">
                        <img
                          src={listing.game?.coverImage || '/placeholder.png'}
                          className="mr-2 h-10 w-10 rounded-md object-cover"
                          alt="Cover"
                        />
                        <div>
                          <p className="font-medium text-dark dark:text-white truncate max-w-37.5">{listing.game?.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{listing.platform?.shortName}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Badge pequeño de estado (Mantenemos semántico suave o neutro) */}
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border
                        ${listing.status === 'active' 
                          ? 'bg-gray-50 text-dark border-gray-200' 
                          : 'bg-primary/10 text-primary border-primary/20'}
                      `}>
                        {listing.status === 'active' ? 'Activo' : 'Vendido'}
                      </span>
                    </div>
                    
                    <div className="flex w-full items-center justify-between pt-4">
                      <p className="text-xl font-bold text-dark dark:text-white">
                        {formatCurrency(listing.price * 100)}
                      </p>
                      <div className="flex justify-end gap-2 items-center min-w-20">
                         {listing.status === 'sold' ? (
                           <div className="p-2 text-gray-300" title="Historial protegido">
                             <Lock size={18} />
                           </div>
                         ) : (
                           <>
                             <Link 
                                href={`/dashboard/ventas/${listing.id}/editar`}
                                className="p-2 rounded-md text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition-colors"
                             >
                                <Pencil size={18} />
                             </Link>
                             <DeleteButton id={listing.id} />
                           </>
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
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Juego</th>
                    <th scope="col" className="px-3 py-5 font-medium">Plataforma</th>
                    <th scope="col" className="px-3 py-5 font-medium">Estado</th>
                    <th scope="col" className="px-3 py-5 font-medium">Precio</th>
                    <th scope="col" className="px-3 py-5 font-medium">Fecha</th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900">
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="w-full border-b border-gray-light dark:border-neutral-800 py-3 text-sm last-of-type:border-none transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <Link href={`/tienda/${listing.id}`} className="flex items-center gap-3 group">
                          <img
                            src={listing.game?.coverImage || '/placeholder.png'}
                            className="h-10 w-10 rounded-md object-cover border border-gray-200 dark:border-neutral-700 transition-opacity group-hover:opacity-80"
                            alt="Cover"
                          />
                          <p className="font-semibold text-dark dark:text-white max-w-50 truncate transition-colors group-hover:text-primary">
                            {listing.game?.title}
                          </p>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                         <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10">
                           {listing.platform?.shortName}
                         </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                         {/* Badge actualizado para encajar mejor con la paleta */}
                         <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset
                            ${listing.status === 'active' 
                                ? 'bg-gray-50 text-gray-600 ring-gray-500/20' 
                                : 'bg-primary/5 text-primary ring-primary/20'}
                         `}>
                           {listing.status === 'active' ? 'Activo' : 'Vendido'}
                         </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-bold">
                        {formatCurrency(listing.price * 100)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                        {formatDateToLocal(listing.createdAt.toString())}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end items-center min-w-20 gap-3">
                           {listing.status === 'sold' ? (
                             <div className="p-2 text-gray-300 cursor-default" title="Historial protegido">
                               <Lock size={18} />
                             </div>
                           ) : (
                             <>
                               <Link 
                                  href={`/dashboard/ventas/${listing.id}/editar`}
                                  className="p-2 rounded-md text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition-colors"
                                  title="Editar"
                               >
                                  <Pencil size={18} />
                               </Link>
                               <DeleteButton id={listing.id} />
                             </>
                           )}
                        </div>
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