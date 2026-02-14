import { prisma } from '@/app/lib/db';
import { Pencil, Package, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { DeleteButton } from '@/app/ui/dashboard/delete-button';
import Pagination from '@/app/ui/pagination';

export default async function AdminProductsPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 8; 

  // 1. Total de productos activos
  const totalItems = await prisma.listing.count({
    where: { status: 'active' },
  });

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2. Productos de la página actual
  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    include: { game: true, platform: true, seller: true },
    orderBy: { createdAt: 'desc' },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <main>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Gestión de Artículos</h1>
        <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium text-gray-500">
            Total Activos: {totalItems}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden flex flex-col min-h-[500px]">
        {listings.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex-grow flex flex-col items-center justify-center">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No hay artículos activos en esta página.
            </div>
        ) : (
            <>
            <div className="overflow-x-auto flex-grow">
              <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Artículo</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Vendedor</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Estado</th> 
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Precio</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Publicado</th>
                      <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-white">Acciones</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                          <img 
                              src={listing.game?.coverImage || '/placeholder.png'} 
                              alt="" 
                              className="w-10 h-10 rounded-md border border-gray-200 dark:border-neutral-600 object-cover bg-gray-100"
                          />
                          <div>
                              <p className="font-bold text-dark dark:text-white truncate max-w-[200px]">{listing.game?.title}</p>
                              <p className="text-xs text-gray-500">{listing.platform?.name}</p>
                          </div>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                              <img src={listing.seller.image || '/placeholder-user.png'} className="w-6 h-6 rounded-full border border-gray-200 dark:border-neutral-600" alt="" />
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{listing.seller.name}</span>
                          </div>
                      </td>
                      
                      {/* 🟢 ESTADO CLEAN */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                            <Tag size={16} />
                            <span>En Venta</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-primary">
                          {formatCurrency(listing.price * 100)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                          {formatDateToLocal(listing.createdAt.toString())}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                              {/* 🟢 BOTÓN EDITAR NORMALIZADO */}
                              <Link 
                                  href={`/admin/productos/${listing.id}`} 
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                                  title="Editar artículo"
                              >
                                  <Pencil size={18} />
                              </Link>
                              <DeleteButton id={listing.id} />
                          </div>
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex justify-center bg-gray-50 dark:bg-neutral-900/50">
               <Pagination totalPages={totalPages} />
            </div>
            </>
        )}
      </div>
    </main>
  );
}