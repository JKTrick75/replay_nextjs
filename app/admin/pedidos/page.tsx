import { prisma } from '@/app/lib/db';
import { Clock, Truck, ShoppingBag, Settings, Search } from 'lucide-react'; // Importamos Search
import Link from 'next/link';
import { formatDateToLocal } from '@/app/lib/utils';
import Pagination from '@/app/ui/pagination';

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ page?: string; query?: string }>; // Añadimos query
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const query = searchParams?.query || ''; // Capturamos la búsqueda
  const ITEMS_PER_PAGE = 8;

  // Filtro base: Solo productos vendidos
  const whereCondition: any = { 
    status: 'sold',
  };

  // Lógica del buscador
  if (query) {
    // Si hay búsqueda, filtramos por la ID del pedido (sin importar su estado de entrega)
    whereCondition.id = { contains: query };
  } else {
    // Comportamiento por defecto: Mostrar solo pendientes o enviados
    whereCondition.deliveryStatus = { in: ['pending', 'shipped'] };
  }

  // 1- Contar total para paginación
  const totalItems = await prisma.listing.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2- Obtener datos con paginación
  const orders = await prisma.listing.findMany({
    where: whereCondition,
    include: { game: true, seller: true, buyer: true },
    orderBy: { soldAt: 'asc' }, // Los más antiguos primero
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <main>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Pedidos en Curso</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            {/* BUSCADOR POR ID */}
            <form className="relative w-full md:w-80">
                <input
                    type="text"
                    name="query"
                    placeholder="Buscar por ID del pedido..."
                    defaultValue={query}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white transition-colors shadow-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <button type="submit" className="hidden">Buscar</button>
            </form>

            <div className="bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium text-gray-500 whitespace-nowrap">
                Resultados: {totalItems}
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden flex flex-col min-h-[500px]">
        {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex-grow flex flex-col items-center justify-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                {query ? 'No se ha encontrado ningún pedido con esa ID.' : '¡Todo limpio! No hay pedidos pendientes de gestión.'}
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
                      
                      <td className="px-6 py-4">
                          {order.deliveryStatus === 'pending' ? (
                              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium">
                                  <Clock size={16} />
                                  <span>Pendiente</span>
                              </div>
                          ) : order.deliveryStatus === 'shipped' ? (
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-medium">
                                  <Truck size={16} />
                                  <span>Enviado</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
                                  {/* Añadimos este estado por si el buscador trae pedidos ya entregados */}
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                  <span>Entregado</span>
                              </div>
                          )}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                          {formatDateToLocal(order.soldAt?.toString() || order.updatedAt.toString())}
                      </td>
                      <td className="px-6 py-4 text-right">
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
            
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex justify-center bg-gray-50 dark:bg-neutral-900/50">
                    <Pagination totalPages={totalPages} />
                </div>
            )}
            </>
        )}
      </div>
    </main>
  );
}