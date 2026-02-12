import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import GameCard from '@/app/ui/game-card'; 
import { Listing } from '@/app/lib/definitions';
// 🟢 Importamos la paginación
import Pagination from '@/app/ui/pagination';

export default async function FavoritesPage(props: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 8; // Muestra 8 favoritos por página (2 filas de 4 en pantallas grandes)

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>Acceso denegado.</div>;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) return <div>Usuario no encontrado.</div>;

  // 1. Contar total de favoritos para la paginación
  const totalItems = await prisma.favorite.count({
    where: { userId: user.id },
  });
  
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 2. Traer solo los favoritos de la página actual
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.id,
    },
    include: {
      listing: {
        include: {
          game: true,
          platform: true,
          seller: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <Heart className="text-primary fill-primary" size={32} />
            <h1 className="text-2xl font-bold text-dark dark:text-white">
            Mi Lista de Deseos
            </h1>
        </div>
      </div>

      {favorites.length === 0 ? (
        // ESTADO VACÍO
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-12 text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Heart className="text-primary" size={24} />
          </div>
          <h3 className="text-lg font-medium text-dark dark:text-white">
            Aún no tienes favoritos
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Explora la tienda y guarda lo que más te guste.
          </p>
          <Link
            href="/tienda"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            Ir a la tienda &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col min-h-[500px]">
            {/* GRID DE FAVORITOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow animate-fade-in">
            {favorites.map((fav) => {
                const product = fav.listing as unknown as Listing;
                
                return (
                <div key={fav.id} className="h-full">
                    <GameCard 
                    ad={product} 
                    initialIsFavorite={true}
                    isLoggedIn={true}
                    />
                </div>
                );
            })}
            </div>

            {/* 🟢 PAGINACIÓN AL FINAL */}
            <div className="mt-8 flex justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
      )}
    </div>
  );
}