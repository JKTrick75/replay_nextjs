import { prisma } from '@/app/lib/db';
import CreateListingForm from '@/app/ui/dashboard/create-form';
import { notFound } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function EditPage({ params }: { params: Params }) {
  const { id } = await params;

  // 1. Buscamos el anuncio a editar
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { game: true } // Necesitamos datos del juego para rellenar
  });

  if (!listing) {
    notFound();
  }

  // 2. Obtenemos datos auxiliares para los desplegables
  const games = await prisma.game.findMany({
    select: { id: true, title: true, coverImage: true },
    orderBy: { title: 'asc' },
  });

  const consoles = await prisma.console.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="mb-8 text-2xl font-bold text-dark dark:text-white">
        Editar Anuncio
      </h1>
      {/* Pasamos 'listing' para activar el modo edición */}
      <CreateListingForm games={games} consoles={consoles} listing={listing} />
    </main>
  );
}