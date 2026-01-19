import { prisma } from '@/app/lib/db';
import CreateListingForm from '@/app/ui/dashboard/create-form';
import { Game, Console } from '@/app/lib/definitions';

// Definimos el tipo exacto que espera el componente
interface GameWithPlatforms extends Game {
  platforms: Console[];
}

export default async function CreatePage() {
  // Obtenemos juegos y sus plataformas
  const gamesRaw = await prisma.game.findMany({
    include: {
      platforms: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  // Casting seguro
  const games = gamesRaw as unknown as GameWithPlatforms[];

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="mb-8 text-2xl font-bold text-dark dark:text-white">
        Publicar Nuevo Anuncio
      </h1>
      <CreateListingForm games={games} />
    </main>
  );
}