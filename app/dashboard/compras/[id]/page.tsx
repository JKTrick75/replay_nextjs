import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Truck, CheckCircle, Clock, PackageX, User, Mail, Settings } from 'lucide-react'; // 🟢 Añadido Settings
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import DeliveryStatusButton from '@/app/ui/dashboard/delivery-status-button';
import BuyerCancelButton from '@/app/ui/dashboard/buyer-cancel-button';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { game: true, seller: true }
  });

  if (!listing || listing.buyerId !== (await prisma.user.findUnique({ where: { email: session?.user?.email! } }))?.id) {
    notFound(); 
  }

  // Mapa de estados (Badges de la cabecera)
  const statusMap: any = {
    'pending': { label: 'Pendiente de Envío', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    'shipped': { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck }, // 🟢 Cambiado a Primary
    'delivered': { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'cancelled': { label: 'Pedido Cancelado', color: 'bg-red-100 text-red-700', icon: PackageX },
  };

  const currentStatus = listing.status === 'cancelled' 
      ? statusMap['cancelled'] 
      : statusMap[listing.deliveryStatus || 'pending'];
      
  const StatusIcon = currentStatus.icon;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Link href="/dashboard/compras" className="inline-flex items-center text-gray-500 hover:text-primary mb-6">
        <ArrowLeft size={20} className="mr-2" /> Volver a mis compras
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
        
        {/* CABECERA */}
        <div className="p-8 border-b border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Detalles del Pedido</h1>
            <p className="text-sm text-gray-500">ID: {listing.id}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${currentStatus.color}`}>
            <StatusIcon size={18} />
            {currentStatus.label}
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQ: PRODUCTO Y VENDEDOR */}
          <div className="space-y-6">
             {/* Tarjeta de Producto */}
             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white">Producto Adquirido</h3>
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                    <img 
                      src={listing.game?.coverImage || '/placeholder.png'} 
                      className="w-16 h-20 object-cover rounded-lg"
                      alt={listing.game?.title}
                    />
                    <div>
                        <p className="font-bold text-dark dark:text-white">{listing.game?.title}</p>
                        <p className="text-primary font-bold text-xl">{formatCurrency(listing.price * 100)}</p>
                    </div>
                </div>
             </div>

             {/* Tarjeta del Vendedor */}
             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <User size={20} className="text-primary"/> Datos del Vendedor
                </h3>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-2">
                    <div className="flex items-center gap-3">
                        <img 
                           src={listing.seller.image || '/placeholder-user.png'} 
                           className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                           alt="Vendedor"
                        />
                        <div>
                            <p className="font-bold text-dark dark:text-white">{listing.seller.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={12}/> {listing.seller.email}
                            </p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* COLUMNA DER: ENVÍO Y ACCIONES */}
          <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <MapPin size={20} className="text-primary"/> Envío y Seguimiento
                </h3>

                {listing.status === 'cancelled' ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                    <p className="font-bold mb-1 flex items-center gap-2"><PackageX size={16}/> Pedido Cancelado</p>
                    El vendedor ha cancelado este pedido. El importe ha sido reembolsado.
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="font-bold text-sm text-dark dark:text-white">Fecha de Compra</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {listing.soldAt ? formatDateToLocal(listing.soldAt.toString()) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={18} />
                        <div>
                          <p className="font-bold text-sm text-dark dark:text-white">Dirección de Entrega</p>
                          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm">
                            {listing.shippingAddress || 'Dirección no registrada'}
                          </p>
                        </div>
                      </div>
                  </div>
                )}
            </div>

            {/* 🟢 PANEL DE ACCIONES DEL COMPRADOR (Estilo actualizado) */}
            {listing.status === 'sold' && listing.deliveryStatus !== 'delivered' && (
              <div className="bg-gray-light/30 dark:bg-neutral-800/50 p-6 rounded-xl border border-gray-light dark:border-neutral-700">
                <h4 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-gray" /> Acciones Disponibles
                </h4>
                
                {listing.deliveryStatus === 'pending' && (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <Clock size={16}/>
                            <span>Esperando a que el vendedor envíe el paquete...</span>
                        </div>
                        <div className="pt-2">
                           <BuyerCancelButton id={listing.id} />
                        </div>
                    </div>
                )}

                {listing.deliveryStatus === 'shipped' && (
                     <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            El vendedor ha marcado el pedido como enviado. Cuando lo recibas, confírmalo abajo.
                        </p>
                        <DeliveryStatusButton listingId={listing.id} />
                     </div>
                )}
              </div>
            )}
            
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