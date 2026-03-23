import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Truck, CheckCircle, Clock, PackageX, User, Mail, Settings, AlertTriangle } from 'lucide-react';
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

  if (!listing || listing.sellerId !== (await prisma.user.findUnique({ where: { email: session?.user?.email! } }))?.id) {
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
    'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: PackageX },
  };

  const currentStatus = listing.status === 'cancelled' 
      ? statusMap['cancelled'] 
      : statusMap[listing.deliveryStatus || 'pending'];
      
  const StatusIcon = currentStatus.icon;

  return (
    <div className="w-full max-w-5xl mx-auto">
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

        <div className="p-8 grid md:grid-cols-2 gap-10">
          
          {/* COLUMNA IZQ */}
          <div className="space-y-8">
            <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <User size={20} className="text-primary"/> Datos del Comprador
                </h3>
                
                <div className="flex flex-col gap-3">
                    <div className="p-5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-2">
                        <p className="font-bold text-dark dark:text-white text-lg">{listing.buyer?.name || 'Usuario desconocido'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2"><Mail size={16}/> {listing.buyer?.email}</p>
                    </div>

                    {/* Reportar Incidencia */}
                    <Link
                        href={`/contacto?asunto=pedido&id=${listing.id}`}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/10 dark:hover:bg-primary/20 transition-all"
                    >
                        <AlertTriangle size={18} />
                        Reportar una incidencia
                    </Link>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <MapPin size={20} className="text-primary"/> Dirección de Envío
                </h3>
                <div className="p-5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                        {listing.shippingAddress || 'No especificada'}
                    </p>
                </div>
            </div>
          </div>

          {/* COLUMNA DER */}
          <div className="space-y-8">
             
             {/* PRODUCTO */}
             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white">Producto Vendido</h3>
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                    <img src={listing.game?.coverImage || '/placeholder.png'} className="w-20 h-24 object-cover rounded-lg" alt="" />
                    <div className="flex flex-col justify-center">
                        <p className="font-bold text-dark dark:text-white text-lg line-clamp-1">{listing.game?.title}</p>
                        <p className="text-primary font-bold text-2xl mt-1">{formatCurrency(listing.price * 100)}</p>
                        <p className="text-xs text-gray-400 mt-1">Vendido el {listing.soldAt ? formatDateToLocal(listing.soldAt.toString()) : '-'}</p>
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
             {listing.status === 'cancelled' && (
                <div className="p-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                  <PackageX size={20} className="shrink-0 mt-0.5" />
                  <div>
                      <p className="font-bold mb-1">Pedido Cancelado</p>
                      <p>El producto ha sido republicado automáticamente.</p>
                  </div>
                </div>
             )}

             {listing.status === 'sold' && listing.deliveryStatus !== 'delivered' && (
                 <div className="bg-gray-50 dark:bg-neutral-900/30 p-6 rounded-xl border border-gray-100 dark:border-neutral-700">
                    <h4 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-gray-500" /> Acciones Disponibles
                    </h4>
                    
                    {listing.deliveryStatus === 'pending' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                                ¿Ya has enviado el paquete? Confírmalo aquí.
                            </p>
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
                            <span>Esperando confirmación del comprador.</span>
                        </div>
                    )}
                 </div>
             )}

             {listing.deliveryStatus === 'delivered' && (
                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-3 font-bold">
                    <CheckCircle size={24} /> 
                    <div>
                        <p>Pedido completado</p>
                        <p className="text-xs font-normal opacity-80">El dinero ha sido liberado.</p>
                    </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}