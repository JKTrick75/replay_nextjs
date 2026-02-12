import { prisma } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import EditOrderForm from '@/app/ui/admin/edit-order-form';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

type Params = Promise<{ id: string }>;

export default async function AdminEditOrderPage({ params }: { params: Params }) {
  const { id } = await params;

  // Traemos TODO: Listing, Juego, Consola, Vendedor, Comprador
  const order = await prisma.listing.findUnique({
    where: { id },
    include: { 
        game: true, 
        platform: true,
        seller: true,
        buyer: true 
    } 
  });

  if (!order || order.status !== 'sold') {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/pedidos" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
                Gestionar Pedido 
                <span className="text-base font-normal text-gray-400">#{order.id.slice(0, 8)}</span>
            </h1>
        </div>
      </div>

      <EditOrderForm order={order} />
    </div>
  );
}