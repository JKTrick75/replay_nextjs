import { prisma } from '@/app/lib/db';
import { Clock, Truck, ShoppingBag, Settings } from 'lucide-react';
import Link from 'next/link';
import { formatDateToLocal } from '@/app/lib/utils';
import Pagination from '@/app/ui/pagination';

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 8;

  // Filtro base: Vendidos y NO entregados/cancelados (Solo gestión activa)
  const whereCondition = { 
    status: 'sold',
    deliveryStatus: { in: ['pending', 'shipped'] }
  };

  // 1. Contar total para paginación
  const totalItems = await prisma.listing.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2. Obtener datos con paginación
  const orders = await prisma.listing.findMany({
    where: whereCondition,
    include: { game: true, seller: true, buyer: true },
    orderBy: { soldAt: 'asc' }, // Los más antiguos primero (urgencia)
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <main>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Pedidos en Curso</h1>
        <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium text-gray-500">
            Pendientes de entrega: {totalItems}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden flex flex-col min-h-[500px]">
        {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex-grow flex flex-col items-center justify-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                ¡Todo limpio! No hay pedidos pendientes de gestión.
            </div>
        ) : (
            <>
            <div className="overflow-x-auto flex-grow">
              <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Producto</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Comprador</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Vendedor</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Estado</th>
                      <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Fecha Venta</th>
                      <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-white">Acción</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-dark dark:text-white truncate max-w-[150px]">
                          {order.game?.title}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {order.buyer?.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                          {order.seller?.name}
                      </td>
                      
                      {/* 🟢 ESTADO: Estilo Clean (Solo Icono + Texto) */}
                      <td className="px-6 py-4">
                          {order.deliveryStatus === 'pending' ? (
                              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium">
                                  <Clock size={16} />
                                  <span>Pendiente</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-medium">
                                  <Truck size={16} />
                                  <span>Enviado</span>
                              </div>
                          )}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                          {formatDateToLocal(order.soldAt?.toString() || order.updatedAt.toString())}
                      </td>
                      <td className="px-6 py-4 text-right">
                          {/* 🟢 BOTÓN NORMALIZADO: px-3 py-2, rounded-lg, text-sm */}
                          <Link 
                              href={`/admin/pedidos/${order.id}`} 
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                          >
                              <Settings size={16} /> Gestionar
                          </Link>
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