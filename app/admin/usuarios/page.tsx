import { prisma } from '@/app/lib/db';
import { Shield, User as UserIcon, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { formatDateToLocal } from '@/app/lib/utils';
import Pagination from '@/app/ui/pagination';

export default async function AdminUsersPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  //Paginación
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 8;

  const totalItems = await prisma.user.count();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  //Buscamos usuarios
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <main>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Usuarios Registrados</h1>
        <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium text-gray-500">
            Total: {totalItems}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden flex flex-col min-h-[500px]">
        {users.length === 0 ? (
           <div className="p-12 text-center text-gray-500 flex-grow flex flex-col items-center justify-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              No hay usuarios registrados.
           </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-grow">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Usuario</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Rol</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Ubicación</th>
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Fecha Registro</th>
                    <th className="px-6 py-4 font-bold text-right text-gray-900 dark:text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
                            alt="" 
                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-600 object-cover"
                          />
                          <div>
                            <p className="font-bold text-dark dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Shield size={16} />
                                <span>Admin</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                                <UserIcon size={16} />
                                <span>User</span>
                            </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {user.city || <span className="text-gray-400 italic">No definida</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDateToLocal(user.createdAt.toString())}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/usuarios/${user.id}`} 
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