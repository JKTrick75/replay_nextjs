import connectDB from '@/app/lib/db';
import { Listing } from '@/app/lib/models';
import { Listing as IListing } from '@/app/lib/definitions'; 
import GameCard from '@/app/ui/game-card';

export default async function ShopPage() {
  await connectDB();

  // Aquí podríamos poner .limit(50) o paginación en el futuro
  const listingsRaw = await Listing.find({ status: 'active' })
    .populate('game')
    .populate('platform')
    .lean();

  const listings = JSON.parse(JSON.stringify(listingsRaw)) as IListing[];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark dark:text-white mb-8 text-center">
          Catálogo Completo
        </h1>

        {/* Aquí en el futuro pondremos los filtros (Nintendo, Sony...) */}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((ad) => (
            <GameCard key={ad._id} ad={ad} />
          ))}
        </div>
      </div>
    </div>
  );
}