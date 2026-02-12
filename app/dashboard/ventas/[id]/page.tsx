import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Truck, CheckCircle, Clock, PackageX, User, Mail, Settings } from 'lucide-react';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import ShipButton from '@/app/ui/dashboard/ship-button';
import CancelOrderButton from '@/app/ui/dashboard/cancel-order-button';

export default async function SellerOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { game: true, buyer: true } 
  });

  // Seguridad: Solo el vendedor (dueño) puede ver esto
  if (!listing || listing.sellerId !== (await prisma.user.findUnique({ where: { email: session?.user?.email! } }))?.id) {
    notFound(); 
  }

  // Mapa de estados
  const statusMap: any = {
    'pending': { label: 'Pendiente de Envío', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    'shipped': { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck },
    'delivered': { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: PackageX },
  };

  const currentStatus = listing.status === 'cancelled' 
      ? statusMap['cancelled'] 
      : statusMap[listing.deliveryStatus || 'pending'];
      
  const StatusIcon = currentStatus.icon;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Link href="/dashboard/ventas?filter=sold" className="inline-flex items-center text-gray-500 hover:text-primary mb-6">
        <ArrowLeft size={20} className="mr-2" /> Volver a mis ventas
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
        
        {/* CABECERA */}
        <div className="p-8 border-b border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Gestión del Pedido</h1>
            <p className="text-sm text-gray-500">ID: {listing.id}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${currentStatus.color}`}>
            <StatusIcon size={18} />
            {currentStatus.label}
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQ: DATOS DEL COMPRADOR Y ENVÍO */}
          <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <User size={20} className="text-primary"/> Datos del Comprador
                </h3>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-2">
                    <p className="font-bold text-dark dark:text-white">{listing.buyer?.name || 'Usuario desconocido'}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2"><Mail size={14}/> {listing.buyer?.email}</p>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <MapPin size={20} className="text-primary"/> Dirección de Envío
                </h3>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {listing.shippingAddress || 'No especificada'}
                    </p>
                </div>
            </div>
          </div>

          {/* COLUMNA DER: PRODUCTO Y ACCIONES */}
          <div className="space-y-6">
             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white">Producto Vendido</h3>
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                    <img src={listing.game?.coverImage || '/placeholder.png'} className="w-16 h-20 object-cover rounded-lg" alt="" />
                    <div>
                        <p className="font-bold text-dark dark:text-white">{listing.game?.title}</p>
                        <p className="text-primary font-bold text-xl">{formatCurrency(listing.price * 100)}</p>
                        <p className="text-xs text-gray-400 mt-1">Vendido el {listing.soldAt ? formatDateToLocal(listing.soldAt.toString()) : '-'}</p>
                    </div>
                </div>
             </div>

             {/* CASO CANCELADO */}
             {listing.status === 'cancelled' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  <p className="font-bold mb-1 flex items-center gap-2"><PackageX size={16}/> Pedido Cancelado</p>
                  Has cancelado este pedido. El producto ha sido republicado automáticamente y el dinero reembolsado al comprador.
                </div>
             )}

             {/* 🟢 PANEL DE ACCIONES (Botones en fila) */}
             {listing.status === 'sold' && listing.deliveryStatus !== 'delivered' && (
                 <div className="bg-gray-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-gray-200 dark:border-neutral-700">
                    <h4 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-gray-500" /> Acciones Disponibles
                    </h4>
                    
                    {listing.deliveryStatus === 'pending' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                                ¿Ya has enviado el paquete? Confírmalo aquí para avisar al comprador.
                            </p>
                            {/* 🟢 FLEX ROW PARA QUE ESTÉN EN LA MISMA FILA */}
                            <div className="flex flex-wrap items-center gap-3">
                                <ShipButton id={listing.id} />
                                <CancelOrderButton id={listing.id} />
                            </div>
                        </div>
                    )}

                    {listing.deliveryStatus === 'shipped' && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-gray-100 dark:border-neutral-700">
                            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                <Truck size={16}/>
                            </div>
                            <span>El paquete está en camino. Esperando confirmación del comprador.</span>
                        </div>
                    )}
                 </div>
             )}

             {/* CASO ENTREGADO */}
             {listing.deliveryStatus === 'delivered' && (
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 font-bold text-sm">
                    <CheckCircle size={20} /> Pedido completado y cerrado.
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}