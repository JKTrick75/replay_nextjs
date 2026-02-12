import { prisma } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import EditUserForm from '@/app/ui/admin/edit-user-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Params = Promise<{ id: string }>;

export default async function AdminEditUserPage({ params }: { params: Params }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/usuarios" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="text-gray-600 dark:text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Editar Usuario</h1>
      </div>

      <EditUserForm userToEdit={user} />
    </div>
  );
}