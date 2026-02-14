import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Truck, CheckCircle, Clock, PackageX, User, Mail, Settings } from 'lucide-react';
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

  // --- TIMELINE ---
  const getProgress = () => {
    if (listing.status === 'cancelled') return 0;
    if (listing.deliveryStatus === 'delivered') return 100;
    if (listing.deliveryStatus === 'pending') return 5;
    
    const fakeRandom = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40; 
    return 50 + fakeRandom; 
  };

  const progress = getProgress();

  const statusMap: any = {
    'pending': { label: 'Pendiente de Envío', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    'shipped': { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck },
    'delivered': { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'cancelled': { label: 'Pedido Cancelado', color: 'bg-red-100 text-red-700', icon: PackageX },
  };

  const currentStatus = listing.status === 'cancelled' 
      ? statusMap['cancelled'] 
      : statusMap[listing.deliveryStatus || 'pending'];
      
  const StatusIcon = currentStatus.icon;

  return (
    <div className="w-full max-w-5xl mx-auto">
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

        <div className="p-8 grid md:grid-cols-2 gap-10">
          
          {/* COLUMNA IZQ */}
          <div className="space-y-8">
             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <User size={20} className="text-primary"/> Datos del Vendedor
                </h3>
                <div className="p-5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-2">
                    <div className="flex items-center gap-3">
                        <img 
                           src={listing.seller.image || '/placeholder-user.png'} 
                           className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                           alt=""
                        />
                        <div>
                            <p className="font-bold text-dark dark:text-white text-lg">{listing.seller.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={14}/> {listing.seller.email}
                            </p>
                        </div>
                    </div>
                </div>
             </div>

             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <MapPin size={20} className="text-primary"/> Envío y Seguimiento
                </h3>
                <div className="p-5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-4">
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
             </div>
          </div>

          {/* COLUMNA DER */}
          <div className="space-y-8">
            
            {/* PRODUCTO */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white">Producto Adquirido</h3>
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                    <img src={listing.game?.coverImage || '/placeholder.png'} className="w-20 h-24 object-cover rounded-lg" alt="" />
                    <div className="flex flex-col justify-center">
                        <p className="font-bold text-dark dark:text-white text-lg line-clamp-1">{listing.game?.title}</p>
                        <p className="text-primary font-bold text-2xl mt-1">{formatCurrency(listing.price * 100)}</p>
                    </div>
                </div>
             </div>

            {/* TIMELINE */}
            {listing.status !== 'cancelled' && (
               <div>
                 <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <Truck size={20} className="text-primary"/> Seguimiento
                 </h3>
                 
                 <div className="p-6 pt-10 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30">
                    <div className="relative mx-2">
                        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 dark:bg-neutral-700 -translate-y-1/2 rounded-full"></div>
                        <div 
                            className="absolute top-1/2 left-0 h-1.5 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out flex flex-col items-center"
                            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="bg-primary text-white p-1.5 rounded-full shadow-sm animate-bounce ring-4 ring-white dark:ring-neutral-800">
                            <Truck size={16} />
                            </div>
                        </div>
                        <div className="relative flex justify-between w-full text-xs font-medium text-gray-400 pt-6">
                            <div className="flex flex-col items-center relative" style={{ marginLeft: '-10px' }}>
                                <div className={`absolute -top-7 w-4 h-4 rounded-full border-[3px] transition-colors duration-500 box-border z-0
                                    ${progress >= 5 ? 'bg-primary border-primary' : 'bg-white border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                                </div>
                                <span className={`transition-colors duration-500 ${progress >= 5 ? 'text-primary font-bold' : ''}`}>Pendiente</span>
                            </div>
                            <div className="flex flex-col items-center relative">
                                <div className={`absolute -top-7 w-4 h-4 rounded-full border-[3px] transition-colors duration-500 box-border z-0
                                    ${progress >= 50 ? 'bg-primary border-primary' : 'bg-white border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                                </div>
                                <span className={`transition-colors duration-500 ${progress >= 50 ? 'text-primary font-bold' : ''}`}>Enviado</span>
                            </div>
                            <div className="flex flex-col items-center relative" style={{ marginRight: '-10px' }}>
                                <div className={`absolute -top-7 w-4 h-4 rounded-full border-[3px] transition-colors duration-500 box-border z-0
                                    ${progress >= 100 ? 'bg-primary border-primary' : 'bg-white border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                                </div>
                                <span className={`transition-colors duration-500 ${progress >= 100 ? 'text-green-600 font-bold' : ''}`}>Entregado</span>
                            </div>
                        </div>
                    </div>
                 </div>
               </div>
            )}

            {/* ACCIONES */}
            {listing.status === 'sold' && listing.deliveryStatus !== 'delivered' && (
              // 🟢 CORRECCIÓN: Fondo y borde unificados con el resto de tarjetas
              <div className="bg-gray-50 dark:bg-neutral-900/30 p-6 rounded-xl border border-gray-100 dark:border-neutral-700">
                <h4 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-gray-500" /> Acciones Disponibles
                </h4>
                
                {listing.deliveryStatus === 'pending' && (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <Clock size={16} className="text-orange-500"/>
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

             {/* ESTADOS FINALES */}
             {(listing.deliveryStatus === 'delivered' || listing.status === 'cancelled') && (
               <div className={`p-5 rounded-xl border flex items-center gap-3 font-bold
                  ${listing.status === 'cancelled' 
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800 text-green-700 dark:text-green-300'
                  }`}>
                    {listing.status === 'cancelled' ? <PackageX size={24} /> : <CheckCircle size={24} />}
                    <div>
                        <p>{listing.status === 'cancelled' ? 'Pedido Cancelado' : 'Pedido Completado'}</p>
                        <p className="text-xs font-normal opacity-80 mt-0.5">
                            {listing.status === 'cancelled' 
                                ? 'El reembolso ha sido emitido.' 
                                : '¡Que disfrutes de tu compra!'}
                        </p>
                    </div>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}