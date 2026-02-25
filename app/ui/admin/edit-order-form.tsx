'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { updateOrderAddress, cancelOrder, confirmDelivery } from '@/app/lib/actions';
import { State, Listing, User, Game, Console } from '@/app/lib/definitions';
import { MapPin, Save, CheckCircle, XCircle, AlertTriangle, Loader2, Search, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { showToast, confirmAction } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';

type ListingWithRelations = Listing & {
  game: Game;
  platform: Console;
  seller: User;
  buyer: User | null;
};

export default function EditOrderForm({ order }: { order: ListingWithRelations }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateOrderAddress, initialState);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const isShipped = order.deliveryStatus === 'shipped';

  // --- LÓGICA DE DIRECCIÓN ---
  const [addressQuery, setAddressQuery] = useState(order.shippingAddress || '');
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isShipped) return;
    const timer = setTimeout(async () => {
      if (addressQuery.length > 3) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressQuery}&countrycodes=es&limit=5&addressdetails=1`);
          const data = await res.json();
          setAddressResults(data);
          setShowDropdown(true);
        } catch (err) {
          console.error("Error buscando dirección", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setAddressResults([]);
        setShowDropdown(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [addressQuery, isShipped]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelectAddress = (result: any) => {
    setAddressQuery(result.display_name);
    setShowDropdown(false);
  };

  useEffect(() => {
    setIsPending(false);
    if (state.success) {
      showToast('success', 'Guardado', 'La dirección se ha actualizado.');
      router.refresh();
    } else if (state.message) {
      showToast('error', 'Error', state.message);
    }
  }, [state, router]);

  const handleCancel = async () => {
    const confirm = await confirmAction('¿Cancelar Pedido?', 'Se reembolsará al comprador.', 'Sí, cancelar');
    if (confirm.isConfirmed) {
        await cancelOrder(order.id);
        showToast('info', 'Cancelado', 'El pedido ha sido cancelado.');
        router.push('/admin/pedidos');
    }
  };

  const handleForceDelivery = async () => {
    const confirm = await confirmAction('¿Confirmar Entrega?', 'Esto marcará el pedido como finalizado.', 'Sí, finalizar');
    if (confirm.isConfirmed) {
        await confirmDelivery(order.id);
        showToast('success', 'Finalizado', 'Marcado como entregado.');
        router.push('/admin/pedidos');
    }
  };

  return (
    <div className="space-y-6">
        
      {/* TARJETA DE RESUMEN */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Detalles del Producto</h3>
            <div className="flex gap-4">
                <img src={order.game.coverImage || '/placeholder.png'} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div>
                    <p className="font-bold text-dark dark:text-white">{order.game.title}</p>
                    <p className="text-sm text-gray-500">{order.platform.name}</p>
                    <p className="text-primary font-bold mt-1">{order.price} €</p>
                </div>
            </div>
         </div>
         <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Datos del Pedido</h3>
            <p className="text-sm"><span className="font-bold">Vendedor:</span> {order.seller.name}</p>
            <p className="text-sm"><span className="font-bold">Comprador:</span> {order.buyer?.name}</p>
            
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-neutral-700">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Dirección de Entrega Actual:</p>
                <p className="text-sm text-dark dark:text-gray-200 leading-snug">
                    {order.shippingAddress || <span className="italic text-gray-400">Sin dirección registrada</span>}
                </p>
            </div>
         </div>
      </div>

      {/* FORMULARIO DE DIRECCIÓN */}
      <form action={formAction} onSubmit={() => setIsPending(true)} className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <input type="hidden" name="listingId" value={order.id} />

        <div className="p-6 md:p-8 space-y-6">
            <div ref={wrapperRef} className="relative">
                <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200 flex justify-between">
                    Modificar Dirección de Envío
                    {isShipped && <span className="text-xs text-orange-500 flex items-center gap-1"><AlertTriangle size={12}/> Bloqueado: Enviado</span>}
                </label>
                
                <div className="relative">
                    <input
                        type="text"
                        disabled={isShipped}
                        placeholder="Busca calle, número, ciudad..."
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        className={`peer block w-full rounded-lg border bg-white dark:bg-neutral-900 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white
                            ${isShipped ? 'opacity-60 cursor-not-allowed border-gray-200 dark:border-neutral-700' : 'border-gray-300 dark:border-neutral-600'}
                        `}
                        autoComplete="off"
                    />
                    {isSearching ? (
                       <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
                    ) : (
                       <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    )}
                </div>
                <input type="hidden" name="shippingAddress" value={addressQuery} />

                {showDropdown && addressResults.length > 0 && !isShipped && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {addressResults.map((result: any) => (
                            <div
                                key={result.place_id}
                                onClick={() => handleSelectAddress(result)}
                                className="cursor-pointer px-4 py-3 hover:bg-primary/10 text-sm text-dark dark:text-white border-b border-gray-100 dark:border-neutral-800 last:border-0 transition-colors flex items-start gap-2"
                            >
                                <Search className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                <span>{result.display_name}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                    💡 Usa el buscador para autocompletar la dirección exacta y evitar errores de entrega.
                </p>
            </div>
        </div>

        {!isShipped && (
            <div className="bg-gray-50 dark:bg-neutral-900/50 p-6 flex justify-end gap-4 border-t border-gray-200 dark:border-neutral-700">
                <button type="submit" disabled={isPending || addressQuery.length < 5} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-md transition-all disabled:opacity-50">
                    <Save size={18} /> {isPending ? 'Guardando...' : 'Actualizar Dirección'}
                </button>
            </div>
        )}
      </form>

      {/* ZONA DE GESTIÓN AVANZADA */}
      <div className="bg-gray-light/30 dark:bg-neutral-800/50 border border-gray-light dark:border-neutral-700 rounded-xl p-6">
          <h3 className="text-dark dark:text-white font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="text-gray dark:text-gray-400" size={20} />
            Zona de Gestión Avanzada
          </h3>
          <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleForceDelivery}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors shadow-sm font-medium"
              >
                  <CheckCircle size={18} /> Forzar "Entregado"
              </button>

              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray text-dark dark:text-white rounded-lg hover:bg-dark hover:text-white dark:hover:bg-neutral-700 transition-colors shadow-sm font-medium"
              >
                  <XCircle size={18} /> Cancelar Pedido
              </button>
          </div>
          <p className="text-xs text-gray dark:text-gray-400 mt-3 font-medium">
            Estas acciones son irreversibles y afectan al saldo de los usuarios.
          </p>
      </div>

      <div className="flex justify-start">
        <Link href="/admin/pedidos" className="text-gray-500 hover:underline text-sm">
            ← Volver a la lista
        </Link>
      </div>
    </div>
  );
}