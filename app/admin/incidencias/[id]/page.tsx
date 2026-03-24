import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, MessageSquare, Package, CheckCircle, ExternalLink, Settings, Clock } from 'lucide-react';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import ResolveTicketButton from '@/app/ui/admin/resolve-ticket-button';
import SupportChatButton from '@/app/ui/admin/support-chat-button';

export default async function AdminReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  if (currentUser?.role !== 'admin') return <div>Acceso denegado</div>;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { 
        user: true, 
        listing: { include: { game: true, seller: true } } 
    }
  });

  if (!report) notFound();

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Link href="/admin/incidencias" className="inline-flex items-center text-gray-500 hover:text-primary mb-6">
        <ArrowLeft size={20} className="mr-2" /> Volver a incidencias
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
        
        {/* CABECERA */}
        <div className="p-8 border-b border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-dark dark:text-white">Detalles del Ticket</h1>
                {report.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                        <Clock size={14} /> Pendiente
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle size={14} /> Resuelto
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500">ID: {report.id}</p>
          </div>
          
          {report.status === 'pending' && (
             <ResolveTicketButton id={report.id} />
          )}
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-10">
          
          {/* COLUMNA IZQ: Datos del usuario y mensaje */}
          <div className="space-y-8">
             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <User size={20} className="text-primary"/> Emisor del Reporte
                </h3>
                <div className="flex flex-col gap-3 p-5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30">
                    <div className="flex items-center gap-4">
                        <img 
                          src={report.user?.image || '/placeholder-user.png'} 
                          alt="" 
                          className="w-14 h-14 rounded-full bg-gray-200 object-cover border border-gray-300 dark:border-neutral-600"
                        />
                        <div>
                            <p className="font-bold text-dark dark:text-white text-lg">{report.user?.name}</p>
                            <p className="text-sm text-gray-500">{report.user?.email}</p>
                        </div>
                    </div>
                    
                    {/* BOTÓN DE CHAT */}
                    <div className="border-t border-gray-200 dark:border-neutral-700 pt-3 mt-1">
                        <SupportChatButton userId={report.user!.id} reportId={report.id} listingId={report.listingId} />
                    </div>
                </div>
             </div>

             <div>
                <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-primary"/> Mensaje
                </h3>
                <div className="p-6 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-700">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Asunto / Categoría</p>
                        <p className="font-bold text-dark dark:text-white text-lg">{report.subject}</p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {report.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-700">
                        Enviado el {formatDateToLocal(report.createdAt.toString())}
                    </p>
                </div>
             </div>
          </div>

          {/* COLUMNA DER: Contexto (Pedido linkeado) */}
          <div className="space-y-8">
             {report.listing ? (
                <div>
                    <h3 className="font-bold text-lg mb-4 text-dark dark:text-white flex items-center gap-2">
                        <Package size={20} className="text-primary"/> Pedido Afectado
                    </h3>
                    <div className="p-5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 space-y-4">
                        <div className="flex gap-4">
                            <img src={report.listing.game?.coverImage || '/placeholder.png'} className="w-16 h-20 object-cover rounded-lg shadow-sm" alt="" />
                            <div>
                                <p className="font-bold text-dark dark:text-white">{report.listing.game?.title}</p>
                                <p className="text-sm text-gray-500 mt-1">Vendedor: {report.listing.seller?.name}</p>
                                <p className="text-primary font-bold mt-1">{formatCurrency(report.listing.price * 100)}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-neutral-700 space-y-2">
                            <p className="text-xs text-gray-500">ID del Pedido: {report.listingId}</p>
                            
                            <div className="flex flex-col gap-2 mt-4">
                                <Link 
                                    href={`/admin/pedidos/${report.listingId}`}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-dark text-white hover:bg-neutral-700 transition-colors font-medium text-sm"
                                >
                                    <Settings size={16} /> Gestionar Pedido (Admin)
                                </Link>
                                <Link 
                                    href={`/tienda/${report.listingId}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-600 text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium text-sm"
                                >
                                    <ExternalLink size={16} /> Ver Anuncio Público
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-2xl">
                    <MessageSquare size={48} className="text-gray-300 dark:text-neutral-600 mb-4" />
                    <p className="text-lg font-bold text-dark dark:text-white mb-2">Consulta General</p>
                    <p className="text-gray-500 text-sm">Este ticket no está vinculado a ningún pedido específico del marketplace.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}