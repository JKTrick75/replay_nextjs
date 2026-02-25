import AdminSideNav from '@/app/ui/admin/admin-sidenav'; 
import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white-off dark:bg-neutral-900 p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
            <ShieldAlert size={64} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">Acceso Restringido</h1>
        <p className="text-gray-500 max-w-md mb-8">
          Esta zona está reservada para administradores.
        </p>
        <Link 
          href="/dashboard" 
          className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          Volver a mi Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white-off dark:bg-neutral-900">
      <div className="w-full flex-none md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
        <AdminSideNav />
      </div>
      <div className="grow p-6 md:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}