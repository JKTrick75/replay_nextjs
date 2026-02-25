import { prisma } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Package, Star, User as UserIcon } from 'lucide-react';
import GameCard from '@/app/ui/game-card';
import { Listing } from '@/app/lib/definitions';
import { auth } from '@/auth';
import Pagination from '@/app/ui/pagination'; 

export default async function SellerProfilePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams?: Promise<{ page?: string; rPage?: string }> 
}) {
  const { id } = await params;
  const urlParams = await searchParams;
  const session = await auth();

  // --- CONFIGURACIÓN ---
  const ITEMS_PER_PAGE = 10;
  const REVIEWS_PER_PAGE = 5;
  
  const inventoryPage = Number(urlParams?.page) || 1;
  const reviewsPage = Number(urlParams?.rPage) || 1;

  //1- DATOS DEL VENDEDOR
  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, image: true, createdAt: true, city: true, email: true,
      _count: {
        select: { 
          //Solo contamos ventas que han sido ENTREGADAS
          sales: { 
            where: { 
              status: 'sold',
              deliveryStatus: 'delivered' 
            } 
          },
          reviewsReceived: true 
        }
      }
    }
  });

  if (!seller) notFound();

  //2- INVENTARIO
  const [activeListings, totalListings] = await prisma.$transaction([
    prisma.listing.findMany({
      where: { sellerId: id, status: 'active' },
      include: { game: true, platform: true, seller: true },
      skip: (inventoryPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.listing.count({ where: { sellerId: id, status: 'active' } })
  ]);

  //3- REVIEWS
  const [reviews, totalReviews] = await prisma.$transaction([
    prisma.review.findMany({
      where: { sellerId: id },
      include: { buyer: true }, 
      skip: (reviewsPage - 1) * REVIEWS_PER_PAGE,
      take: REVIEWS_PER_PAGE,
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.review.count({ where: { sellerId: id } })
  ]);

  //4- CÁLCULOS
  const totalInventoryPages = Math.ceil(totalListings / ITEMS_PER_PAGE);
  const totalReviewPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  const joinDate = new Date(seller.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const isOwnProfile = session?.user?.email === seller.email;
  
  const aggregations = await prisma.review.aggregate({
    where: { sellerId: id },
    _avg: { rating: true }
  });
  const averageRating = aggregations._avg.rating?.toFixed(1) || '-';

  let favoriteIds: string[] = [];
  if (session?.user?.email) {
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { favorites: true }
    });
    if (currentUser) favoriteIds = currentUser.favorites.map(fav => fav.listingId);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-20">
      
      {/* --- CABECERA --- */}
      <div className="bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-white/5 pt-10 pb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar */}
            <div className="relative group">
                <img 
                    src={seller.image || `https://ui-avatars.com/api/?name=${seller.name}`} 
                    alt={seller.name}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-800 shadow-xl object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-neutral-800" title="Vendedor verificado">
                    <UserIcon size={20} />
                </div>
            </div>

            {/* Datos */}
            <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                    <h1 className="text-4xl font-black text-dark dark:text-white mb-2 tracking-tight">{seller.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-neutral-900 rounded-full border border-gray-200 dark:border-neutral-800">
                            <MapPin size={14} className="text-primary" /> 
                            {seller.city || 'Ubicación desconocida'}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-neutral-900 rounded-full border border-gray-200 dark:border-neutral-800">
                            <Calendar size={14} className="text-primary" /> 
                            Desde {joinDate}
                        </span>
                    </div>
                </div>

                {/* KPIs */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="bg-gray-50 dark:bg-neutral-900/50 px-5 py-3 rounded-2xl border border-gray-200 dark:border-neutral-800 text-center min-w-[100px]">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ventas</p>
                        <p className="text-2xl font-black text-dark dark:text-white">{seller._count.sales || 0}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-neutral-900/50 px-5 py-3 rounded-2xl border border-gray-200 dark:border-neutral-800 text-center min-w-[100px]">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Valoración</p>
                        <div className="flex items-center justify-center gap-1">
                           <span className="text-2xl font-black text-dark dark:text-white">{averageRating}</span>
                           <Star size={18} className="text-yellow-400 fill-yellow-400 mb-0.5" />
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* === SECCIÓN 1- INVENTARIO === */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
                    <Package className="text-primary" /> 
                    En venta <span className="text-sm font-normal text-gray-400">({totalListings})</span>
                </h2>
            </div>

            {activeListings.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {activeListings.map((ad) => (
                            <div key={ad.id} className="h-full">
                                <GameCard 
                                    ad={ad as unknown as Listing} 
                                    isLoggedIn={!!session?.user}
                                    initialIsFavorite={favoriteIds.includes(ad.id)}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 flex justify-center">
                        <Pagination totalPages={totalInventoryPages} paramName="page" />
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No hay artículos en venta actualmente.</p>
                </div>
            )}
        </section>

        <div className="border-t border-gray-200 dark:border-neutral-800"></div>

        {/* === SECCIÓN 2- REVIEWS === */}
        <section className="max-w-4xl">
            <h2 className="text-2xl font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" /> 
                Valoraciones <span className="text-sm font-normal text-gray-400">({totalReviews})</span>
            </h2>

            <div className="space-y-4">
                {reviews.length > 0 ? (
                    <>
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 transition-colors hover:border-gray-300 dark:hover:border-neutral-600">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={review.buyer?.image || `https://ui-avatars.com/api/?name=${review.buyer?.name || 'User'}`} 
                                            alt="Buyer" 
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-neutral-700"
                                        />
                                        <div>
                                            <p className="text-base font-bold text-dark dark:text-white leading-none">
                                                {review.buyer?.name || 'Usuario eliminado'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(review.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 bg-gray-50 dark:bg-neutral-900 px-3 py-1 rounded-full border border-gray-100 dark:border-neutral-800">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={14} 
                                                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-neutral-600"} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic pl-4 border-l-4 border-gray-200 dark:border-neutral-700">
                                    "{review.comment || 'Sin comentario'}"
                                </p>
                            </div>
                        ))}
                        
                        <div className="mt-6">
                             <Pagination totalPages={totalReviewPages} paramName="rPage" />
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700">
                         <p className="text-gray-500 dark:text-gray-400">Este vendedor aún no ha recibido valoraciones.</p>
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
}