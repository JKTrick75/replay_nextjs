import { prisma } from '@/app/lib/db';
import CreateListingForm from '@/app/ui/dashboard/create-form';

export default async function CreatePage() {
  // 1. Obtenemos TODOS los juegos (solo necesitamos id y titulo para el buscador)
  const games = await prisma.game.findMany({
    select: { id: true, title: true, coverImage: true },
    orderBy: { title: 'asc' },
  });

  // 2. Obtenemos TODAS las plataformas
  const consoles = await prisma.console.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="mb-8 text-2xl font-bold text-dark dark:text-white">
        Publicar Nuevo Anuncio
      </h1>
      <CreateListingForm games={games} consoles={consoles} />
    </main>
  );
}