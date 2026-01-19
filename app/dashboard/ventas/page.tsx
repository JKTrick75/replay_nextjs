import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { Plus, Pencil, Trash2, PackageOpen } from 'lucide-react';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';

export default async function MyProductsPage() {
  // 1. Obtener usuario autenticado
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return <div>No tienes permiso para ver esto.</div>;
  }

  // 2. Buscar usuario en DB para tener su ID real
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return <div>Usuario no encontrado.</div>;

  // 3. Obtener SUS anuncios (Relación One-to-Many)
  const listings = await prisma.listing.findMany({
    where: {
      sellerId: user.id, // <--- EL FILTRO CLAVE
    },
    include: {
      game: true,     // Necesitamos el título y la foto del juego
      platform: true, // Necesitamos el nombre de la consola
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Mis Productos
        </h1>
        <Link
          href="/dashboard/ventas/crear"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={16} /> 
          <span className="hidden md:block">Nuevo Anuncio</span>
        </Link>
      </div>

      {listings.length === 0 ? (
        // ESTADO VACÍO
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 mb-4">
            <PackageOpen className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-dark dark:text-white">
            No tienes productos en venta
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ¡Es hora de limpiar la estantería! Sube tu primer juego.
          </p>
          <Link
            href="/dashboard/ventas/crear"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            Subir producto ahora &rarr;
          </Link>
        </div>
      ) : (
        // TABLA DE PRODUCTOS
        <div className="mt-6 flow-root">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-2 md:pt-0">
              <div className="md:hidden">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="mb-2 w-full rounded-md bg-white dark:bg-neutral-900 p-4 border border-gray-100 dark:border-neutral-700"
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
                          <p className="text-xs text-gray-500">{listing.platform?.shortName}</p>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full font-medium
                        ${listing.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}`
                      }>
                        {listing.status === 'active' ? 'Activo' : 'Vendido'}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between pt-4">
                      <p className="text-xl font-bold text-dark dark:text-white">
                        {formatCurrency(listing.price * 100)}
                      </p>
                      <div className="flex justify-end gap-2">
                         {/* Botones placeholder para futuras acciones */}
                         <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors">
                            <Pencil size={18} />
                         </button>
                         <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-red-600 transition-colors">
                            <Trash2 size={18} />
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* TABLA ESCRITORIO */}
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
                      className="w-full border-b border-gray-light dark:border-neutral-800 py-3 text-sm last-of-type:border-none hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.game?.coverImage || '/placeholder.png'}
                            className="h-10 w-10 rounded-md object-cover border border-gray-200 dark:border-neutral-700"
                            alt="Cover"
                          />
                          <p className="font-semibold text-dark dark:text-white max-w-50 truncate">
                            {listing.game?.title}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                         <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10">
                           {listing.platform?.shortName}
                         </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                         <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset
                            ${listing.status === 'active' 
                                ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-gray-50 text-gray-600 ring-gray-500/10'}
                         `}>
                           {listing.status === 'active' ? 'Activo' : listing.status}
                         </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-bold">
                        {formatCurrency(listing.price * 100)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                        {formatDateToLocal(listing.createdAt.toString())}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                           <button className="text-gray-400 hover:text-primary transition-colors">
                              <Pencil size={18} />
                           </button>
                           <button className="text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 size={18} />
                           </button>
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