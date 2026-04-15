import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { Wrench, Clock, CheckCircle, Eye, AlertCircle, Filter } from 'lucide-react';
import { formatDateToLocal } from '@/app/lib/utils';
import Pagination from '@/app/ui/pagination'; // NUEVO IMPORT

export default async function AdminReportsPage(props: {
  searchParams?: Promise<{ filter?: string; page?: string }>; // Añadimos 'page'
}) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || 'all';
  const currentPage = Number(searchParams?.page) || 1; // Página actual
  const ITEMS_PER_PAGE = 8; // Límite por página (igual que en pedidos)

  const session = await auth();
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  
  if (user?.role !== 'admin') return <div>Acceso denegado</div>;

  // Lógica de filtrado
  const whereCondition: any = {};
  if (filter === 'pending') whereCondition.status = 'pending';
  if (filter === 'resolved') whereCondition.status = 'resolved';

  // 1- Contar total para paginación
  const totalItems = await prisma.report.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2- Obtener los tickets de la BD con paginación
  const reports = await prisma.report.findMany({
    where: whereCondition,
    include: { user: true, listing: { include: { game: true } } },
    orderBy: { createdAt: 'desc' },
    take: ITEMS_PER_PAGE,         // Traer solo X elementos
    skip: (currentPage - 1) * ITEMS_PER_PAGE, // Saltar los anteriores
  });

  return (
    <div className="w-full">
      <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-dark dark:text-white">
          <Wrench className="text-primary" /> Gestión de Incidencias
        </h1>
        {/* Etiqueta del total de resultados */}
        <div className="bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium text-gray-500 whitespace-nowrap">
           Total: {totalItems}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden flex flex-col min-h-[500px]">
        
        {/* BARRA DE FILTROS */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 flex flex-wrap gap-2 items-center">
          <Filter size={18} className="text-gray-400 mr-2" />
          <Link 
            href="/admin/incidencias" 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:border-primary hover:text-primary'}`}
          >
            Todos
          </Link>
          <Link 
            href="/admin/incidencias?filter=pending" 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-primary text-white' : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:border-primary hover:text-primary'}`}
          >
            Pendientes
          </Link>
          <Link 
            href="/admin/incidencias?filter=resolved" 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'resolved' ? 'bg-primary text-white' : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:border-primary hover:text-primary'}`}
          >
            Resueltos
          </Link>
        </div>

        {/* TABLA DE TICKETS */}
        {reports.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center flex-grow justify-center">
            <CheckCircle size={48} className="text-green-400 mb-4" />
            <p className="text-xl font-bold text-dark dark:text-white mb-1">¡Todo en orden!</p>
            <p>No hay ninguna incidencia en esta categoría.</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-neutral-900/50 uppercase border-b border-gray-100 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Asunto / Categoría</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={report.user?.image || '/placeholder-user.png'} 
                          alt="" 
                          className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-700"
                        />
                        <div>
                          <p className="font-bold text-dark dark:text-white">{report.user?.name}</p>
                          <p className="text-xs text-gray-500">{report.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Asunto y Pedido Linkeado */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-dark dark:text-white">{report.subject}</p>
                      {report.listing && (
                        <p className="text-xs text-primary mt-1 font-medium flex items-center gap-1">
                           Pedido: {report.listing.game.title}
                        </p>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      {report.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                          <Clock size={14} /> Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle size={14} /> Resuelto
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateToLocal(report.createdAt.toString())}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/incidencias/${report.id}`} 
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                      >
                        <Eye size={16} /> Ver Detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
            <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex justify-center bg-gray-50 dark:bg-neutral-900/50">
                <Pagination totalPages={totalPages} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}