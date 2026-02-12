import { prisma } from '@/app/lib/db';
import CreateListingForm from '@/app/ui/dashboard/create-form';
import { notFound } from 'next/navigation';
// 🟢 1. Importamos Link e Icono
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Params = Promise<{ id: string }>;

export default async function EditPage({ params }: { params: Params }) {
  const { id } = await params;

  // 1. Buscamos el anuncio a editar
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { game: true } 
  });

  if (!listing) {
    notFound();
  }

  // 2. Obtenemos datos auxiliares
  const games = await prisma.game.findMany({
    select: { id: true, title: true, coverImage: true, genre: true },
    orderBy: { title: 'asc' },
  });

  const consoles = await prisma.console.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <main className="max-w-2xl mx-auto">
      
      {/* 🟢 2. Enlace de Volver (Estilo consistente) */}
      <Link 
        href="/dashboard/ventas" 
        className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Volver a mis ventas
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-dark dark:text-white">
        Editar Anuncio
      </h1>
      
      <CreateListingForm games={games} consoles={consoles} listing={listing} />
    </main>
  );
}