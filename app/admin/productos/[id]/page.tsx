import { prisma } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import CreateListingForm from '@/app/ui/dashboard/create-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';

type Params = Promise<{ id: string }>;

export default async function AdminEditProductPage({ params }: { params: Params }) {
  const { id } = await params;

  //1- Obtener sesión para saber quién está editando
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ 
    where: { email: session?.user?.email || '' } 
  });

  //2- Buscamos el anuncio
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { game: true } 
  });

  if (!listing) {
    notFound();
  }

  //3- Comprobamos si soy el dueño
  const isOwner = currentUser?.id === listing.sellerId;

  //4- Datos auxiliares
  const games = await prisma.game.findMany({
    select: { id: true, title: true, coverImage: true, genre: true },
    orderBy: { title: 'asc' },
  });

  const consoles = await prisma.console.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/productos" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="text-gray-600 dark:text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Editar Artículo</h1>
      </div>

      {/* Solo mostramos el aviso si NO es el propietario */}
      {!isOwner && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4 mb-6 text-sm text-orange-800 dark:text-orange-200 flex flex-col sm:flex-row gap-2">
           <span className="font-bold">Modo Administrador:</span> 
           <span>Estás editando un producto que pertenece a otro usuario. Cualquier cambio será visible inmediatamente en la tienda.</span>
        </div>
      )}

      <CreateListingForm games={games} consoles={consoles} listing={listing} />
    </div>
  );
}