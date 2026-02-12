import { prisma } from '@/app/lib/db';
import { Shield, User as UserIcon, Pencil, Search } from 'lucide-react';
import Link from 'next/link';
import { formatDateToLocal } from '@/app/lib/utils';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Usuarios Registrados</h1>
        <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm text-sm font-medium text-gray-500">
            Total: {users.length}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-primary border border-purple-200">
                            <Shield size={12} /> Admin
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            <UserIcon size={12} /> User
                        </span>
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-500 transition-colors"
                      title="Editar usuario"
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}